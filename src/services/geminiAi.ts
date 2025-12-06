import { GoogleGenAI } from '@google/genai';
import type { GenogramData } from '../types/genogram';

export interface AnalysisResult {
  patterns: string[];
  traumas: string[];
  recommendations: string[];
  summary: string;
  disclaimer: string;
}

export const generateGeminiPrompt = (data: GenogramData, language: 'en' | 'ro' = 'en') => {
  const isRomanian = language === 'ro';
  
  let prompt = isRomanian 
    ? `Ești un psiholog profesionist specializat în teoria sistemelor familiale și modelele DSM-5-TR. 
Analizează următoarele date genograma familială și oferă o analiză psihologică cuprinzătoare.

MEMBRI FAMILIEI:
`
    : `You are a professional psychologist specialized in family systems theory and DSM-5-TR patterns. 
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

  if (isRomanian) {
    prompt += `
CERINȚE DE ANALIZĂ:
1. Identifică modelele familiale (triangulare, rupturi, încrețire, granițe fuzionate, modele rigide)
2. Detectează potențialul traumă intergenerațională sau cicluri
3. Analizează calitatea relației și stilurile de atașament
4. Identifică zonele de conflict și sursele de tensiune
5. Sugerează intervenții terapeutice

FORMAT RĂSPUNS (returnează doar JSON valid):
{
  "patterns": ["model 1", "model 2"],
  "traumas": ["traumă/problemă 1", "traumă/problemă 2"],
  "recommendations": ["recomandare 1", "recomandare 2"],
  "summary": "Rezumat clinic scurt",
  "disclaimer": "IMPORTANT: Aceasta este o analiză generată de AI doar în scopuri educaționale și NU este un diagnostic clinic. Un terapeut autorizat ar trebui să efectueze o evaluare adecvată."
}

Returnează DOAR JSON valid, fără markdown sau text suplimentar.`;
  } else {
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
  }

  return prompt;
};

export const analyzeGenogramWithGemini = async (data: GenogramData, apiKey?: string, language: 'en' | 'ro' = 'en'): Promise<AnalysisResult> => {
  if (!apiKey) {
    return mockAnalysis(language);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = generateGeminiPrompt(data, language);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const content = response.text;

    if (!content) {
      return mockAnalysis(language);
    }

    // Parse JSON response
    try {
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      const analysis: AnalysisResult = JSON.parse(cleanedContent);
      return analysis;
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      return mockAnalysis(language);
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return mockAnalysis(language);
  }
};

const mockAnalysis = (language: 'en' | 'ro' = 'en'): AnalysisResult => {
  const isRomanian = language === 'ro';
  
  if (isRomanian) {
    return {
      patterns: [
        'Potențial de triangulare între membri familiei',
        'Posibilă încreților în relații primare',
        'Model intergenerațional de evitare a conflictului',
      ],
      traumas: [
        'Evenimente de pierdere sau separare nerezolvate',
        'Posibilă traumă relațională în dinamica părinte-copil',
      ],
      recommendations: [
        'Explorați modelele de comunicare familială în terapie',
        'Considerați terapia individuală pentru membri identificați',
        'Stabilește granițe sănătoase în relații cheie',
        'Procesați modelele intergeneraționale cu un terapeut calificat',
      ],
      summary:
        'Genograma sugerează mai dinamici ale sistemului familial care ar putea beneficia de explorare terapeutică. Considerați lucrul cu un terapeut familial autorizat pentru a identifica punctele specifice de intervenție.',
      disclaimer:
        'IMPORTANT: Aceasta este o analiză generată de AI doar în scopuri educaționale și NU este un diagnostic clinic. Un terapeut autorizat ar trebui să efectueze o evaluare adecvată.',
    };
  }
  
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
