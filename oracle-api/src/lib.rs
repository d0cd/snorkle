use serde::{Deserialize, Serialize};

pub const ORACLE_PORT: u16 = 54541;

#[derive(Serialize, Deserialize)]
pub enum OracleRequest {
    GenerateWitness,
}

#[derive(Serialize, Deserialize)]
pub enum OracleResponse {
    Witness(Vec<u8>),
}

pub const BINCODE_CONFIG: bincode::config::Configuration = bincode::config::standard();
