import { Injectable } from '@angular/core';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  GenerateContentResponse
} from '@google/generative-ai';

import { API_KEYS } from '../../config/api-keys';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {

  private readonly mode = 'gemini-2.5-flash';
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(API_KEYS.gemini);
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

  async generateRouteSafetyAdvisory(
  destination: string,
  unsafeReports: any[],
  selectedRouteIndex: number
): Promise<string> {

  const model = this.genAI.getGenerativeModel({
    model: this.mode
  });

  const hazardSummary = unsafeReports.map((report, index) => {
    return {
      number: index + 1,
      category: report.category,
      severity: report.severity,
      description: report.description
    };
  });

  const prompt = `
You are a safety navigation assistant for an urban safety reporting app.

A user wants to travel to this destination:
${destination}

The selected Google Maps route index is:
${selectedRouteIndex}

High-severity hazard reports detected near this route:
${JSON.stringify(hazardSummary, null, 2)}

Write a short plain-language safety advisory for the user.

Rules:
- Do NOT use markdown.
- Do NOT use bullet points.
- Keep it between 2 and 4 sentences.
- Mention the number of high-severity hazard zones.
- Recommend whether the user should continue carefully or request an alternate route.
- Use a calm but serious tone.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini route advisory error:', error);

    if (unsafeReports.length > 0) {
      return `This route passes near ${unsafeReports.length} high-severity hazard zone(s). Please stay alert near the highlighted areas and consider requesting an alternate route.`;
    }

    return `This route appears safe based on current high-severity reports. No major hazard zones were detected near the selected route.`;
  }
}
}




