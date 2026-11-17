import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { treatmentPlanApi } from "@/api/treatment-plan-api";
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
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PatientSummary } from "@/models/patient";
import {
  CreateTreatmentPlanInput,
  TreatmentPlan,
} from "@/models/treatment-plan";
import { toast } from "@/components/ui/toast";

interface TreatmentPlanPart {
  description: string;
  price: number;
}

interface AddTreatmentPlanProps {
  patientId?: string;
  patientName?: string;
  patients?: PatientSummary[];
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onPlanCreated?: (plan: TreatmentPlan) => void;
}

export function AddTreatmentPlan({
  patientId,
  patientName,
  patients = [],
  disabled = false,
  open: controlledOpen,
  onOpenChange,
  onPlanCreated,
}: AddTreatmentPlanProps) {
  const [internalDialogOpen, setInternalDialogOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(patientId ?? "");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [parts, setParts] = useState<TreatmentPlanPart[]>([
    { description: "", price: 0 },
  ]);
  const [saving, setSaving] = useState(false);
  const dialogOpen = controlledOpen ?? internalDialogOpen;

  const updatePart = (
    index: number,
    field: keyof TreatmentPlanPart,
    value: string | number,
  ) => {
    setParts((current) =>
      current.map((part, partIndex) =>
        partIndex === index ? { ...part, [field]: value } : part,
      ),
    );
  };

  const resetForm = () => {
    setSelectedPatientId(patientId ?? "");
    setTitle("");
    setNotes("");
    setParts([{ description: "", price: 0 }]);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalDialogOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedPatientId || parts.some((part) => !part.description.trim())) {
      return;
    }

    const input: CreateTreatmentPlanInput = {
      patientId: selectedPatientId,
      title: title.trim(),
      notes: notes.trim() || null,
      items: parts.map((part) => ({
        description: part.description.trim(),
        price: Number(part.price),
      })),
    };

    try {
      setSaving(true);
      const createdPlan = await treatmentPlanApi.create(input);
      onPlanCreated?.(createdPlan);
      toast.add({
        title: "Treatment plan created",
        type: "success",
        description: "The plan and its items have been saved.",
      });
      handleOpenChange(false);
    } catch (error) {
      console.error("Failed to create treatment plan:", error);
      toast.add({
        title: "Could not create treatment plan",
        type: "error",
        description: "Please check the plan details and try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {controlledOpen === undefined && (
        <DialogTrigger
          render={
            <Button disabled={disabled}>
              <Plus />
              New treatment plan
            </Button>
          }
        />
      )}
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="mb-5">
            <DialogTitle>New treatment plan</DialogTitle>
            <DialogDescription>
              {patientName
                ? `Create a plan for ${patientName} and add the procedures with their prices.`
                : "Choose a patient, then add the procedures and prices for this plan."}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="space-y-4">
            {!patientId && (
              <Field>
                <Label htmlFor="treatment-plan-patient">Patient *</Label>
                <Select
                  value={selectedPatientId}
                  onValueChange={(value) => setSelectedPatientId(value ?? "")}
                >
                  <SelectTrigger id="treatment-plan-patient" className="w-full">
                    <SelectValue placeholder="Choose a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName} · {patient.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}

            <Field>
              <Label htmlFor="treatment-plan-title">Plan title *</Label>
              <Input
                id="treatment-plan-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Initial treatment plan"
                required
                maxLength={120}
              />
            </Field>

            <Field>
              <Label htmlFor="treatment-plan-notes">Notes</Label>
              <Input
                id="treatment-plan-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Optional notes for the patient plan"
              />
            </Field>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Plan items</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setParts((current) => [
                      ...current,
                      { description: "", price: 0 },
                    ])
                  }
                >
                  <Plus />
                  Add item
                </Button>
              </div>
              {parts.map((part, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[minmax(0,1fr)_8rem_2rem] items-end gap-2"
                >
                  <Field>
                    <Label htmlFor={`treatment-item-${index}`}>
                      Procedure {index + 1} *
                    </Label>
                    <Input
                      id={`treatment-item-${index}`}
                      value={part.description}
                      onChange={(event) =>
                        updatePart(index, "description", event.target.value)
                      }
                      placeholder="e.g. Cleaning"
                      required
                    />
                  </Field>
                  <Field>
                    <Label htmlFor={`treatment-price-${index}`}>
                      Price (DT) *
                    </Label>
                    <Input
                      id={`treatment-price-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={part.price}
                      onChange={(event) =>
                        updatePart(index, "price", Number(event.target.value))
                      }
                      required
                    />
                  </Field>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove procedure ${index + 1}`}
                    disabled={parts.length === 1}
                    onClick={() =>
                      setParts((current) =>
                        current.filter((_, partIndex) => partIndex !== index),
                      )
                    }
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
            </div>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <DialogClose
              render={
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              }
            />
            <Button type="submit" disabled={saving || (!patientId && !selectedPatientId)}>
              {saving ? "Saving..." : "Save treatment plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
