use std::collections::HashMap;

use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    errors::{AppError, AppResult},
    models::treatment_plan::{
        CreateTreatmentPlanInput, TreatmentPlan, TreatmentPlanItem, TreatmentPlanRecord,
    },
};

pub async fn create(pool: &PgPool, input: CreateTreatmentPlanInput) -> AppResult<TreatmentPlan> {
    let mut transaction = pool.begin().await?;
    let record = sqlx::query_as::<_, TreatmentPlanRecord>(
        r#"
        INSERT INTO treatment_plans (patient_id, title, notes)
        VALUES ($1, $2, $3)
        RETURNING id, patient_id, title, notes, created_at, updated_at
        "#,
    )
    .bind(input.patient_id)
    .bind(input.title.trim())
    .bind(input.notes)
    .fetch_one(&mut *transaction)
    .await?;

    let mut items = Vec::with_capacity(input.items.len());
    for (sort_order, item) in input.items.into_iter().enumerate() {
        let created_item = sqlx::query_as::<_, TreatmentPlanItem>(
            r#"
            INSERT INTO treatment_plan_items
                (treatment_plan_id, description, price, sort_order)
            VALUES ($1, $2, $3, $4)
            RETURNING id, treatment_plan_id, description, price, status,
                      sort_order, created_at, updated_at
            "#,
        )
        .bind(record.id)
        .bind(item.description.trim())
        .bind(item.price)
        .bind(sort_order as i32)
        .fetch_one(&mut *transaction)
        .await?;
        items.push(created_item);
    }

    transaction.commit().await?;
    Ok(TreatmentPlan {
        id: record.id,
        patient_id: record.patient_id,
        title: record.title,
        notes: record.notes,
        created_at: record.created_at,
        updated_at: record.updated_at,
        items,
    })
}

pub async fn get_all(pool: &PgPool) -> AppResult<Vec<TreatmentPlan>> {
    let records = sqlx::query_as::<_, TreatmentPlanRecord>(
        r#"
        SELECT id, patient_id, title, notes, created_at, updated_at
        FROM treatment_plans
        ORDER BY updated_at DESC, created_at DESC
        "#,
    )
    .fetch_all(pool)
    .await?;
    plans_with_items(pool, records).await
}

pub async fn get_by_patient_id(pool: &PgPool, patient_id: Uuid) -> AppResult<Vec<TreatmentPlan>> {
    let records = sqlx::query_as::<_, TreatmentPlanRecord>(
        r#"
        SELECT id, patient_id, title, notes, created_at, updated_at
        FROM treatment_plans
        WHERE patient_id = $1
        ORDER BY updated_at DESC, created_at DESC
        "#,
    )
    .bind(patient_id)
    .fetch_all(pool)
    .await?;
    plans_with_items(pool, records).await
}

pub async fn update_item_status(
    pool: &PgPool,
    item_id: Uuid,
    status: &str,
) -> AppResult<TreatmentPlanItem> {
    let mut transaction = pool.begin().await?;
    let item = sqlx::query_as::<_, TreatmentPlanItem>(
        r#"
        UPDATE treatment_plan_items
        SET status = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id, treatment_plan_id, description, price, status,
                  sort_order, created_at, updated_at
        "#,
    )
    .bind(status)
    .bind(item_id)
    .fetch_optional(&mut *transaction)
    .await?
    .ok_or_else(|| AppError::NotFound(item_id.to_string()))?;

    sqlx::query("UPDATE treatment_plans SET updated_at = NOW() WHERE id = $1")
        .bind(item.treatment_plan_id)
        .execute(&mut *transaction)
        .await?;

    transaction.commit().await?;
    Ok(item)
}

async fn plans_with_items(
    pool: &PgPool,
    records: Vec<TreatmentPlanRecord>,
) -> AppResult<Vec<TreatmentPlan>> {
    if records.is_empty() {
        return Ok(Vec::new());
    }

    let ids = records.iter().map(|plan| plan.id).collect::<Vec<_>>();
    let items = sqlx::query_as::<_, TreatmentPlanItem>(
        r#"
        SELECT id, treatment_plan_id, description, price, status,
               sort_order, created_at, updated_at
        FROM treatment_plan_items
        WHERE treatment_plan_id = ANY($1)
        ORDER BY sort_order, created_at
        "#,
    )
    .bind(&ids)
    .fetch_all(pool)
    .await?;

    let mut items_by_plan = HashMap::<Uuid, Vec<TreatmentPlanItem>>::new();
    for item in items {
        items_by_plan
            .entry(item.treatment_plan_id)
            .or_default()
            .push(item);
    }

    Ok(records
        .into_iter()
        .map(|record| TreatmentPlan {
            id: record.id,
            patient_id: record.patient_id,
            title: record.title,
            notes: record.notes,
            created_at: record.created_at,
            updated_at: record.updated_at,
            items: items_by_plan.remove(&record.id).unwrap_or_default(),
        })
        .collect())
}
