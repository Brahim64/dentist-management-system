use std::env;

use sqlx::postgres::PgPoolOptions;
use tauri::Manager;

use crate::state::AppState;
mod commands;
mod errors;
mod models;
mod repositories;
mod services;
mod state;
use crate::commands::appointment_commands::{
    create_appointment, delete_appointment, get_appointments, get_appointments_by_patient,
    update_appointment,
};
use crate::commands::patient_commands::{
    create_patient, delete_patient, get_patient_by_id, get_patient_by_phone, get_patients,
    update_patient,
};
use crate::commands::treatment_plan_commands::{
    create_treatment_plan, get_treatment_plans, get_treatment_plans_by_patient,
    update_treatment_plan_item_status,
};
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
            tauri::async_runtime::block_on(sqlx::migrate!("./migrations").run(&db))
                .expect("failed to run database migrations");
            app.manage(AppState { db });

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            create_patient,
            update_patient,
            delete_patient,
            get_patient_by_phone,
            get_patients,
            get_patient_by_id,
            create_appointment,
            delete_appointment,
            update_appointment,
            get_appointments,
            get_appointments_by_patient,
            create_treatment_plan,
            get_treatment_plans,
            get_treatment_plans_by_patient,
            update_treatment_plan_item_status
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
