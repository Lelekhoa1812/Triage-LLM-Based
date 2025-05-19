import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const DispatchForm = ({ patient, setEmergencyLogs, setDrones }) => {
  const [severity, setSeverity] = useState("");
  const [medication, setMedication] = useState("");
  const [notes, setNotes] = useState("");
  const [droneStatus, setDroneStatus] = useState("");
  const navigate = useNavigate();

  const handleDispatch = () => {
    if (!severity) {
      alert("Please select severity level");
      return;
    }
    const logEntry = {
      id: Date.now(),
      patientName: patient.name,
      severity,
      medication: medication || "None",
      notes,
      timestamp: new Date().toLocaleString(),
    };
    setEmergencyLogs((prev) => [...prev, logEntry]);

    if (severity === "High") {
      const droneEntry = {
        id: Date.now(),
        patientName: patient.name,
        address: patient.address,
        medication: medication || "First Aid Kit",
        status: "Dispatched",
      };
      setDrones((prev) => [...prev, droneEntry]);
      setDroneStatus("Drone dispatched to " + patient.address);
      setTimeout(() => {
        setDroneStatus("Drone en route...");
        setDrones((prev) =>
          prev.map((d) =>
            d.id === droneEntry.id ? { ...d, status: "En Route" } : d
          )
        );
      }, 2000);
      setTimeout(() => {
        setDroneStatus("Drone arrived at destination");
        setDrones((prev) =>
          prev.map((d) =>
            d.id === droneEntry.id ? { ...d, status: "Arrived" } : d
          )
        );
      }, 4000);
    } else {
      alert("Severity not critical. Consider alternative response.");
    }
    navigate("/drone-status");
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Dispatch Drone for {patient.name}
      </h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="mb-4">
          <strong>Patient Address:</strong> {patient.address}
        </p>
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">
            Severity Level:
          </label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Severity</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">
            Medication to Dispatch (Optional):
          </label>
          <input
            type="text"
            value={medication}
            onChange={(e) => setMedication(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Inhaler, Insulin"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">
            Additional Notes:
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="Enter any additional notes..."
          />
        </div>
        <button
          onClick={handleDispatch}
          className="bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition mr-4"
        >
          Dispatch Drone
        </button>
        <button
          onClick={() => navigate("/patient-details")}
          className="bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition"
        >
          Back
        </button>
        {droneStatus && (
          <div className="mt-6 p-4 bg-green-100 rounded-lg">
            <p className="text-green-700">{droneStatus}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DispatchForm;
