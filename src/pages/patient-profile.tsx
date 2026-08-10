import { useParams } from "react-router-dom";

export default function PatientProfile() {
  const { id } = useParams();

  return (
    <div>
      <h1>Patient ID: {id}</h1>
    </div>
  );
}
