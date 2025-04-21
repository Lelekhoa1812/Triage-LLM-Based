// api/dispatch.js
let latestDispatch = null;

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { action, status, user } = req.body;

    latestDispatch = {
      received: true,
      service: req.headers.host,
      action,
      status,
      user,
      timestamp: new Date().toISOString()
    };

    console.log("🚨 Dispatch Log:", latestDispatch);
    return res.status(200).json(latestDispatch);
  }

  if (req.method === 'GET') {
    if (!latestDispatch) return res.status(204).end(); 
    return res.status(200).json(latestDispatch);
  }

  res.status(405).json({ error: "Method Not Allowed" });
}
