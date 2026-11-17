import { PatientSummary } from "@/models/patient";

import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreHorizontalIcon } from "lucide-react";
import { patientApi } from "@/api/patient-api";
import { toast } from "../ui/toast";
import { AddAppointment } from "../appointment-components/add-appointment";
import { AddTreatmentPlan } from "../treatment-plan-components/add-treatment-plan";
import { useState } from "react";

interface PatientTableProps {
  patients: PatientSummary[];
  onPatientDeleted: (id: string) => void;
}

function calculateAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

function formatDate(date: string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
}

export function PatientTable({
  patients,
  onPatientDeleted,
}: PatientTableProps) {
  const navigate = useNavigate();
  const [appointmentPatient, setAppointmentPatient] =
    useState<PatientSummary | null>(null);
  const [treatmentPlanPatient, setTreatmentPlanPatient] =
    useState<PatientSummary | null>(null);

  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-sm text-muted-foreground">
        No patients found.
      </div>
    );
  }

  const delete_patient = async (id: string) => {
    try {
      await patientApi.delete(id).then(() => {
        onPatientDeleted(id);
        toast.add({
          title: "Patient is deleted",
          type: "success",
          description: "Patient has been deleted from the database.",
        });
      });
    } catch (error) {
      console.error("Failed to refresh patients:", error);
    } finally {
    }
  };

  return (
    <>
      <Table className="w-[80%]">
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Last visit</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow
              key={patient.id}
              className="cursor-pointer"
              onClick={() => navigate(`/patients/${patient.id}`)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-medium text-accent-foreground">
                    {getInitials(patient.firstName, patient.lastName)}
                  </div>
                  <span className="font-medium">
                    {patient.firstName} {patient.lastName}
                  </span>
                </div>
              </TableCell>
              <TableCell>{calculateAge(patient.dateOfBirth)}</TableCell>
              <TableCell>{patient.phone}</TableCell>
              <TableCell>{formatDate(patient.lastVisit)}</TableCell>
              <TableCell
                className="text-right"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontalIcon />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setAppointmentPatient(patient)}
                    >
                      Add appointment
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setTreatmentPlanPatient(patient)}
                    >
                      Add treatment plan
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => delete_patient(patient.id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {appointmentPatient && (
        <AddAppointment
          key={appointmentPatient.id}
          patientId={appointmentPatient.id}
          open
          onOpenChange={(open) => {
            if (!open) {
              setAppointmentPatient(null);
            }
          }}
        />
      )}
      {treatmentPlanPatient && (
        <AddTreatmentPlan
          key={treatmentPlanPatient.id}
          patientId={treatmentPlanPatient.id}
          patientName={`${treatmentPlanPatient.firstName} ${treatmentPlanPatient.lastName}`}
          open
          onOpenChange={(open) => {
            if (!open) {
              setTreatmentPlanPatient(null);
            }
          }}
        />
      )}
    </>
  );
}
