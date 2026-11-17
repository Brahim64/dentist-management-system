DROP INDEX IF EXISTS idx_appointments_treatment_plan_id;

ALTER TABLE appointments
    DROP COLUMN treatment_plan_id;

DROP TABLE IF EXISTS treatment_plan_items;
DROP TABLE IF EXISTS treatment_plans;
