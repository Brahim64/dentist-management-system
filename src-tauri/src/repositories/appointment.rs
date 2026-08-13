use crate::models::appointment::UpdateAppointmentInput;
use crate::{
    errors::AppError,
    models::appointment::Appointment,
    models::appointment::CreateAppointmentInput,
};
use sqlx::query_as;
use sqlx::PgPool;
use uuid::Uuid;

pub async fn create(
    pool: &PgPool,
    input: CreateAppointmentInput,
) -> Result<Appointment, AppError> {
    let appointment = query_as!(
        Appointment,
        r#"
        INSERT INTO appointments (
            patient_id,
            date,
            acte,
            amount,
            in_advance,
            notes,
            status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING
            id,
            patient_id,
            date,
            acte,
            amount,
            in_advance,
            notes,
            status,
            created_at,
            updated_at
        "#,
        input.patient_id,
        input.date,
        input.acte,
        input.amount,
        input.in_advance,
        input.notes,
        input.status
    )
    .fetch_one(pool)
    .await?;

    Ok(appointment)
}

pub async fn get_by_id(
    pool: &PgPool,
    id: Uuid,
) -> Result<Option<Appointment>, AppError> {
    let appointment = query_as!(
        Appointment,
        r#"
        SELECT
            id,
            patient_id,
            date,
            acte,
            amount,
            in_advance,
            notes,
            status,
            created_at,
            updated_at
        FROM appointments
        WHERE id = $1
        "#,
        id
    )
    .fetch_optional(pool)
    .await?;

    Ok(appointment)
}

pub async fn get_by_patient_id(
    pool: &PgPool,
    patient_id: Uuid,
) -> Result<Vec<Appointment>, AppError> {
    let appointments = query_as!(
        Appointment,
        r#"
        SELECT
            id,
            patient_id,
            date,
            acte,
            amount,
            in_advance,
            notes,
            status,
            created_at,
            updated_at
        FROM appointments
        WHERE patient_id = $1
        ORDER BY date DESC, created_at DESC
        "#,
        patient_id
    )
    .fetch_all(pool)
    .await?;

    Ok(appointments)
}

pub async fn get_all(
    pool: &PgPool,
) -> Result<Vec<Appointment>, AppError> {
    let appointments = query_as!(
        Appointment,
        r#"
        SELECT
            id,
            patient_id,
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
        "#
    )
    .fetch_all(pool)
    .await?;

    Ok(appointments)
}

pub async fn update(
    pool: &PgPool,
    id: Uuid,
    input: UpdateAppointmentInput,
) -> Result<Appointment, AppError> {
    let appointment = query_as!(
        Appointment,
        r#"
        UPDATE appointments
        SET
            patient_id = $1,
            date = $2,
            acte = $3,
            amount = $4,
            in_advance = $5,
            notes = $6,
            status = $7,
            updated_at = NOW()
        WHERE id = $8
        RETURNING
            id,
            patient_id,
            date,
            acte,
            amount,
            in_advance,
            notes,
            status,
            created_at,
            updated_at
        "#,
        input.patient_id,
        input.date,
        input.acte,
        input.amount,
        input.in_advance,
        input.notes,
        input.status,
        id
    )
    .fetch_one(pool)
    .await?;

    Ok(appointment)
}

pub async fn delete(
    pool: &PgPool,
    id: Uuid,
) -> Result<(), AppError> {
    sqlx::query!(
        r#"
        DELETE FROM appointments
        WHERE id = $1
        "#,
        id
    )
    .execute(pool)
    .await?;

    Ok(())
}