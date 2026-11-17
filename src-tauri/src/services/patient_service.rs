use sqlx::SqlitePool;
use uuid::Uuid;

use crate::{
    errors::AppResult,
    models::patient::{CreatePatientInput, Patient, PatientSummary, UpdatePatientInput},
    repositories::patient::PatientRepository,
};

pub struct PatientService;

impl PatientService {
    pub async fn create(pool: &SqlitePool, input: CreatePatientInput) -> AppResult<Patient> {
        PatientRepository::create(pool, &input).await
    }

    pub async fn get_by_id(pool: &SqlitePool, id: Uuid) -> AppResult<Patient> {
        PatientRepository::find_by_id(pool, id).await
    }

    pub async fn get_by_phone(pool: &SqlitePool, phone: &str) -> AppResult<Patient> {
        PatientRepository::find_by_phone(pool, phone).await
    }

    pub async fn get_all(pool: &SqlitePool) -> AppResult<Vec<PatientSummary>> {
        PatientRepository::get_all_summaries(pool).await
    }

    pub async fn update(
        pool: &SqlitePool,
        id: Uuid,
        input: UpdatePatientInput,
    ) -> AppResult<Patient> {
        PatientRepository::update(pool, id, &input).await
    }

    pub async fn delete(pool: &SqlitePool, id: Uuid) -> AppResult<()> {
        PatientRepository::delete(pool, id).await
    }
}
