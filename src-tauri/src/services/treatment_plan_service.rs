use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    errors::{AppError, AppResult},
    models::treatment_plan::{
        CreateTreatmentPlanInput, TreatmentPlan, TreatmentPlanItem, TreatmentPlanItemStatus,
    },
    repositories::treatment_plan,
};

pub struct TreatmentPlanService;

impl TreatmentPlanService {
    pub async fn create(
        pool: &PgPool,
        input: CreateTreatmentPlanInput,
    ) -> AppResult<TreatmentPlan> {
        if input.title.trim().is_empty() {
            return Err(AppError::InvalidInput(
                "Treatment plan title is required".to_owned(),
            ));
        }
        if input.items.is_empty() {
            return Err(AppError::InvalidInput(
                "A treatment plan must contain at least one item".to_owned(),
            ));
        }
        if input.items.iter().any(|item| {
            item.description.trim().is_empty() || !item.price.is_finite() || item.price < 0.0
        }) {
            return Err(AppError::InvalidInput(
                "Every item needs a description and a non-negative price".to_owned(),
            ));
        }

        treatment_plan::create(pool, input).await
    }

    pub async fn get_all(pool: &PgPool) -> AppResult<Vec<TreatmentPlan>> {
        treatment_plan::get_all(pool).await
    }

    pub async fn get_by_patient_id(
        pool: &PgPool,
        patient_id: Uuid,
    ) -> AppResult<Vec<TreatmentPlan>> {
        treatment_plan::get_by_patient_id(pool, patient_id).await
    }

    pub async fn update_item_status(
        pool: &PgPool,
        item_id: Uuid,
        status: TreatmentPlanItemStatus,
    ) -> AppResult<TreatmentPlanItem> {
        treatment_plan::update_item_status(pool, item_id, status.as_str()).await
    }
}
