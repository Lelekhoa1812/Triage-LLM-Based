// api/dispatch.js
// In‑memory queue of all incoming emergency calls
let dispatchQueue = [];

export default function handler(req, res) {
  // ─────────────────────────────────────────────────────────
  //  POST  ⇒  add a new dispatch item
  // ─────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const {
      action,
      status,
      profile,
      highlights,
      recommendations,
      medications
    } = req.body;

    const item = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      received: true,
      service: req.headers.host,
      action,
      status,
      profile,
      highlights,
      recommendations,
      medications,
      urgency: null,      // staff labelling: “High” | “Medium” | “Low”
      archived: false,    // client‑side archive toggle
      timestamp: new Date().toISOString()
    };

    dispatchQueue.push(item);
    console.log('🚨 New dispatch:', item);
    return res.status(200).json(item);
  }

  // ─────────────────────────────────────────────────────────
  //  GET  ⇒  return *all* active, non‑archived dispatches
  // ─────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const active = dispatchQueue.filter(d => !d.archived);
    if (active.length === 0) return res.status(204).end();
    return res.status(200).json(active);
  }

  res.status(405).json({ error: 'Method Not Allowed' });
}
