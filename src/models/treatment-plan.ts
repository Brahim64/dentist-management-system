export type TreatmentPlanItemStatus = "planned" | "scheduled" | "completed";

export interface TreatmentPlanItem {
  id: string;
  treatmentPlanId: string;
  description: string;
  price: number;
  status: TreatmentPlanItemStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  title: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: TreatmentPlanItem[];
}

export interface CreateTreatmentPlanInput {
  patientId: string;
  title: string;
  notes?: string | null;
  items: Array<{
    description: string;
    price: number;
  }>;
}
