use tokio::net::TcpStream;
use tokio::sync::Mutex;
use tokio_stream::StreamExt;
use tokio_util::codec::{Decoder, Framed, LengthDelimitedCodec};

use anyhow::Context;

use futures::sink::SinkExt;

use snorkle_oracle_interface::{
    BINCODE_CONFIG, GameData, ORACLE_PORT, OracleInfo, OracleRequest, OracleResponse,
};

use bincode::serde::{decode_from_slice, encode_to_vec};

/// Maintains a connection to the oracle
pub struct Oracle {
    connection: Mutex<Framed<TcpStream, LengthDelimitedCodec>>,
}

impl Oracle {
    pub async fn new(hostname: &str) -> anyhow::Result<Self> {
        let addr = format!("{hostname}:{ORACLE_PORT}");
        log::trace!("Connecting to oracle at {addr}");

        let connection = TcpStream::connect(addr).await?;
        let connection = Mutex::new(LengthDelimitedCodec::new().framed(connection));

        println!("Connected to Oracle at {hostname}");
        Ok(Self { connection })
    }

    pub async fn get_info(&self) -> anyhow::Result<OracleInfo> {
        let msg = OracleRequest::GetOracleInfo;
        let response = self.issue_request(msg).await?;

        #[allow(irrefutable_let_patterns)]
        let OracleResponse::OracleInfo(info) = response else {
            anyhow::bail!("Got invalid response");
        };

        Ok(info)
    }

    pub async fn generate_submission(&self, game_id: String) -> anyhow::Result<(GameData, String)> {
        let msg = OracleRequest::GenerateSubmission { game_id };
        let response = self.issue_request(msg).await?;

        let OracleResponse::Submission {
            transaction,
            game_data,
        } = response
        else {
            anyhow::bail!("Got invalid response");
        };

        Ok((game_data, transaction))
    }

    pub async fn generate_registration(&self) -> anyhow::Result<String> {
        let msg = OracleRequest::GetRegistration;
        let response = self.issue_request(msg).await?;

        let OracleResponse::Registration(txn_str) = response else {
            anyhow::bail!("Got invalid response");
        };

        Ok(txn_str)
    }

    async fn issue_request(&self, msg: OracleRequest) -> anyhow::Result<OracleResponse> {
        let data = encode_to_vec(&msg, BINCODE_CONFIG)?;

        let mut connection = self.connection.lock().await;

        log::trace!("Sending request to oracle");
        connection.send(data.into()).await?;

        if let Some(data) = connection.next().await {
            log::trace!("Got response from oracle");
            let data = data?;
            let (response, _) = decode_from_slice(&data, BINCODE_CONFIG)
                .with_context(|| "Failed to deserialize data from oracle")?;
            Ok(response)
        } else {
            anyhow::bail!("Oracle disconnected");
        }
    }
}
