import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layouts/layout";
import Dashboard from "./pages/dashboard";
import PatientProfile from "./pages/patient-profile";
import PatientList from "./pages/patient-list";
import Appointments from "./pages/appointments";
import TreatmentPlansPage from "./pages/treatment-plans";
import Billing from "./pages/billing";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
           <Route path="/" element={<Dashboard />} />
          <Route path="/patients" element={<PatientList />} />
          <Route path="/patients/:id" element={<PatientProfile />} />
           <Route path="/appointments" element={<Appointments />} />
          <Route path="/treatment-plans" element={<TreatmentPlansPage />} />
          <Route path="/billing" element={<Billing />} />
           {/*
          <Route path="/billing" element={<Billing />} />
          <Route path="/settings" element={<Settings />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
