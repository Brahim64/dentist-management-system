-- Add down migration script here
DROP INDEX IF EXISTS idx_appointments_date;

DROP INDEX IF EXISTS idx_appointments_patient_id;

DROP TABLE IF EXISTS appointments;