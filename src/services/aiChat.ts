import type { GenogramData } from '../types/genogram';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const assistantSettings = {
  verbosity: 'short' as const,
  maxResponseLength: 300,
};

export const createPsychologySystemPrompt = (data: GenogramData) => {
  let context = `You are a concise psychology assistant specializing in family systems theory and therapeutic insights. Keep responses SHORT and direct.

GENOGRAM:
`;

  context += `People (${data.people.length}): `;
  context += data.people.map(p => `${p.name} (${p.age || '?'}, ${p.gender}${p.attributes?.length ? ` [${p.attributes.join(',')}]` : ''})`).join(', ');

  context += `\n\nRelationships (${data.relations.length}): `;
  context += data.relations.map(r => {
    const source = data.people.find(p => p.id === r.sourceId)?.name || '?';
    const target = data.people.find(p => p.id === r.targetId)?.name || '?';
    return `${source}-${r.type}-${target}`;
  }).join('; ');

  context += `

INSTRUCTIONS:
- Answer in 2-3 sentences max
- Be direct and practical
- No long introductions or unnecessary explanations
- Focus on actionable insights
- Suggest coping strategies briefly
- This is educational, not clinical diagnosis

RESPONSE LENGTH: Maximum 300 characters.`;

  return context;
};

export const initializeChatSession = (data: GenogramData, apiKey?: string) => {
  if (!apiKey) {
    console.warn('No API key provided for chat session');
    return null;
  }

  const systemPrompt = createPsychologySystemPrompt(data);
  return systemPrompt;
};
