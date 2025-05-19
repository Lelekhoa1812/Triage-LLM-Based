import React from "react";
import { useState } from "react";

function StaffCommunication({ setCurrentPage }) {
  const [message, setMessage] = useState("");
  const [sentMessages, setSentMessages] = useState([]);

  const handleSend = () => {
    if (!message) {
      alert("Please enter a message");
      return;
    }
    setSentMessages((prev) => [
      ...prev,
      { id: Date.now(), message, timestamp: new Date().toLocaleString() },
    ]);
    setMessage("");
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Staff Communication
      </h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">
            Message to Healthcare Providers:
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="Enter your message..."
          />
        </div>
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition mr-4"
        >
          Send Message
        </button>
        <button
          onClick={() => setCurrentPage("dashboard")}
          className="bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition"
        >
          Back to Dashboard
        </button>
        {sentMessages.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Sent Messages
            </h3>
            <div className="space-y-4">
              {sentMessages.map((msg) => (
                <div key={msg.id} className="p-4 border rounded-lg">
                  <p>{msg.message}</p>
                  <p className="text-sm text-gray-600">
                    Sent at: {msg.timestamp}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StaffCommunication;
