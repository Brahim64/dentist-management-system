import { useState } from "react";
import { Plus, CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldGroup } from "../ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CreateAppointmentInput } from "@/models/appointment";
import { appointmentApi } from "@/api/appointment-api";
import { toast } from "../ui/toast";

interface AddAppointmentProps {
  patientId: string;
  treatmentPlanId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onAppointmentAdded?: (
    appointment: Awaited<ReturnType<typeof appointmentApi.create>>,
  ) => void;
}

export function AddAppointment({
  patientId,
  treatmentPlanId,
  open,
  onOpenChange,
  onAppointmentAdded,
}: AddAppointmentProps) {
  const [internalDialogOpen, setInternalDialogOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [appointmentTime, setAppointmentTime] = useState("");
  const dialogOpen = open ?? internalDialogOpen;

  const handleDialogOpenChange = (nextOpen: boolean) => {
    setInternalDialogOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  const [newAppointment, setNewAppointment] = useState<
    Partial<CreateAppointmentInput>
  >({
    patientId,
    date: "",
    acte: "",
    amount: 0,
    inAdvance: 0,
    notes: "",
    status: "scheduled",
  });

  const handleChange = (
    field: keyof CreateAppointmentInput,
    value: string | number,
  ) => {
    setNewAppointment((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !newAppointment.date ||
      !newAppointment.acte ||
      newAppointment.amount === undefined
    ) {
      return;
    }

    const appointment: CreateAppointmentInput = {
      patientId,
      treatmentPlanId,
      date: (() => {
        const date = parseISO(newAppointment.date!);
        const [hours, minutes] = appointmentTime.split(":").map(Number);
        date.setHours(hours, minutes, 0, 0);
        return date.toISOString();
      })(),
      acte: newAppointment.acte,
      amount: Number(newAppointment.amount),
      inAdvance: Number(newAppointment.inAdvance ?? 0),
      notes: newAppointment.notes ?? null,
      status: newAppointment.status ?? "scheduled",
    };

    try {
      const createdAppointment = await appointmentApi.create(appointment);
      onAppointmentAdded?.(createdAppointment);
      toast.add({
        title: "Appointment Added Successfully",
        type: "success",
        description: "The appointment has been added.",
      });

      setNewAppointment({
        patientId,
        date: "",
        acte: "",
        amount: 0,
        inAdvance: 0,
        notes: "",
        status: "scheduled",
      });
      setAppointmentTime("");
      handleDialogOpenChange(false);
    } catch (error) {
      console.error("Failed to create appointment:", error);

      toast.add({
        title: "Error",
        type: "warning",
        description: "Failed to add appointment.",
      });
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
      {open === undefined && (
        <DialogTrigger
          render={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Appointment
            </Button>
          }
        />
      )}

      <DialogContent className="sm:max-w-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="mb-6">
            <DialogTitle>New Appointment</DialogTitle>
            <DialogDescription>
              Add a new appointment for this patient.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* DATE */}
            <Field>
              <Label htmlFor="appointment-date">Date *</Label>

              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      variant="outline"
                      id="appointment-date"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />

                      {newAppointment.date ? (
                        format(parseISO(newAppointment.date), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  }
                />

                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    captionLayout="dropdown"
                    selected={
                      newAppointment.date
                        ? parseISO(newAppointment.date)
                        : undefined
                    }
                    onSelect={(date) => {
                      if (date) {
                        handleChange("date", format(date, "yyyy-MM-dd"));
                      }

                      setDateOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </Field>

            <Field>
              <Label htmlFor="appointment-time">Time *</Label>
              <Input
                id="appointment-time"
                type="time"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                required
              />
            </Field>

            {/* STATUS */}
            <Field>
              <Label htmlFor="status">Status *</Label>

              <Select
                value={newAppointment.status ?? "scheduled"}
                onValueChange={(value) => handleChange("status", value!)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>

                  <SelectItem value="completed">Completed</SelectItem>

                  <SelectItem value="cancelled">Cancelled</SelectItem>

                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            {/* ACTE */}
            <Field className="md:col-span-2">
              <Label htmlFor="acte">Acte / Treatment *</Label>

              <Input
                id="acte"
                placeholder="e.g. Consultation, Cleaning, Extraction..."
                value={newAppointment.acte ?? ""}
                onChange={(e) => handleChange("acte", e.target.value)}
                required
              />
            </Field>

            {/* AMOUNT */}
            <Field>
              <Label htmlFor="amount">Amount (DT) *</Label>

              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={newAppointment.amount ?? ""}
                onChange={(e) => handleChange("amount", Number(e.target.value))}
                required
              />
            </Field>

            {/* ADVANCE */}
            <Field>
              <Label htmlFor="inAdvance">Advance (DT)</Label>

              <Input
                id="inAdvance"
                type="number"
                min="0"
                step="0.01"
                value={newAppointment.inAdvance ?? ""}
                onChange={(e) =>
                  handleChange("inAdvance", Number(e.target.value))
                }
              />
            </Field>

            {/* REMAINING */}
            <Field>
              <Label>Remaining (DT)</Label>

              <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm">
                {(
                  Number(newAppointment.amount ?? 0) -
                  Number(newAppointment.inAdvance ?? 0)
                ).toFixed(2)}{" "}
                DT
              </div>
            </Field>

            {/* NOTES */}
            <Field className="md:col-span-2">
              <Label htmlFor="notes">Notes</Label>

              <Input
                id="notes"
                placeholder="Additional notes..."
                value={newAppointment.notes ?? ""}
                onChange={(e) => handleChange("notes", e.target.value)}
              />
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <DialogClose render={<Button variant="outline">Cancel</Button>} />

            <Button type="submit">Save Appointment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
