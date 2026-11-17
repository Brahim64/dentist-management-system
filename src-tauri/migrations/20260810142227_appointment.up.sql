-- Add up migration script here
CREATE TABLE appointments (
    id TEXT PRIMARY KEY NOT NULL,

    patient_id TEXT NOT NULL,

    date TEXT NOT NULL,

    acte TEXT NOT NULL,

    amount DOUBLE PRECISION NOT NULL DEFAULT 0,

    in_advance DOUBLE PRECISION NOT NULL DEFAULT 0,

    notes TEXT,

    status TEXT NOT NULL DEFAULT 'scheduled',

    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

    CONSTRAINT fk_appointments_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_appointments_patient_id
    ON appointments(patient_id);

CREATE INDEX idx_appointments_date
    ON appointments(date);