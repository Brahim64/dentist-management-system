use crate::errors::{AppError, AppResult};
use crate::models::patient::{CreatePatientInput, Patient, PatientSummary, UpdatePatientInput};
use sqlx::SqlitePool;
use uuid::Uuid;

pub struct PatientRepository;

impl PatientRepository {
    pub async fn create(pool: &SqlitePool, input: &CreatePatientInput) -> AppResult<Patient> {
        let patient = sqlx::query_as::<_, Patient>(
            r#"
            INSERT INTO patients (
                id,
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
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
            "#,
        )
        .bind(Uuid::new_v4())
        .bind(&input.first_name)
        .bind(&input.last_name)
        .bind(&input.date_of_birth)
        .bind(&input.gender)
        .bind(&input.phone)
        .bind(&input.email)
        .bind(&input.address)
        .bind(&input.emergency_contact_name)
        .bind(&input.emergency_contact_phone)
        .bind(&input.blood_type)
        .bind(&input.allergies)
        .bind(&input.medical_conditions)
        .bind(&input.current_medications)
        .bind(&input.insurance_provider)
        .bind(&input.insurance_policy_number)
        .bind(&input.notes)
        .fetch_one(pool)
        .await?;

        Ok(patient)
    }

    pub async fn find_by_id(pool: &SqlitePool, id: Uuid) -> AppResult<Patient> {
        sqlx::query_as::<_, Patient>("SELECT * FROM patients WHERE id = ?")
            .bind(id)
            .fetch_optional(pool)
            .await?
            .ok_or_else(|| AppError::NotFound(id.to_string()))
    }

    pub async fn find_by_phone(pool: &SqlitePool, phone: &str) -> AppResult<Patient> {
        sqlx::query_as::<_, Patient>("SELECT * FROM patients WHERE phone = ?")
            .bind(phone)
            .fetch_optional(pool)
            .await?
            .ok_or_else(|| AppError::NotFound(phone.to_owned()))
    }

    pub async fn get_all_summaries(pool: &SqlitePool) -> AppResult<Vec<PatientSummary>> {
        let summaries = sqlx::query_as::<_, PatientSummary>(
            r#"
            SELECT
                id,
                first_name,
                last_name,
                date_of_birth,
                phone,
                NULL AS last_visit
            FROM patients
            ORDER BY updated_at DESC
            "#,
        )
        .fetch_all(pool)
        .await?;

        Ok(summaries)
    }

    pub async fn update(
        pool: &SqlitePool,
        id: Uuid,
        input: &UpdatePatientInput,
    ) -> AppResult<Patient> {
        let patient = sqlx::query_as::<_, Patient>(
            r#"
            UPDATE patients SET
                first_name = COALESCE(?, first_name),
                last_name = COALESCE(?, last_name),
                date_of_birth = COALESCE(?, date_of_birth),
                gender = COALESCE(?, gender),
                phone = COALESCE(?, phone),
                email = COALESCE(?, email),
                address = COALESCE(?, address),
                emergency_contact_name = COALESCE(?, emergency_contact_name),
                emergency_contact_phone = COALESCE(?, emergency_contact_phone),
                blood_type = COALESCE(?, blood_type),
                allergies = COALESCE(?, allergies),
                medical_conditions = COALESCE(?, medical_conditions),
                current_medications = COALESCE(?, current_medications),
                insurance_provider = COALESCE(?, insurance_provider),
                insurance_policy_number = COALESCE(?, insurance_policy_number),
                notes = COALESCE(?, notes),
                updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
            WHERE id = ?
            RETURNING *
            "#,
        )
        .bind(input.first_name.as_deref())
        .bind(input.last_name.as_deref())
        .bind(&input.date_of_birth)
        .bind(&input.gender)
        .bind(&input.phone)
        .bind(&input.email)
        .bind(&input.address)
        .bind(&input.emergency_contact_name)
        .bind(&input.emergency_contact_phone)
        .bind(&input.blood_type)
        .bind(&input.allergies)
        .bind(&input.medical_conditions)
        .bind(&input.current_medications)
        .bind(&input.insurance_provider)
        .bind(&input.insurance_policy_number)
        .bind(&input.notes)
        .bind(id)
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| AppError::NotFound(id.to_string()))?;

        Ok(patient)
    }

    pub async fn delete(pool: &SqlitePool, id: Uuid) -> AppResult<()> {
        let result = sqlx::query("DELETE FROM patients WHERE id = ?")
            .bind(id)
            .execute(pool)
            .await?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound(id.to_string()));
        }

        Ok(())
    }
}
