#![cfg_attr(target_env = "sgx", no_std)]
#![feature(restricted_std)]

#[cfg(target_env = "sgx")]
extern crate sgx_tstd as std;

use std::net::{Ipv4Addr, SocketAddr, SocketAddrV4, TcpListener};

use anyhow::Context;

use rand::rngs::OsRng;

use base64::engine::general_purpose::URL_SAFE as BASE64;
use base64::prelude::*;

use snarkvm::prelude::*;

use snorkle_oracle_interface::{GameData, OracleInfo};

#[cfg(all(target_arch = "x86_64", not(target_env = "sgx")))]
mod tdx;

mod http;

mod fetch;
mod gateway;
mod transaction;

#[cfg(target_env = "sgx")]
use sgx_crypto::{
    crypto::{ecc::EccHandle, hash::Sha256},
    types::*,
};

fn main() -> anyhow::Result<()> {
    let oracle = Oracle::<TestnetV0>::new()?;
    oracle.run()
}

struct Oracle<N: Network> {
    key: PrivateKey<N>,
    program: Program<N>,
    info: OracleInfo,
}

impl<N: Network> Oracle<N> {
    /// Constructor for SGX (currently broken)
    #[cfg(target_env = "sgx")]
    pub fn new() -> anyhow::Result<Self> {
        todo!();
    }

    /// Constructor for TDX and macOS "dummy" oracle
    #[cfg(not(target_env = "sgx"))]
    pub fn new() -> anyhow::Result<Self> {
        const DEVNET_PRIVATE_KEY: &str =
            "APrivateKey1zkp8CZNn3yeCseEtxuVPbDCwSyhGW6yZKUYKfgXmcpoGPWH";

        let program = Self::init_program();
        println!("Loaded program!");

        // Create the private key.
        let private_key = PrivateKey::<N>::from_str(DEVNET_PRIVATE_KEY)
            .expect("Failed to initialize private key");
        println!("Generated private key!");

        let address = Address::<N>::try_from(&private_key)?;
        println!("Oracles address is {address}");

        let report = Self::generate_report(&address.to_string())?;

        Ok(Self {
            info: OracleInfo {
                address: address.to_string(),
                report,
            },
            program,
            key: private_key,
        })
    }

    #[cfg(all(not(target_arch = "x86_64"), not(target_env = "sgx")))]
    fn generate_report(_address: &str) -> anyhow::Result<String> {
        println!("Created Dummy Oracle!");
        Ok(BASE64.encode("Hello World"))
    }

    #[cfg(all(target_arch = "x86_64", not(target_env = "sgx")))]
    fn generate_report(address: &str) -> anyhow::Result<String> {
        let address = BASE64.encode(address);
        let report = BASE64.encode(tdx::generate_report(&address)?);
        println!("Created TXD Oracle!");
        Ok(report)
    }

    /// Main loop of the oracle. Can handle one gateway connection
    /// at a time.
    pub fn run(&self) -> anyhow::Result<()> {
        let addr = SocketAddr::V4(SocketAddrV4::new(
            Ipv4Addr::UNSPECIFIED,
            snorkle_oracle_interface::ORACLE_PORT,
        ));
        let listener = TcpListener::bind(addr).with_context(|| "Failed to bind API port")?;

        loop {
            // Accept a connection and process all its requests.
            let (conn, _addr) = listener
                .accept()
                .with_context(|| "Failed to accept new connection")?;
            if let Err(err) = self.handle_connection(conn) {
                println!("Error while handling connection: {err}");
            }
        }
    }

    fn generate_registration(&self) -> anyhow::Result<Transaction<N>> {
        let report = self.info.report.as_bytes();

        let mut report_bits = Vec::with_capacity(report.len() * 8);
        for byte in report {
            for i in (0..8).rev() {
                report_bits.push((byte >> i) & 1 == 1);
            }
        }

        let hasher = &snarkvm::prelude::BHP_1024;
        let attestation_hash = hasher.hash(&report_bits)?;
        let hash_value = Value::<N>::from_str(&attestation_hash.to_string())?;

        self.generate_transaction("register", &[hash_value])
    }

    /// Generate a new transaction that contains the game's score
    fn generate_submission(&self) -> anyhow::Result<Transaction<N>> {
        let (home, away) = self.fetch_scores()?;

        let game_data = GameData {
            event_id: "0field".to_string(),
            home_score: home,
            away_score: away,
        };

        // Create the game data.
        let data_str = format!(
            r"
{{
    id: {},
    home_team_score: {}u8,
    away_team_score: {}u8
}}",
            game_data.event_id, game_data.home_score, game_data.away_score
        );

        let game_data = Value::<N>::from_str(&data_str).expect("Failed to create game data");

        let signature = self.key.sign(&game_data.to_fields()?, &mut OsRng)?;
        let signature = Value::<N>::from_str(&signature.to_string())?;

        self.generate_transaction("submit_event", &[game_data, signature])
    }
}

#[cfg(target_env = "sgx")]
#[no_mangle]
pub extern "C" fn t_main() -> sgx_types::sgx_status_t {
    match main() {
        Ok(_) => sgx_types::sgx_status_t::SGX_SUCCESS,
        Err(_) => sgx_types::sgx_status_t::SGX_ERROR_UNEXPECTED,
    }
}
