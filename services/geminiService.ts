import { GoogleGenAI, Type } from "@google/genai";
import { SystemMetric, AiAnalysisResult } from '../types';

const apiKey = process.env.API_KEY || '';

// Initialize specific Gemini model for system diagnostics
const getAiClient = () => {
  if (!apiKey) {
    throw new Error("API_KEY is missing from environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeSystemMetrics = async (metrics: SystemMetric[]): Promise<AiAnalysisResult> => {
  try {
    const ai = getAiClient();
    const recentMetrics = metrics.slice(-5); // Analyze last 5 data points
    
    const prompt = `
      Act as a futuristic spaceship computer system. Analyze the following system telemetry data and provide a brief diagnostic report.
      
      Telemetry Data:
      ${JSON.stringify(recentMetrics)}
      
      Return the response in strictly valid JSON format matching this schema:
      {
        "status": "optimal" | "warning" | "critical",
        "summary": "Short analysis of the current state (max 20 words)",
        "recommendation": "Actionable advice (max 15 words)"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, enum: ["optimal", "warning", "critical"] },
            summary: { type: Type.STRING },
            recommendation: { type: Type.STRING }
          },
          required: ["status", "summary", "recommendation"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI Core");

    return JSON.parse(text) as AiAnalysisResult;

  } catch (error) {
    console.error("AI Analysis Failed:", error);
    throw error;
  }
};
