#![cfg_attr(target_env = "sgx", no_std)]
#![feature(restricted_std)]

#[cfg(target_env = "sgx")]
extern crate sgx_tstd as std;

use std::net::{Ipv4Addr, SocketAddr, SocketAddrV4, TcpListener};

use ureq::config::Config;

use ureq::unversioned::transport::DefaultConnector;

use anyhow::Context;

use base64::prelude::*;

use snarkvm::prelude::*;

use snorkle_oracle_interface::{GameData, OracleInfo};

#[cfg(all(target_arch = "x86_64", not(target_env = "sgx")))]
mod tdx;

mod http;
use http::Resolver;

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
    #[cfg(target_env = "sgx")]
    pub fn new() -> anyhow::Result<Self> {
        todo!();
    }

    #[cfg(all(not(target_arch = "x86_64"), not(target_env = "sgx")))]
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

        let report = BASE64_STANDARD.encode("Hello World");

        println!("Created dummy oracle!");
        Ok(Self {
            info: OracleInfo {
                address: address.to_string(),
                report,
            },
            program,
            key: private_key,
        })
    }

    #[cfg(all(target_arch = "x86_64", not(target_env = "sgx")))]
    pub fn new() -> anyhow::Result<Self> {
        let keypair: Keypair = Keypair::generate_with(OsRng);
        let pubkey = keypair.public.as_compressed();

        let key_hash = BASE64_STANDARD.encode(pubkey.as_bytes());
        let report = BASE64_STANDARD.encode(tdx::generate_report(&key_hash)?);

        println!("Keypair and Trust Domain set up!");
        Ok(Self {
            info: OracleInfo {
                pubkey: key_hash,
                report,
            },
            keypair,
        })
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

    /// Generate a new transaction that contains the game's score
    fn generate_witness(&self) -> anyhow::Result<Transaction<N>> {
        let config = Config::builder().build();
        let resolver = Resolver::new();
        let connector = DefaultConnector::new();

        let agent = ureq::Agent::with_parts(config, connector, resolver);
        let mut response = agent.get("https://example.com".to_string()).call()?;

        let mock_data = GameData {
            event_id: "0field".to_string(),
            home_score: 1,
            away_score: 3,
        };

        println!("Status: {}", response.status());

        // Generate hash of the body
        let body = response.body_mut().read_to_string()?;

        self.generate_transaction(mock_data)
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
