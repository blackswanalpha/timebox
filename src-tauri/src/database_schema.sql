-- TimeBox Pomodoro System Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    timezone TEXT DEFAULT 'UTC',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Pomodoro Settings table
CREATE TABLE IF NOT EXISTS pomodoro_settings (
    user_id TEXT PRIMARY KEY,
    focus_minutes INTEGER DEFAULT 25,
    short_break_minutes INTEGER DEFAULT 5,
    long_break_minutes INTEGER DEFAULT 15,
    cycles_before_long_break INTEGER DEFAULT 4,
    strict_mode BOOLEAN DEFAULT 0,
    auto_start_breaks BOOLEAN DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    estimated_pomodoros INTEGER DEFAULT 1,
    completed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Pomodoro Sessions table
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    task_id TEXT,
    session_type TEXT CHECK(session_type IN ('FOCUS', 'SHORT_BREAK', 'LONG_BREAK')) NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    duration_seconds INTEGER,
    interrupted BOOLEAN DEFAULT 0,
    interruption_count INTEGER DEFAULT 0,
    manual_override BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
);

-- Goals table (for long-term objectives)
CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    target_pomodoros INTEGER NOT NULL,
    completed_pomodoros INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT 0,
    
    category TEXT,
    motivation TEXT,
    target_date DATETIME,
    description TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default user if none exists
INSERT OR IGNORE INTO users (id, name) VALUES ('default_user', 'Default User');

-- Insert default settings for the default user
INSERT OR IGNORE INTO pomodoro_settings (user_id) VALUES ('default_user');