use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TreatmentPlan {
    pub id: Uuid,
    pub patient_id: Uuid,
    pub title: String,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub items: Vec<TreatmentPlanItem>,
}

#[derive(Debug, Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct TreatmentPlanItem {
    pub id: Uuid,
    pub treatment_plan_id: Uuid,
    pub description: String,
    pub price: f64,
    pub status: String,
    pub sort_order: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, FromRow)]
pub struct TreatmentPlanRecord {
    pub id: Uuid,
    pub patient_id: Uuid,
    pub title: String,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateTreatmentPlanInput {
    pub patient_id: Uuid,
    pub title: String,
    pub notes: Option<String>,
    pub items: Vec<CreateTreatmentPlanItemInput>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateTreatmentPlanItemInput {
    pub description: String,
    pub price: f64,
}

#[derive(Debug, Deserialize, Clone, Copy)]
#[serde(rename_all = "snake_case")]
pub enum TreatmentPlanItemStatus {
    Planned,
    Scheduled,
    Completed,
}

impl TreatmentPlanItemStatus {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Planned => "planned",
            Self::Scheduled => "scheduled",
            Self::Completed => "completed",
        }
    }
}
