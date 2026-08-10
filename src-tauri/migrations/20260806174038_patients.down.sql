
DROP INDEX IF EXISTS idx_patients_email;
DROP INDEX IF EXISTS idx_patients_phone;
DROP INDEX IF EXISTS idx_patients_last_name;

DROP TABLE IF EXISTS patients;

DROP EXTENSION IF EXISTS "pgcrypto";