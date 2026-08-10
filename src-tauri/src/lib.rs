use std::env;

use sqlx::postgres::PgPoolOptions;
use tauri::Manager;

use crate::state::AppState;
mod commands;
mod state;
mod errors;
mod models;
mod repositories;
mod services;
use crate::commands::patient_commands::{create_patient,update_patient,delete_patient,get_patient_by_phone,get_patients};
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    dotenvy::dotenv().ok();
    tauri::Builder::default()
        .setup(|app| {
            let database_url = env::var("DATABASE_URL").expect("database url must be set");
            let db = tauri::async_runtime::block_on(
                PgPoolOptions::new()
                    .max_connections(10)
                    .connect(&database_url),
            )
            .expect("failed to connect to postgres");
            app.manage(AppState { db });

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![create_patient,update_patient,delete_patient,get_patient_by_phone,get_patients])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
