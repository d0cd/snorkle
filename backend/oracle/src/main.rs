#![cfg_attr(target_env = "sgx", no_std)]
#![feature(restricted_std)]

#[cfg(target_env = "sgx")]
extern crate sgx_tstd as std;

use std::io::{Read, Write};
use std::net::{Ipv4Addr, SocketAddr, SocketAddrV4, TcpListener, TcpStream};

use bytes::{Bytes, BytesMut};

use tokio_util::codec::length_delimited::LengthDelimitedCodec;
use tokio_util::codec::{Decoder, Encoder};

use ureq::config::Config;

use ureq::unversioned::transport::DefaultConnector;

use anyhow::Context;

use snorkle_oracle_interface::{
    BINCODE_CONFIG, GameData, OracleInfo, OracleRequest, OracleResponse,
};

#[cfg(all(target_arch = "x86_64", not(target_env = "sgx")))]
mod tdx;

mod transaction;
use transaction::generate_transaction;

use base64::prelude::*;

use snarkvm::prelude::{Address, FromStr, PrivateKey, TestnetV0, Transaction};

mod http;
use http::Resolver;

use bincode::serde::{decode_from_slice, encode_to_vec};

#[cfg(target_env = "sgx")]
use sgx_crypto::{
    crypto::{ecc::EccHandle, hash::Sha256},
    types::*,
};

fn main() -> anyhow::Result<()> {
    let oracle = Oracle::new()?;
    oracle.run()
}

struct Oracle {
    key: PrivateKey<TestnetV0>,
    info: OracleInfo,
}

impl Oracle {
    #[cfg(target_env = "sgx")]
    pub fn new() -> anyhow::Result<Self> {
        todo!();
    }

    #[cfg(all(not(target_arch = "x86_64"), not(target_env = "sgx")))]
    pub fn new() -> anyhow::Result<Self> {
        const DEVNET_PRIVATE_KEY: &str =
            "APrivateKey1zkp8CZNn3yeCseEtxuVPbDCwSyhGW6yZKUYKfgXmcpoGPWH";

        // Create the private key.
        let private_key = PrivateKey::<TestnetV0>::from_str(DEVNET_PRIVATE_KEY)
            .expect("Failed to initialize private key");

        let address = Address::<TestnetV0>::try_from(&private_key)?;

        let report = BASE64_STANDARD.encode("Hello World");

        println!("Created dummy oracle!");
        Ok(Self {
            info: OracleInfo {
                address: address.to_string(),
                report,
            },
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

    fn handle_connection(&self, mut conn: TcpStream) -> anyhow::Result<()> {
        let mut codec = LengthDelimitedCodec::new();
        let mut incoming = BytesMut::new();

        loop {
            let mut read_buffer = [0u8; 4096];
            let read_len = conn.read(&mut read_buffer)?;

            if read_len == 0 {
                println!("Connection closed.");
                return Ok(());
            }

            incoming.extend_from_slice(&read_buffer[0..read_len]);

            if let Some(data) = codec.decode(&mut incoming)? {
                let (msg, _) = decode_from_slice(&data, BINCODE_CONFIG)
                    .with_context(|| "Failed to deserialize data")?;

                let response = self.handle_message(msg)?;
                let response = encode_to_vec(&response, BINCODE_CONFIG)?;

                let mut data = BytesMut::new();
                codec.encode(Bytes::from(response), &mut data)?;

                conn.write_all(&data)
                    .with_context(|| "Failed to write to socket")?;
                conn.flush()?;
            }
        }
    }

    fn handle_message(&self, msg: OracleRequest) -> anyhow::Result<OracleResponse> {
        match msg {
            OracleRequest::GenerateWitness => {
                let txn = self.generate_witness()?;
                Ok(OracleResponse::Witness(Box::new(txn)))
            }
            OracleRequest::GetOracleInfo => Ok(OracleResponse::OracleInfo(self.info.clone())),
        }
    }

    fn generate_witness(&self) -> anyhow::Result<Transaction<TestnetV0>> {
        let config = Config::builder().build();
        let resolver = Resolver::new();
        let connector = DefaultConnector::new();

        let agent = ureq::Agent::with_parts(config, connector, resolver);
        let mut response = agent.get("https://example.com".to_string()).call()?;

        let mock_data = GameData {
            event_id: "rand".to_string(),
            home_score: 1,
            away_score: 0,
        };

        println!("Status: {}", response.status());

        // Generate hash of the body
        let body = response.body_mut().read_to_string()?;

        let txn = generate_transaction(&self.key, mock_data);
        Ok(txn)
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
