use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{Pool, Row, Sqlite, SqlitePool};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Clone)]
pub struct User {
    pub id: String,
    pub name: String,
    pub timezone: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct PomodoroSettings {
    pub user_id: String,
    pub focus_minutes: i32,
    pub short_break_minutes: i32,
    pub long_break_minutes: i32,
    pub cycles_before_long_break: i32,
    pub strict_mode: bool,
    pub auto_start_breaks: bool,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Task {
    pub id: String,
    pub user_id: String,
    pub title: String,
    pub estimated_pomodoros: i32,
    pub completed: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Serialize, Deserialize, Clone)]
pub enum SessionType {
    #[serde(rename = "FOCUS")]
    Focus,
    #[serde(rename = "SHORT_BREAK")]
    ShortBreak,
    #[serde(rename = "LONG_BREAK")]
    LongBreak,
}

impl ToString for SessionType {
    fn to_string(&self) -> String {
        match self {
            SessionType::Focus => "FOCUS".to_string(),
            SessionType::ShortBreak => "SHORT_BREAK".to_string(),
            SessionType::LongBreak => "LONG_BREAK".to_string(),
        }
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct PomodoroSession {
    pub id: String,
    pub user_id: String,
    pub task_id: Option<String>,
    pub session_type: SessionType,
    pub start_time: DateTime<Utc>,
    pub end_time: Option<DateTime<Utc>>,
    pub duration_seconds: Option<i32>,
    pub interrupted: bool,
    pub interruption_count: i32,
    pub manual_override: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Goal {
    pub id: String,
    pub user_id: String,
    pub title: String,
    pub target_pomodoros: i32,
    pub completed_pomodoros: i32,
    pub completed: bool,
    pub created_at: DateTime<Utc>,
}

pub struct Database {
    pool: Pool<Sqlite>,
}

impl Database {
    pub async fn new(db_path: &str) -> Result<Self, sqlx::Error> {
        let pool = SqlitePool::connect(db_path).await?;
        
        // Run migrations
        Self::run_migrations(&pool).await?;
        
        Ok(Database { pool })
    }

    async fn run_migrations(pool: &Pool<Sqlite>) -> Result<(), sqlx::Error> {
        // Create tables
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                timezone TEXT DEFAULT 'UTC',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
            "#
        ).execute(pool).await?;

        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS pomodoro_settings (
                user_id TEXT PRIMARY KEY,
                focus_minutes INTEGER DEFAULT 25,
                short_break_minutes INTEGER DEFAULT 5,
                long_break_minutes INTEGER DEFAULT 15,
                cycles_before_long_break INTEGER DEFAULT 4,
                strict_mode BOOLEAN DEFAULT 0,
                auto_start_breaks BOOLEAN DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            "#
        ).execute(pool).await?;

        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                estimated_pomodoros INTEGER DEFAULT 1,
                completed BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            "#
        ).execute(pool).await?;

        sqlx::query(
            r#"
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
            )
            "#
        ).execute(pool).await?;

        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS goals (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                target_pomodoros INTEGER NOT NULL,
                completed_pomodoros INTEGER DEFAULT 0,
                completed BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            "#
        ).execute(pool).await?;

        // Insert default user if none exists
        sqlx::query(
            r#"
            INSERT OR IGNORE INTO users (id, name) VALUES (?, ?)
            "#,
        )
        .bind("default_user")
        .bind("Default User")
        .execute(pool)
        .await?;

        // Insert default settings for the default user
        sqlx::query(
            r#"
            INSERT OR IGNORE INTO pomodoro_settings (user_id) VALUES (?)
            "#,
        )
        .bind("default_user")
        .execute(pool)
        .await?;

        Ok(())
    }

    pub async fn get_or_create_user(&self, user_id: Option<String>, name: Option<String>) -> Result<User, sqlx::Error> {
        let user_id = match user_id {
            Some(id) => id,
            None => "default_user".to_string(),
        };

        let user_name = match name {
            Some(n) => n,
            None => "Default User".to_string(),
        };

        // Check if user exists
        if let Some(user) = self.get_user(&user_id).await? {
            return Ok(user);
        }

        // Create user if doesn't exist
        let new_user = User {
            id: user_id.clone(),
            name: user_name,
            timezone: "UTC".to_string(),
            created_at: Utc::now(),
        };

        sqlx::query(
            r#"
            INSERT INTO users (id, name, timezone) VALUES (?, ?, ?)
            "#,
        )
        .bind(&new_user.id)
        .bind(&new_user.name)
        .bind(&new_user.timezone)
        .execute(&self.pool)
        .await?;

        // Create default settings for the new user
        sqlx::query(
            r#"
            INSERT OR IGNORE INTO pomodoro_settings (user_id) VALUES (?)
            "#,
        )
        .bind(&new_user.id)
        .execute(&self.pool)
        .await?;

        Ok(new_user)
    }

    pub async fn get_user(&self, user_id: &str) -> Result<Option<User>, sqlx::Error> {
        let row = sqlx::query(
            r#"
            SELECT id, name, timezone, created_at
            FROM users
            WHERE id = ?
            "#
        )
        .bind(user_id)
        .fetch_optional(&self.pool)
        .await?;

        if let Some(row) = row {
            Ok(Some(User {
                id: row.get("id"),
                name: row.get("name"),
                timezone: row.get("timezone"),
                created_at: row.get("created_at"),
            }))
        } else {
            Ok(None)
        }
    }

    pub async fn get_or_create_settings(&self, user_id: &str) -> Result<PomodoroSettings, sqlx::Error> {
        if let Some(settings) = self.get_settings(user_id).await? {
            return Ok(settings);
        }

        // Create default settings
        let settings = PomodoroSettings {
            user_id: user_id.to_string(),
            focus_minutes: 25,
            short_break_minutes: 5,
            long_break_minutes: 15,
            cycles_before_long_break: 4,
            strict_mode: false,
            auto_start_breaks: false,
        };

        sqlx::query(
            r#"
            INSERT INTO pomodoro_settings (user_id, focus_minutes, short_break_minutes, long_break_minutes, cycles_before_long_break, strict_mode, auto_start_breaks)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&settings.user_id)
        .bind(settings.focus_minutes)
        .bind(settings.short_break_minutes)
        .bind(settings.long_break_minutes)
        .bind(settings.cycles_before_long_break)
        .bind(settings.strict_mode)
        .bind(settings.auto_start_breaks)
        .execute(&self.pool)
        .await?;

        Ok(settings)
    }

    pub async fn get_settings(&self, user_id: &str) -> Result<Option<PomodoroSettings>, sqlx::Error> {
        let row = sqlx::query(
            r#"
            SELECT user_id, focus_minutes, short_break_minutes, long_break_minutes, cycles_before_long_break, strict_mode, auto_start_breaks
            FROM pomodoro_settings
            WHERE user_id = ?
            "#
        )
        .bind(user_id)
        .fetch_optional(&self.pool)
        .await?;

        if let Some(row) = row {
            Ok(Some(PomodoroSettings {
                user_id: row.get("user_id"),
                focus_minutes: row.get("focus_minutes"),
                short_break_minutes: row.get("short_break_minutes"),
                long_break_minutes: row.get("long_break_minutes"),
                cycles_before_long_break: row.get("cycles_before_long_break"),
                strict_mode: row.get::<i32, &str>("strict_mode") != 0,
                auto_start_breaks: row.get::<i32, &str>("auto_start_breaks") != 0,
            }))
        } else {
            Ok(None)
        }
    }

    pub async fn update_settings(&self, settings: &PomodoroSettings) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"
            UPDATE pomodoro_settings
            SET focus_minutes = ?, short_break_minutes = ?, long_break_minutes = ?, 
                cycles_before_long_break = ?, strict_mode = ?, auto_start_breaks = ?
            WHERE user_id = ?
            "#,
        )
        .bind(settings.focus_minutes)
        .bind(settings.short_break_minutes)
        .bind(settings.long_break_minutes)
        .bind(settings.cycles_before_long_break)
        .bind(settings.strict_mode)
        .bind(settings.auto_start_breaks)
        .bind(&settings.user_id)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn create_task(&self, user_id: &str, title: &str, estimated_pomodoros: Option<i32>) -> Result<Task, sqlx::Error> {
        let task_id = Uuid::new_v4().to_string();
        let estimated = estimated_pomodoros.unwrap_or(1);

        sqlx::query(
            r#"
            INSERT INTO tasks (id, user_id, title, estimated_pomodoros)
            VALUES (?, ?, ?, ?)
            "#,
        )
        .bind(&task_id)
        .bind(user_id)
        .bind(title)
        .bind(estimated)
        .execute(&self.pool)
        .await?;

        Ok(Task {
            id: task_id,
            user_id: user_id.to_string(),
            title: title.to_string(),
            estimated_pomodoros: estimated,
            completed: false,
            created_at: Utc::now(),
        })
    }

    pub async fn get_tasks(&self, user_id: &str) -> Result<Vec<Task>, sqlx::Error> {
        let rows = sqlx::query(
            r#"
            SELECT id, user_id, title, estimated_pomodoros, completed, created_at
            FROM tasks
            WHERE user_id = ?
            ORDER BY created_at DESC
            "#
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await?;

        let tasks = rows.into_iter().map(|row| Task {
            id: row.get("id"),
            user_id: row.get("user_id"),
            title: row.get("title"),
            estimated_pomodoros: row.get("estimated_pomodoros"),
            completed: row.get::<i32, &str>("completed") != 0,
            created_at: row.get("created_at"),
        }).collect();

        Ok(tasks)
    }

    pub async fn get_task(&self, task_id: &str) -> Result<Option<Task>, sqlx::Error> {
        let row = sqlx::query(
            r#"
            SELECT id, user_id, title, estimated_pomodoros, completed, created_at
            FROM tasks
            WHERE id = ?
            "#
        )
        .bind(task_id)
        .fetch_optional(&self.pool)
        .await?;

        if let Some(row) = row {
            Ok(Some(Task {
                id: row.get("id"),
                user_id: row.get("user_id"),
                title: row.get("title"),
                estimated_pomodoros: row.get("estimated_pomodoros"),
                completed: row.get::<i32, &str>("completed") != 0,
                created_at: row.get("created_at"),
            }))
        } else {
            Ok(None)
        }
    }

    pub async fn create_session(&self, session: &PomodoroSession) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"
            INSERT INTO pomodoro_sessions (id, user_id, task_id, session_type, start_time, interrupted, interruption_count, manual_override)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&session.id)
        .bind(&session.user_id)
        .bind(&session.task_id)
        .bind(session.session_type.to_string())
        .bind(&session.start_time)
        .bind(session.interrupted)
        .bind(session.interruption_count)
        .bind(session.manual_override)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn update_session(&self, session_id: &str, end_time: DateTime<Utc>, duration_seconds: i32) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"
            UPDATE pomodoro_sessions
            SET end_time = ?, duration_seconds = ?
            WHERE id = ?
            "#,
        )
        .bind(end_time)
        .bind(duration_seconds)
        .bind(session_id)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn get_sessions(&self, user_id: &str, limit: Option<i32>) -> Result<Vec<PomodoroSession>, sqlx::Error> {
        let query = if let Some(_lim) = limit {
            r#"
            SELECT id, user_id, task_id, session_type, start_time, end_time, duration_seconds, interrupted, interruption_count, manual_override, created_at
            FROM pomodoro_sessions
            WHERE user_id = ?
            ORDER BY start_time DESC
            LIMIT ?
            "#
        } else {
            r#"
            SELECT id, user_id, task_id, session_type, start_time, end_time, duration_seconds, interrupted, interruption_count, manual_override, created_at
            FROM pomodoro_sessions
            WHERE user_id = ?
            ORDER BY start_time DESC
            "#
        };

        let rows = if let Some(lim) = limit {
            sqlx::query(query)
                .bind(user_id)
                .bind(lim)
                .fetch_all(&self.pool)
                .await?
        } else {
            sqlx::query(query)
                .bind(user_id)
                .fetch_all(&self.pool)
                .await?
        };

        let sessions = rows.into_iter().map(|row: sqlx::sqlite::SqliteRow| {
            let session_type_str: String = row.get("session_type");
            let session_type = match session_type_str.as_str() {
                "FOCUS" => SessionType::Focus,
                "SHORT_BREAK" => SessionType::ShortBreak,
                "LONG_BREAK" => SessionType::LongBreak,
                _ => SessionType::Focus, // Default fallback
            };

            PomodoroSession {
                id: row.get("id"),
                user_id: row.get("user_id"),
                task_id: row.get("task_id"),
                session_type,
                start_time: row.get("start_time"),
                end_time: row.get("end_time"),
                duration_seconds: row.get("duration_seconds"),
                interrupted: row.get::<i32, &str>("interrupted") != 0,
                interruption_count: row.get("interruption_count"),
                manual_override: row.get::<i32, &str>("manual_override") != 0,
                created_at: row.get("created_at"),
            }
        }).collect();

        Ok(sessions)
    }

    pub async fn get_today_sessions(&self, user_id: &str) -> Result<Vec<PomodoroSession>, sqlx::Error> {
        let today_start = Utc::now().date_naive().and_hms_opt(0, 0, 0).unwrap().and_local_timezone(Utc).unwrap();
        let today_end = today_start + chrono::Duration::days(1);

        let rows = sqlx::query(
            r#"
            SELECT id, user_id, task_id, session_type, start_time, end_time, duration_seconds, interrupted, interruption_count, manual_override, created_at
            FROM pomodoro_sessions
            WHERE user_id = ? AND start_time >= ? AND start_time < ?
            ORDER BY start_time DESC
            "#
        )
        .bind(user_id)
        .bind(today_start)
        .bind(today_end)
        .fetch_all(&self.pool)
        .await?;

        let sessions = rows.into_iter().map(|row| {
            let session_type_str: String = row.get("session_type");
            let session_type = match session_type_str.as_str() {
                "FOCUS" => SessionType::Focus,
                "SHORT_BREAK" => SessionType::ShortBreak,
                "LONG_BREAK" => SessionType::LongBreak,
                _ => SessionType::Focus, // Default fallback
            };

            PomodoroSession {
                id: row.get("id"),
                user_id: row.get("user_id"),
                task_id: row.get("task_id"),
                session_type,
                start_time: row.get("start_time"),
                end_time: row.get("end_time"),
                duration_seconds: row.get("duration_seconds"),
                interrupted: row.get::<i32, &str>("interrupted") != 0,
                interruption_count: row.get("interruption_count"),
                manual_override: row.get::<i32, &str>("manual_override") != 0,
                created_at: row.get("created_at"),
            }
        }).collect();

        Ok(sessions)
    }

    pub async fn create_goal(&self, user_id: &str, title: &str, target_pomodoros: i32) -> Result<Goal, sqlx::Error> {
        let goal_id = Uuid::new_v4().to_string();

        sqlx::query(
            r#"
            INSERT INTO goals (id, user_id, title, target_pomodoros)
            VALUES (?, ?, ?, ?)
            "#,
        )
        .bind(&goal_id)
        .bind(user_id)
        .bind(title)
        .bind(target_pomodoros)
        .execute(&self.pool)
        .await?;

        Ok(Goal {
            id: goal_id,
            user_id: user_id.to_string(),
            title: title.to_string(),
            target_pomodoros,
            completed_pomodoros: 0,
            completed: false,
            created_at: Utc::now(),
        })
    }

    pub async fn get_goals(&self, user_id: &str) -> Result<Vec<Goal>, sqlx::Error> {
        let rows = sqlx::query(
            r#"
            SELECT id, user_id, title, target_pomodoros, completed_pomodoros, completed, created_at
            FROM goals
            WHERE user_id = ?
            ORDER BY created_at DESC
            "#
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await?;

        let goals = rows.into_iter().map(|row| Goal {
            id: row.get("id"),
            user_id: row.get("user_id"),
            title: row.get("title"),
            target_pomodoros: row.get("target_pomodoros"),
            completed_pomodoros: row.get("completed_pomodoros"),
            completed: row.get::<i32, &str>("completed") != 0,
            created_at: row.get("created_at"),
        }).collect();

        Ok(goals)
    }

    pub async fn increment_interruption_count(&self, session_id: &str) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"
            UPDATE pomodoro_sessions
            SET interruption_count = interruption_count + 1,
                interrupted = 1
            WHERE id = ?
            "#,
        )
        .bind(session_id)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn update_task(&self, task_id: &str, title: Option<&str>, estimated_pomodoros: Option<i32>, completed: Option<bool>) -> Result<Task, sqlx::Error> {
        let current_task = self.get_task(task_id).await?.ok_or_else(|| sqlx::Error::RowNotFound)?;

        let new_title = title.unwrap_or(&current_task.title);
        let new_estimated = estimated_pomodoros.unwrap_or(current_task.estimated_pomodoros);
        let new_completed = completed.unwrap_or(current_task.completed);

        sqlx::query(
            r#"
            UPDATE tasks
            SET title = ?, estimated_pomodoros = ?, completed = ?
            WHERE id = ?
            "#,
        )
        .bind(new_title)
        .bind(new_estimated)
        .bind(new_completed)
        .bind(task_id)
        .execute(&self.pool)
        .await?;

        Ok(Task {
            id: task_id.to_string(),
            user_id: current_task.user_id,
            title: new_title.to_string(),
            estimated_pomodoros: new_estimated,
            completed: new_completed,
            created_at: current_task.created_at,
        })
    }

    pub async fn delete_task(&self, task_id: &str) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"
            DELETE FROM tasks
            WHERE id = ?
            "#,
        )
        .bind(task_id)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn get_tasks_with_pomodoro_counts(&self, user_id: &str) -> Result<Vec<(Task, i64)>, sqlx::Error> {
        let rows = sqlx::query(
            r#"
            SELECT 
                t.id, t.user_id, t.title, t.estimated_pomodoros, t.completed, t.created_at,
                COUNT(ps.id) as pomodoro_count
            FROM tasks t
            LEFT JOIN pomodoro_sessions ps ON t.id = ps.task_id AND ps.session_type = 'FOCUS'
            WHERE t.user_id = ?
            GROUP BY t.id
            ORDER BY t.created_at DESC
            "#
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await?;

        let tasks_with_counts = rows.into_iter().map(|row| {
            let task = Task {
                id: row.get("id"),
                user_id: row.get("user_id"),
                title: row.get("title"),
                estimated_pomodoros: row.get("estimated_pomodoros"),
                completed: row.get::<i32, &str>("completed") != 0,
                created_at: row.get("created_at"),
            };
            let count: i64 = row.get("pomodoro_count");
            (task, count)
        }).collect();

        Ok(tasks_with_counts)
    }
}