-- Add up migration script here
    -- Create Team Table
    CREATE TABLE teams (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        CONSTRAINT unique_team_city_name UNIQUE (name, city) -- Ensure team names are unique within a city
    );

    -- Create GameStatus Enum Type (PostgreSQL specific)
    DO $$ BEGIN
        CREATE TYPE game_status_enum AS ENUM ('Scheduled', 'InProgress', 'Finished', 'Cancelled');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;

    -- Create Game Table
    CREATE TABLE games (
        id UUID PRIMARY KEY,
        home_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        away_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        home_team_score INTEGER,
        away_team_score INTEGER,
        game_date TIMESTAMPTZ NOT NULL,
        status game_status_enum NOT NULL,
        CONSTRAINT check_different_teams CHECK (home_team_id <> away_team_id)
    );

    -- Optional: Add indexes for frequently queried columns
    CREATE INDEX idx_games_home_team_id ON games(home_team_id);
    CREATE INDEX idx_games_away_team_id ON games(away_team_id);
    CREATE INDEX idx_games_game_date ON games(game_date);
    CREATE INDEX idx_games_status ON games(status);