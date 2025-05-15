use std::io::{Read, Write};
use std::net::TcpStream;

use bytes::{Bytes, BytesMut};

use tokio_util::codec::length_delimited::LengthDelimitedCodec;
use tokio_util::codec::{Decoder, Encoder};

use anyhow::Context;

use bincode::serde::{decode_from_slice, encode_to_vec};

use snorkle_oracle_interface::{BINCODE_CONFIG, OracleRequest, OracleResponse};

use snarkvm::prelude::Network;

use super::Oracle;

impl<N: Network> Oracle<N> {
    /// Network loop for communication with the gateway
    pub fn handle_connection(&self, mut conn: TcpStream) -> anyhow::Result<()> {
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

    /// Process a message from the gateway
    pub fn handle_message(&self, msg: OracleRequest) -> anyhow::Result<OracleResponse> {
        match msg {
            OracleRequest::GenerateSubmission { game_id } => {
                let (game_data, txn) = self.generate_submission(game_id)?;
                let txn_str = serde_json::to_string(&txn)?;
                Ok(OracleResponse::Submission {
                    game_data,
                    transaction: txn_str,
                })
            }
            OracleRequest::GetRegistration => {
                let txn = self.generate_registration()?;
                let txn_str = serde_json::to_string(&txn)?;
                Ok(OracleResponse::Registration(txn_str))
            }
            OracleRequest::GetOracleInfo => Ok(OracleResponse::OracleInfo(self.info.clone())),
        }
    }
}
