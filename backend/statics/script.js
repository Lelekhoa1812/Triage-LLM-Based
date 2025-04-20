const BASE_URL = "https://binkhoale1812-triage-llm.hf.space"; // Correct format
const LOGIN_API = `${BASE_URL}/login`;
const REGISTER_API = `${BASE_URL}/register`;
const PROFILE_API = `${BASE_URL}/profile`;
const EMERGENCY_API = `${BASE_URL}/emergency`;

let authState = {
  username: null,
  password: null,
  user_id: null
};

// Toggle Login/Register Modal
const loginSection = document.getElementById("loginSection");
const registerSection = document.getElementById("registerSection");
const toggleSection = (showLogin) => {
  if (showLogin) {
    loginSection.classList.remove("collapsed");
    registerSection.classList.add("collapsed");
  } else {
    loginSection.classList.add("collapsed");
    registerSection.classList.remove("collapsed");
  }
};

document.getElementById("showRegisterBtn").addEventListener("click", () => toggleSection(false));
document.getElementById("showLoginBtn").addEventListener("click", () => toggleSection(true));

// Login
const loginBtn = document.getElementById("loginBtn");
loginBtn.addEventListener("click", async () => {
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
      alert("Login successful!");
      document.getElementById("loginRegisterModal").style.display = "none";
    } else {
      alert(result.message);
    }
  } catch (err) {
    alert("Login failed.");
  }
});

// Register
const registerBtn = document.getElementById("createAccountBtn");
registerBtn.addEventListener("click", async () => {
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

// Update Medical Profile
const profileForm = document.getElementById("profile-form");
profileForm.addEventListener("submit", async (e) => {
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
    allergies: document.getElementById("allergies").value.split(","),
    medical_history: document.getElementById("medical_history").value,
    active_medications: document.getElementById("active_medications").value.split(","),
    disability: document.getElementById("disability").value,
    home_address: document.getElementById("home_address").value,
    emergency_contact: { name: "N/A", phone: "N/A" },
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

// Emergency Trigger
const emergencyButton = document.getElementById("emergency-button");
emergencyButton.addEventListener("click", async () => {
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