import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import {
  ConversationMessage,
  ScamDetectionResult,
  ExtractedIntelligence,
  AgentResponse,
  AgentNotes,
} from "../types";
import {
  SCAM_DETECTION_PROMPT,
  DEFAULT_HUMAN_PERSONA,
  INTELLIGENCE_EXTRACTION_PROMPT,
  AGENT_NOTES_PROMPT,
  GEMINI_MODEL_TEXT_TASK,
} from "../constants";

// Helper function to encode Uint8Array to base64
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Function to convert Message[] to ConversationMessage[] for Gemini API
const formatConversationHistory = (history: { sender: string; text: string }[]): ConversationMessage[] => {
  return history.map((msg) => ({
    role: msg.sender === 'scammer' ? 'user' : 'model',
    parts: [{ text: msg.text }],
  }));
};

// Function to initialize GoogleGenAI
const getGenAI = (): GoogleGenAI => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const detectScamIntent = async (
  messageText: string,
  conversationHistory: { sender: string; text: string }[]
): Promise<ScamDetectionResult> => {
  const ai = getGenAI();
  const history = formatConversationHistory(conversationHistory);

  const fullPrompt = `${SCAM_DETECTION_PROMPT}

Current message from scammer: "${messageText}"
Conversation History:
${history.map(m => `${m.role}: ${m.parts[0].text}`).join('\n')}

JSON Response:`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT_TASK,
      contents: [{ parts: [{ text: fullPrompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isScam: { type: Type.BOOLEAN },
            scamType: { type: Type.STRING, nullable: true },
            initialReply: { type: Type.STRING },
          },
          required: ["isScam", "initialReply"],
        },
      },
    });

    const jsonStr = response.text?.trim();
    if (!jsonStr) {
      throw new Error("Empty response from scam detection model.");
    }
    const result: ScamDetectionResult = JSON.parse(jsonStr);
    return result;
  } catch (error) {
    console.error('Error detecting scam intent:', error);
    // Fallback to a safe default if detection fails
    return { isScam: false, scamType: null, initialReply: "I'm not sure I understand, can you clarify?" };
  }
};

export const generateAgentResponse = async (
  conversationHistory: { sender: string; text: string }[],
  persona: string = DEFAULT_HUMAN_PERSONA
): Promise<AgentResponse> => {
  const ai = getGenAI();
  const history = formatConversationHistory(conversationHistory);

  const systemInstruction = persona;

  const fullPrompt = `Based on the conversation history below, provide a believable human-like response.
  
Conversation History:
${history.map(m => `${m.role === 'user' ? 'Scammer' : 'You'}: ${m.parts[0].text}`).join('\n')}

Your response:`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT_TASK,
      contents: [{ parts: [{ text: fullPrompt }] }],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.9,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 200,
        thinkingConfig: { thinkingBudget: 50 }, // Allocate some thinking budget
      },
    });
    const replyText = response.text?.trim();
    if (!replyText) {
      throw new Error("Empty response from agent response model.");
    }
    return { reply: replyText };
  } catch (error) {
    console.error('Error generating agent response:', error);
    return { reply: "I seem to be having trouble understanding right now, could you rephrase?" };
  }
};

export const extractIntelligence = async (
  conversationHistory: { sender: string; text: string }[]
): Promise<ExtractedIntelligence> => {
  const ai = getGenAI();
  const history = formatConversationHistory(conversationHistory);

  const fullPrompt = `${INTELLIGENCE_EXTRACTION_PROMPT}

Conversation History:
${history.map(m => `${m.role}: ${m.parts[0].text}`).join('\n')}

JSON Response:`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT_TASK,
      contents: [{ parts: [{ text: fullPrompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bankAccounts: { type: Type.ARRAY, items: { type: Type.STRING } },
            upiIds: { type: Type.ARRAY, items: { type: Type.STRING } },
            phishingLinks: { type: Type.ARRAY, items: { type: Type.STRING } },
            phoneNumbers: { type: Type.ARRAY, items: { type: Type.STRING } },
            suspiciousKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
    });

    const jsonStr = response.text?.trim();
    if (!jsonStr) {
      // Return empty intelligence if no text response
      return {
        bankAccounts: [],
        upiIds: [],
        phishingLinks: [],
        phoneNumbers: [],
        suspiciousKeywords: [],
      };
    }
    const result: ExtractedIntelligence = JSON.parse(jsonStr);
    return result;
  } catch (error) {
    console.error('Error extracting intelligence:', error);
    return {
      bankAccounts: [],
      upiIds: [],
      phishingLinks: [],
      phoneNumbers: [],
      suspiciousKeywords: [],
    };
  }
};

export const generateAgentNotes = async (
  conversationHistory: { sender: string; text: string }[]
): Promise<AgentNotes> => {
  const ai = getGenAI();
  const history = formatConversationHistory(conversationHistory);

  const fullPrompt = `${AGENT_NOTES_PROMPT}

Conversation History:
${history.map(m => `${m.role}: ${m.parts[0].text}`).join('\n')}

Summary:`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT_TASK,
      contents: [{ parts: [{ text: fullPrompt }] }],
      config: {
        temperature: 0.7,
      },
    });
    const notesText = response.text?.trim();
    if (!notesText) {
      throw new Error("Empty response from agent notes model.");
    }
    return { notes: notesText };
  } catch (error) {
    console.error('Error generating agent notes:', error);
    return { notes: "Failed to generate agent notes." };
  }
};
