

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string | null;
  address: string | null;

  emergencyContactName: string | null;
  emergencyContactPhone: string | null;

  bloodType: string;
  allergies: string | null;
  medicalConditions: string | null;
  currentMedications: string | null;

  insuranceProvider: string | null;
  insurancePolicyNumber: string | null;

  notes: string | null;

  createdAt: string; 
  updatedAt: string;
}

export interface CreatePatientInput {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender: string;
  phone: string;
  email?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  bloodType?: string;
  allergies?: string;
  medicalConditions?: string;
  currentMedications?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  notes?: string;
}

export type UpdatePatientInput = Partial<CreatePatientInput>;

// Lightweight shape for list views (patient table)
export interface PatientSummary {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  lastVisit: string | null;
}