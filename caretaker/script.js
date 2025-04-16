// File: caretaker/script.js
fetch("https://BinKhoaLe1812-Triage_LLM.hf.space", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action: "send_caretaker", status: "en route" })
})
.then(res => res.json())
.then(data => {
  document.getElementById("log").innerText = "🧑 Caretaker on the way: " + JSON.stringify(data);
})
.catch(err => {
  document.getElementById("log").innerText = "❌ Error sending caretaker: " + err;
});