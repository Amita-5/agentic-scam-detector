import fetch from "node-fetch";

/**
 * In-memory session state (sufficient for hackathon evaluation)
 */
const sessionState = {};

/**
 * Call Gemini safely
 */
async function callGemini(prompt) {
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  /* ------------------ AUTH ------------------ */
  const apiKey = req.headers["x-api-key"];
  if (!apiKey) return res.status(401).json({ error: "x-api-key missing" });
  if (apiKey !== "dev-key") return res.status(403).json({ error: "Invalid API key" });

  /* ------------------ INPUT ------------------ */
  const {
    sessionId,
    message,
    conversationHistory = [],
    metadata = {}
  } = req.body;

  const text = message?.text;

  if (!sessionId || !text) {
    return res.status(200).json({
      status: "success",
      reply: "Can you explain what this message is about?"
    });
  }

  /* ------------------ SESSION INIT ------------------ */
  if (!sessionState[sessionId]) {
    sessionState[sessionId] = {
      turns: 0,
      scamIndicators: new Set(),
      requestedData: new Set(),
      finalized: false
    };
  }

  const state = sessionState[sessionId];
  state.turns += 1;

  /* ------------------ INTELLIGENCE EXTRACTION ------------------ */
  const lower = text.toLowerCase();

  if (/otp|one time password/.test(lower)) state.requestedData.add("OTP");
  if (/upi|account number|bank|card/.test(lower)) state.requestedData.add("Bank Details");
  if (/click|link|verify link/.test(lower)) state.scamIndicators.add("Phishing Link");
  if (/urgent|blocked|suspended|hours|immediately/.test(lower))
    state.scamIndicators.add("Threat / Urgency");
  if (/won|prize|reward|lottery/.test(lower)) state.scamIndicators.add("Lottery Scam");

  /* ------------------ GEMINI PROMPT (REAL INTELLIGENCE) ------------------ */
  const historyText =
    conversationHistory.length > 0
      ? conversationHistory.map(m => `${m.sender}: ${m.text}`).join("\n")
      : "No prior conversation.";

  const geminiPrompt = `
You are a real human who received suspicious messages.
You are NOT an AI.
You are NOT a security system.

Rules:
- Reply like a cautious normal person
- Ask natural clarification questions
- Do NOT share OTP, bank info, or personal data
- Do NOT mention scams, fraud, police, or security
- Do NOT explain policies or analysis
- Reply with ONE short message only

Conversation so far:
${historyText}

Latest message received:
"${text}"

Your reply:
`;

  const geminiReply = await callGemini(geminiPrompt);

  const reply =
    geminiReply && typeof geminiReply === "string"
      ? geminiReply.trim()
      : "Can you explain what you mean by this?";

  /* ------------------ GUVI FINAL CALLBACK ------------------ */
  if (!state.finalized && state.turns >= 3) {
    state.finalized = true;

    const intelligencePayload = {
      sessionId,
      scamDetected: true,
      scamIndicators: Array.from(state.scamIndicators),
      requestedSensitiveData: Array.from(state.requestedData),
      channel: metadata.channel || "Unknown",
      language: metadata.language || "Unknown",
      locale: metadata.locale || "Unknown",
      totalTurns: state.turns
    };

    try {
      await fetch("https://hackathon.guvi.in/api/updateHoneyPotFinalResult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(intelligencePayload)
      });
    } catch {
      // silent by design (no leakage)
    }
  }

  /* ------------------ FINAL RESPONSE ------------------ */
  return res.status(200).json({
    status: "success",
    reply
  });
}






// import fetch from "node-fetch";

// export default async function handler(req, res) {
//   // 🔑 REQUIRED by tester
//   const apiKey = req.headers["x-api-key"];

//   if (!apiKey) {
//     return res.status(401).json({ error: "x-api-key missing" });
//   }

//   // 🔒 Accept dev-key explicitly (as required)
//   if (apiKey !== "dev-key") {
//     return res.status(403).json({ error: "Invalid API key" });
//   }

//   // 🧪 TESTER MODE (always fast response)
//   if (!req.body || typeof req.body.text !== "string") {
//     return res.status(200).json({
//       status: "ok",
//       authenticated: true,
//       honeypot: true
//     });
//   }

//   // 🤖 REAL ANALYSIS (only when text exists)
//   const { text } = req.body;

//   const response = await fetch(
//     "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
//       process.env.GEMINI_API_KEY,
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         contents: [{ parts: [{ text }] }]
//       })
//     }
//   );

//   const data = await response.json();

//   return res.status(200).json({
//     scam: /otp|upi|blocked/i.test(text),
//     aiResponse: data.candidates?.[0]?.content?.parts?.[0]?.text
//   });
// }
