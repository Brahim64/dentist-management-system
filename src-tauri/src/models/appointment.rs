use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Appointment {
    pub id: Uuid,

    pub patient_id: Uuid,

    pub date: String,

    pub acte: String,

    pub amount: f64,
    pub in_advance: f64,

    pub notes: Option<String>,

    pub status: String,

    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateAppointmentInput {
    pub patient_id: Uuid,
    pub date: String,
    pub acte: String,
    pub amount: f64,
    pub in_advance: f64,
    pub notes: Option<String>,
    pub status: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateAppointmentInput {
    pub patient_id: Uuid,
    pub date: String,
    pub acte: String,
    pub amount: f64,
    pub in_advance: f64,
    pub notes: Option<String>,
    pub status: String,
}