// File: pharmacy/script.js
fetch("https://BinKhoaLe1812-Triage_LLM.hf.space", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action: "dispatch", status: "success" })
})
.then(res => res.json())
.then(data => {
  document.getElementById("log").innerText = "✅ Drone dispatched with: " + JSON.stringify(data);
})
.catch(err => {
  document.getElementById("log").innerText = "❌ Error dispatching drone: " + err;
});