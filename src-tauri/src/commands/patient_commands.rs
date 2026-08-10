

use tauri::State;
use uuid::Uuid;

use crate::{errors::AppResult, models::Patient::{CreatePatientInput, Patient, PatientSummary, UpdatePatientInput}, services::patient_service::PatientService, state::AppState};






#[tauri::command]
pub async fn create_patient(
    state: State<'_, AppState>,
    input: CreatePatientInput,
) -> AppResult<Patient> {
    PatientService::create(&state.db, input).await
}

#[tauri::command]
pub async fn get_patient_by_phone(state: State<'_, AppState>, phone: String) -> AppResult<Patient> {
    PatientService::get_by_phone(&state.db, &phone).await
}

#[tauri::command]
pub async fn get_patients(state: State<'_, AppState>) -> AppResult<Vec<PatientSummary>> {
    PatientService::get_all(&state.db).await
}

#[tauri::command]
pub async fn update_patient(
    state: State<'_, AppState>,
    id: Uuid,
    input: UpdatePatientInput,
) -> AppResult<Patient> {
    PatientService::update(&state.db, id, input).await
}

#[tauri::command]
pub async fn delete_patient(state: State<'_, AppState>, id: Uuid) -> AppResult<()> {
    PatientService::delete(&state.db, id).await
}
