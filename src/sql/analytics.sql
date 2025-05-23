CREATE TABLE IF NOT EXISTS money_transactions (
    id INTEGER UNIQUE PRIMARY KEY AUTOINCREMENT NOT NULL,
    user_id TEXT NOT NULL,
    balance INTEGER NOT NULL,
    added_at INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS command_usage (
    command_name TEXT UNIQUE NOT NULL,
    used INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS messages_at_time (
    time TEXT UNIQUE NOT NULL,
    amount INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS messages_in_channels (
    channel_id TEXT UNIQUE PRIMARY KEY NOT NULL,
    guild_id TEXT NOT NULL,
    amount INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS member_count (
    id INTEGER UNIQUE PRIMARY KEY AUTOINCREMENT NOT NULL,
    time TEXT NOT NULL,
    server_id TEXT NOT NULL,
    amount INT NOT NULL
);

CREATE TABLE IF NOT EXISTS words (
    id INTEGER UNIQUE PRIMARY KEY AUTOINCREMENT NOT NULL,
    word TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS words_by (
    word_id INTEGER REFERENCES words (id),
    author_id TEXT NOT NULL,
    server_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    amount INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (word_id, author_id, channel_id, created_at)
);
