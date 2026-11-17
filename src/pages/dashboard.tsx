import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addDays,
  format,
  isAfter,
  isValid,
  parseISO,
  startOfDay,
} from "date-fns";
import {
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  RefreshCw,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

import { appointmentApi } from "@/api/appointment-api";
import { patientApi } from "@/api/patient-api";
import { treatmentPlanApi } from "@/api/treatment-plan-api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Appointment } from "@/models/appointment";
import { PatientSummary } from "@/models/patient";
import { TreatmentPlan } from "@/models/treatment-plan";

function getAppointmentDate(value: string): Date | null {
  const date = parseISO(value);
  return isValid(date) ? date : null;
}

function getTimeLabel(value: string): string {
  const date = getAppointmentDate(value);
  if (!date) return "Time not set";
  if (date.getHours() === 0 && date.getMinutes() === 0) return "Time not set";
  return format(date, "h:mm a");
}

function formatMoney(value: number): string {
  return `${value.toFixed(2)} DT`;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <div className="space-y-1">
          <CardDescription>{title}</CardDescription>
          <CardTitle className="text-2xl">{value}</CardTitle>
        </div>
        <span className={`rounded-lg p-2 ${tone}`}>
          <Icon className="size-5" />
        </span>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function AppointmentList({
  appointments,
  patientsById,
  emptyMessage,
}: {
  appointments: Appointment[];
  patientsById: Map<string, PatientSummary>;
  emptyMessage: string;
}) {
  if (appointments.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="divide-y">
      {appointments.map((appointment) => {
        const patient = patientsById.get(appointment.patientId);

        return (
          <li
            key={appointment.id}
            className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div className="min-w-0">
              {patient ? (
                <Link
                  to={`/patients/${patient.id}`}
                  className="font-medium hover:underline"
                >
                  {patient.firstName} {patient.lastName}
                </Link>
              ) : (
                <p className="font-medium">Patient information unavailable</p>
              )}
              <p className="truncate text-sm text-muted-foreground">
                {appointment.acte}
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="whitespace-nowrap font-medium">
                {getTimeLabel(appointment.date)}
              </span>
              <span className="capitalize text-muted-foreground">
                {appointment.status.replace("_", " ")}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function Dashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [appointmentData, patientData, planData] = await Promise.all([
        appointmentApi.getAll(),
        patientApi.getAll(),
        treatmentPlanApi.getAll(),
      ]);
      setAppointments(appointmentData);
      setPatients(patientData);
      setTreatmentPlans(planData);
    } catch (loadError) {
      console.error("Failed to load dashboard data:", loadError);
      setError("Could not load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const today = startOfDay(new Date());
  const todayKey = format(today, "yyyy-MM-dd");
  const currentMonth = format(today, "yyyy-MM");
  const nextWeek = addDays(today, 7);

  const patientsById = useMemo(
    () => new Map(patients.map((patient) => [patient.id, patient])),
    [patients],
  );

  const todaysAppointments = useMemo(
    () =>
      appointments
        .filter((appointment) => {
          const date = getAppointmentDate(appointment.date);
          return (
            date !== null &&
            format(date, "yyyy-MM-dd") === todayKey &&
            appointment.status !== "cancelled"
          );
        })
        .sort((left, right) => left.date.localeCompare(right.date)),
    [appointments, todayKey],
  );

  const upcomingAppointments = useMemo(
    () =>
      appointments
        .filter((appointment) => {
          const date = getAppointmentDate(appointment.date);
          const appointmentDay = date ? startOfDay(date) : null;
          return (
            appointmentDay !== null &&
            isAfter(appointmentDay, today) &&
            !isAfter(appointmentDay, nextWeek) &&
            appointment.status === "scheduled"
          );
        })
        .sort((left, right) => left.date.localeCompare(right.date))
        .slice(0, 6),
    [appointments, today, nextWeek],
  );

  const paymentsThisMonth = appointments.reduce((sum, appointment) => {
    const date = getAppointmentDate(appointment.date);
    return date && format(date, "yyyy-MM") === currentMonth
      ? sum + appointment.inAdvance
      : sum;
  }, 0);

  const outstandingBalance = appointments.reduce(
    (sum, appointment) =>
      appointment.status === "cancelled"
        ? sum
        : sum + Math.max(appointment.amount - appointment.inAdvance, 0),
    0,
  );

  const activePlans = treatmentPlans.filter((plan) =>
    plan.items.some((item) => item.status !== "completed"),
  ).length;

  const metrics = [
    {
      title: "Patients",
      value: String(patients.length),
      detail: "Registered patients",
      icon: Users,
      tone: "bg-blue-100 text-blue-700",
    },
    {
      title: "Appointments today",
      value: String(todaysAppointments.length),
      detail: format(today, "EEEE, MMMM d"),
      icon: CalendarDays,
      tone: "bg-purple-100 text-purple-700",
    },
    {
      title: "Payments recorded this month",
      value: formatMoney(paymentsThisMonth),
      detail: "Based on appointment advances",
      icon: CircleDollarSign,
      tone: "bg-green-100 text-green-700",
    },
    {
      title: "Outstanding balance",
      value: formatMoney(outstandingBalance),
      detail: "Excludes cancelled appointments",
      icon: Wallet,
      tone: "bg-red-100 text-red-700",
    },
    {
      title: "Active treatment plans",
      value: String(activePlans),
      detail: "Plans with items not yet completed",
      icon: ClipboardList,
      tone: "bg-yellow-100 text-yellow-700",
    },
  ];

  return (
    <section className="space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
          <h1 className="text-2xl font-semibold">{getGreeting()}</h1>
          <p className="text-sm text-muted-foreground">
            Here is your practice overview for today.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void loadDashboard()}
          disabled={loading}
        >
          <RefreshCw />
          Refresh
        </Button>
      </header>

      {loading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Loading dashboard...
        </p>
      ) : error ? (
        <div className="space-y-3 py-12 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" onClick={() => void loadDashboard()}>
            Try again
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {metrics.map((metric) => (
              <MetricCard key={metric.title} {...metric} />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 border-b">
                <div>
                  <CardTitle>Today’s timetable</CardTitle>
                  <CardDescription>
                    {todaysAppointments.length} appointments not cancelled
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" render={<Link to="/appointments" />}>
                  View schedule
                </Button>
              </CardHeader>
              <CardContent className="pt-4">
                <AppointmentList
                  appointments={todaysAppointments}
                  patientsById={patientsById}
                  emptyMessage="No appointments scheduled for today."
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 border-b">
                <div>
                  <CardTitle>Coming up</CardTitle>
                  <CardDescription>Next 7 days</CardDescription>
                </div>
                <Button variant="outline" size="sm" render={<Link to="/appointments" />}>
                  All appointments
                </Button>
              </CardHeader>
              <CardContent className="pt-4">
                <AppointmentList
                  appointments={upcomingAppointments}
                  patientsById={patientsById}
                  emptyMessage="No upcoming appointments in the next 7 days."
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button render={<Link to="/patients" />}>Patients</Button>
            <Button variant="secondary" render={<Link to="/treatment-plans" />}>
              Treatment plans
            </Button>
            <Button variant="outline" render={<Link to="/billing" />}>
              Billing
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
