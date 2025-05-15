#![cfg_attr(target_env = "sgx", no_std)]
#![feature(restricted_std)]

#[cfg(target_env = "sgx")]
extern crate sgx_tstd as std;

use std::net::{Ipv4Addr, SocketAddr, SocketAddrV4, TcpListener};

use anyhow::Context;

use rand::rngs::OsRng;

use base64::engine::general_purpose::URL_SAFE as BASE64;
use base64::prelude::*;

#[cfg(feature = "reuse-vm")]
use snarkvm::ledger::store::helpers::memory::ConsensusMemory;
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
    #[cfg(feature = "reuse-vm")]
    vm: VM<N, ConsensusMemory<N>>,
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
        //FIXME don't hardcode this
        const TESTNET_PRIVATE_KEY: &str =
            "APrivateKey1zkp3TFLRzSPqqhNh9o6csyZ1yPaizmtUzwEWMeTJ9bXxQMA";
        let program = Self::init_program();
        println!("Loaded program");

        #[cfg(feature = "reuse-vm")]
        {
            let vm = Self::init_vm()?;
            println!("Created snarkVM instance");

            // Add the oracle program to the process.
            vm.process()
                .write()
                .add_program(&program)
                .with_context(|| "Failed to add program to VM")?;
        }

        // Create the private key.
        let private_key = PrivateKey::<N>::from_str(TESTNET_PRIVATE_KEY)
            .expect("Failed to initialize private key");

        let address = Address::<N>::try_from(&private_key)?;
        println!("Oracle's address is {address}");

        let report = Self::generate_report(&address.to_string())?;

        Ok(Self {
            info: OracleInfo {
                address: address.to_string(),
                report,
            },
            program,
            #[cfg(feature = "reuse-vm")]
            vm,
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
        println!("Created TDX Oracle!");
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

    fn hash(&self, bytes: &[u8]) -> anyhow::Result<String> {
        let mut bits: Vec<bool> = Vec::with_capacity(bytes.len() * 8);
        for byte in bytes {
            for i in (0..8).rev() {
                bits.push((byte >> i) & 1 == 1);
            }
        }

        let hasher = &snarkvm::prelude::BHP_1024;
        hasher.hash(&bits).map(|res| res.to_string())
    }

    fn generate_registration(&self) -> anyhow::Result<Transaction<N>> {
        let report = self.info.report.as_bytes();
        let attestation_hash = self.hash(report)?;

        let hash_value = Value::<N>::from_str(&attestation_hash)?;

        let txn = self.generate_transaction("register", &[hash_value])?;
        println!("Registration transaction id is {}", txn.id());

        Ok(txn)
    }

    /// Generate a new transaction that contains the game's score
    fn generate_submission(&self, game_id: String) -> anyhow::Result<(GameData, Transaction<N>)> {
        let (home, away) = self.fetch_scores(&game_id)?;
        let uid: u128 = rand::random();
        let event_id = format!("{game_id}_{uid}");

        let game_data = GameData {
            event_id: self.hash(event_id.as_bytes())?,
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

        let game_data_value = Value::<N>::from_str(&data_str).expect("Failed to create game data");

        let signature = self.key.sign(&game_data_value.to_fields()?, &mut OsRng)?;
        let signature = Value::<N>::from_str(&signature.to_string())?;

        let txn = self.generate_transaction("submit_event", &[game_data_value, signature])?;

        Ok((game_data, txn))
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
