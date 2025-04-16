// File: hospital/public/script.js
fetch("https://BinKhoaLe1812-Triage_LLM.hf.space", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action: "ambulance", status: "dispatched" })
})
.then(res => res.json())
.then(data => {
  document.getElementById("log").innerText = "🚑 Ambulance dispatched with: " + JSON.stringify(data);
})
.catch(err => {
  document.getElementById("log").innerText = "❌ Error dispatching ambulance: " + err;
});