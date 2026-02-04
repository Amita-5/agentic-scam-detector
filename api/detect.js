import fetch from "node-fetch";

export default async function handler(req, res) {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== "dev-key") {
    return res.status(401).json({ error: "Invalid API key" });
  }

  // Tester / health check
  if (req.method === "GET" || !req.body || !req.body.text) {
    return res.status(200).json({
      status: "ok",
      message: "Honeypot API reachable"
    });
  }

  // Real usage with Gemini
  const { text } = req.body;

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
      process.env.GEMINI_API_KEY,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }]
      })
    }
  );

  const data = await response.json();

  return res.status(200).json({
    scam: /otp|upi|blocked/i.test(text),
    aiResponse: data.candidates?.[0]?.content?.parts?.[0]?.text
  });
}
