#![feature(box_into_inner)]

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
struct SubmitRequest {
    game_id: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct SubmitResult {
    game_data: snorkle_oracle_interface::GameData,
    transaction: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct StatusResponse {
    message: String,
}

struct Gateway {
    oracle: Oracle,
}

impl Gateway {
    async fn landing_handler(&self) -> Result<Html<&'static str>, StatusCode> {
        Ok(Html(
            "<html>
            <head><h>Snorkle Oracle</h><head>
            <body>
            <h1>API Endpoints</h1>
            <ul>
                <li><b>/info</b> Show report data for the oracle</li>
                <li><b>/submit</b> Ask the oracle to submit a new event</li>
            </ul>
            </body>
            </html>
            ",
        ))
    }

    async fn info_handler(&self) -> Result<Json<String>, StatusCode> {
        let info = self.oracle.get_info().await.unwrap();
        let response = serde_json::to_string(&info).unwrap();

        Ok(Json(response))
    }

    /// Generate a new witness/statement through the oracle
    async fn submit_handler(
        &self,
        request: Json<SubmitRequest>,
    ) -> Result<Json<SubmitResult>, StatusCode> {
        let (game_data, txn_str) = match self
            .oracle
            .generate_submission(request.game_id.clone())
            .await
        {
            Ok(result) => result,
            Err(err) => {
                log::error!("Got error: {err}");
                return Err(StatusCode::INTERNAL_SERVER_ERROR);
            }
        };

        log::info!("Issuing new 'submit_event' transaction");

        if let Err(err) = self.issue_transaction(txn_str.clone()).await {
            log::error!("Got error: {err}");
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }

        log::debug!("Successfully sent new transaction");
        Ok(Json(SubmitResult {
            game_data,
            transaction: txn_str,
        }))
    }

    /// Register the oracle with the contract
    pub async fn register(&self) -> anyhow::Result<()> {
        let txn_str = self.oracle.generate_registration().await?;

        log::info!("Issuing new 'register' transaction");
        self.issue_transaction(txn_str).await
    }

    /// Broadcast a transaction to the Aleo network
    async fn issue_transaction(&self, txn: String) -> anyhow::Result<()> {
        log::debug!(
            "Issuing transaction: {}",
            serde_json::to_string(&txn).unwrap()
        );

        let api_client = reqwest::Client::new();
        let response = api_client
            .post("https://api.explorer.provable.com/v1/testnet/transaction/broadcast")
            .body(txn)
            .header("Content-Type", "application/json")
            .send()
            .await?;

        if response.status() != reqwest::StatusCode::OK {
            anyhow::bail!(
                "snarkOS REST API returned status code: {}",
                response.status()
            );
        }

        Ok(())
    }
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    env_logger::init();

    let oracle = Oracle::new("localhost")
        .await
        .with_context(|| "Failed to connect to oracle")?;

    let obj = Arc::new(Gateway { oracle });
    let obj1 = obj.clone();
    let obj2 = obj.clone();
    let obj3 = obj.clone();

    // Build our application with a route
    let app = Router::new()
        .route(
            "/submit",
            post(async move |payload| obj1.submit_handler(payload).await),
        )
        .route("/info", get(async move || obj2.info_handler().await))
        .route("/", get(async move || obj3.landing_handler().await));

    log::info!("Registering oracle");
    obj.register().await?;

    // Run it with hyper on localhost:3000
    let addr = "0.0.0.0:3000";

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    println!("Frontend listening at http://{addr}");

    axum::serve(listener, app).await?;

    Ok(())
}
