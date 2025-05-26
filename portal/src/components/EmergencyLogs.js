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
                  <strong>Patient:</strong> {log.profile?.Name || "Unknown"} ({log.profile?.Age || "N/A"} years old)
                </p>
                <p>
                  <strong>Location:</strong> {log.profile?.Location || "N/A"}
                </p>
                <p>
                  <strong>Blood Type:</strong> {log.profile?.["Blood Type"] || "N/A"}
                </p>
                <p>
                  <strong>Disability:</strong> {log.profile?.Disability || "N/A"}
                </p>
                <p>
                  <strong>Emergency Contact:</strong> {log.profile?.["Emergency Contact"] || "N/A"}
                </p> 
                <div className="mt-2">
                  <strong>Highlights:</strong>
                  <ul className="list-disc ml-6 text-sm text-gray-700 mt-1">
                    {log.highlights?.map((h, idx) => (
                      <li key={idx}>{h}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-2">
                  <strong>Recommendation:</strong>
                  <ul className="list-disc ml-6 text-sm text-gray-700 mt-1">
                    {log.recommendations?.map((h, idx) => (
                      <li key={idx}>{h}</li>
                    ))}
                  </ul>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  <strong>Timestamp:</strong> {new Date(log.timestamp).toLocaleString()}
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
