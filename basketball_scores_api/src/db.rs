use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;
use std::env;

#[derive(Clone)]
pub struct AppState {
    pub db_pool: PgPool,
}

impl AppState {
    pub async fn new() -> Result<Self, sqlx::Error> {
        dotenvy::dotenv().ok(); // Load .env file if present
        let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
        
        let pool = PgPoolOptions::new()
            .max_connections(10) // Configure pool size
            .connect(&database_url)
            .await?;
        
        tracing::info!("Database connection pool established.");
        Ok(Self { db_pool: pool })
    }
}

// Mock data initialization will now be part of nba_data.rs and directly use the pool. 