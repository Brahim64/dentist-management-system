use crate::errors::{AppError, AppResult};
use crate::models::patient::{CreatePatientInput, Patient, PatientSummary, UpdatePatientInput};
use sqlx::PgPool;
use uuid::Uuid;

pub struct PatientRepository;

impl PatientRepository {
    pub async fn create(pool: &PgPool, input: &CreatePatientInput) -> AppResult<Patient> {
        let patient = sqlx::query_as!(
            Patient,
            r#"
        INSERT INTO patients (
            first_name,
            last_name,
            date_of_birth,
            gender,
            phone,
            email,
            address,
            emergency_contact_name,
            emergency_contact_phone,
            blood_type,
            allergies,
            medical_conditions,
            current_medications,
            insurance_provider,
            insurance_policy_number,
            notes
        )
        VALUES (
            $1, $2, $3, $4, $5, $6, $7,
            $8, $9, $10, $11, $12, $13,
            $14, $15, $16
        )
        RETURNING *
        "#,
            input.first_name,
            input.last_name,
            input.date_of_birth,
            input.gender,
            input.phone,
            input.email,
            input.address,
            input.emergency_contact_name,
            input.emergency_contact_phone,
            input.blood_type,
            input.allergies,
            input.medical_conditions,
            input.current_medications,
            input.insurance_provider,
            input.insurance_policy_number,
            input.notes
        )
        .fetch_one(pool)
        .await?;

        Ok(patient)
    }

    pub async fn find_by_id(pool: &PgPool, id: Uuid) -> AppResult<Patient> {
        sqlx::query_as::<_, Patient>("SELECT * FROM patients WHERE id = $1")
            .bind(id)
            .fetch_optional(pool)
            .await?
            .ok_or_else(|| AppError::NotFound(id.to_string()))
    }

    pub async fn find_by_phone(pool: &PgPool, phone: &str) -> AppResult<Patient> {
        let patient = sqlx::query_as!(
            Patient,
            r#"
        SELECT *
        FROM patients
        WHERE phone = $1
        "#,
            phone
        )
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| AppError::NotFound(phone.to_string()))?;

        Ok(patient)
    }

    pub async fn get_all_summaries(pool: &PgPool) -> AppResult<Vec<PatientSummary>> {
        let summaries = sqlx::query_as!(
            PatientSummary,
            r#"
            SELECT
                id,
                first_name,
                last_name,
                date_of_birth,
                phone,
                NULL::DATE AS last_visit
            FROM patients
            ORDER BY updated_at DESC
            "#
        )
        .fetch_all(pool)
        .await?;

        Ok(summaries)
    }

    pub async fn update(pool: &PgPool, id: Uuid, input: &UpdatePatientInput) -> AppResult<Patient> {
        let patient = sqlx::query_as!(
            Patient,
            r#"
        UPDATE patients SET
            first_name = COALESCE($1, first_name),
            last_name = COALESCE($2, last_name),
            date_of_birth = COALESCE($3, date_of_birth),
            gender = COALESCE($4, gender),
            phone = COALESCE($5, phone),
            email = COALESCE($6, email),
            address = COALESCE($7, address),
            emergency_contact_name = COALESCE($8, emergency_contact_name),
            emergency_contact_phone = COALESCE($9, emergency_contact_phone),
            blood_type = COALESCE($10, blood_type),
            allergies = COALESCE($11, allergies),
            medical_conditions = COALESCE($12, medical_conditions),
            current_medications = COALESCE($13, current_medications),
            insurance_provider = COALESCE($14, insurance_provider),
            insurance_policy_number = COALESCE($15, insurance_policy_number),
            notes = COALESCE($16, notes),
            updated_at = NOW()
        WHERE id = $17
        RETURNING *
        "#,
            input.first_name,
            input.last_name,
            input.date_of_birth,
            input.gender,
            input.phone,
            input.email,
            input.address,
            input.emergency_contact_name,
            input.emergency_contact_phone,
            input.blood_type,
            input.allergies,
            input.medical_conditions,
            input.current_medications,
            input.insurance_provider,
            input.insurance_policy_number,
            input.notes,
            id
        )
        .fetch_one(pool)
        .await?;

        Ok(patient)
    }

    pub async fn delete(pool: &PgPool, id: Uuid) -> AppResult<()> {
        let result = sqlx::query!("DELETE FROM patients WHERE id = $1", id)
            .execute(pool)
            .await?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound(id.to_string()));
        }

        Ok(())
    }
}
