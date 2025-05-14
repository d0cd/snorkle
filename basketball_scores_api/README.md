# Basketball Scores API

A REST API built with Rust, Axum, and PostgreSQL to manage basketball game scores, teams, and games.

## Prerequisites

- Rust programming language (latest stable version recommended): [https://www.rust-lang.org/tools/install](https://www.rust-lang.org/tools/install)
- Docker and Docker Compose: [https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/)
- `sqlx-cli` for database migrations: `cargo install sqlx-cli`

## Local Development Setup (with Docker Compose)

1.  **Environment Configuration**:
    -   Copy `.env.example` to `.env` in the `basketball_scores_api` directory: `cp .env.example .env`
    -   Edit the `.env` file and set your desired `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, and `POSTGRES_PORT` (if not using default 5432).
        The `DATABASE_URL` in this file is for running the Rust app *outside* of Docker Compose directly against a local/remote Postgres. The `docker-compose.yml` defines its own `DATABASE_URL` for the API service to connect to the Postgres service within the Docker network.

2.  **Build and Start Services**:
    Navigate to the `basketball_scores_api` directory and run:
    ```bash
    docker-compose up --build
    ```
    This will build the Rust API image and start both the API and PostgreSQL containers.
    The API will be available at `http://localhost:3000` (or your `${APP_PORT}`).
    The PostgreSQL database will be available on `localhost:5432` (or your `${POSTGRES_PORT}`).

3.  **Database Migrations**:
    After the PostgreSQL container is up and healthy for the first time (or if schema changes), you need to run migrations.
    -   Ensure your `.env` file is correctly set up with the `DATABASE_URL` pointing to your local PostgreSQL instance (e.g., `postgres://dbuser:dbpassword@localhost:5432/basketball_db`).
    -   From the `basketball_scores_api` directory (not inside a container), run:
        ```bash
        sqlx database create # If the database doesn't exist yet
        sqlx migrate run
        ```
    This will apply the schemas defined in the `migrations` folder to your PostgreSQL database.

## Running the Application Natively (Without Docker Compose)

1.  **Start PostgreSQL**: Ensure you have a PostgreSQL instance running and accessible.
2.  **Environment**: Set up the `.env` file with the correct `DATABASE_URL` for your PostgreSQL instance.
3.  **Migrations**: Run `sqlx database create` (if needed) and `sqlx migrate run`.
4.  **Run**: `cargo run`

## Build (Standalone)

Navigate to the `basketball_scores_api` directory and run:

```bash
cargo build
```

For a release build:

```bash
cargo build --release
```

## API Endpoints

The API provides the following endpoints:

### Health Check

- `GET /health`: Returns `OK` if the server is running and can connect to the database.

### Teams

- `POST /teams`: Create a new team.
  - Body: `{"name": "Team Name", "city": "Team City"}`
- `GET /teams`: Get a list of all teams.
- `GET /teams/{id}`: Get a specific team by its UUID.
- `PUT /teams/{id}`: Update a specific team.
  - Body: `{"name": "New Team Name", "city": "New Team City"}`
- `DELETE /teams/{id}`: Delete a specific team by its UUID.

### Games

- `POST /games`: Create a new game.
  - Body: `{"home_team_id": "uuid", "away_team_id": "uuid", "game_date": "YYYY-MM-DDTHH:MM:SSZ"}` (e.g., `"2024-01-01T20:00:00Z"`)
- `GET /games`: Get a list of all games.
- `GET /games/query?team_id={uuid}&status={GameStatus}`: Query games. Both `team_id` and `status` are optional.
  - `GameStatus` can be `Scheduled`, `InProgress`, `Finished`, `Cancelled`.
- `GET /games/{id}`: Get a specific game by its UUID.
- `DELETE /games/{id}`: Delete a specific game by its UUID.
- `PUT /games/{id}/score`: Update the score for a specific game.
  - Body: `{"home_team_score": 100, "away_team_score": 98}`
- `PUT /games/{id}/status`: Update the status of a specific game.
  - Body: `{"status": "InProgress"}` (or `Finished`, `Cancelled`, etc.)

## Mock Data

- The API attempts to initialize NBA teams into the database on startup if they don't already exist.

## Further Development Ideas

- More robust error handling and specific error codes.
- Pagination for list endpoints.
- Adding player statistics.
- User authentication/authorization.
- Automated migration runs within Docker Compose (e.g., using an entrypoint script). 