import { GoogleGenAI, Modality, Type, GenerateContentResponse } from "@google/genai";
import { AdCopy, BannerSize } from "../types";

// Extend window for AI Studio API key selection
declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export async function checkApiKey() {
  if (typeof window.aistudio !== 'undefined') {
    return await window.aistudio.hasSelectedApiKey();
  }
  return true; // Assume true if not in AI Studio environment (e.g. local dev with .env)
}

export async function openApiKeyDialog() {
  if (typeof window.aistudio !== 'undefined') {
    await window.aistudio.openSelectKey();
  }
}

export async function generateAdCopy(description: string, url?: string): Promise<AdCopy> {
  const apiKey = process.env.GEMINI_API_KEY || (process.env as any).API_KEY;
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `Generate ad copy for a product with the following description: "${description}" ${url ? `and URL: ${url}` : ''}. 
  Provide a catchy headline (max 40 chars), a subheadline (max 80 chars), and a call to action (max 15 chars).
  Return as JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING },
          subheadline: { type: Type.STRING },
          cta: { type: Type.STRING },
        },
        required: ["headline", "subheadline", "cta"],
      },
      tools: url ? [{ urlContext: {} }] : [],
    },
  });

  return JSON.parse(response.text) as AdCopy;
}

export async function generateBannerImage(
  description: string, 
  aspectRatio: string, 
  imageSize: "512px" | "1K" | "2K" | "4K" = "1K"
): Promise<string> {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: {
      parts: [
        {
          text: `A high-quality, professional commercial product photograph for a banner ad. Product: ${description}. Clean background, studio lighting, high resolution, professional composition.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        imageSize: imageSize as any,
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image generated");
}

export async function generateTheme(description: string): Promise<{ backgroundColor: string; textColor: string; accentColor: string }> {
  const apiKey = process.env.GEMINI_API_KEY || (process.env as any).API_KEY;
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Based on the product description: "${description}", suggest a professional color theme for a banner ad. 
  Provide hex codes for backgroundColor, textColor, and accentColor.
  Return as JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          backgroundColor: { type: Type.STRING },
          textColor: { type: Type.STRING },
          accentColor: { type: Type.STRING },
        },
        required: ["backgroundColor", "textColor", "accentColor"],
      },
    },
  });

  return JSON.parse(response.text);
}
