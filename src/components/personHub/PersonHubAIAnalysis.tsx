import { useState } from 'react';
import { Card } from '../ui/Card';
import { useGenogramStore } from '../../store/genogramStore';
import * as personService from '../../services/personService';
import type { Person, PersonProfile } from '../../types/genogram';

interface PersonHubAIAnalysisProps {
  person: Person;
  profile?: PersonProfile;
}

interface AIAnalysis {
  summary: string;
  psychologicalPatterns: string[];
  coreConflicts: string[];
  relationships: string[];
  recommendations: string[];
  generatedAt: Date;
}

export const PersonHubAIAnalysis = ({ person, profile }: PersonHubAIAnalysisProps) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { currentGenogramId, people, relations } = useGenogramStore();

  const generateAnalysis = async () => {
    if (!profile || !currentGenogramId) {
      setError('Missing profile or genogram information');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if we have cached analysis
      const cached = await personService.getPersonAIAnalysis(person.id, currentGenogramId);
      
      if (cached && cached.generatedAt) {
        const cachedDate = new Date(cached.generatedAt);
        const daysSinceCached = (Date.now() - cachedDate.getTime()) / (1000 * 60 * 60 * 24);
        
        // Use cached if less than 7 days old
        if (daysSinceCached < 7) {
          setAnalysis(cached);
          setLoading(false);
          return;
        }
      }

      // Generate new analysis based on person's profile and relationships
      const personRelations = relations.filter(
        r => r.sourceId === person.id || r.targetId === person.id
      );

      // Build contextual analysis
      const relatedPeople = personRelations
        .map(r => {
          const otherId = r.sourceId === person.id ? r.targetId : r.sourceId;
          return people.find(p => p.id === otherId);
        })
        .filter(Boolean);

      const aiAnalysis: AIAnalysis = {
        summary: buildSummary(person, profile, personRelations),
        psychologicalPatterns: extractPatterns(profile),
        coreConflicts: identifyConflicts(profile),
        relationships: analyzeRelationships(person, personRelations, relatedPeople),
        recommendations: generateRecommendations(profile),
        generatedAt: new Date(),
      };

      // Cache the analysis
      await personService.setPersonAIAnalysis(person.id, currentGenogramId, aiAnalysis);
      
      setAnalysis(aiAnalysis);
    } catch (err) {
      console.error('Error generating analysis:', err);
      setError('Failed to generate analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Analysis Header */}
      <Card className="p-6 bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 border border-accent-blue/30">
        <h2 className="text-2xl font-bold text-white mb-3">🤖 AI Psychological Analysis</h2>
        <p className="text-ocean-300 mb-4">
          Get AI-powered insights about {person.name}'s psychological patterns, core conflicts, and growth opportunities based on their profile and relationships.
        </p>
        <button
          onClick={generateAnalysis}
          disabled={loading || !profile}
          className={`px-6 py-2 rounded font-semibold transition-colors ${
            loading || !profile
              ? 'bg-ocean-600 text-ocean-400 cursor-not-allowed'
              : 'bg-accent-blue hover:bg-accent-blue/80 text-white'
          }`}
        >
          {loading ? 'Analyzing...' : 'Generate AI Analysis'}
        </button>
      </Card>

      {/* Profile Context */}
      {profile && (
        <Card className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">📋 Profile Context</h3>
          <div className="space-y-3">
            {profile.templateCategory && (
              <div className="p-3 bg-purple-900/20 rounded border border-purple-700/30">
                <p className="text-ocean-400 text-sm">Archetype</p>
                <p className="text-white font-semibold capitalize">{profile.templateCategory.replace('-', ' ')}</p>
              </div>
            )}
            {profile.coreWounds && profile.coreWounds.length > 0 && (
              <div className="p-3 bg-red-900/20 rounded border border-red-700/30">
                <p className="text-ocean-400 text-sm">Core Wounds Identified</p>
                <p className="text-red-300 font-semibold">{profile.coreWounds.length} wounds</p>
              </div>
            )}
            {profile.copingMechanisms && profile.copingMechanisms.length > 0 && (
              <div className="p-3 bg-blue-900/20 rounded border border-blue-700/30">
                <p className="text-ocean-400 text-sm">Coping Strategies</p>
                <p className="text-blue-300 font-semibold">{profile.copingMechanisms.length} mechanisms</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-6 bg-red-900/20 border border-red-700">
          <p className="text-red-300">{error}</p>
        </Card>
      )}

      {/* Analysis Result */}
      {analysis && (
        <div className="space-y-4">
          {/* Summary */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-white mb-3">📝 Overall Summary</h3>
            <p className="text-ocean-200 leading-relaxed">{analysis.summary}</p>
          </Card>

          {/* Psychological Patterns */}
          {analysis.psychologicalPatterns.length > 0 && (
            <Card className="p-6">
              <h3 className="text-xl font-bold text-purple-300 mb-3">🧠 Psychological Patterns</h3>
              <ul className="space-y-2">
                {analysis.psychologicalPatterns.map((pattern, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-purple-400 mt-1">•</span>
                    <span className="text-ocean-200">{pattern}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Core Conflicts */}
          {analysis.coreConflicts.length > 0 && (
            <Card className="p-6 border-l-4 border-red-600">
              <h3 className="text-xl font-bold text-red-300 mb-3">⚡ Core Conflicts</h3>
              <ul className="space-y-2">
                {analysis.coreConflicts.map((conflict, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-red-400 mt-1">•</span>
                    <span className="text-ocean-200">{conflict}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Relationships */}
          {analysis.relationships.length > 0 && (
            <Card className="p-6">
              <h3 className="text-xl font-bold text-blue-300 mb-3">🤝 Relationship Dynamics</h3>
              <ul className="space-y-2">
                {analysis.relationships.map((rel, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span className="text-ocean-200">{rel}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <Card className="p-6 bg-accent-blue/10">
              <h3 className="text-xl font-bold text-accent-blue mb-3">🎯 Therapeutic Recommendations</h3>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-accent-blue mt-1 font-bold">→</span>
                    <span className="text-ocean-200">{rec}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card className="p-4 bg-ocean-900/50 text-ocean-400 text-sm">
            <p>Generated: {analysis.generatedAt.toLocaleDateString()} at {analysis.generatedAt.toLocaleTimeString()}</p>
          </Card>
        </div>
      )}

      {/* Placeholder for no profile */}
      {!profile && (
        <Card className="p-6 bg-ocean-800/50">
          <p className="text-ocean-300">
            No psychological profile available for {person.name}. Create a profile first to enable AI analysis.
          </p>
        </Card>
      )}

      {/* Features Coming Soon */}
      <Card className="p-6 bg-ocean-800/30 border border-dashed border-ocean-600">
        <h3 className="text-lg font-bold text-accent-blue mb-3">🚀 Future AI Capabilities</h3>
        <ul className="space-y-2 text-ocean-300 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-accent-blue">✓</span>
            <span>Gemini AI integration for deeper insights</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-blue">✓</span>
            <span>Transgenerational pattern detection</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-blue">✓</span>
            <span>Real-time relationship dynamic analysis</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-blue">✓</span>
            <span>Personalized healing pathway suggestions</span>
          </li>
        </ul>
      </Card>
    </div>
  );
};

// Helper functions
function buildSummary(person: any, profile: any, relations: any[]): string {
  const wounds = profile.coreWounds?.length || 0;
  const relationships = relations.length;
  
  return `${person.name} is a ${profile.templateCategory} archetype with ${wounds} identified core wounds and ${relationships} significant relationship${relationships !== 1 ? 's' : ''}. Their psychological profile suggests patterns of ${profile.psychologicalTraits?.join(', ') || 'resilience'}. Key focus areas include addressing core wounds and developing healthier coping mechanisms through intentional therapeutic work.`;
}

function extractPatterns(profile: any): string[] {
  const patterns = [...(profile.psychologicalTraits || [])];
  if (profile.templateCategory) {
    patterns.push(`${profile.templateCategory} family role pattern`);
  }
  return patterns.slice(0, 5);
}

function identifyConflicts(profile: any): string[] {
  return profile.coreWounds || [];
}

function analyzeRelationships(_person: any, _relations: any[], relatedPeople: any[]): string[] {
  return [
    `Connected to ${relatedPeople.length} family member(s)`,
    `Various relationship dynamics requiring attention`,
    'Potential for relational healing through awareness',
  ];
}

function generateRecommendations(profile: any): string[] {
  return profile.therapeuticRecommendations || [
    'Individual therapy to process core wounds',
    'Family systems work to understand relational patterns',
    'Mindfulness-based interventions for coping',
  ];
}
