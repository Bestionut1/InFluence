import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, TrendingUp, Brain, BarChart3 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AppHeader } from '../components/layout/AppHeader';
import { useTranslation } from '../hooks/useTranslation';
import type { TestResultWithMetadata } from '../services/testResults';
import {
  getUserTestResults,
  getTestResultsByType,
  getDASSLevel,
} from '../services/testResults';
import { exportTestResultToPDF } from '../services/pdfExport';

export const PsychologicalResultsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const t = useTranslation();

  const [allResults, setAllResults] = useState<TestResultWithMetadata[]>([]);
  const [selectedResult, setSelectedResult] = useState<TestResultWithMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonTestId, setComparisonTestId] = useState<string>('');

  useEffect(() => {
    loadResults();
  }, [user]);

  const loadResults = async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    try {
      const results = await getUserTestResults(user.uid);
      setAllResults(results);
      if (results.length > 0) {
        setSelectedResult(results[0]);
      }
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompare = async (testId: string) => {
    if (!user?.uid) return;

    try {
      await getTestResultsByType(user.uid, testId);
      setComparisonTestId(testId);
      setShowComparison(true);
    } catch (error) {
      console.error('Error loading comparison:', error);
    }
  };

  const handleExportPDF = async (result: TestResultWithMetadata) => {
    try {
      await exportTestResultToPDF(result);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert(t.tests.errorExporting);
    }
  };

  const getScoreColor = (score: number, maxScore: number = 100) => {
    const percentage = score / maxScore;
    if (percentage < 0.33) return 'from-red-500 to-red-600';
    if (percentage < 0.66) return 'from-yellow-500 to-yellow-600';
    return 'from-green-500 to-green-600';
  };

  const renderScoreBreakdown = (result: TestResultWithMetadata) => {
    const { testId, scores } = result;

    return (
      <div className="space-y-4">
        {Object.entries(scores).map(([key, value]) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-ocean-300 font-medium capitalize">
                {key.replace(/_/g, ' ')}
              </span>
              <span className="text-white font-bold">{Math.round(value)}</span>
            </div>
            <div className="w-full h-2 bg-ocean-900 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${getScoreColor(value)}`}
                style={{ width: `${Math.min(value, 100)}%` }}
              ></div>
            </div>
          </div>
        ))}

        {testId === 'dass-21' && (
          <div className="mt-6 p-4 bg-warm-500/10 border border-warm-500/30 rounded-lg">
            <h4 className="text-warm-300 font-semibold mb-3">{t.tests.severityLevels}</h4>
            <div className="space-y-2 text-sm">
              {Object.entries(scores).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-ocean-300 capitalize">{key}:</span>
                  <span className="text-white font-medium">
                    {getDASSLevel(value, key as 'depression' | 'anxiety' | 'stress')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-deep flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-warm-500 mx-auto mb-4 animate-pulse" />
          <p className="text-ocean-300">{t.tests.loadingResults}</p>
        </div>
      </div>
    );
  }

  if (allResults.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-deep-900 via-deep-800 to-deep-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Brain className="w-16 h-16 text-warm-500 mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-white mb-2">{t.tests.noResultsYet}</h2>
          <p className="text-ocean-300 mb-6">
            {t.tests.takeFirstTest}
          </p>
          <button
            onClick={() => navigate('/tests')}
            className="px-6 py-3 bg-gradient-to-r from-warm-400 to-warm-500 hover:shadow-lg hover:shadow-warm-500/50 text-white font-semibold rounded-lg transition"
          >
            {t.tests.takeATest}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-deep-900 via-deep-800 to-deep-900">
      <AppHeader showLogo showUserMenu sticky={false} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Results Timeline - Left */}
          <div className="lg:col-span-1">
            <div className="bg-deep-800/50 border border-warm-500/20 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-white mb-4">Your Tests</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {allResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => setSelectedResult(result)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      selectedResult?.id === result.id
                        ? 'bg-warm-500/20 border border-warm-500/50'
                        : 'bg-deep-700/50 hover:bg-deep-700 border border-warm-500/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium text-sm">{result.testName}</p>
                        <p className="text-ocean-400 text-xs">
                          {result.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-warm-400 text-xs font-semibold">
                        {Math.floor(result.duration / 60)}m
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Details - Right */}
          {selectedResult && (
            <div className="lg:col-span-2">
              <div className="bg-deep-800/50 border border-warm-500/20 rounded-lg p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {selectedResult.testName}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-ocean-400">
                      <span>{selectedResult.createdAt.toLocaleDateString()}</span>
                      <span>Duration: {Math.floor(selectedResult.duration / 60)}m {selectedResult.duration % 60}s</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExportPDF(selectedResult)}
                      className="p-2 hover:bg-warm-500/20 text-warm-300 rounded-lg transition"
                      title="Export to PDF"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleCompare(selectedResult.testId)}
                      className="p-2 hover:bg-warm-500/20 text-warm-300 rounded-lg transition"
                      title="Compare Results"
                    >
                      <BarChart3 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-warm-500" />
                    Your Scores
                  </h3>
                  {renderScoreBreakdown(selectedResult)}
                </div>

                {/* Interpretation */}
                {selectedResult.interpretation && (
                  <div className="p-4 bg-sage-500/10 border border-sage-500/30 rounded-lg">
                    <h4 className="text-sage-300 font-semibold mb-2">Interpretation</h4>
                    <p className="text-ocean-200 text-sm leading-relaxed">
                      {selectedResult.interpretation}
                    </p>
                  </div>
                )}

                {/* Disclaimer */}
                <div className="mt-6 p-4 bg-deep-700/50 border border-ocean-800 rounded-lg">
                  <p className="text-ocean-400 text-xs leading-relaxed">
                    ⚠️ These results are for educational purposes only and should not be
                    considered as professional psychological advice. If you have concerns about
                    your mental health, please consult with a qualified mental health professional.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Comparison Modal */}
        {showComparison && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50 p-4">
            <div className="bg-deep-800 border border-warm-500/30 rounded-lg p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
              <h3 className="text-xl font-bold text-white mb-6">Trend Analysis</h3>
              <div className="space-y-4">
                {allResults
                  .filter((r) => r.testId === comparisonTestId)
                  .map((result, idx) => (
                    <div key={result.id} className="p-4 bg-deep-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold">
                          #{allResults.filter((r) => r.testId === comparisonTestId).length - idx}
                        </span>
                        <span className="text-ocean-400 text-sm">
                          {result.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(result.scores).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-ocean-400 text-xs">{key}</span>
                            <p className="text-white font-semibold">{Math.round(value)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
              <button
                onClick={() => setShowComparison(false)}
                className="mt-6 w-full px-4 py-2 bg-warm-500/20 hover:bg-warm-500/30 text-warm-300 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
