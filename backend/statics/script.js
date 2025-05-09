const BASE_URL = "https://binkhoale1812-triage-llm.hf.space";
const LOGIN_API = `${BASE_URL}/login`;
const REGISTER_API = `${BASE_URL}/register`;
const PROFILE_API = `${BASE_URL}/profile`;
const EMERGENCY_API = `${BASE_URL}/emergency`;

// Init authState null at default
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
// Toggle state
const toggleSection = (showLogin) => {
  loginSection.classList.toggle("collapsed", !showLogin);
  registerSection.classList.toggle("collapsed", showLogin);
};
// Determine current state and toggle
document.getElementById("showRegisterBtn").addEventListener("click", () => toggleSection(false));
document.getElementById("showLoginBtn").addEventListener("click", () => toggleSection(true));

// --- Login ---
document.getElementById("loginBtn").addEventListener("click", async () => {
  const username = document.getElementById("userName").value;
  const password = document.getElementById("userPassword").value;
  // Send username and password for authentication
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
  // Send register information of username and password to DB
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
  // Prepare profile JSON 
  const profileData = {
    username: authState.username,
    password: authState.password,
    user_id: authState.user_id,
    name: document.getElementById("name").value,
    dob: `${document.getElementById("dob_year").value.padStart(4, '0')}-${document.getElementById("dob_month").value.padStart(2, '0')}-${document.getElementById("dob_day").value.padStart(2, '0')}`,
    sex: document.getElementById("sex").value,
    phone_number: document.getElementById("phone_number").value,
    email_address: document.getElementById("email_address").value,
    blood_type: document.getElementById("blood_type").value,
    allergies: document.getElementById("allergies").value.split(",").map(x => x.trim()),
    medical_history: document.getElementById("medical_history").value.split(",").map(x => x.trim()),
    active_medications: document.getElementById("active_medications").value.split(",").map(x => x.trim()),
    disability: document.getElementById("disability").value,
    insurance_card: document.getElementById("insurance_card").value,
    home_address: document.getElementById("home_address").value,
    emergency_contact: {
      name: document.getElementById("emergency_name").value || "N/A",
      phone: document.getElementById("emergency_phone").value || "N/A"
    },    
    last_updated: new Date().toISOString()
  };
  // Fetch profile back to refresh
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

// --- Emergency Trigger (Voice-Based) ---
// Media recording
let mediaRecorder;
let audioChunks = [];
// Btn triggers
const emergencyButton = document.getElementById("emergency-button");
const voiceOutput = document.getElementById("voice-output");
// Typing animation
let typingInterval; // Global reference
function typeEffect(element, text, delay = 50) { // Typing each 50ms
  if (typingInterval) clearInterval(typingInterval);
  element.classList.add("typing");
  element.innerText = "";
  let i = 0;
  typingInterval = setInterval(() => {
    element.innerText += text.charAt(i);
    i++;
    if (i >= text.length) {
      clearInterval(typingInterval);
      element.classList.remove("typing");
      typingInterval = null;
    }
  }, delay);
}
// Get audio record
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = e => {
        audioChunks.push(e.data);
      };
      // Stop media
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        audioChunks = [];
        // Form and write audio file
        const formData = new FormData();
        formData.append("file", audioBlob, "recording.wav");
        try {
          // Indicate sending audio...
          typeEffect(voiceOutput, "🧠 Transcribing your voice...", 40);
          const res = await fetch(`${BASE_URL}/voice-transcribe`, {
            method: "POST",
            body: formData
          });
          // Result from trancribe
          const result = await res.json();
          const transcribedText = result.transcription || "❌ Unable to transcribe.";
          // Show voice transcription with typing effect
          typeEffect(voiceOutput, `🗣 ${transcribedText}`, 30);
          // Only send to backend if valid auth and transcription
          if (authState.user_id) {
            const emergencyData = {
              user_id: authState.user_id,
              emergency_type: "ambulance",
              voice_text: transcribedText
            };
            // Delay emergency call slightly to let user see transcription
            setTimeout(async () => {
              typeEffect(voiceOutput, `🗣 ${transcribedText}\n⏳ Sending emergency request...`, 30);
              // Send to correct service API
              const emRes = await fetch(EMERGENCY_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(emergencyData)
              });
              // Obtain result
              const emResult = await emRes.json();
              // Spec timeout event
              setTimeout(() => {
                typeEffect(
                  voiceOutput,
                  `🗣 ${transcribedText}\n🚨 ${emResult.message || "Response received."}`,
                  25
                );
              }, 300);
            }, 600);
          }
        } catch (err) {
          typeEffect(voiceOutput, "❌ Error processing voice emergency.");
        }
      };
      // START RECORDING EVENTS
      const startRecording = () => {
        voiceOutput.innerText = "🎙 Recording... Hold to speak...";
        mediaRecorder.start();
      };
      const stopRecording = () => {
        mediaRecorder.stop();
      };
      // MOUSE EVENTS
      emergencyButton.addEventListener("mousedown", startRecording);
      emergencyButton.addEventListener("mouseup", stopRecording);
      // TOUCH EVENTS (Mobile)
      emergencyButton.addEventListener("touchstart", startRecording);
      emergencyButton.addEventListener("touchend", stopRecording);
    })
    .catch(err => {
      console.error("Microphone access denied or failed.", err);
      alert("Microphone access is required for emergency voice recognition.");
    });
} else {
  alert("getUserMedia not supported on this browser.");
}

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
    // saved credential data in localStorage matches db data => allow auto-login
    const result = await res.json();
    if (res.ok && result.status === "success") {
      const profile = result.profile;    
      // Pre-fill the fields
      document.getElementById("name").value = profile.name || "";
      if (profile.dob) {
        const [y, m, d] = profile.dob.split("-");
        document.getElementById("dob_year").value = y || "";
        document.getElementById("dob_month").value = m || "";
        document.getElementById("dob_day").value = d || "";
      }  
      document.getElementById("sex").value = profile.sex || "";
      document.getElementById("phone_number").value = profile.phone_number || "";
      document.getElementById("email_address").value = profile.email_address || "";
      document.getElementById("blood_type").value = profile.blood_type || "";
      document.getElementById("allergies").value = (profile.allergies || []).join(", ");
      document.getElementById("medical_history").value = (profile.medical_history || []).join(", ");
      document.getElementById("active_medications").value = (profile.active_medications || []).join(", ");
      document.getElementById("disability").value = profile.disability || "";
      document.getElementById("insurance_card").value = profile.insurance_card || "";
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
