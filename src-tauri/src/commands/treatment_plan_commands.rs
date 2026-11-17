use tauri::State;
use uuid::Uuid;

use crate::{
    errors::AppResult,
    models::treatment_plan::{
        CreateTreatmentPlanInput, TreatmentPlan, TreatmentPlanItem, TreatmentPlanItemStatus,
    },
    services::treatment_plan_service::TreatmentPlanService,
    state::AppState,
};

#[tauri::command]
pub async fn create_treatment_plan(
    state: State<'_, AppState>,
    input: CreateTreatmentPlanInput,
) -> AppResult<TreatmentPlan> {
    TreatmentPlanService::create(&state.db, input).await
}

#[tauri::command]
pub async fn get_treatment_plans(state: State<'_, AppState>) -> AppResult<Vec<TreatmentPlan>> {
    TreatmentPlanService::get_all(&state.db).await
}

#[tauri::command]
pub async fn get_treatment_plans_by_patient(
    state: State<'_, AppState>,
    patient_id: Uuid,
) -> AppResult<Vec<TreatmentPlan>> {
    TreatmentPlanService::get_by_patient_id(&state.db, patient_id).await
}

#[tauri::command]
pub async fn update_treatment_plan_item_status(
    state: State<'_, AppState>,
    item_id: Uuid,
    status: TreatmentPlanItemStatus,
) -> AppResult<TreatmentPlanItem> {
    TreatmentPlanService::update_item_status(&state.db, item_id, status).await
}
