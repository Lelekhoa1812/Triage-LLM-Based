import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import PatientDetails from "./components/PatientDetails";
import DispatchForm from "./components/DispatchForm";
import EmergencyLogs from "./components/EmergencyLogs";
import DroneStatus from "./components/DroneStatus";
import StaffCommunication from "./components/StaffCommunication";
import Login from "./components/Login";

const AppContent = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Mock patient data (update to use API)
  const [patients, setPatients] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [emergencyLogs, setEmergencyLogs] = useState([]);
  const [drones, setDrones] = useState([]); // still static unless drone API exists
  
  useEffect(() => {
    // Load patients and dispatch alerts from FastAPI
    const loadData = async () => {
      try {
        const res = await fetch('/api/index'); 
        if (!res.ok) return;
        const data = await res.json();
        // Map details
        const mapped = data.map((d, i) => ({
          id: d.id || i + 1,
          patientId: i + 1,
          description: d.highlights?.[0] || "Emergency Alert",
          location: d.profile?.Location || "Unknown",
          timestamp: d.timestamp,
          handled: false,
          profile: d.profile,
          dispatch: d
        }));
        // Break profile to items
        setPatients(
          mapped.map((m) => ({
            id: m.id,
            name: m.profile?.Name || "Unknown",
            age: m.profile?.Age,
            bloodType: m.profile?.["Blood Type"],
            allergies: m.profile?.Allergies,
            medicalHistory: m.profile?.History,
            currentMedications: m.profile?.Meds,
            disability: m.profile?.Disability,
            address: m.profile?.Location,
            emergencyContact: parseEmergencyContact(m.profile?.["Emergency Contact"]),
            rawDispatch: m.dispatch
          }))
        );
        setAlerts(mapped);
        setEmergencyLogs(mapped);
      } catch (e) {
        console.error("API fetch failed", e);
      }
    };
    // Break JSON to string
    const parseEmergencyContact = (val) => {
      if (!val) return { name: "N/A", phone: "N/A" };
      const [name, phone] = val.split(" - ");
      return { name: name?.trim() || "N/A", phone: phone?.trim() || "N/A" };
    };    
  
    loadData();
    const interval = setInterval(loadData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);
  
  // Toggle authentication status
  if (!isLoggedIn) {
    return <Login setIsLoggedIn={setIsLoggedIn} />;
  }

  return (
    <>
      <Navbar setIsLoggedIn={setIsLoggedIn} />
      <Routes>
        <Route
          path="/dashboard"
          element={
            <Dashboard
              patients={patients}
              alerts={alerts}
              setAlerts={setAlerts}
              setSelectedPatient={setSelectedPatient}
              emergencyLogs={emergencyLogs}
              drones={drones}
            />
          }
        />
        <Route
          path="/patient-details"
          element={
            selectedPatient ? (
              <PatientDetails patient={selectedPatient} />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />
        <Route
          path="/dispatch"
          element={
            selectedPatient ? (
              <DispatchForm
                patient={selectedPatient}
                setEmergencyLogs={setEmergencyLogs}
                setDrones={setDrones}
              />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />
        <Route path="/logs" element={<EmergencyLogs logs={emergencyLogs} />} />
        <Route path="/drone-status" element={<DroneStatus drones={drones} />} />
        <Route path="/communication" element={<StaffCommunication />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <AppContent />
      </div>
    </Router>
  );
};

export default App;
