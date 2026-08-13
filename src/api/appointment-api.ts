import {
  Appointment,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from "@/models/appointment";
import { invoke } from "@tauri-apps/api/core";

export const appointmentApi = {
  getAll: async (): Promise<Appointment[]> =>
    invoke<Appointment[]>("get_appointments"),

  getByPatientId: async (patientId: string): Promise<Appointment[]> =>
    invoke<Appointment[]>("get_appointments_by_patient", { patientId }),

  create: async (input: CreateAppointmentInput): Promise<Appointment> =>
    invoke<Appointment>("create_appointment", { input }),

  update: async (
    id: string,
    input: UpdateAppointmentInput,
  ): Promise<Appointment> =>
    invoke<Appointment>("update_appointment", { id, input }),

  delete: async (id: string): Promise<void> =>
    invoke<void>("delete_appointment", { id }),
};