use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Patient {
    pub id: Uuid,

    pub first_name: String,
    pub last_name: String,

    pub date_of_birth: String,

    pub gender: String,

    pub phone: String,

    pub email: Option<String>,
    pub address: Option<String>,

    pub emergency_contact_name: Option<String>,
    pub emergency_contact_phone: Option<String>,

    pub blood_type: Option<String>,

    pub allergies: Option<String>,
    pub medical_conditions: Option<String>,
    pub current_medications: Option<String>,

    pub insurance_provider: Option<String>,
    pub insurance_policy_number: Option<String>,

    pub notes: Option<String>,

    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/* #[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "text", rename_all = "lowercase")]
pub enum Gender {
    Male,
    Female,
}
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "text", rename_all = "lowercase")]
pub enum BloodType {
    APositive,

    ANegative,

    BPositive,

    BNegative,

    ABPositive,

    ABNegative,

    OPositive,

    ONegative,

    NotKnown
} */

// Payload for creating a patient — no id/timestamps, those are server-generated
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreatePatientInput {
    pub first_name: String,
    pub last_name: String,
    pub date_of_birth: String,
    pub gender:String,
    pub phone:String,
    pub email: Option<String>,
    pub address: Option<String>,
    pub emergency_contact_name: Option<String>,
    pub emergency_contact_phone: Option<String>,
    pub blood_type: Option<String>,
    pub allergies: Option<String>,
    pub medical_conditions: Option<String>,
    pub current_medications: Option<String>,
    pub insurance_provider: Option<String>,
    pub insurance_policy_number: Option<String>,
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdatePatientInput {
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub date_of_birth: String,
    pub phone:String,
    pub gender:String,

    pub email: Option<String>,
    pub address: Option<String>,
    pub emergency_contact_name: Option<String>,
    pub emergency_contact_phone: Option<String>,
    pub blood_type: Option<String>,
    pub allergies: Option<String>,
    pub medical_conditions: Option<String>,
    pub current_medications: Option<String>,
    pub insurance_provider: Option<String>,
    pub insurance_policy_number: Option<String>,
    pub notes: Option<String>,
}

// To avoids sending medical/insurance data over the wire when you just need name + basics
#[derive(Debug, Serialize, sqlx::FromRow)]
#[serde(rename_all = "camelCase")]
pub struct PatientSummary {
    pub id: Uuid,
    pub first_name: String,
    pub last_name: String,
    pub phone: String,
    pub date_of_birth: String,
    pub last_visit: Option<NaiveDate>,
}
/* impl From<String> for Gender {
    fn from(value: String) -> Self {
        match value.as_str() {
            "male" => Gender::Male,
            "Female" => Gender::Female,
            _ => panic!("please correct gender"),
        }
    }
}
impl From<String> for BloodType {

    fn from(value: String) -> Self {
        match value.as_str() {
            "A+" => BloodType::ANegative,
            "A-" => BloodType::APositive,
            "B+" => BloodType::BPositive,
            "B-" => BloodType::BNegative,
            "AB+" => BloodType::ABPositive,
            "AB-" => BloodType::ABNegative,
            "O+" => BloodType::OPositive,
            "O" => BloodType::ONegative,
            "Not known" => BloodType::NotKnown,
            _ => panic!("please enter the right blood type")
        }
    }
} */
