import { useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { Link } from "react-router-dom";

import { treatmentPlanApi } from "@/api/treatment-plan-api";
import { AddAppointment } from "@/components/appointment-components/add-appointment";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { toast } from "@/components/ui/toast";
import { Appointment } from "@/models/appointment";
import { PatientSummary } from "@/models/patient";
import {
  TreatmentPlan,
  TreatmentPlanItem,
  TreatmentPlanItemStatus,
} from "@/models/treatment-plan";

interface TreatmentPlanListProps {
  plans: TreatmentPlan[];
  appointments: Appointment[];
  patients?: PatientSummary[];
  onItemUpdated: (item: TreatmentPlanItem) => void;
  onAppointmentAdded: (appointment: Appointment) => void;
}

function isItemStatus(value: string | null): value is TreatmentPlanItemStatus {
  return value === "planned" || value === "scheduled" || value === "completed";
}

function formatAppointmentDate(value: string): string {
  const date = parseISO(value);
  return isValid(date) ? format(date, "PP · p") : value;
}

function formatPrice(value: number): string {
  return `${value.toFixed(2)} DT`;
}

export function TreatmentPlanList({
  plans,
  appointments,
  patients = [],
  onItemUpdated,
  onAppointmentAdded,
}: TreatmentPlanListProps) {
  const [savingItemIds, setSavingItemIds] = useState<Set<string>>(
    () => new Set(),
  );

  const updateItemStatus = async (
    itemId: string,
    status: TreatmentPlanItemStatus,
  ) => {
    try {
      setSavingItemIds((current) => new Set(current).add(itemId));
      const updatedItem = await treatmentPlanApi.updateItemStatus(itemId, status);
      onItemUpdated(updatedItem);
      toast.add({
        title: "Plan item updated",
        type: "success",
        description: "The treatment status has been saved.",
      });
    } catch (error) {
      console.error("Failed to update treatment plan item:", error);
      toast.add({
        title: "Could not update plan item",
        type: "error",
        description: "Please try again.",
      });
    } finally {
      setSavingItemIds((current) => {
        const next = new Set(current);
        next.delete(itemId);
        return next;
      });
    }
  };

  if (plans.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-10 text-center">
        <p className="font-medium">No treatment plans yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a plan with the procedures and prices for this patient.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {plans.map((plan) => {
        const patient = patients.find((entry) => entry.id === plan.patientId);
        const planAppointments = appointments.filter(
          (appointment) => appointment.treatmentPlanId === plan.id,
        );
        const total = plan.items.reduce((sum, item) => sum + item.price, 0);
        const completedCount = plan.items.filter(
          (item) => item.status === "completed",
        ).length;

        return (
          <Card key={plan.id}>
            <CardHeader className="flex flex-wrap items-start justify-between gap-4 border-b">
              <div>
                <CardTitle>{plan.title}</CardTitle>
                <CardDescription className="mt-1">
                  {patient
                    ? (
                        <>
                          <Link
                            to={`/patients/${patient.id}`}
                            className="font-medium text-foreground hover:underline"
                          >
                            {patient.firstName} {patient.lastName}
                          </Link>
                          {" · "}{patient.phone}
                        </>
                      )
                    : `Created ${formatAppointmentDate(plan.createdAt)}`}
                </CardDescription>
                {plan.notes && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {plan.notes}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline">
                  {completedCount} / {plan.items.length} completed
                </Badge>
                <span className="text-sm font-semibold">
                  Total {formatPrice(total)}
                </span>
                <AddAppointment
                  patientId={plan.patientId}
                  treatmentPlanId={plan.id}
                  onAppointmentAdded={onAppointmentAdded}
                />
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Procedure</TableHead>
                      <TableHead className="w-36 text-right">Price</TableHead>
                      <TableHead className="w-48">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plan.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.description}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPrice(item.price)}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={item.status}
                            onValueChange={(value) => {
                              if (isItemStatus(value)) {
                                void updateItemStatus(item.id, value);
                              }
                            }}
                            disabled={savingItemIds.has(item.id)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="planned">To do</SelectItem>
                              <SelectItem value="scheduled">Scheduled</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Appointments</h3>
                  <span className="text-xs text-muted-foreground">
                    {planAppointments.length} linked
                  </span>
                </div>
                {planAppointments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No appointments linked to this plan yet.
                  </p>
                ) : (
                  <ul className="divide-y rounded-lg border">
                    {planAppointments.map((appointment) => (
                      <li
                        key={appointment.id}
                        className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
                      >
                        <div>
                          <p className="font-medium">{appointment.acte}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatAppointmentDate(appointment.date)}
                          </p>
                        </div>
                        <span className="capitalize text-muted-foreground">
                          {appointment.status.replace("_", " ")}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
