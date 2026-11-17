use crate::{
    errors::{AppError, AppResult},
    models::appointment::{Appointment, CreateAppointmentInput, UpdateAppointmentInput},
};
use sqlx::SqlitePool;
use uuid::Uuid;

pub async fn create(pool: &SqlitePool, input: CreateAppointmentInput) -> AppResult<Appointment> {
    validate_treatment_plan(pool, input.patient_id, input.treatment_plan_id).await?;

    let appointment = sqlx::query_as::<_, Appointment>(
        r#"
        INSERT INTO appointments (
            id,
            patient_id,
            treatment_plan_id,
            date,
            acte,
            amount,
            in_advance,
            notes,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING
            id,
            patient_id,
            treatment_plan_id,
            date,
            acte,
            amount,
            in_advance,
            notes,
            status,
            created_at,
            updated_at
        "#,
    )
    .bind(Uuid::new_v4())
    .bind(input.patient_id)
    .bind(input.treatment_plan_id)
    .bind(input.date)
    .bind(input.acte)
    .bind(input.amount)
    .bind(input.in_advance)
    .bind(input.notes)
    .bind(input.status)
    .fetch_one(pool)
    .await?;

    Ok(appointment)
}

pub async fn get_by_id(pool: &SqlitePool, id: Uuid) -> AppResult<Option<Appointment>> {
    let appointment = sqlx::query_as::<_, Appointment>(
        r#"
        SELECT
            id,
            patient_id,
            treatment_plan_id,
            date,
            acte,
            amount,
            in_advance,
            notes,
            status,
            created_at,
            updated_at
        FROM appointments
        WHERE id = ?
        "#,
    )
    .bind(id)
    .fetch_optional(pool)
    .await?;

    Ok(appointment)
}

pub async fn get_by_patient_id(pool: &SqlitePool, patient_id: Uuid) -> AppResult<Vec<Appointment>> {
    let appointments = sqlx::query_as::<_, Appointment>(
        r#"
        SELECT
            id,
            patient_id,
            treatment_plan_id,
            date,
            acte,
            amount,
            in_advance,
            notes,
            status,
            created_at,
            updated_at
        FROM appointments
        WHERE patient_id = ?
        ORDER BY date DESC, created_at DESC
        "#,
    )
    .bind(patient_id)
    .fetch_all(pool)
    .await?;

    Ok(appointments)
}

pub async fn get_all(pool: &SqlitePool) -> AppResult<Vec<Appointment>> {
    let appointments = sqlx::query_as::<_, Appointment>(
        r#"
        SELECT
            id,
            patient_id,
            treatment_plan_id,
            date,
            acte,
            amount,
            in_advance,
            notes,
            status,
            created_at,
            updated_at
        FROM appointments
        ORDER BY date DESC, created_at DESC
        "#,
    )
    .fetch_all(pool)
    .await?;

    Ok(appointments)
}

pub async fn update(
    pool: &SqlitePool,
    id: Uuid,
    input: UpdateAppointmentInput,
) -> AppResult<Appointment> {
    validate_treatment_plan(pool, input.patient_id, input.treatment_plan_id).await?;

    let appointment = sqlx::query_as::<_, Appointment>(
        r#"
        UPDATE appointments
        SET
            patient_id = ?,
            treatment_plan_id = ?,
            date = ?,
            acte = ?,
            amount = ?,
            in_advance = ?,
            notes = ?,
            status = ?,
            updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
        WHERE id = ?
        RETURNING
            id,
            patient_id,
            treatment_plan_id,
            date,
            acte,
            amount,
            in_advance,
            notes,
            status,
            created_at,
            updated_at
        "#,
    )
    .bind(input.patient_id)
    .bind(input.treatment_plan_id)
    .bind(input.date)
    .bind(input.acte)
    .bind(input.amount)
    .bind(input.in_advance)
    .bind(input.notes)
    .bind(input.status)
    .bind(id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| AppError::NotFound(id.to_string()))?;

    Ok(appointment)
}

pub async fn delete(pool: &SqlitePool, id: Uuid) -> AppResult<()> {
    let result = sqlx::query("DELETE FROM appointments WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound(id.to_string()));
    }

    Ok(())
}

async fn validate_treatment_plan(
    pool: &SqlitePool,
    patient_id: Uuid,
    treatment_plan_id: Option<Uuid>,
) -> AppResult<()> {
    if let Some(treatment_plan_id) = treatment_plan_id {
        let belongs_to_patient = sqlx::query_scalar::<_, i64>(
            r#"
            SELECT EXISTS (
                SELECT 1
                FROM treatment_plans
                WHERE id = ? AND patient_id = ?
            )
            "#,
        )
        .bind(treatment_plan_id)
        .bind(patient_id)
        .fetch_one(pool)
        .await?;

        if belongs_to_patient == 0 {
            return Err(AppError::InvalidInput(
                "The treatment plan does not belong to this patient".to_owned(),
            ));
        }
    }

    Ok(())
}
