use crate::db::AppState;
use crate::models::{
    CreateGamePayload, CreateTeamPayload, Game, GameStatus, Team, UpdateGameStatusPayload,
    UpdateScorePayload,
};
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::Json,
};
use serde::Deserialize;
use uuid::Uuid;

// Helper for error mapping
fn internal_error<E: std::error::Error>(err: E) -> StatusCode {
    tracing::error!("Internal server error: {}", err);
    StatusCode::INTERNAL_SERVER_ERROR
}

// === Team Handlers ===

// POST /teams
pub async fn create_team(
    State(app_state): State<AppState>,
    Json(payload): Json<CreateTeamPayload>,
) -> Result<Json<Team>, StatusCode> {
    let team_id = Uuid::new_v4();
    let team = sqlx::query_as!(
        Team,
        "INSERT INTO teams (id, name, city) VALUES ($1, $2, $3) RETURNING id, name, city",
        team_id,
        payload.name,
        payload.city
    )
    .fetch_one(&app_state.db_pool)
    .await
    .map_err(|e| {
        tracing::error!("Failed to create team: {}", e);
        // Basic duplicate check, could be more specific with DB error codes
        if e.to_string().contains("unique_team_city_name") {
            return StatusCode::CONFLICT;
        }
        internal_error(e)
    })?;

    tracing::debug!("Created team: {:?}", team);
    Ok(Json(team))
}

// GET /teams
pub async fn get_teams(State(app_state): State<AppState>) -> Result<Json<Vec<Team>>, StatusCode> {
    let teams = sqlx::query_as!(Team, "SELECT id, name, city FROM teams")
        .fetch_all(&app_state.db_pool)
        .await
        .map_err(internal_error)?;
    Ok(Json(teams))
}

// GET /teams/:id
pub async fn get_team(
    State(app_state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<Team>, StatusCode> {
    let team = sqlx::query_as!(Team, "SELECT id, name, city FROM teams WHERE id = $1", id)
        .fetch_optional(&app_state.db_pool)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            tracing::debug!("Team with id {} not found", id);
            StatusCode::NOT_FOUND
        })?;
    Ok(Json(team))
}

// PUT /teams/:id
pub async fn update_team(
    State(app_state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(payload): Json<CreateTeamPayload>,
) -> Result<Json<Team>, StatusCode> {
    let team = sqlx::query_as!(
        Team,
        "UPDATE teams SET name = $1, city = $2 WHERE id = $3 RETURNING id, name, city",
        payload.name,
        payload.city,
        id
    )
    .fetch_optional(&app_state.db_pool)
    .await
    .map_err(|e| {
        if e.to_string().contains("unique_team_city_name") {
            return StatusCode::CONFLICT;
        }
        internal_error(e)
    })?
    .ok_or_else(|| {
        tracing::debug!("Team with id {} not found for update", id);
        StatusCode::NOT_FOUND
    })?;
    tracing::debug!("Updated team: {:?}", team);
    Ok(Json(team))
}

// DELETE /teams/:id
pub async fn delete_team(
    State(app_state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, StatusCode> {
    let result = sqlx::query!("DELETE FROM teams WHERE id = $1", id)
        .execute(&app_state.db_pool)
        .await
        .map_err(internal_error)?;

    if result.rows_affected() == 0 {
        tracing::debug!("Team with id {} not found for deletion", id);
        Err(StatusCode::NOT_FOUND)
    } else {
        tracing::debug!("Deleted team with id {}", id);
        Ok(StatusCode::NO_CONTENT)
    }
}

// === Game Handlers ===

// POST /games
pub async fn create_game(
    State(app_state): State<AppState>,
    Json(payload): Json<CreateGamePayload>,
) -> Result<Json<Game>, StatusCode> {
    // Basic validation (could be a transaction if checking team existence)
    if payload.home_team_id == payload.away_team_id {
        tracing::debug!("Home and away team IDs cannot be the same");
        return Err(StatusCode::BAD_REQUEST);
    }

    let game_id = Uuid::new_v4();
    let game = sqlx::query_as!(
        Game,
        "INSERT INTO games (id, home_team_id, away_team_id, game_date, status) \
         VALUES ($1, $2, $3, $4, $5) RETURNING id, home_team_id, away_team_id, home_team_score, away_team_score, game_date, status AS \"status: _\"",
        game_id,
        payload.home_team_id,
        payload.away_team_id,
        payload.game_date,
        GameStatus::Scheduled as GameStatus
    )
    .fetch_one(&app_state.db_pool)
    .await
    .map_err(|e| {
        tracing::error!("Failed to create game: {}", e);
        // Check for foreign key violation (e.g., team_id doesn't exist)
        if e.to_string().contains("foreign key constraint") {
            return StatusCode::BAD_REQUEST; 
        }
        internal_error(e)
    })?;
    tracing::debug!("Created game: {:?}", game);
    Ok(Json(game))
}

// GET /games
pub async fn get_games(State(app_state): State<AppState>) -> Result<Json<Vec<Game>>, StatusCode> {
    let games = sqlx::query_as!(
        Game,
        "SELECT id, home_team_id, away_team_id, home_team_score, away_team_score, game_date, status AS \"status: _\" FROM games ORDER BY game_date DESC"
    )
    .fetch_all(&app_state.db_pool)
    .await
    .map_err(internal_error)?;
    Ok(Json(games))
}

// GET /games/:id
pub async fn get_game(
    State(app_state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<Game>, StatusCode> {
    let game = sqlx::query_as!(
        Game,
        "SELECT id, home_team_id, away_team_id, home_team_score, away_team_score, game_date, status AS \"status: _\" FROM games WHERE id = $1",
        id
    )
    .fetch_optional(&app_state.db_pool)
    .await
    .map_err(internal_error)?
    .ok_or_else(|| {
        tracing::debug!("Game with id {} not found", id);
        StatusCode::NOT_FOUND
    })?;
    Ok(Json(game))
}

// PUT /games/:id/score
pub async fn update_game_score(
    State(app_state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateScorePayload>,
) -> Result<Json<Game>, StatusCode> {
    // Check current status, potentially update to InProgress if Scheduled
    let current_game = get_game(State(app_state.clone()), Path(id)).await?;
    let mut new_status = current_game.0.status;
    if new_status == GameStatus::Scheduled {
        new_status = GameStatus::InProgress;
    }

    let game = sqlx::query_as!(
        Game,
        "UPDATE games SET home_team_score = $1, away_team_score = $2, status = $3 WHERE id = $4 RETURNING id, home_team_id, away_team_id, home_team_score, away_team_score, game_date, status AS \"status: _\"",
        Some(payload.home_team_score),
        Some(payload.away_team_score),
        new_status as GameStatus,
        id
    )
    .fetch_optional(&app_state.db_pool)
    .await
    .map_err(internal_error)?
    .ok_or_else(|| {
        tracing::debug!("Game with id {} not found for score update", id);
        StatusCode::NOT_FOUND
    })?;
    tracing::debug!("Updated score for game {}: {:?}", id, game);
    Ok(Json(game))
}

// PUT /games/:id/status
pub async fn update_game_status(
    State(app_state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateGameStatusPayload>,
) -> Result<Json<Game>, StatusCode> {
    let game = sqlx::query_as!(
        Game,
        "UPDATE games SET status = $1 WHERE id = $2 RETURNING id, home_team_id, away_team_id, home_team_score, away_team_score, game_date, status AS \"status: _\"",
        payload.status as GameStatus,
        id
    )
    .fetch_optional(&app_state.db_pool)
    .await
    .map_err(internal_error)?
    .ok_or_else(|| {
        tracing::debug!("Game with id {} not found for status update", id);
        StatusCode::NOT_FOUND
    })?;
    tracing::debug!("Updated status for game {}: {:?}", id, game);
    Ok(Json(game))
}

// DELETE /games/:id
pub async fn delete_game(
    State(app_state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, StatusCode> {
    let result = sqlx::query!("DELETE FROM games WHERE id = $1", id)
        .execute(&app_state.db_pool)
        .await
        .map_err(internal_error)?;
    if result.rows_affected() == 0 {
        tracing::debug!("Game with id {} not found for deletion", id);
        Err(StatusCode::NOT_FOUND)
    } else {
        tracing::debug!("Deleted game with id {}", id);
        Ok(StatusCode::NO_CONTENT)
    }
}

#[derive(Deserialize, Debug)] // Added Debug for logging
pub struct GetGamesQuery {
    team_id: Option<Uuid>,
    status: Option<GameStatus>,
}

// GET /games/query?team_id=...&status=...
pub async fn query_games(
    State(app_state): State<AppState>,
    Query(params): Query<GetGamesQuery>,
) -> Result<Json<Vec<Game>>, StatusCode> {
    tracing::debug!("Querying games with params: {:?}", params);
    let mut query_builder = sqlx::QueryBuilder::new(
        "SELECT id, home_team_id, away_team_id, home_team_score, away_team_score, game_date, status AS \"status: _\" FROM games WHERE 1=1"
    );

    if let Some(team_id_val) = params.team_id {
        query_builder.push(" AND (home_team_id = ");
        query_builder.push_bind(team_id_val);
        query_builder.push(" OR away_team_id = ");
        query_builder.push_bind(team_id_val);
        query_builder.push(")");
    }

    if let Some(status_val) = params.status {
        query_builder.push(" AND status = ");
        query_builder.push_bind(status_val);
    }
    query_builder.push(" ORDER BY game_date DESC");

    let games = query_builder.build_query_as::<Game>()
        .fetch_all(&app_state.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Failed to query games: {}", e);
            internal_error(e)
        })?;
    Ok(Json(games))
}

// === Score Handlers will go here === 