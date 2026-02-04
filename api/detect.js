export default async function handler(req, res) {
  // ---- 1. Allow only GET & POST ----
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ---- 2. Health check ----
  if (req.method === "GET") {
    return res.status(200).json({
      status: "ok",
      message: "Honeypot Scam Detector API is running"
    });
  }

  // ---- 3. Simple API key protection ----
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== "dev-key") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // ---- 4. Validate request body ----
  const { text } = req.body || {};
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Text is required" });
  }

  try {
    // ---- 5. Call Gemini API ----
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
You are a cyber security assistant.
Analyze the following message and tell if it is a scam.
Reply in JSON format with keys:
- scam (true/false)
- reason (short explanation)

Message:
"${text}"
                  `
                }
              ]
            }
          ]
        })
      }
    );

    const data = await geminiResponse.json();

    // ---- 6. Extract Gemini output safely ----
    const aiText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // ---- 7. Fallback scam detection (backup) ----
    const fallbackScam = /otp|upi|blocked|kyc|urgent|bank/i.test(text);

    return res.status(200).json({
      input: text,
      scam: aiText.toLowerCase().includes("true") || fallbackScam,
      aiResponse: aiText || "No response from AI"
    });

  } catch (error) {
    console.error("Gemini API Error:", error);

    return res.status(500).json({
      error: "Failed to analyze text",
      details: error.message
    });
  }
}
