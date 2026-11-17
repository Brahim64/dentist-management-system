CREATE TABLE treatment_plans (
    id TEXT PRIMARY KEY NOT NULL,
    patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (length(trim(title)) > 0),
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX idx_treatment_plans_patient_id
    ON treatment_plans(patient_id);

CREATE TABLE treatment_plan_items (
    id TEXT PRIMARY KEY NOT NULL,
    treatment_plan_id TEXT NOT NULL REFERENCES treatment_plans(id) ON DELETE CASCADE,
    description TEXT NOT NULL CHECK (length(trim(description)) > 0),
    price DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (price >= 0),
    status TEXT NOT NULL DEFAULT 'planned'
        CHECK (status IN ('planned', 'scheduled', 'completed')),
    sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX idx_treatment_plan_items_plan_id
    ON treatment_plan_items(treatment_plan_id, sort_order);

ALTER TABLE appointments
    ADD COLUMN treatment_plan_id TEXT
        REFERENCES treatment_plans(id) ON DELETE SET NULL;

CREATE INDEX idx_appointments_treatment_plan_id
    ON appointments(treatment_plan_id);
