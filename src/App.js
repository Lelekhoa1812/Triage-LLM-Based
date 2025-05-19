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
  const [alerts, setAlerts] = useState([]);
  const [emergencyLogs, setEmergencyLogs] = useState([]);
  const [drones, setDrones] = useState([]);

  // Mock patient data
  const patients = [
    {
      id: 1,
      name: "John Doe",
      age: 34,
      bloodType: "O+",
      allergies: "Peanuts",
      medicalHistory: "Asthma",
      currentMedications: "Inhaler",
      disability: "None",
      address: "123 Main St",
      emergencyContact: { name: "Jane Doe", phone: "555-1234" },
    },
    {
      id: 2,
      name: "Alice Smith",
      age: 45,
      bloodType: "A-",
      allergies: "None",
      medicalHistory: "Diabetes",
      currentMedications: "Insulin",
      disability: "None",
      address: "456 Oak Ave",
      emergencyContact: { name: "Bob Smith", phone: "555-5678" },
    },
  ];

  // Simulate incoming alerts
  useEffect(() => {
    const mockAlerts = [
      {
        id: 1,
        patientId: 1,
        description: "Severe asthma attack",
        location: "123 Main St",
        timestamp: new Date().toLocaleString(),
        handled: false,
      },
      {
        id: 2,
        patientId: 2,
        description: "Low blood sugar",
        location: "456 Oak Ave",
        timestamp: new Date().toLocaleString(),
        handled: false,
      },
    ];

    const interval = setInterval(() => {
      const newAlert =
        mockAlerts[Math.floor(Math.random() * mockAlerts.length)];
      setAlerts((prev) => [
        ...prev,
        {
          ...newAlert,
          id: prev.length + 1,
          timestamp: new Date().toLocaleString(),
        },
      ]);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

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
