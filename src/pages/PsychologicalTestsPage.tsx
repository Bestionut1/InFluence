import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Clock, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AppHeader } from '../components/layout/AppHeader';
import { useTranslation } from '../hooks/useTranslation';

interface Test {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  questionCount: number;
  category: 'personality' | 'mental-health' | 'relationships';
  color: 'warm' | 'sage' | 'ocean';
  icon: React.ReactNode;
}

const PSYCHOLOGICAL_TESTS: Test[] = [
  {
    id: 'big-five',
    name: 'Big Five Personality',
    description: 'Understand your personality across 5 major dimensions: Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism.',
    duration: 8,
    questionCount: 30,
    category: 'personality',
    color: 'warm',
    icon: <Brain className="w-6 h-6" />,
  },
  {
    id: 'mbti',
    name: 'Myers-Briggs Type Indicator',
    description: 'Discover your personality type and how you interact with the world through your preferred cognitive functions.',
    duration: 10,
    questionCount: 40,
    category: 'personality',
    color: 'sage',
    icon: <Brain className="w-6 h-6" />,
  },
  {
    id: 'disc',
    name: 'DISC Assessment',
    description: 'Explore your behavioral style: Dominance, Influence, Steadiness, or Conscientiousness in various situations.',
    duration: 7,
    questionCount: 30,
    category: 'personality',
    color: 'ocean',
    icon: <Brain className="w-6 h-6" />,
  },
  {
    id: 'attachment-style',
    name: 'Attachment Style Test',
    description: 'Learn about your attachment patterns in relationships - Secure, Anxious, Avoidant, or Fearful-Avoidant.',
    duration: 5,
    questionCount: 25,
    category: 'relationships',
    color: 'warm',
    icon: <Brain className="w-6 h-6" />,
  },
  {
    id: 'dass-21',
    name: 'Stress & Anxiety Assessment',
    description: 'Evaluate your current levels of depression, anxiety, and stress using the validated DASS-21 scale.',
    duration: 5,
    questionCount: 21,
    category: 'mental-health',
    color: 'sage',
    icon: <Brain className="w-6 h-6" />,
  },
];

interface TestResult {
  testId: string;
  completedAt: string;
}

export const PsychologicalTestsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const t = useTranslation();
  const [completedTests] = useState<TestResult[]>([]);

  useEffect(() => {
    // TODO: Fetch completed tests from Firebase
    // For now, using empty state
  }, [user]);

  const getTestStatus = (testId: string) => {
    return completedTests.some(test => test.testId === testId);
  };

  const getColorClasses = (color: 'warm' | 'sage' | 'ocean') => {
    switch (color) {
      case 'warm':
        return 'border-warm-300/30 bg-warm-300/10 hover:bg-warm-300/20';
      case 'sage':
        return 'border-sage-500/30 bg-sage-500/10 hover:bg-sage-500/20';
      case 'ocean':
        return 'border-ocean-700/30 bg-ocean-900/20 hover:bg-ocean-900/30';
    }
  };

  const getIconColor = (color: 'warm' | 'sage' | 'ocean') => {
    switch (color) {
      case 'warm':
        return 'text-warm-300';
      case 'sage':
        return 'text-sage-500';
      case 'ocean':
        return 'text-ocean-400';
    }
  };

  const completedCount = completedTests.length;
  const totalTests = PSYCHOLOGICAL_TESTS.length;

  return (
    <div className="min-h-screen bg-deep text-ocean-50 page-enter">
      <AppHeader showLogo showUserMenu sticky={false} />

      {/* Header Section */}
      <div className="bg-gradient-to-b from-warm-300/20 to-transparent border-b border-warm-300/30">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-warm-300" />
            <span className="text-sm font-semibold text-warm-300 uppercase tracking-wider">{t.tests.psychologicalAssessment}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-light text-white mb-4">
            {t.tests.title}
          </h1>
          <p className="text-lg text-ocean-200 max-w-2xl">
            {t.tests.assessmentsDescription}
          </p>
        </div>
      </div>

      {/* Progress Section */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-deep-surface border border-ocean-800 rounded-xl p-6">
            <p className="text-ocean-400 text-sm mb-2">{t.tests.testsCompleted}</p>
            <p className="text-4xl font-bold text-ocean-100">{completedCount}/{totalTests}</p>
            <p className="text-ocean-500 text-xs mt-2">
              {totalTests - completedCount} {t.tests.remaining}
            </p>
          </div>

          <div className="bg-deep-surface border border-ocean-800 rounded-xl p-6">
            <p className="text-ocean-400 text-sm mb-2">{t.tests.estimatedTotalTime}</p>
            <p className="text-4xl font-bold text-ocean-100">
              {PSYCHOLOGICAL_TESTS.reduce((sum, test) => sum + test.duration, 0)}
            </p>
            <p className="text-ocean-500 text-xs mt-2">{t.tests.minutesAcrossAllTests}</p>
          </div>

          <div className="bg-deep-surface border border-ocean-800 rounded-xl p-6">
            <p className="text-ocean-400 text-sm mb-2">{t.tests.averageTimePerTest}</p>
            <p className="text-4xl font-bold text-ocean-100">
              {Math.round(PSYCHOLOGICAL_TESTS.reduce((sum, test) => sum + test.duration, 0) / totalTests)}
            </p>
            <p className="text-ocean-500 text-xs mt-2">{t.tests.minutes}</p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-warm-300/10 border border-warm-300/30 rounded-xl p-6 mb-12">
          <div className="flex gap-4">
            <div className="text-warm-300 text-lg">⚠️</div>
            <div>
              <p className="font-semibold text-warm-100 mb-2">{t.tests.importantDisclaimer}</p>
              <p className="text-sm text-warm-200/80">
                {t.tests.disclaimerText}
              </p>
            </div>
          </div>
        </div>

        {/* Tests Grid */}
        <div className="space-y-4 mb-12">
          <h2 className="text-2xl font-light text-white mb-6">{t.tests.availableTests}</h2>

          {PSYCHOLOGICAL_TESTS.map((test) => {
            const isCompleted = getTestStatus(test.id);
            return (
              <button
                key={test.id}
                onClick={() => navigate(`/tests/${test.id}`)}
                className={`w-full p-6 rounded-xl border transition-all duration-300 flex items-center justify-between group hover:shadow-lg ${getColorClasses(test.color)}`}
              >
                <div className="flex items-center gap-4 text-left">
                  <div className={`${getIconColor(test.color)} transition-transform group-hover:scale-110`}>
                    {test.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-semibold text-white group-hover:text-ocean-100 transition-colors">
                        {test.name}
                      </h3>
                      {isCompleted && (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                      {!isCompleted && (
                        <Circle className="w-5 h-5 text-ocean-600" />
                      )}
                    </div>
                    <p className="text-sm text-ocean-300 mb-3">{test.description}</p>
                    <div className="flex items-center gap-6 text-sm text-ocean-400">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        ~{test.duration} {t.tests.min}
                      </div>
                      <div className="flex items-center gap-2">
                        <span>{test.questionCount} {t.tests.questions}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-ocean-400 transition-transform group-hover:translate-x-2" />
              </button>
            );
          })}
        </div>

        {/* View Results Button */}
        {completedCount > 0 && (
          <button
            onClick={() => navigate('/results')}
            className="w-full py-4 bg-gradient-to-r from-warm-300/20 to-sage-500/20 border border-warm-300/50 rounded-xl text-ocean-100 font-semibold hover:from-warm-300/30 hover:to-sage-500/30 transition-all"
          >
            {t.tests.viewYourResults}
          </button>
        )}
      </div>
    </div>
  );
};
