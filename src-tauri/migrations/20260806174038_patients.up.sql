-- Add up migration script here
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    gender TEXT NOT NULL ,

    phone TEXT NOT NULL,
    email TEXT ,
    address TEXT ,

    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,

    blood_type TEXT ,

    allergies TEXT,
    medical_conditions TEXT,
    current_medications TEXT,

    insurance_provider TEXT,
    insurance_policy_number TEXT,

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_patients_last_name
ON patients(last_name);

CREATE INDEX idx_patients_phone
ON patients(phone);

CREATE INDEX idx_patients_email
ON patients(email);