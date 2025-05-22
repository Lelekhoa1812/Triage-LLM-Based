import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();

  return (
    <nav className="bg-blue-600 p-4 text-white flex flex-wrap justify-between items-center shadow-md">
      <div className="text-xl font-semibold">Medical Drone Dispatch</div>
      <div className="flex space-x-4 mt-2 sm:mt-0">
        <button
          onClick={() => navigate("/dashboard")}
          className="hover:underline"
        >
          Dashboard
        </button>
        <button onClick={() => navigate("/logs")} className="hover:underline">
          Emergency Logs
        </button>
        <button
          onClick={() => navigate("/drone-status")}
          className="hover:underline"
        >
          Drone Status
        </button>
        <button
          onClick={() => navigate("/communication")}
          className="hover:underline"
        >
          Communication
        </button>
        <button
          onClick={() => setIsLoggedIn(false)}
          className="hover:underline"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
