const BASE_URL = "https://binkhoale1812-triage-llm.hf.space";
const LOGIN_API = `${BASE_URL}/login`;
const REGISTER_API = `${BASE_URL}/register`;
const PROFILE_API = `${BASE_URL}/profile`;
const EMERGENCY_API = `${BASE_URL}/emergency`;

let authState = {
  username: null,
  password: null,
  user_id: null
};

// --- Load saved auth state from localStorage ---
document.addEventListener("DOMContentLoaded", async () => {
  const saved = localStorage.getItem("authState");
  if (saved) {
    authState = JSON.parse(saved);
    document.getElementById("loginRegisterModal").style.display = "none";
    await loadUserProfile(); // Load and fill form
  }
});

// --- Toggle Login/Register Modal ---
const loginSection = document.getElementById("loginSection");
const registerSection = document.getElementById("registerSection");

const toggleSection = (showLogin) => {
  loginSection.classList.toggle("collapsed", !showLogin);
  registerSection.classList.toggle("collapsed", showLogin);
};

document.getElementById("showRegisterBtn").addEventListener("click", () => toggleSection(false));
document.getElementById("showLoginBtn").addEventListener("click", () => toggleSection(true));

// --- Login ---
document.getElementById("loginBtn").addEventListener("click", async () => {
  const username = document.getElementById("userName").value;
  const password = document.getElementById("userPassword").value;

  try {
    const res = await fetch(LOGIN_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const result = await res.json();
    if (res.ok) {
      authState = { username, password, user_id: result.user_id };
      localStorage.setItem("authState", JSON.stringify(authState));
      alert("Login successful!");
      document.getElementById("loginRegisterModal").style.display = "none";
      await loadUserProfile();
    } else {
      alert(result.message);
    }
  } catch (err) {
    alert("Login failed.");
  }
});

// --- Register ---
document.getElementById("createAccountBtn").addEventListener("click", async () => {
  const username = document.getElementById("newUserName").value;
  const password = document.getElementById("newUserPassword").value;

  try {
    const res = await fetch(REGISTER_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const result = await res.json();
    if (res.ok) {
      alert("Account created. You can now login.");
      toggleSection(true);
    } else {
      alert(result.message);
    }
  } catch (err) {
    alert("Registration failed.");
  }
});

// --- Profile Submission ---
document.getElementById("profile-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!authState.user_id) return alert("Please login first.");

  const profileData = {
    username: authState.username,
    password: authState.password,
    user_id: authState.user_id,
    name: document.getElementById("name").value,
    age: parseInt(document.getElementById("age").value),
    sex: document.getElementById("sex").value,
    blood_type: document.getElementById("blood_type").value,
    allergies: document.getElementById("allergies").value.split(",").map(x => x.trim()),
    medical_history: document.getElementById("medical_history").value.split(",").map(x => x.trim()),
    active_medications: document.getElementById("active_medications").value.split(",").map(x => x.trim()),
    disability: document.getElementById("disability").value,
    home_address: document.getElementById("home_address").value,
    emergency_contact: {
      name: document.getElementById("emergency_name").value || "N/A",
      phone: document.getElementById("emergency_phone").value || "N/A"
    },    
    last_updated: new Date().toISOString()
  };

  try {
    const res = await fetch(PROFILE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileData)
    });
    const result = await res.json();
    alert(result.message || "Profile updated.");
  } catch (err) {
    alert("Error updating profile.");
  }
});

// --- Emergency Trigger ---
document.getElementById("emergency-button").addEventListener("click", async () => {
  if (!authState.user_id) return alert("Please login first.");
  const voiceText = prompt("Enter your emergency message:");
  if (!voiceText) return;

  const emergencyData = {
    user_id: authState.user_id,
    emergency_type: "ambulance",
    voice_text: voiceText
  };

  try {
    const res = await fetch(EMERGENCY_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emergencyData)
    });
    const result = await res.json();
    document.getElementById("voice-output").innerText = result.message;
  } catch (err) {
    document.getElementById("voice-output").innerText = "Error processing emergency request.";
  }
});

// --- Auto-Fill Profile ---
async function loadUserProfile() {
  try {
    const res = await fetch("https://binkhoale1812-medical-profile.hf.space/get_profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: authState.username,
        password: authState.password
      })
    });

    const result = await res.json();
    if (res.ok && result.status === "success") {
      const profile = result.profile;

      // Pre-fill the fields
      document.getElementById("name").value = profile.name || "";
      document.getElementById("age").value = profile.age || "";
      document.getElementById("sex").value = profile.sex || "";
      document.getElementById("blood_type").value = profile.blood_type || "";
      document.getElementById("allergies").value = (profile.allergies || []).join(", ");
      document.getElementById("medical_history").value = (profile.medical_history || []).join(", ");
      document.getElementById("active_medications").value = (profile.active_medications || []).join(", ");
      document.getElementById("disability").value = profile.disability || "";
      document.getElementById("home_address").value = profile.home_address || "";
      document.getElementById("emergency_name").value = profile.emergency_contact?.name || "";
      document.getElementById("emergency_phone").value = profile.emergency_contact?.phone || "";
    }
  } catch (err) {
    console.warn("❌ Failed to load profile on page load.");
  }
}

// --- Logout ---
const logoutBtn = document.getElementById("logout-button");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("authState");
    authState = { username: null, password: null, user_id: null };
    alert("Logged out.");
    location.reload();
  });
}
