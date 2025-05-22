import React from "react";

function EmergencyLogs({ logs, setCurrentPage }) {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Emergency Logs</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        {logs.length === 0 ? (
          <p className="text-gray-600">No emergency logs available.</p>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="p-4 border rounded-lg">
                <p>
                  <strong>Patient:</strong> {log.patientName}
                </p>
                <p>
                  <strong>Severity:</strong> {log.severity}
                </p>
                <p>
                  <strong>Medication Dispatched:</strong> {log.medication}
                </p>
                <p>
                  <strong>Notes:</strong> {log.notes}
                </p>
                <p>
                  <strong>Timestamp:</strong> {log.timestamp}
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

export default EmergencyLogs;
