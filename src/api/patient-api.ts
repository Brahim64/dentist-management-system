import {
  CreatePatientInput,
  Patient,
  PatientSummary,
  UpdatePatientInput,
} from "@/models/patient";
import { invoke } from "@tauri-apps/api/core";

export const patientApi = {
  getAll: async (): Promise<PatientSummary[]> =>
    invoke<PatientSummary[]>("get_patients"),

  getById: async (id: string) : Promise<Patient> => invoke<Patient>("get_patient_by_id", { id }),

  getByPhone: (phone: string) => invoke("get_patient_by_phone", { phone }),

  create: (input: CreatePatientInput) => invoke("create_patient", { input }),

  update: (id: string, input: UpdatePatientInput) =>
    invoke("update_patient", { id, input }),

  delete: (id: string):Promise<void> => invoke("delete_patient", { id }),
};
