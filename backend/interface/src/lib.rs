use serde::{Deserialize, Serialize};

pub const ORACLE_PORT: u16 = 54541;

#[derive(Clone, Debug, Serialize, Deserialize)]
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
    GenerateSubmission { game_id: String },
    GetOracleInfo,
    GetRegistration,
}

#[derive(Serialize, Deserialize)]
pub enum OracleResponse {
    Submission {
        /// The raw results
        game_data: GameData,
        /// The JSON-serialized transaction as a string
        transaction: String,
    },
    OracleInfo(OracleInfo),
    /// Contains the JSON-serialized transaction as a string
    Registration(String),
}

pub const BINCODE_CONFIG: bincode::config::Configuration = bincode::config::standard();
