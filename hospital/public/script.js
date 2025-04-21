// public/script.js
const logElement = document.getElementById("log");
const profileElement = document.getElementById("profile");

// Clear display at first
logElement.innerText = "Waiting for dispatch...";
profileElement.innerHTML = "";

function formatProfile(user) {
  if (!user) return "<i>No user data available.</i>";
  return `
    <ul>
      <li><strong>Name:</strong> ${user.Name}</li>
      <li><strong>Age:</strong> ${user.Age}</li>
      <li><strong>Sex:</strong> ${user.Sex}</li>
      <li><strong>Blood Type:</strong> ${user["Blood Type"]}</li>
      <li><strong>Allergies:</strong> ${user.Allergies}</li>
      <li><strong>Medical History:</strong> ${user["Medical History"]}</li>
      <li><strong>Current Medication:</strong> ${user["Current Medication"]}</li>
      <li><strong>Disability:</strong> ${user.Disability}</li>
      <li><strong>Emergency Contact:</strong> ${user["Emergency Contact"]}</li>
      <li><strong>Location:</strong> ${user.Location}</li>
    </ul>
  `;
}

function pollDispatch() {
  fetch("/api/dispatch")
    .then(res => {
      if (res.status === 204) return null;
      return res.json();
    })
    .then(data => {
      if (data) {
        logElement.innerText = `🚑 Ambulance dispatched. \nUser request: "${data.message || 'N/A'}"`;
        profileElement.innerHTML = formatProfile(data.user);
      }
    })
    .catch(err => {
      logElement.innerText = "❌ Error fetching dispatch: " + err;
    });
}

// Poll every 5 seconds (refresh)
setInterval(pollDispatch, 5000);
