import { Injectable } from '@angular/core';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  GenerateContentResponse
} from '@google/generative-ai';

export const environment = {
  production: false,
  geminiApiKey: 'AIzaSyDGO2Y2vF1VQmt8WPJYPZj80gJ9olWZgF8'
};

@Injectable({
  providedIn: 'root'
})
export class GeminiService {

  private readonly apiKey = environment.geminiApiKey;
  private readonly mode = 'gemini-2.5-flash';
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(this.apiKey);
  }

  
  async analyzeReport(category: string, description: string): Promise<any> {

    const model = this.genAI.getGenerativeModel({
      model: this.mode
    });

    const prompt = `
    You are a strict JSON generator.
    You MUST respond ONLY with valid JSON.
    Do NOT add explanations.
    Do NOT use markdown.
    Do NOT wrap in backticks.
    Output format:
    {
    "hazardType": "string",
    "authority": "Municipality | Traffic Police | Utilities | Civil Defense",
    "recommendedAction": "string"
    }
    Now analyze:
    Category: ${category}
    Description: ${description}
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    try {
      return JSON.parse(text);
    } catch (error) {
      console.error("Gemini JSON parse error:", text);

      return {
        hazardType: "Unknown",
        authority: "Municipality",
        recommendedAction: "Report this issue to local authorities."
      };
    }
  }
}




