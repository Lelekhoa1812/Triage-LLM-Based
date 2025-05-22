import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Chart from "chart.js/auto";
import QRCode from "qrcode";
import { motion } from "framer-motion"; // For animations

const Dashboard = ({
  patients,
  alerts,
  setAlerts,
  setSelectedPatient,
  emergencyLogs,
  drones,
}) => {
  const chartRef1 = useRef(null); // Emergencies Handled Per Day
  const chartRef2 = useRef(null); // Patient Wait Times Per Day
  const chartRef3 = useRef(null); // Emergency Severity Distribution
  const heatmapRef = useRef(null); // Drone Activity Heatmap
  const qrRef = useRef(null);
  const navigate = useNavigate();

  // Store chart instances
  const chartInstance1 = useRef(null);
  const chartInstance2 = useRef(null);
  const chartInstance3 = useRef(null);
  const chartInstance4 = useRef(null);

  // Metrics
  const activeAlerts = alerts.filter((a) => !a.handled).length;
  const dronesInFlight = drones.filter((d) => d.status !== "Arrived").length;
  const resolvedEmergencies = emergencyLogs.length;

  // Mock data
  const emergenciesPerDay = [5, 3, 8, 2, 6];
  const labels = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"];
  const waitTimes = {
    labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"],
    datasets: [
      {
        label: "Patient 1",
        data: [10, 15, 12, 8, 20],
        borderColor: "rgba(75, 192, 192, 1)",
        fill: false,
      },
      {
        label: "Patient 2",
        data: [5, 10, 8, 12, 15],
        borderColor: "rgba(153, 102, 255, 1)",
        fill: false,
      },
    ],
  };
  const severityData = {
    labels: ["Low", "Medium", "High"],
    datasets: [
      {
        data: [30, 40, 30],
        backgroundColor: ["#4BC0C0", "#9966FF", "#FF6384"],
      },
    ],
  };
  const heatmapData = [
    { x: 0, y: 0, value: 10 },
    { x: 1, y: 0, value: 15 },
    { x: 0, y: 1, value: 8 },
    { x: 1, y: 1, value: 20 },
  ];

  useEffect(() => {
    // Destroy existing charts if they exist
    if (chartInstance1.current) chartInstance1.current.destroy();
    if (chartInstance2.current) chartInstance2.current.destroy();
    if (chartInstance3.current) chartInstance3.current.destroy();
    if (chartInstance4.current) chartInstance4.current.destroy();

    // Emergencies Handled Per Day (Bar Chart)
    const ctx1 = chartRef1.current.getContext("2d");
    chartInstance1.current = new Chart(ctx1, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Emergencies Handled",
            data: emergenciesPerDay,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "Count" } },
        },
        plugins: { legend: { labels: { color: "#e0e0e0" } } },
      },
    });

    // Patient Wait Times Per Day (Line Chart)
    const ctx2 = chartRef2.current.getContext("2d");
    chartInstance2.current = new Chart(ctx2, {
      type: "line",
      data: waitTimes,
      options: {
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "Minutes" } },
        },
        plugins: { legend: { labels: { color: "#e0e0e0" } } },
      },
    });

    // Emergency Severity Distribution (Pie Chart)
    const ctx3 = chartRef3.current.getContext("2d");
    chartInstance3.current = new Chart(ctx3, {
      type: "pie",
      data: severityData,
      options: {
        plugins: { legend: { labels: { color: "#e0e0e0" } } },
      },
    });

    // Drone Activity Heatmap (Scatter-based)
    const ctx4 = heatmapRef.current.getContext("2d");
    chartInstance4.current = new Chart(ctx4, {
      type: "scatter",
      data: {
        datasets: [
          {
            label: "Drone Activity",
            data: heatmapData.map((d) => ({ x: d.x, y: d.y, r: d.value * 2 })),
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            pointRadius: 10,
          },
        ],
      },
      options: {
        scales: {
          x: { title: { display: true, text: "Region X" } },
          y: { title: { display: true, text: "Region Y" } },
        },
        plugins: { legend: { display: false } },
      },
    });

    // QR Code
    QRCode.toCanvas(
      qrRef.current,
      "https://example.com/patient-guide",
      { width: 100 },
      (err) => {
        if (err) console.error(err);
      }
    );

    // Cleanup function to destroy charts on unmount
    return () => {
      if (chartInstance1.current) chartInstance1.current.destroy();
      if (chartInstance2.current) chartInstance2.current.destroy();
      if (chartInstance3.current) chartInstance3.current.destroy();
      if (chartInstance4.current) chartInstance4.current.destroy();
    };
  }, []); // Empty dependency array to run only on mount

  const handleAlert = (alert) => {
    const patient = patients.find((p) => p.id === alert.patientId);
    setSelectedPatient(patient);
    navigate("/patient-details");
    setAlerts((prev) =>
      prev.map((a) => (a.id === alert.id ? { ...a, handled: true } : a))
    );
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-900 to-black text-white min-h-screen">
      <motion.h1
        className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Emergency Response Command Center
      </motion.h1>

      {/* Metrics Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg border border-blue-500/30"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold text-blue-300">Active Alerts</h3>
          <p className="text-4xl font-bold text-red-400">{activeAlerts}</p>
        </motion.div>
        <motion.div
          className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg border border-blue-500/30"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-blue-300">
            Drones in Flight
          </h3>
          <p className="text-4xl font-bold text-blue-400">{dronesInFlight}</p>
        </motion.div>
        <motion.div
          className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg border border-blue-500/30"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-blue-300">
            Resolved Emergencies
          </h3>
          <p className="text-4xl font-bold text-green-400">
            {resolvedEmergencies}
          </p>
        </motion.div>
      </div>

      {/* Graphs and Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Emergencies Handled Per Day */}
        <motion.div
          className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg border border-blue-500/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-xl font-semibold text-blue-300 mb-4">
            Emergencies Handled Per Day
          </h3>
          <canvas ref={chartRef1} className="w-full h-64"></canvas>
        </motion.div>

        {/* Patient Wait Times Per Day */}
        <motion.div
          className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg border border-blue-500/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-xl font-semibold text-blue-300 mb-4">
            Patient Wait Times Per Day
          </h3>
          <canvas ref={chartRef2} className="w-full h-64"></canvas>
        </motion.div>

        {/* Emergency Severity Distribution */}
        <motion.div
          className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg border border-blue-500/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-blue-300 mb-4">
            Emergency Severity Distribution
          </h3>
          <canvas ref={chartRef3} className="w-full h-64"></canvas>
        </motion.div>

        {/* Drone Activity Heatmap */}
        <motion.div
          className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg border border-blue-500/30 col-span-1 lg:col-span-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <h3 className="text-xl font-semibold text-blue-300 mb-4">
            Drone Activity by Region
          </h3>
          <canvas ref={heatmapRef} className="w-full h-64"></canvas>
        </motion.div>
      </div>

      {/* Alerts Section */}
      <motion.div
        className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg border border-blue-500/30 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <h2 className="text-2xl font-semibold text-red-400 mb-4">
          Incoming Alerts
        </h2>
        {alerts.length === 0 ? (
          <p className="text-gray-400">No active alerts.</p>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                className={`p-4 rounded-lg shadow-md ${
                  alert.handled ? "bg-gray-800" : "bg-red-900/50"
                }`}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
              >
                <p className="text-gray-200">
                  <strong>Emergency:</strong> {alert.description}
                </p>
                <p className="text-gray-300">
                  <strong>Location:</strong> {alert.location}
                </p>
                <p className="text-gray-400">
                  <strong>Time:</strong> {alert.timestamp}
                </p>
                {!alert.handled && (
                  <button
                    onClick={() => handleAlert(alert)}
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                  >
                    Handle Alert
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Patients Section */}
      <motion.div
        className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg border border-blue-500/30 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <h2 className="text-2xl font-semibold text-blue-300 mb-4">
          Patient Profiles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map((patient) => (
            <motion.div
              key={patient.id}
              className="bg-gray-800/50 p-6 rounded-lg shadow-md hover:shadow-lg transition hover:bg-gray-700/50"
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-xl font-semibold text-blue-400">
                {patient.name}
              </h3>
              <p className="text-gray-300">Age: {patient.age}</p>
              <p className="text-gray-400">Blood Type: {patient.bloodType}</p>
              <button
                onClick={() => {
                  setSelectedPatient(patient);
                  navigate("/patient-details");
                }}
                className="mt-4 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition"
              >
                View Details
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* QR Code Section */}
      <motion.div
        className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg border border-blue-500/30 mt-8 flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
      >
        <div>
          <h3 className="text-xl font-semibold text-blue-300">Patient Guide</h3>
          <p className="text-gray-400">
            Scan to access guide for submitting medical profiles.
          </p>
        </div>
        <canvas ref={qrRef}></canvas>
      </motion.div>
    </div>
  );
};

export default Dashboard;
