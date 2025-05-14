# Stage 1: Build the application
FROM rust:1.82-slim-bullseye AS builder

# Install dependencies that might be needed for compilation of certain crates (e.g., openssl-sys)
# For a basic Axum app, these might not be strictly necessary but are good to have.
RUN apt-get update && apt-get install -y libssl-dev pkg-config && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy manifests, lock file, sqlx offline data, and source code
COPY Cargo.toml Cargo.lock ./
COPY .sqlx ./.sqlx/
COPY src ./src

# Build the application in release mode
# Using --locked ensures that Cargo.lock is used, for reproducible builds
RUN cargo build --release --locked

# Stage 2: Create the runtime image
FROM debian:bullseye-slim AS runtime

# Create a non-root user for security
ARG APP_USER=appuser
RUN groupadd -r "${APP_USER}" && useradd --no-log-init -r -g "${APP_USER}" "${APP_USER}"

WORKDIR /app

# Copy the compiled binary from the builder stage
COPY --from=builder /app/target/release/basketball_scores_api .

# Ensure the binary is executable and owned by the app user
RUN chmod +x ./basketball_scores_api && chown ${APP_USER}:${APP_USER} ./basketball_scores_api

# Switch to the non-root user
USER ${APP_USER}

# Expose the port the app runs on
EXPOSE 3000

# Set default logging level (can be overridden at runtime)
ENV RUST_LOG="basketball_scores_api=info,tower_http=info"

# Command to run the application
CMD ["./basketball_scores_api"] 