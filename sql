-- Create the table
CREATE TABLE scheduled_words (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    word VARCHAR(5) NOT NULL,
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX idx_scheduled_words_scheduled_for ON scheduled_words(scheduled_for);

-- Create the auth table for users who want to register
CREATE TABLE auth_users (
    user_id TEXT PRIMARY KEY,  -- This is the same as their guest ID
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_registered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- User statistics table (simplified)
CREATE TABLE user_statistics (
    user_id TEXT PRIMARY KEY,  -- This is the same as their guest ID
    username TEXT NOT NULL,
    total_games_played INTEGER DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    average_guesses NUMERIC(5,2) DEFAULT 0,
    best_guess INTEGER DEFAULT 999,
    last_played_at TIMESTAMP WITH TIME ZONE
);

-- Game history table
CREATE TABLE game_history (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    word_id INTEGER REFERENCES scheduled_words(id),
    guesses_count INTEGER NOT NULL,
    won BOOLEAN NOT NULL,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_game_history_user ON game_history(user_id);
CREATE INDEX idx_auth_users_username ON auth_users(username);