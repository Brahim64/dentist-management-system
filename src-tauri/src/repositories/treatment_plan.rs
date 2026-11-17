use std::collections::HashMap;

use sqlx::{QueryBuilder, Sqlite, SqlitePool};
use uuid::Uuid;

use crate::{
    errors::{AppError, AppResult},
    models::treatment_plan::{
        CreateTreatmentPlanInput, TreatmentPlan, TreatmentPlanItem, TreatmentPlanRecord,
    },
};

pub async fn create(
    pool: &SqlitePool,
    input: CreateTreatmentPlanInput,
) -> AppResult<TreatmentPlan> {
    let mut transaction = pool.begin().await?;
    let plan_id = Uuid::new_v4();
    let record = sqlx::query_as::<_, TreatmentPlanRecord>(
        r#"
        INSERT INTO treatment_plans (id, patient_id, title, notes)
        VALUES (?, ?, ?, ?)
        RETURNING id, patient_id, title, notes, created_at, updated_at
        "#,
    )
    .bind(plan_id)
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
                (id, treatment_plan_id, description, price, sort_order)
            VALUES (?, ?, ?, ?, ?)
            RETURNING id, treatment_plan_id, description, price, status,
                      sort_order, created_at, updated_at
            "#,
        )
        .bind(Uuid::new_v4())
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

pub async fn get_all(pool: &SqlitePool) -> AppResult<Vec<TreatmentPlan>> {
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

pub async fn get_by_patient_id(
    pool: &SqlitePool,
    patient_id: Uuid,
) -> AppResult<Vec<TreatmentPlan>> {
    let records = sqlx::query_as::<_, TreatmentPlanRecord>(
        r#"
        SELECT id, patient_id, title, notes, created_at, updated_at
        FROM treatment_plans
        WHERE patient_id = ?
        ORDER BY updated_at DESC, created_at DESC
        "#,
    )
    .bind(patient_id)
    .fetch_all(pool)
    .await?;
    plans_with_items(pool, records).await
}

pub async fn update_item_status(
    pool: &SqlitePool,
    item_id: Uuid,
    status: &str,
) -> AppResult<TreatmentPlanItem> {
    let mut transaction = pool.begin().await?;
    let item = sqlx::query_as::<_, TreatmentPlanItem>(
        r#"
        UPDATE treatment_plan_items
        SET status = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
        WHERE id = ?
        RETURNING id, treatment_plan_id, description, price, status,
                  sort_order, created_at, updated_at
        "#,
    )
    .bind(status)
    .bind(item_id)
    .fetch_optional(&mut *transaction)
    .await?
    .ok_or_else(|| AppError::NotFound(item_id.to_string()))?;

    sqlx::query(
        "UPDATE treatment_plans SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?",
    )
        .bind(item.treatment_plan_id)
        .execute(&mut *transaction)
        .await?;

    transaction.commit().await?;
    Ok(item)
}

async fn plans_with_items(
    pool: &SqlitePool,
    records: Vec<TreatmentPlanRecord>,
) -> AppResult<Vec<TreatmentPlan>> {
    if records.is_empty() {
        return Ok(Vec::new());
    }

    let ids = records.iter().map(|plan| plan.id).collect::<Vec<_>>();
    let mut query_builder = QueryBuilder::<Sqlite>::new(
        r#"
        SELECT id, treatment_plan_id, description, price, status,
               sort_order, created_at, updated_at
        FROM treatment_plan_items
        WHERE treatment_plan_id IN (
        "#,
    );
    {
        let mut separated = query_builder.separated(", ");
        for id in &ids {
            separated.push_bind(id);
        }
    }
    query_builder.push(") ORDER BY sort_order, created_at");
    let items = query_builder
        .build_query_as::<TreatmentPlanItem>()
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
