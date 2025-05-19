import React from "react";

function DroneStatus({ drones, setCurrentPage }) {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Drone Status</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        {drones.length === 0 ? (
          <p className="text-gray-600">No drones in flight.</p>
        ) : (
          <div className="space-y-4">
            {drones.map((drone) => (
              <div key={drone.id} className="p-4 border rounded-lg">
                <p>
                  <strong>Patient:</strong> {drone.patientName}
                </p>
                <p>
                  <strong>Destination:</strong> {drone.address}
                </p>
                <p>
                  <strong>Medication:</strong> {drone.medication}
                </p>
                <p>
                  <strong>Status:</strong> {drone.status}
                </p>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => setCurrentPage("dashboard")}
          className="mt-6 bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default DroneStatus;
