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

interface PatientTableProps {
  patients: PatientSummary[];
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

export function PatientTable({ patients }: PatientTableProps) {
  const navigate = useNavigate();

  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-sm text-muted-foreground">
        No patients found.
      </div>
    );
  }

  return (
    <Table className="w-[80%]">
      <TableHeader>
        <TableRow>
          <TableHead>Patient</TableHead>
          <TableHead>Age</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Last visit</TableHead>
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
