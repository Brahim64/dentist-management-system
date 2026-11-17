import { useCallback, useEffect, useMemo, useState } from "react";
import { addDays, format, isValid, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

import { appointmentApi } from "@/api/appointment-api";
import { patientApi } from "@/api/patient-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Appointment } from "@/models/appointment";
import { PatientSummary } from "@/models/patient";

function getLocalDateKey(value: string): string | null {
  const parsed = parseISO(value);
  return isValid(parsed) ? format(parsed, "yyyy-MM-dd") : null;
}

function getAppointmentTime(value: string): string | null {
  const parsed = parseISO(value);
  if (!isValid(parsed) || (parsed.getHours() === 0 && parsed.getMinutes() === 0)) {
    return null;
  }

  return format(parsed, "h:mm a");
}

function getStatusClassName(status: string): string {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-700";
    case "scheduled":
      return "bg-blue-100 text-blue-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    case "no_show":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export default function Appointments() {
  const [selectedDate, setSelectedDate] = useState(() =>
    format(new Date(), "yyyy-MM-dd"),
  );
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSchedule = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [appointmentData, patientData] = await Promise.all([
        appointmentApi.getAll(),
        patientApi.getAll(),
      ]);
      setAppointments(appointmentData);
      setPatients(patientData);
    } catch (loadError) {
      console.error("Failed to load appointments:", loadError);
      setError("Could not load appointments. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSchedule();
  }, [loadSchedule]);

  const patientsById = useMemo(
    () => new Map(patients.map((patient) => [patient.id, patient])),
    [patients],
  );

  const selectedAppointments = useMemo(
    () =>
      appointments
        .filter((appointment) => getLocalDateKey(appointment.date) === selectedDate)
        .sort((left, right) => left.date.localeCompare(right.date)),
    [appointments, selectedDate],
  );

  const appointmentsWithoutTime = selectedAppointments.filter(
    (appointment) => getAppointmentTime(appointment.date) === null,
  );
  const timedAppointments = selectedAppointments.filter(
    (appointment) => getAppointmentTime(appointment.date) !== null,
  );

  const renderAppointment = (appointment: Appointment) => {
    const patient = patientsById.get(appointment.patientId);

    return (
      <Card key={appointment.id} size="sm">
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
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
            <p className="text-muted-foreground">{appointment.acte}</p>
            {patient && (
              <p className="text-xs text-muted-foreground">{patient.phone}</p>
            )}
          </div>
          <span
            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusClassName(appointment.status)}`}
          >
            {appointment.status.replace("_", " ")}
          </span>
        </CardContent>
      </Card>
    );
  };

  return (
    <section className="space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Appointments</h1>
          <p className="text-sm text-muted-foreground">
            Daily timetable for {format(parseISO(selectedDate), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void loadSchedule()}
          disabled={loading}
          aria-label="Refresh appointments"
        >
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous day"
          onClick={() =>
            setSelectedDate(format(addDays(parseISO(selectedDate), -1), "yyyy-MM-dd"))
          }
        >
          <ChevronLeft />
        </Button>
        <Input
          type="date"
          aria-label="Display appointments for date"
          className="w-auto"
          value={selectedDate}
          onChange={(event) => {
            if (event.target.value) {
              setSelectedDate(event.target.value);
            }
          }}
        />
        <Button
          variant="outline"
          size="icon"
          aria-label="Next day"
          onClick={() =>
            setSelectedDate(format(addDays(parseISO(selectedDate), 1), "yyyy-MM-dd"))
          }
        >
          <ChevronRight />
        </Button>
        <Button
          variant="secondary"
          onClick={() => setSelectedDate(format(new Date(), "yyyy-MM-dd"))}
        >
          Today
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        {selectedAppointments.length} appointment
        {selectedAppointments.length === 1 ? "" : "s"}
      </p>

      {loading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Loading appointments...
        </p>
      ) : error ? (
        <div className="space-y-3 py-12 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" onClick={() => void loadSchedule()}>
            Try again
          </Button>
        </div>
      ) : selectedAppointments.length === 0 ? (
        <div className="rounded-lg border border-dashed py-12 text-center">
          <p className="font-medium">No appointments for this day</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose another date to view its schedule.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {appointmentsWithoutTime.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">
                Time not set
              </h2>
              {appointmentsWithoutTime.map(renderAppointment)}
            </section>
          )}
          {timedAppointments.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">
                Scheduled
              </h2>
              {timedAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-start gap-3"
                >
                  <time className="pt-3 text-sm font-medium">
                    {getAppointmentTime(appointment.date)}
                  </time>
                  {renderAppointment(appointment)}
                </div>
              ))}
            </section>
          )}
        </div>
      )}
    </section>
  );
}
