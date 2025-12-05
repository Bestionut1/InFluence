import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGenogramStore } from '../store/genogramStore';
import { AppHeader } from '../components/layout/AppHeader';
import { Sidebar } from '../components/ui/Sidebar';
import { PersonHubOverview, PersonHubPsychological, PersonHubRelations, PersonHubTimeline, PersonHubAIAnalysis } from '../components/personHub';
import * as personService from '../services/personService';
import type { Person } from '../types/genogram';

export const PersonHubPage = () => {
  const { personId } = useParams<{ personId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'psychological' | 'relations' | 'timeline' | 'ai'>('overview');
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { people, profiles, relations, currentGenogramId } = useGenogramStore();

  useEffect(() => {
    const loadPerson = async () => {
      if (!personId) {
        setError('No person ID provided');
        setLoading(false);
        return;
      }

      try {
        // First try: Check local store first (fastest)
        const foundPerson = people.find(p => p.id === personId);
        if (foundPerson) {
          setPerson(foundPerson);
          setError(null);
          setLoading(false);
          return;
        }

        // Second try: Firestore if available
        if (currentGenogramId) {
          try {
            const firestorePerson = await personService.getPerson(personId, currentGenogramId);
            if (firestorePerson) {
              setPerson(firestorePerson);
              setError(null);
              setLoading(false);
              return;
            }
          } catch (err) {
            console.warn('Firestore query failed:', err);
          }
        }

        setError('Person not found');
      } catch (err) {
        console.error('Error loading person:', err);
        setError('Failed to load person profile');
      } finally {
        setLoading(false);
      }
    };

    loadPerson();
  }, [personId, currentGenogramId, people]);

  const personProfile = profiles.find(p => p.personId === person?.id);
  const personRelations = relations.filter(r => r.sourceId === person?.id || r.targetId === person?.id);

  if (!personId) {
    return (
      <div className="min-h-screen bg-deep">
        <AppHeader />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="bg-ocean-900/50 border border-ocean-700 rounded-lg p-6 text-center">
              <p className="text-ocean-300">No person selected</p>
              <button
                onClick={() => navigate('/editor/new')}
                className="mt-4 px-4 py-2 bg-accent-blue rounded hover:bg-accent-blue/80 transition-colors"
              >
                Back to Editor
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-deep flex items-center justify-center">
        <div className="animate-pulse text-ocean-300">Loading person profile...</div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="min-h-screen bg-deep">
        <AppHeader />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
              <p className="text-red-300">{error || 'Person not found'}</p>
              <button
                onClick={() => navigate(-1)}
                className="mt-4 px-4 py-2 bg-accent-blue rounded hover:bg-accent-blue/80 transition-colors"
              >
                Go Back
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep">
      <AppHeader />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {/* Clinical Header - Like Medical Record */}
          <div className="bg-gradient-to-b from-ocean-950 to-ocean-900 border-b-2 border-ocean-600 p-8 sticky top-0 z-30">
            <div className="max-w-7xl mx-auto">
              {/* Document Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="text-xs text-ocean-400 uppercase tracking-wider mb-2">Patient Profile & Anamnesis</div>
                  <h1 className="text-5xl font-bold text-white mb-1">{person.name}</h1>
                  <div className="h-1 w-24 bg-gradient-to-r from-accent-blue to-accent-purple rounded"></div>
                </div>
                <button
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 bg-ocean-700 hover:bg-ocean-600 rounded-lg transition-colors text-ocean-200 text-sm font-medium"
                >
                  ← Back
                </button>
              </div>

              {/* Patient Demographics - Grid Layout */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-ocean-800/50 border border-ocean-700 rounded-lg p-4">
                  <div className="text-ocean-400 text-xs uppercase tracking-wide">Age</div>
                  <div className="text-2xl font-bold text-white mt-1">{person.age || 'N/A'} years</div>
                </div>
                <div className="bg-ocean-800/50 border border-ocean-700 rounded-lg p-4">
                  <div className="text-ocean-400 text-xs uppercase tracking-wide">Gender</div>
                  <div className="text-2xl font-bold text-white mt-1 capitalize">{person.gender || 'N/A'}</div>
                </div>
                <div className="bg-ocean-800/50 border border-ocean-700 rounded-lg p-4">
                  <div className="text-ocean-400 text-xs uppercase tracking-wide">Status</div>
                  <div className={`text-2xl font-bold mt-1 ${person.status === 'living' ? 'text-green-400' : 'text-gray-400'}`}>
                    {person.status === 'living' ? '✓ Living' : '✗ Deceased'}
                  </div>
                </div>
                <div className="bg-ocean-800/50 border border-ocean-700 rounded-lg p-4">
                  <div className="text-ocean-400 text-xs uppercase tracking-wide">Occupation</div>
                  <div className="text-xl font-bold text-white mt-1">{person.occupation || '—'}</div>
                </div>
              </div>

              {/* Clinical Notes */}
              {person.notes && (
                <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-lg p-4 mb-6">
                  <div className="text-accent-blue text-xs uppercase tracking-wide font-semibold mb-2">Clinical Notes</div>
                  <p className="text-ocean-100 text-sm leading-relaxed">{person.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tab Navigation - Professional Style */}
          <div className="sticky top-0 z-40 bg-ocean-900/95 border-b border-ocean-700 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto flex gap-2 px-8 py-4 overflow-x-auto">
              {(['overview', 'psychological', 'relations', 'timeline', 'ai'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-lg whitespace-nowrap text-sm font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-accent-blue text-white shadow-lg shadow-accent-blue/30'
                      : 'bg-ocean-800 text-ocean-300 hover:bg-ocean-700'
                  }`}
                >
                  {tab === 'overview' && '📊 Overview'}
                  {tab === 'psychological' && '🧠 Psychological'}
                  {tab === 'relations' && '🤝 Relations'}
                  {tab === 'timeline' && '📅 Timeline'}
                  {tab === 'ai' && '✨ AI Insights'}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="max-w-7xl mx-auto p-8">
            {activeTab === 'overview' && person && (
              <PersonHubOverview person={person} profile={personProfile} relations={personRelations} />
            )}
            {activeTab === 'psychological' && person && (
              <PersonHubPsychological person={person} profile={personProfile} />
            )}
            {activeTab === 'relations' && person && (
              <PersonHubRelations person={person} relations={personRelations} />
            )}
            {activeTab === 'timeline' && person && (
              <PersonHubTimeline person={person} />
            )}
            {activeTab === 'ai' && person && (
              <PersonHubAIAnalysis person={person} profile={personProfile} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PersonHubPage;
