import { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { useGenogramStore } from '../../store/genogramStore';
import type { Person, PersonProfile } from '../../types/genogram';

interface PersonHubPsychologicalProps {
  person: Person;
  profile?: PersonProfile;
}

interface TestResult {
  id: string;
  testName: string;
  scores: Record<string, number>;
  completedAt: Date;
}

export const PersonHubPsychological = ({ person, profile }: PersonHubPsychologicalProps) => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentGenogramId } = useGenogramStore();

  useEffect(() => {
    const loadTestResults = async () => {
      if (!currentGenogramId) {
        setLoading(false);
        return;
      }

      try {
        // Get current user's test results for this person
        // This would need auth context - for now, we'll keep it simple
        setTestResults([]);
      } catch (error) {
        console.error('Error loading test results:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTestResults();
  }, [person.id, currentGenogramId]);

  if (!profile) {
    return (
      <Card className="p-6">
        <p className="text-ocean-300">No psychological profile created yet for {person.name}.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Template */}
      {profile.templateCategory && (
        <Card className="p-6 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
          <h2 className="text-2xl font-bold text-white mb-3">🎭 Profile Archetype</h2>
          <p className="text-2xl font-bold text-purple-300 capitalize mb-2">
            {profile.templateCategory.replace('-', ' ')}
          </p>
          <p className="text-ocean-200">
            This archetype represents patterns commonly seen in family systems and psychological development.
          </p>
        </Card>
      )}

      {/* Description */}
      {profile.description && (
        <Card className="p-6">
          <h3 className="text-xl font-bold text-white mb-3">📖 Profile Description</h3>
          <p className="text-ocean-200 leading-relaxed">{profile.description}</p>
        </Card>
      )}

      {/* Core Wounds */}
      {profile.coreWounds && profile.coreWounds.length > 0 && (
        <Card className="p-6 border-l-4 border-red-600">
          <h3 className="text-xl font-bold text-red-300 mb-3">💔 Core Wounds</h3>
          <ul className="space-y-2">
            {profile.coreWounds.map((wound, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-red-400 mt-1 font-bold">•</span>
                <span className="text-ocean-200">{wound}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Psychological Traits */}
      {profile.psychologicalTraits && profile.psychologicalTraits.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">🧩 Psychological Traits</h3>
          <div className="grid grid-cols-2 gap-3">
            {profile.psychologicalTraits.map((trait, idx) => (
              <div key={idx} className="p-3 bg-purple-900/30 rounded border border-purple-700/50">
                <p className="text-purple-300 font-medium">{trait}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Coping Mechanisms */}
      {profile.copingMechanisms && profile.copingMechanisms.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">🛡️ Coping Mechanisms</h3>
          <ul className="space-y-3">
            {profile.copingMechanisms.map((mechanism, idx) => (
              <li key={idx} className="p-3 bg-ocean-800/50 rounded border border-ocean-700/50">
                <p className="text-ocean-200">{mechanism}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Strengths & Resources */}
      {profile.strengthsAndResources && profile.strengthsAndResources.length > 0 && (
        <Card className="p-6 border-l-4 border-green-600">
          <h3 className="text-xl font-bold text-green-300 mb-4">💪 Strengths & Resources</h3>
          <div className="grid grid-cols-2 gap-3">
            {profile.strengthsAndResources.map((strength, idx) => (
              <div key={idx} className="p-3 bg-green-900/30 rounded border border-green-700/50">
                <p className="text-green-300 font-medium">{strength}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Therapeutic Recommendations */}
      {profile.therapeuticRecommendations && profile.therapeuticRecommendations.length > 0 && (
        <Card className="p-6 bg-accent-blue/10">
          <h3 className="text-xl font-bold text-accent-blue mb-4">🎯 Therapeutic Recommendations</h3>
          <ul className="space-y-3">
            {profile.therapeuticRecommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-accent-blue mt-1 font-bold">→</span>
                <span className="text-ocean-200">{rec}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Test Results Section */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-white mb-4">📊 Assessment Results</h3>
        {loading ? (
          <p className="text-ocean-300">Loading test results...</p>
        ) : testResults.length > 0 ? (
          <div className="space-y-3">
            {testResults.map((result) => (
              <div
                key={result.id}
                className="p-4 bg-ocean-800/30 rounded border border-ocean-700/50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white font-semibold">{result.testName}</p>
                    <p className="text-ocean-400 text-sm">
                      {result.completedAt.toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-accent-blue/20 text-accent-blue rounded text-sm">
                    View Results
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-ocean-300">No assessment results yet for {person.name}.</p>
        )}
      </Card>
    </div>
  );
};
