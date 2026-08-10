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
import { Plus, CalendarIcon } from "lucide-react";
import { useState } from "react";
import { CreatePatientInput } from "@/models/patient";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { patientApi } from "@/api/patient-api";
import { toast } from "../ui/toast";

export function AddPatient() {
  const [dobOpen, setDobOpen] = useState(false);
  const [DialogOpen, setDialogOpen] = useState(false);
  const [newPatient, setNewPatient] = useState<Partial<CreatePatientInput>>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    bloodType: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    allergies: "",
    medicalConditions: "",
    currentMedications: "",
    insuranceProvider: "",
    insurancePolicyNumber: "",
    notes: "",
  });

  const handleChange = (
    field: keyof CreatePatientInput,
    value: string | Date | undefined,
  ) => {
    setNewPatient((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !newPatient.firstName ||
      !newPatient.lastName ||
      !newPatient.dateOfBirth ||
      !newPatient.gender ||
      !newPatient.phone
    ) {
      return;
    }

    const patient: CreatePatientInput = {
      firstName: newPatient.firstName,
      lastName: newPatient.lastName,
      dateOfBirth: newPatient.dateOfBirth,
      gender: newPatient.gender,
      phone: newPatient.phone,

      email: newPatient.email,
      address: newPatient.address,
      emergencyContactName: newPatient.emergencyContactName,
      emergencyContactPhone: newPatient.emergencyContactPhone,
      bloodType: newPatient.bloodType,
      allergies: newPatient.allergies,
      medicalConditions: newPatient.medicalConditions,
      currentMedications: newPatient.currentMedications,
      insuranceProvider: newPatient.insuranceProvider,
      insurancePolicyNumber: newPatient.insurancePolicyNumber,
      notes: newPatient.notes,
    };

      const createdPatient = await patientApi
        .create(patient)
        .then(() => {
          toast.add({
            title: "Patient Added Successfully",
            type:"success",
            description: "Patient has been added to the database.",
          });
          setDialogOpen(false);
        })
        .catch((err) => {
          console.log("errrrs" + err);
          toast.add({
            title: "Error",
            type:"warning",
            description: "Failed to add patient.",
          });
        });
  };

  return (
    <Dialog open={DialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger
        render={
          <Button
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
            size="icon"
          >
            <Plus className="h-6 w-6" />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="mb-4">
            <DialogTitle>Patient Information</DialogTitle>
            <DialogDescription>
              Fields marked with * are mandatory
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* --- BASIC INFORMATION --- */}
            <Field>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                required
                value={newPatient.firstName ?? ""}
                onChange={(e) => handleChange("firstName", e.target.value)}
              />
            </Field>

            <Field>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                required
                value={newPatient.lastName ?? ""}
                onChange={(e) => handleChange("lastName", e.target.value)}
              />
            </Field>

            <Field className="flex flex-col gap-1.5">
              <Label htmlFor="dob">Date of Birth *</Label>
              <Popover open={dobOpen} onOpenChange={setDobOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      variant="outline"
                      id="dob"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newPatient?.dateOfBirth ? (
                        format(newPatient.dateOfBirth, "PPP")
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
                    onSelect={(date) => {
                      handleChange("dateOfBirth", date);
                      setDobOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </Field>

            <Field>
              <Label htmlFor="gender">Gender *</Label>
              <Select
                value={newPatient.gender ?? ""}
                onValueChange={(value) => handleChange("gender", value!)}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            {/* --- CONTACT DETAILS --- */}
            <Field>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                required
                value={newPatient.phone ?? ""}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </Field>

            <Field>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newPatient.email ?? ""}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </Field>

            <Field className="md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={newPatient.address ?? ""}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </Field>

            {/* --- EMERGENCY CONTACT --- */}
            <Field>
              <Label htmlFor="emergencyContactName">
                Emergency Contact Name
              </Label>
              <Input
                id="emergencyContactName"
                value={newPatient.emergencyContactName ?? ""}
                onChange={(e) =>
                  handleChange("emergencyContactName", e.target.value)
                }
              />
            </Field>

            <Field>
              <Label htmlFor="emergencyContactPhone">
                Emergency Contact Phone
              </Label>
              <Input
                id="emergencyContactPhone"
                type="tel"
                value={newPatient.emergencyContactPhone ?? ""}
                onChange={(e) =>
                  handleChange("emergencyContactPhone", e.target.value)
                }
              />
            </Field>

            {/* --- MEDICAL HISTORY --- */}
            <Field>
              <Label htmlFor="bloodType">Blood Type</Label>
              <Select
                value={newPatient.bloodType ?? ""}
                onValueChange={(val) => handleChange("bloodType", val!)}
              >
                <SelectTrigger id="bloodType">
                  <SelectValue placeholder="Select blood type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A_POSITIVE">A+</SelectItem>
                  <SelectItem value="A_NEGATIVE">A-</SelectItem>
                  <SelectItem value="B_POSITIVE">B+</SelectItem>
                  <SelectItem value="B_NEGATIVE">B-</SelectItem>
                  <SelectItem value="AB_POSITIVE">AB+</SelectItem>
                  <SelectItem value="AB_NEGATIVE">AB-</SelectItem>
                  <SelectItem value="O_POSITIVE">O+</SelectItem>
                  <SelectItem value="O_NEGATIVE">O-</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <Label htmlFor="allergies">Allergies</Label>
              <Input
                id="allergies"
                placeholder="e.g. Penicillin, Peanuts"
                value={newPatient.allergies ?? ""}
                onChange={(e) => handleChange("allergies", e.target.value)}
              />
            </Field>

            <Field className="md:col-span-2">
              <Label htmlFor="medicalConditions">Medical Conditions</Label>
              <Input
                id="medicalConditions"
                placeholder="e.g. Asthma, Hypertension"
                value={newPatient.medicalConditions ?? ""}
                onChange={(e) =>
                  handleChange("medicalConditions", e.target.value)
                }
              />
            </Field>

            <Field className="md:col-span-2">
              <Label htmlFor="currentMedications">Current Medications</Label>
              <Input
                id="currentMedications"
                value={newPatient.currentMedications ?? ""}
                onChange={(e) =>
                  handleChange("currentMedications", e.target.value)
                }
              />
            </Field>

            {/* --- INSURANCE --- */}
            <Field>
              <Label htmlFor="insuranceProvider">Insurance Provider</Label>
              <Input
                id="insuranceProvider"
                value={newPatient.insuranceProvider ?? ""}
                onChange={(e) =>
                  handleChange("insuranceProvider", e.target.value)
                }
              />
            </Field>

            <Field>
              <Label htmlFor="insurancePolicyNumber">Policy Number</Label>
              <Input
                id="insurancePolicyNumber"
                value={newPatient.insurancePolicyNumber ?? ""}
                onChange={(e) =>
                  handleChange("insurancePolicyNumber", e.target.value)
                }
              />
            </Field>

            {/* --- NOTES --- */}
            <Field className="md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={newPatient.notes ?? ""}
                onChange={(e) => handleChange("notes", e.target.value)}
              />
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button type="submit">Save Patient</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
