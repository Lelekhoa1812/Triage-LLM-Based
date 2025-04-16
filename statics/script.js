// Define API endpoints (adjust these URLs to your deployed backend endpoints)
const PROFILE_API = "https://<your-huggingface-space-domain>/profile";  // Endpoint for profile updates
const EMERGENCY_API = "https://<your-huggingface-space-domain>/emergency"; // Endpoint for emergency requests

// Update profile event handler
document.getElementById('profile-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const profileData = {
    name: document.getElementById('name').value,
    age: document.getElementById('age').value,
    sex: document.getElementById('sex').value,
    blood_type: document.getElementById('blood_type').value,
    allergies: document.getElementById('allergies').value,
    medical_history: document.getElementById('medical_history').value,
    active_medications: document.getElementById('active_medications').value,
    disability: document.getElementById('disability').value,
    home_address: document.getElementById('home_address').value,
  };

  // Call API to update profile in MongoDB
  try {
    const res = await fetch(PROFILE_API, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(profileData)
    });
    const result = await res.json();
    alert(result.message || "Profile updated successfully!");
  } catch (err) {
    alert("Error updating profile.");
  }
});

// Emergency request handler
document.getElementById('emergency-button').addEventListener('click', async function() {
  // Use a simulated voice input via prompt
  const voiceText = prompt("Simulated voice input (enter your emergency message):");
  if (!voiceText) return;
  
  const emergencyData = {
    user_id: "sample_user_id",  // Replace with actual user ID in production
    emergency_type: "ambulance",  // Options: "self-care", "caretaker", "ambulance"
    voice_message: voiceText
  };
  
  try {
    const res = await fetch(EMERGENCY_API, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(emergencyData)
    });
    const result = await res.json();
    document.getElementById('voice-output').innerText = result.message;
  } catch (err) {
    document.getElementById('voice-output').innerText = "Error processing emergency request.";
  }
});
