use serde::{Deserialize, Serialize};

use snarkvm::prelude::{TestnetV0, Transaction};

pub const ORACLE_PORT: u16 = 54541;

#[derive(Clone, Serialize, Deserialize)]
pub struct GameData {
    pub event_id: String,
    pub away_score: u8,
    pub home_score: u8,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct OracleInfo {
    pub address: String,
    pub report: String,
}

#[derive(Serialize, Deserialize)]
pub enum OracleRequest {
    GenerateWitness,
    GetOracleInfo,
}

#[derive(Serialize, Deserialize)]
pub enum OracleResponse {
    Witness(Box<Transaction<TestnetV0>>),
    OracleInfo(OracleInfo),
}

pub const BINCODE_CONFIG: bincode::config::Configuration = bincode::config::standard();
