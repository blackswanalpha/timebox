mod database;
mod commands;

use std::sync::Arc;
use std::thread;
use std::time::Duration;
use tokio::sync::RwLock;

use tauri::Manager;
use database::Database;
use commands::{AppState, initialize_app, start_session, pause_session, resume_session, stop_session, has_active_session, save_active_session, get_timer_status, get_settings, update_settings, create_task, get_tasks, get_sessions, get_today_sessions, create_goal, get_goals, record_interruption, update_task, delete_task, get_tasks_with_pomodoro_counts, update_goal, delete_goal, get_sessions_by_date_range};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Initialize the database
            tauri::async_runtime::block_on(async {
                let app_dir = app.path().app_data_dir()
                    .expect("Failed to get app data directory");
                
                // Create the directory if it doesn't exist
                if !app_dir.exists() {
                    std::fs::create_dir_all(&app_dir)
                        .expect("Failed to create app data directory");
                }
                
                let db_path = app_dir.join("timebox.db");
                let db_path_str = db_path.to_str().expect("Invalid path");
                
                // Create the database file if it doesn't exist
                // SQLx requires the file to exist before connecting
                if !db_path.exists() {
                    std::fs::File::create(&db_path)
                        .expect("Failed to create database file");
                }
                
                // Use absolute path with sqlite:// protocol (3 slashes for absolute paths)
                let db_url = format!("sqlite://{}", db_path_str);
                
                let db = Database::new(&db_url).await
                    .expect("Failed to initialize database");

                let app_state = Arc::new(AppState {
                    db: Arc::new(db),
                    active_session: RwLock::new(None),
                });

                app.manage(app_state);
            });

            // Get window references
            let splashscreen_window = app.get_webview_window("splashscreen").unwrap();
            let main_window = app.get_webview_window("main").unwrap();

            // Perform initialization in a separate thread
            tauri::async_runtime::spawn(async move {
                // Show splash for 3 seconds before transitioning to main window
                thread::sleep(Duration::from_millis(3000));
                
                // Show main window first (in background)
                main_window.show().unwrap();
                
                // Close splashscreen
                splashscreen_window.close().unwrap();
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            initialize_app,
            start_session,
            pause_session,
            resume_session,
            stop_session,
            has_active_session,
            save_active_session,
            get_timer_status,
            get_settings,
            update_settings,
            create_task,
            get_tasks,
            get_sessions,
            get_today_sessions,
            create_goal,
            get_goals,
            record_interruption,
            update_task,
            delete_task,
            get_tasks_with_pomodoro_counts,
            update_goal,
            delete_goal,
            get_sessions_by_date_range
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
