use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq, Hash, FromRow)]
pub struct Team {
    pub id: Uuid,
    pub name: String, // e.g., "Lakers", "Warriors"
    pub city: String, // e.g., "Los Angeles", "Golden State"
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq, Eq, Hash, sqlx::Type)]
#[sqlx(type_name = "game_status_enum")] // Matches the PostgreSQL enum type
#[sqlx(rename_all = "PascalCase")] // Matches 'Scheduled', 'InProgress', etc. in DB
pub enum GameStatus {
    Scheduled,
    InProgress,
    Finished,
    Cancelled,
}

#[derive(Debug, Serialize, Deserialize, Clone, FromRow)]
pub struct Game {
    pub id: Uuid,
    pub home_team_id: Uuid,
    pub away_team_id: Uuid,
    pub home_team_score: Option<i32>, // Changed from u32 to i32 for SQL compatibility (INTEGER)
    pub away_team_score: Option<i32>,
    pub game_date: DateTime<Utc>,
    pub status: GameStatus,
}

// Request payloads for creating/updating resources

#[derive(Debug, Deserialize)]
pub struct CreateTeamPayload {
    pub name: String,
    pub city: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateGamePayload {
    pub home_team_id: Uuid,
    pub away_team_id: Uuid,
    pub game_date: DateTime<Utc>,
}

#[derive(Debug, Deserialize, Clone, Copy)]
pub struct UpdateScorePayload {
    pub home_team_score: i32, // Changed from u32 to i32
    pub away_team_score: i32,
}

#[derive(Debug, Deserialize)]
pub struct UpdateGameStatusPayload {
    pub status: GameStatus,
} 