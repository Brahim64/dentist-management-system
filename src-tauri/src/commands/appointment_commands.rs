use tauri::State;
use uuid::Uuid;

use crate::{
    errors::AppResult,
    models::appointment::{
        Appointment,
        CreateAppointmentInput,
        UpdateAppointmentInput,
    },
    services::appointment_service::AppointmentService,
    state::AppState,
};

#[tauri::command]
pub async fn create_appointment(
    state: State<'_, AppState>,
    input: CreateAppointmentInput,
) -> AppResult<Appointment> {
    AppointmentService::create(&state.db, input).await
}

#[tauri::command]
pub async fn get_appointments_by_patient(
    state: State<'_, AppState>,
    patient_id: Uuid,
) -> AppResult<Vec<Appointment>> {
    AppointmentService::get_by_patient_id(&state.db, patient_id).await
}

#[tauri::command]
pub async fn get_appointments(
    state: State<'_, AppState>,
) -> AppResult<Vec<Appointment>> {
    AppointmentService::get_all(&state.db).await
}

#[tauri::command]
pub async fn update_appointment(
    state: State<'_, AppState>,
    id: Uuid,
    input: UpdateAppointmentInput,
) -> AppResult<Appointment> {
    AppointmentService::update(&state.db, id, input).await
}

#[tauri::command]
pub async fn delete_appointment(
    state: State<'_, AppState>,
    id: Uuid,
) -> AppResult<()> {
    AppointmentService::delete(&state.db, id).await
}