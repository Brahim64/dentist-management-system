import { invoke } from "@tauri-apps/api/core";

import {
  CreateTreatmentPlanInput,
  TreatmentPlan,
  TreatmentPlanItem,
  TreatmentPlanItemStatus,
} from "@/models/treatment-plan";

export const treatmentPlanApi = {
  getAll: async (): Promise<TreatmentPlan[]> =>
    invoke<TreatmentPlan[]>("get_treatment_plans"),

  getByPatientId: async (patientId: string): Promise<TreatmentPlan[]> =>
    invoke<TreatmentPlan[]>("get_treatment_plans_by_patient", { patientId }),

  create: async (input: CreateTreatmentPlanInput): Promise<TreatmentPlan> =>
    invoke<TreatmentPlan>("create_treatment_plan", { input }),

  updateItemStatus: async (
    itemId: string,
    status: TreatmentPlanItemStatus,
  ): Promise<TreatmentPlanItem> =>
    invoke<TreatmentPlanItem>("update_treatment_plan_item_status", {
      itemId,
      status,
    }),
};
