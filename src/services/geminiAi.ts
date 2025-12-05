import { GoogleGenAI } from '@google/genai';
import type { GenogramData } from '../types/genogram';

export interface AnalysisResult {
  patterns: string[];
  traumas: string[];
  recommendations: string[];
  summary: string;
  disclaimer: string;
}

export const generateGeminiPrompt = (data: GenogramData) => {
  let prompt = `You are a professional psychologist specialized in family systems theory and DSM-5-TR patterns. 
Analyze the following family genogram data and provide a comprehensive psychological analysis.

FAMILY MEMBERS:
`;

  data.people.forEach(p => {
    prompt += `- Name: ${p.name}\n`;
    prompt += `  Age: ${p.age || 'Unknown'}\n`;
    prompt += `  Gender: ${p.gender}\n`;
    prompt += `  Status: ${p.status}\n`;
    if (p.occupation) prompt += `  Occupation: ${p.occupation}\n`;
    if (p.medicalConditions?.length) prompt += `  Medical Conditions: ${p.medicalConditions.join(', ')}\n`;
    if (p.attributes?.length) prompt += `  Psychological Traits: ${p.attributes.join(', ')}\n`;
    if (p.significantEvents?.length) prompt += `  Significant Events: ${p.significantEvents.join(', ')}\n`;
    prompt += '\n';
  });

  prompt += `FAMILY RELATIONSHIPS:\n`;
  data.relations.forEach(r => {
    const source = data.people.find(p => p.id === r.sourceId)?.name || 'Unknown';
    const target = data.people.find(p => p.id === r.targetId)?.name || 'Unknown';
    prompt += `- ${source} <--${r.type}--> ${target}\n`;
  });

  prompt += `
ANALYSIS REQUIREMENTS:
1. Identify family patterns (triangulation, cut-offs, enmeshment, fused boundaries, rigid patterns)
2. Detect potential intergenerational trauma or cycles
3. Analyze relationship quality and attachment styles
4. Identify conflict areas and sources of tension
5. Suggest therapeutic interventions

RESPONSE FORMAT (return as valid JSON only):
{
  "patterns": ["pattern 1", "pattern 2"],
  "traumas": ["trauma/issue 1", "trauma/issue 2"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "summary": "Brief clinical summary",
  "disclaimer": "IMPORTANT: This is an AI-generated analysis for educational purposes only and is NOT a clinical diagnosis. A licensed therapist should conduct proper assessment."
}

Return ONLY valid JSON, no markdown or additional text.`;

  return prompt;
};

export const analyzeGenogramWithGemini = async (data: GenogramData, apiKey?: string): Promise<AnalysisResult> => {
  if (!apiKey) {
    return mockAnalysis();
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = generateGeminiPrompt(data);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const content = response.text;

    if (!content) {
      return mockAnalysis();
    }

    // Parse JSON response
    try {
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      const analysis: AnalysisResult = JSON.parse(cleanedContent);
      return analysis;
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      return mockAnalysis();
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return mockAnalysis();
  }
};

const mockAnalysis = (): AnalysisResult => {
  return {
    patterns: [
      'Potential triangulation between family members',
      'Possible enmeshment in primary relationships',
      'Intergenerational pattern of conflict avoidance',
    ],
    traumas: [
      'Unresolved loss or separation events',
      'Possible relational trauma in parent-child dynamics',
    ],
    recommendations: [
      'Explore family communication patterns in therapy',
      'Consider individual therapy for identified members',
      'Establish healthy boundaries in key relationships',
      'Process intergenerational patterns with qualified therapist',
    ],
    summary:
      'The genogram suggests several family system dynamics that may benefit from therapeutic exploration. Consider working with a licensed family therapist to identify specific intervention points.',
    disclaimer:
      'IMPORTANT: This is an AI-generated analysis for educational purposes only and is NOT a clinical diagnosis. A licensed therapist should conduct proper assessment.',
  };
};
