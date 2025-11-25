import { GoogleGenAI, Type } from "@google/genai";
import { Category, AIAnalysisResult } from "../types";

export const analyzeUrlWithGemini = async (input: string): Promise<AIAnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    I have a website link or name: "${input}".
    Please analyze it for an embedded systems engineer and provide:
    1. A concise title (max 30 chars).
    2. A brief description in Chinese (max 100 chars).
    3. The most fitting category.
    4. A list of 3-5 short tags/keywords (in English or Chinese) relevant to the technology (e.g., "STM32", "Driver", "PCB").
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            category: { 
              type: Type.STRING,
              enum: [
                'EMBEDDED', 
                'LINUX', 
                'HARDWARE', 
                'TOOLS', 
                'LEARNING', 
                'AI', 
                'OTHER'
              ]
            },
          },
          required: ["title", "description", "category", "tags"],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    
    let mappedCategory = Category.OTHER;
    switch(result.category) {
        case 'EMBEDDED': mappedCategory = Category.EMBEDDED; break;
        case 'LINUX': mappedCategory = Category.LINUX; break;
        case 'HARDWARE': mappedCategory = Category.HARDWARE; break;
        case 'TOOLS': mappedCategory = Category.TOOLS; break;
        case 'LEARNING': mappedCategory = Category.LEARNING; break;
        case 'AI': mappedCategory = Category.AI; break;
        default: mappedCategory = Category.OTHER;
    }

    return {
      title: result.title || input,
      description: result.description || "暂无描述",
      category: mappedCategory,
      tags: Array.isArray(result.tags) ? result.tags.slice(0, 5) : []
    };

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return {
      title: input,
      description: "无法自动生成描述，请手动输入。",
      category: Category.OTHER,
      tags: []
    };
  }
};