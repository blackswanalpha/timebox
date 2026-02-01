use std::sync::Arc;
use tokio::sync::RwLock;
use chrono::{DateTime, Utc, Duration};
use serde::{Deserialize, Serialize};

use crate::database::{Database, PomodoroSettings, Task, PomodoroSession, SessionType, Goal};

// Global state to hold the database connection and active session
pub struct AppState {
    pub db: Arc<Database>,
    pub active_session: RwLock<Option<ActiveSession>>,
}

pub struct ActiveSession {
    pub session: PomodoroSession,
    pub start_time: DateTime<Utc>,
    pub remaining_duration: Duration,
    pub is_paused: bool,
}

#[derive(Serialize, Deserialize)]
pub struct StartSessionRequest {
    pub user_id: Option<String>,
    pub task_id: Option<String>,
    pub session_type: SessionType,
}

#[derive(Serialize, Deserialize)]
pub struct TimerStatusResponse {
    pub time_remaining: i64,  // seconds
    pub is_running: bool,
    pub is_paused: bool,
    pub session_type: SessionType,
    pub task_title: Option<String>,
    pub interruption_count: i32,
}

#[derive(Serialize, Deserialize)]
pub struct SettingsUpdateRequest {
    pub user_id: String,
    pub focus_minutes: Option<i32>,
    pub short_break_minutes: Option<i32>,
    pub long_break_minutes: Option<i32>,
    pub cycles_before_long_break: Option<i32>,
    pub strict_mode: Option<bool>,
    pub auto_start_breaks: Option<bool>,
}

#[derive(Serialize, Deserialize)]
pub struct UpdateTaskRequest {
    pub task_id: String,
    pub title: Option<String>,
    pub estimated_pomodoros: Option<i32>,
    pub completed: Option<bool>,
}

#[derive(Serialize, Deserialize)]
pub struct TaskWithPomodoroCount {
    #[serde(flatten)]
    pub task: Task,
    pub actual_pomodoros: i64,
}

#[tauri::command]
pub async fn initialize_app(_state: tauri::State<'_, Arc<AppState>>) -> Result<(), String> {
    // Initialization logic can go here if needed
    Ok(())
}

#[tauri::command]
pub async fn start_session(
    state: tauri::State<'_, Arc<AppState>>,
    req: StartSessionRequest,
) -> Result<PomodoroSession, String> {
    let user = state.db.get_or_create_user(req.user_id, Some("Default User".to_string())).await
        .map_err(|e| e.to_string())?;
    
    let user_id = user.id.clone();
    let session_type = req.session_type.clone();
    
    let session_id = uuid::Uuid::new_v4().to_string();
    let now = Utc::now();
    
    let session = PomodoroSession {
        id: session_id,
        user_id: user_id.clone(),
        task_id: req.task_id,
        session_type: session_type.clone(),
        start_time: now,
        end_time: None,
        duration_seconds: None,
        interrupted: false,
        interruption_count: 0,
        manual_override: false,
        created_at: now,
    };
    
    state.db.create_session(&session).await
        .map_err(|e| e.to_string())?;
    
    // Update active session in state
    {
        let mut active_session = state.active_session.write().await;
        *active_session = Some(ActiveSession {
            session: session.clone(),
            start_time: now,
            remaining_duration: match session_type {
                SessionType::Focus => Duration::minutes(
                    state.db.get_settings(&user_id).await
                        .map_err(|e| e.to_string())?
                        .unwrap_or_else(|| PomodoroSettings {
                            user_id: user_id.clone(),
                            focus_minutes: 25,
                            short_break_minutes: 5,
                            long_break_minutes: 15,
                            cycles_before_long_break: 4,
                            strict_mode: false,
                            auto_start_breaks: false,
                        })
                        .focus_minutes as i64
                ),
                SessionType::ShortBreak => Duration::minutes(
                    state.db.get_settings(&user_id).await
                        .map_err(|e| e.to_string())?
                        .unwrap_or_else(|| PomodoroSettings {
                            user_id: user_id.clone(),
                            focus_minutes: 25,
                            short_break_minutes: 5,
                            long_break_minutes: 15,
                            cycles_before_long_break: 4,
                            strict_mode: false,
                            auto_start_breaks: false,
                        })
                        .short_break_minutes as i64
                ),
                SessionType::LongBreak => Duration::minutes(
                    state.db.get_settings(&user_id).await
                        .map_err(|e| e.to_string())?
                        .unwrap_or_else(|| PomodoroSettings {
                            user_id: user_id.clone(),
                            focus_minutes: 25,
                            short_break_minutes: 5,
                            long_break_minutes: 15,
                            cycles_before_long_break: 4,
                            strict_mode: false,
                            auto_start_breaks: false,
                        })
                        .long_break_minutes as i64
                ),
            },
            is_paused: false,
        });
    }
    
    Ok(session)
}

#[tauri::command]
pub async fn pause_session(state: tauri::State<'_, Arc<AppState>>) -> Result<(), String> {
    let mut active_session = state.active_session.write().await;
    if let Some(session) = active_session.as_mut() {
        session.is_paused = true;
        // Calculate remaining duration based on elapsed time
        let elapsed = Utc::now() - session.start_time;
        session.remaining_duration = session.remaining_duration - elapsed;
        session.start_time = Utc::now(); // Reset start time for when resuming
    }
    Ok(())
}

#[tauri::command]
pub async fn resume_session(state: tauri::State<'_, Arc<AppState>>) -> Result<(), String> {
    let mut active_session = state.active_session.write().await;
    if let Some(session) = active_session.as_mut() {
        session.is_paused = false;
        session.start_time = Utc::now(); // Reset start time
    }
    Ok(())
}

#[tauri::command]
pub async fn stop_session(state: tauri::State<'_, Arc<AppState>>) -> Result<(), String> {
    let mut active_session = state.active_session.write().await;
    if let Some(session) = active_session.take() {
        let duration = (Utc::now() - session.start_time).num_seconds() as i32;
        state.db.update_session(&session.session.id, Utc::now(), duration)
            .await
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub async fn has_active_session(state: tauri::State<'_, Arc<AppState>>) -> Result<bool, String> {
    let active_session = state.active_session.read().await;
    Ok(active_session.is_some())
}

#[tauri::command]
pub async fn save_active_session(state: tauri::State<'_, Arc<AppState>>) -> Result<(), String> {
    let mut active_session = state.active_session.write().await;
    if let Some(session) = active_session.take() {
        let duration = (Utc::now() - session.start_time).num_seconds() as i32;
        state.db.update_session(&session.session.id, Utc::now(), duration)
            .await
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub async fn get_timer_status(state: tauri::State<'_, Arc<AppState>>) -> Result<TimerStatusResponse, String> {
    let active_session = state.active_session.read().await;
    
    if let Some(session) = active_session.as_ref() {
        let mut time_remaining = session.remaining_duration.num_seconds();
        
        if !session.is_paused {
            let elapsed_since_resume = (Utc::now() - session.start_time).num_seconds();
            time_remaining -= elapsed_since_resume;
            
            if time_remaining < 0 {
                time_remaining = 0;
            }
        }
        
        let task_title = if let Some(task_id) = &session.session.task_id {
            if let Ok(Some(task)) = state.db.get_task(task_id).await {
                Some(task.title)
            } else {
                None
            }
        } else {
            None
        };
        
        Ok(TimerStatusResponse {
            time_remaining,
            is_running: true,
            is_paused: session.is_paused,
            session_type: session.session.session_type.clone(),
            task_title,
            interruption_count: session.session.interruption_count,
        })
    } else {
        // Return default values when no active session
        Ok(TimerStatusResponse {
            time_remaining: 0,
            is_running: false,
            is_paused: false,
            session_type: SessionType::Focus,
            task_title: None,
            interruption_count: 0,
        })
    }
}

#[tauri::command]
pub async fn get_settings(state: tauri::State<'_, Arc<AppState>>, user_id: String) -> Result<PomodoroSettings, String> {
    state.db.get_or_create_settings(&user_id).await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_settings(state: tauri::State<'_, Arc<AppState>>, req: SettingsUpdateRequest) -> Result<(), String> {
    let current_settings = state.db.get_settings(&req.user_id).await
        .map_err(|e| e.to_string())?
        .unwrap_or_else(|| PomodoroSettings {
            user_id: req.user_id.clone(),
            focus_minutes: 25,
            short_break_minutes: 5,
            long_break_minutes: 15,
            cycles_before_long_break: 4,
            strict_mode: false,
            auto_start_breaks: false,
        });

    let updated_settings = PomodoroSettings {
        user_id: req.user_id,
        focus_minutes: req.focus_minutes.unwrap_or(current_settings.focus_minutes),
        short_break_minutes: req.short_break_minutes.unwrap_or(current_settings.short_break_minutes),
        long_break_minutes: req.long_break_minutes.unwrap_or(current_settings.long_break_minutes),
        cycles_before_long_break: req.cycles_before_long_break.unwrap_or(current_settings.cycles_before_long_break),
        strict_mode: req.strict_mode.unwrap_or(current_settings.strict_mode),
        auto_start_breaks: req.auto_start_breaks.unwrap_or(current_settings.auto_start_breaks),
    };

    state.db.update_settings(&updated_settings).await
        .map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
pub async fn create_task(
    state: tauri::State<'_, Arc<AppState>>,
    user_id: String,
    title: String,
    estimated_pomodoros: Option<i32>,
) -> Result<Task, String> {
    state.db.create_task(&user_id, &title, estimated_pomodoros).await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_tasks(state: tauri::State<'_, Arc<AppState>>, user_id: String) -> Result<Vec<Task>, String> {
    state.db.get_tasks(&user_id).await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_sessions(state: tauri::State<'_, Arc<AppState>>, user_id: String) -> Result<Vec<PomodoroSession>, String> {
    state.db.get_sessions(&user_id, None).await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_today_sessions(state: tauri::State<'_, Arc<AppState>>, user_id: String) -> Result<Vec<PomodoroSession>, String> {
    state.db.get_today_sessions(&user_id).await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_goal(
    state: tauri::State<'_, Arc<AppState>>,
    user_id: String,
    title: String,
    target_pomodoros: i32,
    category: Option<String>,
    motivation: Option<String>,
    target_date: Option<DateTime<Utc>>,
    description: Option<String>,
) -> Result<Goal, String> {
    state.db.create_goal(&user_id, &title, target_pomodoros, category, motivation, target_date, description).await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_goals(state: tauri::State<'_, Arc<AppState>>, user_id: String) -> Result<Vec<Goal>, String> {
    state.db.get_goals(&user_id).await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn record_interruption(state: tauri::State<'_, Arc<AppState>>) -> Result<i32, String> {
    let mut active_session = state.active_session.write().await;
    if let Some(session) = active_session.as_mut() {
        // Increment interruption count in memory
        session.session.interruption_count += 1;
        let new_count = session.session.interruption_count;
        let session_id = session.session.id.clone();
        
        // Update in database
        state.db.increment_interruption_count(&session_id).await
            .map_err(|e| e.to_string())?;
        
        Ok(new_count)
    } else {
        Err("No active session".to_string())
    }
}

#[tauri::command]
pub async fn update_task(
    state: tauri::State<'_, Arc<AppState>>,
    req: UpdateTaskRequest,
) -> Result<Task, String> {
    state.db.update_task(
        &req.task_id,
        req.title.as_deref(),
        req.estimated_pomodoros,
        req.completed,
    ).await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_task(
    state: tauri::State<'_, Arc<AppState>>,
    task_id: String,
) -> Result<(), String> {
    state.db.delete_task(&task_id).await
        .map_err(|e| e.to_string())
}

#[derive(Serialize, Deserialize)]
pub struct UpdateGoalRequest {
    pub goal_id: String,
    pub title: Option<String>,
    pub target_pomodoros: Option<i32>,
    pub completed: Option<bool>,
    pub category: Option<String>,
    pub motivation: Option<String>,
    pub target_date: Option<DateTime<Utc>>,
    pub description: Option<String>,
}

#[tauri::command]
pub async fn get_tasks_with_pomodoro_counts(
    state: tauri::State<'_, Arc<AppState>>,
    user_id: String,
) -> Result<Vec<TaskWithPomodoroCount>, String> {
    let tasks_with_counts = state.db.get_tasks_with_pomodoro_counts(&user_id).await
        .map_err(|e| e.to_string())?;
    
    let result = tasks_with_counts.into_iter()
        .map(|(task, count)| TaskWithPomodoroCount {
            task,
            actual_pomodoros: count,
        })
        .collect();
    
    Ok(result)
}

#[tauri::command]
pub async fn update_goal(
    state: tauri::State<'_, Arc<AppState>>,
    req: UpdateGoalRequest,
) -> Result<(), String> {
    state.db.update_goal(
        &req.goal_id, 
        req.title.as_deref(), 
        req.target_pomodoros, 
        req.completed,
        req.category,
        req.motivation,
        req.target_date,
        req.description
    ).await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_goal(
    state: tauri::State<'_, Arc<AppState>>,
    goal_id: String,
) -> Result<(), String> {
    state.db.delete_goal(&goal_id).await
        .map_err(|e| e.to_string())
}