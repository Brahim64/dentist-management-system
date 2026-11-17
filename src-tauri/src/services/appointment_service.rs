use sqlx::SqlitePool;
use uuid::Uuid;

use crate::{
    errors::AppResult,
    models::appointment::{Appointment, CreateAppointmentInput, UpdateAppointmentInput},
    repositories::appointment,
};

pub struct AppointmentService;

impl AppointmentService {
    pub async fn create(
        pool: &SqlitePool,
        input: CreateAppointmentInput,
    ) -> AppResult<Appointment> {
        appointment::create(pool, input).await
    }

    pub async fn get_by_patient_id(
        pool: &SqlitePool,
        patient_id: Uuid,
    ) -> AppResult<Vec<Appointment>> {
        appointment::get_by_patient_id(pool, patient_id).await
    }

    pub async fn get_all(pool: &SqlitePool) -> AppResult<Vec<Appointment>> {
        appointment::get_all(pool).await
    }

    pub async fn update(
        pool: &SqlitePool,
        id: Uuid,
        input: UpdateAppointmentInput,
    ) -> AppResult<Appointment> {
        appointment::update(pool, id, input).await
    }

    pub async fn delete(pool: &SqlitePool, id: Uuid) -> AppResult<()> {
        appointment::delete(pool, id).await
    }
}
