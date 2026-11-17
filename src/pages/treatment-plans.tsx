import { useCallback, useEffect, useState } from "react";

import { appointmentApi } from "@/api/appointment-api";
import { patientApi } from "@/api/patient-api";
import { treatmentPlanApi } from "@/api/treatment-plan-api";
import { AddTreatmentPlan } from "@/components/treatment-plan-components/add-treatment-plan";
import { TreatmentPlanList } from "@/components/treatment-plan-components/treatment-plan-list";
import { Button } from "@/components/ui/button";
import { TreatmentPlan, TreatmentPlanItem } from "@/models/treatment-plan";
import { Appointment } from "@/models/appointment";
import { PatientSummary } from "@/models/patient";

export default function TreatmentPlansPage() {
  const [plans, setPlans] = useState<TreatmentPlan[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [planData, appointmentData, patientData] = await Promise.all([
        treatmentPlanApi.getAll(),
        appointmentApi.getAll(),
        patientApi.getAll(),
      ]);
      setPlans(planData);
      setAppointments(appointmentData);
      setPatients(patientData);
    } catch (loadError) {
      console.error("Failed to load treatment plans:", loadError);
      setError("Could not load treatment plans. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return (
    <section className="space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Treatment plans</h1>
          <p className="text-sm text-muted-foreground">
            Manage patient procedures, costs, and linked appointments.
          </p>
        </div>
        <AddTreatmentPlan
          patients={patients}
          disabled={loading || patients.length === 0}
          onPlanCreated={(plan) => setPlans((current) => [plan, ...current])}
        />
      </header>

      {loading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Loading treatment plans...
        </p>
      ) : error ? (
        <div className="space-y-3 py-12 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" onClick={() => void loadData()}>
            Try again
          </Button>
        </div>
      ) : (
        <TreatmentPlanList
          plans={plans}
          appointments={appointments}
          patients={patients}
          onItemUpdated={(updatedItem: TreatmentPlanItem) =>
            setPlans((current) =>
              current.map((plan) =>
                plan.id === updatedItem.treatmentPlanId
                  ? {
                      ...plan,
                      items: plan.items.map((item) =>
                        item.id === updatedItem.id ? updatedItem : item,
                      ),
                    }
                  : plan,
              ),
            )
          }
          onAppointmentAdded={(appointment) =>
            setAppointments((current) => [appointment, ...current])
          }
        />
      )}
    </section>
  );
}
