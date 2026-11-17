export interface Appointment {
  id: string;
  patientId: string;
  treatmentPlanId: string | null;

  date: string;
  acte: string;

  amount: number;
  inAdvance: number;

  notes: string | null;

  status: string;

  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentInput {
  patientId: string;
  treatmentPlanId?: string | null;

  date: string;
  acte: string;

  amount: number;
  inAdvance: number;

  notes?: string | null;

  status: string;
}

export interface UpdateAppointmentInput {
  patientId: string;
  treatmentPlanId?: string | null;

  date: string;
  acte: string;

  amount: number;
  inAdvance: number;

  notes?: string | null;

  status: string;
}