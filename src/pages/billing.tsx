import { useCallback, useEffect, useMemo, useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { CircleDollarSign, RefreshCw, Wallet, HandCoins } from "lucide-react";

import { appointmentApi } from "@/api/appointment-api";
import { patientApi } from "@/api/patient-api";
import { treatmentPlanApi } from "@/api/treatment-plan-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Appointment } from "@/models/appointment";
import { PatientSummary } from "@/models/patient";
import { TreatmentPlan } from "@/models/treatment-plan";

type PaymentFilter = "all" | "unpaid" | "paid" | "cancelled";

function getPaymentStatus(appointment: Appointment): string {
  if (appointment.status === "cancelled") return "Cancelled";
  if (appointment.amount <= appointment.inAdvance) return "Paid";
  if (appointment.inAdvance > 0) return "Partially paid";
  return "Unpaid";
}

function getPaymentStatusClassName(status: string): string {
  switch (status) {
    case "Paid":
      return "bg-green-100 text-green-700";
    case "Partially paid":
      return "bg-yellow-100 text-yellow-700";
    case "Unpaid":
      return "bg-red-100 text-red-700";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function formatMoney(value: number): string {
  return `${value.toFixed(2)} DT`;
}

function getMonthKey(value: string): string | null {
  const date = parseISO(value);
  return isValid(date) ? format(date, "yyyy-MM") : null;
}

function formatAppointmentDate(value: string): string {
  const date = parseISO(value);
  if (!isValid(date)) return "—";
  return date.getHours() === 0 && date.getMinutes() === 0
    ? format(date, "PP")
    : format(date, "PP · p");
}

function MetricCard({
  title,
  value,
  description,
  icon,
  tone,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <div className="space-y-1">
          <CardDescription>{title}</CardDescription>
          <CardTitle className="text-2xl">{value}</CardTitle>
        </div>
        <span className={`rounded-lg p-2 ${tone}`}>{icon}</span>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function Billing() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
  const [month, setMonth] = useState(() => format(new Date(), "yyyy-MM"));
  const [allTime, setAllTime] = useState(false);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBillingData = useCallback(async () => {
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
      console.error("Failed to load billing data:", loadError);
      setError("Could not load billing data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBillingData();
  }, [loadBillingData]);

  const patientsById = useMemo(
    () => new Map(patients.map((patient) => [patient.id, patient])),
    [patients],
  );

  const periodAppointments = useMemo(
    () =>
      appointments.filter(
        (appointment) =>
          allTime || getMonthKey(appointment.date) === month,
      ),
    [appointments, allTime, month],
  );

  const filteredAppointments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return periodAppointments
      .filter((appointment) => {
        const paymentStatus = getPaymentStatus(appointment);
        if (paymentFilter === "cancelled" && paymentStatus !== "Cancelled") {
          return false;
        }
        if (
          paymentFilter === "paid" &&
          paymentStatus !== "Paid"
        ) {
          return false;
        }
        if (
          paymentFilter === "unpaid" &&
          paymentStatus !== "Unpaid" &&
          paymentStatus !== "Partially paid"
        ) {
          return false;
        }
        if (!query) return true;

        const patient = patientsById.get(appointment.patientId);
        const patientName = patient
          ? `${patient.firstName} ${patient.lastName}`
          : "";
        return (
          patientName.toLowerCase().includes(query) ||
          (patient?.phone ?? "").toLowerCase().includes(query) ||
          appointment.acte.toLowerCase().includes(query)
        );
      })
      .sort((left, right) => right.date.localeCompare(left.date));
  }, [periodAppointments, paymentFilter, patientsById, search]);

  const totals = useMemo(() => {
    const appointmentValue = periodAppointments.reduce(
      (sum, appointment) => sum + appointment.amount,
      0,
    );
    const paymentsRecorded = periodAppointments.reduce(
      (sum, appointment) => sum + appointment.inAdvance,
      0,
    );
    const outstanding = periodAppointments.reduce(
      (sum, appointment) =>
        appointment.status === "cancelled"
          ? sum
          : sum + Math.max(appointment.amount - appointment.inAdvance, 0),
      0,
    );
    const credits = periodAppointments.reduce(
      (sum, appointment) =>
        sum + Math.max(appointment.inAdvance - appointment.amount, 0),
      0,
    );
    const treatmentPlanValue = treatmentPlans.reduce(
      (sum, plan) =>
        sum + plan.items.reduce((itemTotal, item) => itemTotal + item.price, 0),
      0,
    );

    return {
      appointmentValue,
      paymentsRecorded,
      outstanding,
      credits,
      treatmentPlanValue,
    };
  }, [periodAppointments, treatmentPlans]);

  const periodLabel = allTime ? "All time" : format(parseISO(`${month}-01`), "MMMM yyyy");

  return (
    <section className="space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Billing</h1>
          <p className="text-sm text-muted-foreground">
            Appointment charges, payments recorded, and outstanding balances.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void loadBillingData()}
          disabled={loading}
        >
          <RefreshCw />
          Refresh
        </Button>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Period</span>
          <Input
            type="month"
            value={month}
            disabled={allTime}
            onChange={(event) => {
              if (event.target.value) {
                setMonth(event.target.value);
                setAllTime(false);
              }
            }}
            className="w-auto"
          />
        </label>
        <Button
          variant={allTime ? "secondary" : "outline"}
          onClick={() => setAllTime((current) => !current)}
        >
          {allTime ? "Showing all time" : "Show all time"}
        </Button>
        <span className="text-sm text-muted-foreground">{periodLabel}</span>
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Loading billing data...
        </p>
      ) : error ? (
        <div className="space-y-3 py-12 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" onClick={() => void loadBillingData()}>
            Try again
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Appointment value"
              value={formatMoney(totals.appointmentValue)}
              description="Recorded appointments in this period, including cancelled."
              icon={<CircleDollarSign className="size-5" />}
              tone="bg-blue-100 text-blue-700"
            />
            <MetricCard
              title="Payments recorded"
              value={formatMoney(totals.paymentsRecorded)}
              description="Sum of the advance/payment amounts on appointments."
              icon={<HandCoins className="size-5" />}
              tone="bg-green-100 text-green-700"
            />
            <MetricCard
              title="Outstanding balance"
              value={formatMoney(totals.outstanding)}
              description="Unpaid amount on non-cancelled appointments."
              icon={<Wallet className="size-5" />}
              tone="bg-red-100 text-red-700"
            />
            <MetricCard
              title="Credits / overpayments"
              value={formatMoney(totals.credits)}
              description="Recorded payments that exceed appointment value."
              icon={<CircleDollarSign className="size-5" />}
              tone="bg-yellow-100 text-yellow-700"
            />
          </div>

          <Card>
            <CardHeader className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <CardTitle>Appointment balances</CardTitle>
                <CardDescription>
                  Payment amounts use each appointment’s recorded advance.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search patient or treatment..."
                  aria-label="Search billing records"
                  className="w-56"
                />
                <Select
                  value={paymentFilter}
                  onValueChange={(value) => {
                    if (
                      value === "all" ||
                      value === "unpaid" ||
                      value === "paid" ||
                      value === "cancelled"
                    ) {
                      setPaymentFilter(value);
                    }
                  }}
                >
                  <SelectTrigger aria-label="Filter by payment status" className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="unpaid">Unpaid balance</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredAppointments.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No billing records match these filters.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Treatment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Paid</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAppointments.map((appointment) => {
                        const patient = patientsById.get(appointment.patientId);
                        const balance =
                          appointment.amount - appointment.inAdvance;
                        const paymentStatus = getPaymentStatus(appointment);

                        return (
                          <TableRow key={appointment.id}>
                            <TableCell className="whitespace-nowrap">
                              {formatAppointmentDate(appointment.date)}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {patient
                                  ? `${patient.firstName} ${patient.lastName}`
                                  : "Patient unavailable"}
                              </div>
                              {patient && (
                                <div className="text-xs text-muted-foreground">
                                  {patient.phone}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>{appointment.acte}</TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getPaymentStatusClassName(paymentStatus)}`}
                              >
                                {paymentStatus}
                              </span>
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              {formatMoney(appointment.amount)}
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              {formatMoney(appointment.inAdvance)}
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap font-medium">
                              {appointment.status === "cancelled"
                                ? "—"
                                : balance < 0
                                  ? `Credit ${formatMoney(Math.abs(balance))}`
                                  : formatMoney(balance)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Planned treatment value</CardTitle>
              <CardDescription>
                Sum of all treatment plan items; this is planned value, not billed revenue.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {formatMoney(totals.treatmentPlanValue)}
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground">
            Payments are based on appointment amounts currently recorded in the system. This page does not include a separate payment ledger or refunds.
          </p>
        </>
      )}
    </section>
  );
}
