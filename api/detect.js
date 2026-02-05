import fetch from "node-fetch";

export default async function handler(req, res) {
  // 🔑 API key check (unchanged behavior)
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({ error: "x-api-key missing" });
  }

  if (apiKey !== "dev-key") {
    return res.status(403).json({ error: "Invalid API key" });
  }

  // ✅ NEW REQUEST FORMAT SUPPORT
  const latestMessage = req.body?.message?.text;

  if (!latestMessage || typeof latestMessage !== "string") {
    return res.status(200).json({
      status: "success",
      reply: "Can you explain what this message is about?"
    });
  }

  // 🤖 Ask Gemini to generate a SAFE honeypot-style reply
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
      process.env.GEMINI_API_KEY,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `
You are a cautious user replying to a suspected scammer.
Ask a neutral clarification question.
Do NOT share personal info.
Reply in one short sentence.

Scammer message:
"${latestMessage}"
`
              }
            ]
          }
        ]
      })
    }
  );

  const data = await response.json();

  const reply =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Why is my account being suspended?";

  // ✅ FINAL REQUIRED OUTPUT FORMAT
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
