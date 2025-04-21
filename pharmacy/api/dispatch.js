// File: api/dispatch.js
export default function handler(req, res) {
    if (req.method === 'POST') {
      const { action, status, user, medications } = req.body;
  
      console.log("🚨 Dispatch Log:", {
        service: req.headers.host,
        action,
        status,
        user
      });
  
      return res.status(200).json({
        received: true,
        service: req.headers.host,
        action,
        status,
        user,
        medications,
        timestamp: new Date().toISOString()
      });
    }
  
    res.status(405).json({ error: "Method Not Allowed" });
  }
  