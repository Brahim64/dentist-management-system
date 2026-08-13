import { Input } from "@/components/ui/input";
import { PatientTable } from "@/components/patient-components/patient-table";

import { patientApi } from "@/api/patient-api";
import { RefreshCw, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AddPatient } from "@/components/patient-components/add-patient";
import { PatientSummary } from "@/models/patient";
import { Button } from "@base-ui/react";

export default function PatientList() {
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await patientApi.getAll();
      setPatients(data);
    } catch (error) {
      console.error("Failed to refresh patients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (q === "") {
      return patients;
    }

    const phoneQuery = q.replace(/\D/g, "");

    return patients.filter((patient) => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();

      return (
        fullName.includes(q) ||
        (phoneQuery.length > 0 &&
          patient.phone.replace(/\D/g, "").includes(phoneQuery))
      );
    });
  }, [patients, query]);

  return (
    <div className="p-6">
      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or phone..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="flex gap-4 justify-between">
        <p className="mb-2 text-sm text-muted-foreground">
          {filteredPatients.length} of {patients.length} patients
        </p>
        <Button onClick={fetchPatients}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <p>Loading patients...</p>
      ) : (
        <PatientTable
          patients={filteredPatients}
          onPatientDeleted={(id) => {
            setPatients((currentPatients) =>
              currentPatients.filter((patient) => patient.id !== id),
            );
          }}
        />
      )}
      <AddPatient />
    </div>
  );
}
