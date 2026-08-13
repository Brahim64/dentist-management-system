-- Add up migration script here
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    patient_id UUID NOT NULL,

    date TEXT NOT NULL,

    acte TEXT NOT NULL,

    amount DOUBLE PRECISION NOT NULL DEFAULT 0,

    in_advance DOUBLE PRECISION NOT NULL DEFAULT 0,

    notes TEXT,

    status TEXT NOT NULL DEFAULT 'scheduled',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_appointments_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_appointments_patient_id
    ON appointments(patient_id);

CREATE INDEX idx_appointments_date
    ON appointments(date);