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
struct UpdateRequest {
    service: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct StatusResponse {
    message: String,
}

struct Gateway {
    oracle: Oracle,
}

impl Gateway {
    async fn status_handler(&self) -> (StatusCode, Html<&'static str>) {
        let response = "<b>Frontend is up and running</b>";

        (StatusCode::OK, Html(response))
    }

    async fn info_handler(&self) -> (StatusCode, Html<String>) {
        let info = self.oracle.get_info().await.unwrap();
        let response = serde_json::to_string(&info).unwrap();

        (StatusCode::OK, Html(response))
    }

    async fn update_handler(
        &self,
        _payload: Json<UpdateRequest>,
    ) -> Result<Html<&'static str>, StatusCode> {
        let _txn = match self.oracle.generate_witness().await {
            Ok(txn) => txn,
            Err(err) => {
                log::error!("Got error: {err}");
                return Err(StatusCode::INTERNAL_SERVER_ERROR);
            }
        };

        //TODO send transaction

        Ok(Html("success!"))
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
            "/update",
            post(async move |payload| obj.update_handler(payload).await),
        )
        .route("/info", get(async move || obj1.info_handler().await))
        .route("/", get(async move || obj2.status_handler().await))
        .route("/status", get(async move || obj3.status_handler().await));

    // Run it with hyper on localhost:3000
    let addr = "0.0.0.0:3000";

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    println!("Frontend listening at http://{addr}");

    axum::serve(listener, app).await?;

    Ok(())
}
