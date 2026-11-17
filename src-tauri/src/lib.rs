use std::time::Duration;

use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};
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
    tauri::Builder::default()
        .setup(|app| {
            let database_dir = app.path().app_data_dir()?;
            std::fs::create_dir_all(&database_dir)?;
            let database_path = database_dir.join("dentist-management-system.sqlite");
            let connect_options = SqliteConnectOptions::new()
                .filename(database_path)
                .create_if_missing(true)
                .foreign_keys(true)
                .busy_timeout(Duration::from_secs(5));
            let db = tauri::async_runtime::block_on(
                SqlitePoolOptions::new()
                    .max_connections(5)
                    .connect_with(connect_options),
            )
            .expect("failed to open SQLite database");
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

#[cfg(test)]
mod sqlite_tests {
    use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};
    use uuid::Uuid;

    use crate::{
        models::{
            appointment::CreateAppointmentInput,
            patient::CreatePatientInput,
            treatment_plan::{CreateTreatmentPlanInput, CreateTreatmentPlanItemInput},
        },
        repositories::{appointment, patient::PatientRepository, treatment_plan},
    };

    #[test]
    fn sqlite_migrations_and_repositories_work() {
        tauri::async_runtime::block_on(async {
            let pool = SqlitePoolOptions::new()
                .max_connections(1)
                .connect_with(
                    SqliteConnectOptions::new()
                        .filename(":memory:")
                        .foreign_keys(true),
                )
                .await
                .expect("open in-memory SQLite database");
            sqlx::migrate!("./migrations")
                .run(&pool)
                .await
                .expect("run SQLite migrations");

            let created_patient = PatientRepository::create(
                &pool,
                &CreatePatientInput {
                    first_name: "Test".to_owned(),
                    last_name: "Patient".to_owned(),
                    date_of_birth: "1990-01-01".to_owned(),
                    gender: "Other".to_owned(),
                    phone: "555-0100".to_owned(),
                    email: None,
                    address: None,
                    emergency_contact_name: None,
                    emergency_contact_phone: None,
                    blood_type: None,
                    allergies: None,
                    medical_conditions: None,
                    current_medications: None,
                    insurance_provider: None,
                    insurance_policy_number: None,
                    notes: None,
                },
            )
            .await
            .expect("create patient");
            assert_eq!(
                PatientRepository::find_by_id(&pool, created_patient.id)
                    .await
                    .expect("read patient")
                    .id,
                created_patient.id
            );
            assert_eq!(
                PatientRepository::get_all_summaries(&pool)
                    .await
                    .expect("read patient summaries")
                    .len(),
                1
            );

            let plan = treatment_plan::create(
                &pool,
                CreateTreatmentPlanInput {
                    patient_id: created_patient.id,
                    title: "Initial plan".to_owned(),
                    notes: None,
                    items: vec![CreateTreatmentPlanItemInput {
                        description: "Cleaning".to_owned(),
                        price: 75.0,
                    }],
                },
            )
            .await
            .expect("create treatment plan");
            assert_eq!(
                treatment_plan::get_all(&pool)
                    .await
                    .expect("read treatment plans")[0]
                    .items
                    .len(),
                1
            );

            let appointment = appointment::create(
                &pool,
                CreateAppointmentInput {
                    patient_id: created_patient.id,
                    treatment_plan_id: Some(plan.id),
                    date: "2026-11-18T10:00:00".to_owned(),
                    acte: "Cleaning".to_owned(),
                    amount: 75.0,
                    in_advance: 25.0,
                    notes: None,
                    status: "scheduled".to_owned(),
                },
            )
            .await
            .expect("create linked appointment");
            assert_eq!(appointment.patient_id, created_patient.id);
            assert_eq!(
                appointment::get_by_patient_id(&pool, created_patient.id)
                    .await
                    .expect("read patient appointments")
                    .len(),
                1
            );

            let missing_patient = Uuid::new_v4();
            assert!(PatientRepository::find_by_id(&pool, missing_patient)
                .await
                .is_err());
        });
    }
}
