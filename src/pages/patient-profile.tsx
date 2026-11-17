import { appointmentApi } from "@/api/appointment-api";
import { patientApi } from "@/api/patient-api";
import { AddAppointment } from "@/components/appointment-components/add-appointment";
import { AppointmentTable } from "@/components/appointment-components/appointment-table";
import { AddTreatmentPlan } from "@/components/treatment-plan-components/add-treatment-plan";
import { TreatmentPlanList } from "@/components/treatment-plan-components/treatment-plan-list";
import { Appointment } from "@/models/appointment";
import { Patient } from "@/models/patient";
import { TreatmentPlan, TreatmentPlanItem } from "@/models/treatment-plan";
import { treatmentPlanApi } from "@/api/treatment-plan-api";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function PatientProfile() {
  const { id } = useParams();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const loadPatient = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await patientApi.getById(id!);
      setPatient(data);
    } catch (err) {
      console.error("Failed to load patient:", err);
      setError("Failed to load patient");
    } finally {
      setLoading(false);
    }
  };
  function calculateAge(dateOfBirth: string): number {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const hasBirthdayPassed =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() >= birthDate.getDate());

    if (!hasBirthdayPassed) {
      age--;
    }

    return age;
  }
  useEffect(() => {
    if (!id) {
      setError("Patient ID is missing");
      setLoading(false);
      return;
    }
    loadPatient();
  }, [id]);
  const loadAppointments = async () => {
    if (patient) {
      await appointmentApi.getByPatientId(patient.id).then((data) => {
        setAppointments(data);
      });
    }
  };
  const loadTreatmentPlans = async () => {
    if (!patient) return;

    try {
      setPlansLoading(true);
      setPlansError(null);
      const data = await treatmentPlanApi.getByPatientId(patient.id);
      setTreatmentPlans(data);
    } catch (loadError) {
      console.error("Failed to load treatment plans:", loadError);
      setPlansError("Could not load treatment plans.");
    } finally {
      setPlansLoading(false);
    }
  };
  useEffect(() => {
    if (!patient?.id) return;

    void loadAppointments();
    void loadTreatmentPlans();
  }, [patient?.id]);
  if (loading) {
    return <div>Loading patient...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!patient) {
    return <div>Patient not found</div>;
  }
  return (
    <div className="w-full">
      <div className="flex justify-between my-6">
        <div className=" w-[50%] flex gap-10 mx-10">
          <div className="flex justify-center items-center rounded-full bg-sky-200 w-22 h-22 text-3xl font-bold antialiased ">
            {patient?.firstName[0].toUpperCase()}{" "}
            {patient?.lastName[0].toUpperCase()}
          </div>
          <div className="flex flex-col justify-center">
            <div className="text-xl">
              {patient?.firstName.toUpperCase()}{" "}
              {patient?.lastName.toUpperCase()}
            </div>
            <div className="text-gray-600 lowercase">
              {patient?.gender} | registered {patient?.createdAt.split("T")[0]}{" "}
              {patient?.createdAt.split("T")[1].split(".")[0]}
            </div>
          </div>
        </div>
        <div className="w-[30%] ">allergies</div>
      </div>

      <div>
        <div className="flex justify-around">
          <div className="flex flex-col justify-center items-center">
            <div>Age</div>
            <div>{calculateAge(patient?.dateOfBirth)}</div>
          </div>
          <div className="flex flex-col justify-center items-center">
            <div>Phone</div>
            <div>{patient?.phone}</div>
          </div>
          <div className="flex flex-col justify-center items-center">
            <div>Last visit</div>
            <div>date of last visit</div>
          </div>
        </div>
      </div>
      <section className="my-10 space-y-4 px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Treatment plans</h2>
            <p className="text-sm text-muted-foreground">
              Procedures, prices, and progress for this patient.
            </p>
          </div>
          <AddTreatmentPlan
            patientId={patient.id}
            patientName={`${patient.firstName} ${patient.lastName}`}
            disabled={plansLoading}
            onPlanCreated={(plan) =>
              setTreatmentPlans((current) => [plan, ...current])
            }
          />
        </div>
        {plansLoading ? (
          <p className="py-6 text-sm text-muted-foreground">
            Loading treatment plans...
          </p>
        ) : plansError ? (
          <p className="py-6 text-sm text-destructive">{plansError}</p>
        ) : (
          <TreatmentPlanList
            plans={treatmentPlans}
            appointments={appointments}
            onItemUpdated={(updatedItem: TreatmentPlanItem) =>
              setTreatmentPlans((current) =>
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
      <div className="my-6 px-12 w-full flex justify-end">
        <AddAppointment
          patientId={patient.id}
          onAppointmentAdded={() => {
            loadAppointments()
          }}
        />
      </div>
      <AppointmentTable
        appointments={appointments}
        onAppointmentDeleted={(id) => {
          setAppointments((current) =>
            current.filter((appointment) => appointment.id !== id),
          );
        }}
      />
    </div>
  );
}
