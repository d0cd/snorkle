use serde::{Deserialize, Serialize};

pub const ORACLE_PORT: u16 = 54541;

#[derive(Clone, Serialize, Deserialize)]
pub struct OracleInfo {
    pub pubkey: String,
    pub report: String,
}

#[derive(Serialize, Deserialize)]
pub enum OracleRequest {
    GenerateWitness,
    GetOracleInfo,
}

#[derive(Serialize, Deserialize)]
pub enum OracleResponse {
    Witness(Vec<u8>),
    OracleInfo(OracleInfo),
}

pub const BINCODE_CONFIG: bincode::config::Configuration = bincode::config::standard();
