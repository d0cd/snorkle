use axum::{
    routing::{get, put},
    Router,
    extract::State,
    http::StatusCode,
};
use std::net::SocketAddr;
use tower_http::trace::TraceLayer;
use tower_http::cors::CorsLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use sqlx;

mod db;
mod handlers;
mod models;
mod nba_data;

use db::AppState;

#[tokio::main]
async fn main() {
    // Initialize tracing for logging
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG")
                .unwrap_or_else(|_| "basketball_scores_api=debug,tower_http=debug,sqlx=warn".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Initialize AppState with DB pool
    let app_state = match AppState::new().await {
        Ok(state) => state,
        Err(e) => {
            tracing::error!("Failed to initialize database connection pool: {}", e);
            std::process::exit(1);
        }
    };

    // Run database migrations if using sqlx-cli programmatically (usually done manually or via entrypoint)
    // For simplicity, we assume migrations are run before starting the app.
    // sqlx::migrate!("./migrations").run(&app_state.db_pool).await.expect("Failed to run migrations");
    // tracing::info!("Database migrations applied successfully.");

    // Initialize NBA teams into the database
    if let Err(e) = nba_data::initialize_nba_teams(&app_state.db_pool).await {
        tracing::warn!("Failed to initialize NBA teams (they might already exist or DB issue): {}", e);
    }
    // TODO: Add some mock games using the initialized teams for better testing

    let team_routes = Router::new()
        .route("/", get(handlers::get_teams).post(handlers::create_team))
        .route("/:id", get(handlers::get_team).put(handlers::update_team).delete(handlers::delete_team));

    let game_routes = Router::new()
        .route("/", get(handlers::get_games).post(handlers::create_game))
        .route("/query", get(handlers::query_games)) // Specific query route first
        .route("/:id", get(handlers::get_game).delete(handlers::delete_game))
        .route("/:id/score", put(handlers::update_game_score))
        .route("/:id/status", put(handlers::update_game_status));
        
    let app = Router::new()
        .route("/health", get(health_check))
        .nest("/teams", team_routes)
        .nest("/games", game_routes)
        .with_state(app_state.clone()) // Clone AppState for sharing
        .layer(TraceLayer::new_for_http())
        .layer(CorsLayer::permissive()); // Basic permissive CORS for local dev

    // Run it with hyper on localhost:3000
    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    tracing::debug!("listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn health_check(State(state): State<AppState>) -> Result<&'static str, StatusCode> {
    // Ping the database as part of the health check
    sqlx::query("SELECT 1")
        .execute(&state.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Database health check failed: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;
    tracing::debug!("Health check: Database connection OK.");
    Ok("OK")
} 