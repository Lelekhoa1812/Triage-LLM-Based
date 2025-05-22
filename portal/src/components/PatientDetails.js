import React from "react";
import { useNavigate } from "react-router-dom";

const PatientDetails = ({ patient }) => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Patient Details: {patient.name}
      </h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="mb-2">
          <strong>Age:</strong> {patient.age}
        </p>
        <p className="mb-2">
          <strong>Blood Type:</strong> {patient.bloodType}
        </p>
        <p className="mb-2">
          <strong>Allergies:</strong> {patient.allergies}
        </p>
        <p className="mb-2">
          <strong>Medical History:</strong> {patient.medicalHistory}
        </p>
        <p className="mb-2">
          <strong>Current Medications:</strong> {patient.currentMedications}
        </p>
        <p className="mb-2">
          <strong>Disability:</strong> {patient.disability}
        </p>
        <p className="mb-2">
          <strong>Home Address:</strong> {patient.address}
        </p>
        <p className="mb-4">
          <strong>Emergency Contact:</strong> {patient.emergencyContact.name} (
          {patient.emergencyContact.phone})
        </p>
        <button
          onClick={() => navigate("/dispatch")}
          className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition mr-4"
        >
          Assess & Dispatch Drone
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default PatientDetails;
