import { Appointment } from "@/models/appointment";
import { appointmentApi } from "@/api/appointment-api";
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
import { toast } from "../ui/toast";

interface AppointmentTableProps {
  appointments: Appointment[];
  onAppointmentDeleted: (id: string) => void;
}

function formatDate(date: string | null): string {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatAmount(amount: number): string {
  return `${amount.toFixed(2)} DT`;
}

function getRemainingAmount(appointment: Appointment): number {
  return appointment.amount - appointment.inAdvance;
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

export function AppointmentTable({
  appointments,
  onAppointmentDeleted,
}: AppointmentTableProps) {
  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-sm text-muted-foreground">
        No appointments found.
      </div>
    );
  }

  const deleteAppointment = async (id: string) => {
    try {
      await appointmentApi.delete(id);

      onAppointmentDeleted(id);

      toast.add({
        title: "Appointment deleted",
        type: "success",
        description: "The appointment has been deleted.",
      });
    } catch (error) {
      console.error("Failed to delete appointment:", error);

      toast.add({
        title: "Failed to delete appointment",
        type: "error",
        description: "Something went wrong while deleting the appointment.",
      });
    }
  };

  return (
    <Table className="w-full">
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Acte</TableHead>
          <TableHead>Note</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Advance</TableHead>
          <TableHead>Reste</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {appointments.map((appointment) => {
          const reste = getRemainingAmount(appointment);

          return (
            <TableRow key={appointment.id}>
              <TableCell className="font-medium">
                {formatDate(appointment.date)}
              </TableCell>

              <TableCell>{appointment.acte}</TableCell>

              <TableCell className="max-w-[250px] truncate">
                {appointment.notes || "—"}
              </TableCell>

              <TableCell>
                {formatAmount(appointment.amount)}
              </TableCell>

              <TableCell>
                {formatAmount(appointment.inAdvance)}
              </TableCell>

              <TableCell
                className={
                  reste > 0
                    ? "font-medium text-destructive"
                    : "font-medium text-green-600"
                }
              >
                {formatAmount(reste)}
              </TableCell>

              <TableCell>
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusClassName(
                    appointment.status,
                  )}`}
                >
                  {appointment.status.replace("_", " ")}
                </span>
              </TableCell>

              <TableCell
                className="text-right"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                      >
                        <MoreHorizontalIcon />
                        <span className="sr-only">
                          Open menu
                        </span>
                      </Button>
                    }
                  />

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      Edit
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                      View details
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() =>
                        deleteAppointment(appointment.id)
                      }
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}