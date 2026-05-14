import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";
import { LANGUAGES } from "../constants";

let genAI: GoogleGenAI | null = null;

function getAI() {
  const key = process.env.GEMINI_API_KEY || '';
  if (!genAI && key) {
    genAI = new GoogleGenAI({ apiKey: key });
  }
  return genAI;
}

export interface FileData {
  data: string; // base64
  mimeType: string;
  name: string;
}

export async function chatWithAI(messages: Message[], language: string = 'en', file?: FileData | null) {
  try {
    const aiClient = getAI();
    if (!aiClient) {
      console.error("Gemini API Key is missing!");
      return "I'm sorry, I cannot reply right now because my AI brain (API Key) is not connected. Please check your settings.";
    }

    const languageName = LANGUAGES[language as keyof typeof LANGUAGES] || 'English';
    
    const contents: any[] = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }] as any[]
    }));

    // If there's a file, attach it to the LAST user message
    if (file && contents.length > 0) {
      const lastMessage = contents[contents.length - 1];
      if (lastMessage.role === 'user') {
        lastMessage.parts.push({
          inlineData: {
            data: file.data,
            mimeType: file.mimeType
          }
        });
      }
    }

    const response = await aiClient.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction: `You are Hasta-Shilpa AI, a design bridge for bamboo and cane artisans in India. 
        Your goal is to help them modernize their products. 
        You provide advice on design trends, step-by-step making guides, and pricing suggestions.
        Always reply in ${languageName}.
        If the user asks in another language, still prioritize replying in ${languageName} unless they explicitly ask to change.
        Keep your advice practical, encouraging, and focused on sustainable bamboo craft.
        You can answer any question related to bamboo furniture, sales, marketing, and artisan life.
        If the user uploads an image of a bamboo product or a document, analyze it and provide feedback/suggestions accordingly.`,
      },
    });

    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    return "I am sorry, I am having trouble connecting right now. Please try again later.";
  }
}
