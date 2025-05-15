use std::sync::Arc;

use anyhow::Context;

use axum::response::Html;
use axum::{
    Json, Router,
    http::StatusCode,
    routing::{get, post},
};

use serde::{Deserialize, Serialize};

mod oracle;
use oracle::Oracle;

#[derive(Debug, Serialize, Deserialize)]
struct UpdateRequest {
    service: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct UpdateResponse {
    status: String,
    message: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct StatusResponse {
    message: String,
}

async fn status_handler() -> (StatusCode, Html<&'static str>) {
    let response = "<b>Frontend is up and running</b>";

    (StatusCode::OK, Html(response))
}

async fn info_handler(oracle: &Oracle) -> (StatusCode, Html<String>) {
    let info = oracle.get_info().await.unwrap();
    let response = serde_json::to_string(&info).unwrap();

    (StatusCode::OK, Html(response))
}

async fn update_handler(
    oracle: &Oracle,
    Json(_payload): Json<UpdateRequest>,
) -> Result<Json<UpdateResponse>, StatusCode> {
    let witness = match oracle.generate_witness().await {
        Ok(witness) => witness,
        Err(err) => {
            log::error!("Got error: {err}");
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
    };

    let hex_witness = witness
        .iter()
        .map(|b| format!("{b:02x}"))
        .collect::<String>();

    // Process the update request here
    let response = UpdateResponse {
        status: "success".to_string(),
        message: format!("Witness is: {hex_witness}"),
    };

    Ok(Json(response))
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    env_logger::init();

    let oracle = Arc::new(
        Oracle::new("localhost")
            .await
            .with_context(|| "Failed to connect to oracle")?,
    );
    let oracle2 = oracle.clone();

    // Build our application with a route
    let app = Router::new()
        .route(
            "/update",
            post(async move |payload| update_handler(&oracle, payload).await),
        )
        .route("/info", get(async move || info_handler(&oracle2).await))
        .route("/", get(status_handler))
        .route("/status", get(status_handler));

    // Run it with hyper on localhost:3000
    let addr = "0.0.0.0:3000";

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    println!("Frontend listening at http://{addr}");

    axum::serve(listener, app).await?;

    Ok(())
}
