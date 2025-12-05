import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { getTestById } from '../data/testQuestions';
import { useAuth } from '../hooks/useAuth';
import { AppHeader } from '../components/layout/AppHeader';
import { useTranslation } from '../hooks/useTranslation';
import {
  saveTestResult,
  calculateBigFiveScores,
  calculateMBTIResult,
  calculateDISCResult,
  calculateAttachmentResult,
  calculateDASSResult,
} from '../services/testResults';

export const TestFlowPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const t = useTranslation();

  const test = getTestById(testId || '');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!test) {
    return (
      <div className="min-h-screen bg-deep flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-ocean-100 mb-4">{t.tests.testNotFound}</h2>
          <button
            onClick={() => navigate('/tests')}
            className="px-6 py-3 bg-ocean-600 hover:bg-ocean-500 text-white rounded-lg"
          >
            {t.tests.backToTests}
          </button>
        </div>
      </div>
    );
  }

  const handleSelectAnswer = (questionId: string, optionScore: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionScore,
    }));
  };

  const handleNext = async () => {
    if (currentQuestion < test.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      // Submit test on last question
      await handleSubmitTest();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmitTest = async () => {
    if (!user?.uid || !test) {
      alert(t.tests.userNotAuthenticated);
      return;
    }

    // Check if all questions are answered
    if (Object.keys(answers).length !== test.questions.length) {
      alert(t.tests.pleaseAnswerAll);
      return;
    }

    try {
      // Calculate scores based on test type
      let scores: Record<string, number> = {};

      switch (test.id) {
        case 'big-five':
          scores = calculateBigFiveScores(answers);
          break;
        case 'mbti':
          scores = calculateMBTIResult(answers);
          break;
        case 'disc':
          scores = calculateDISCResult(answers);
          break;
        case 'attachment':
          scores = calculateAttachmentResult(answers);
          break;
        case 'dass-21':
          scores = calculateDASSResult(answers);
          break;
        default:
          scores = {};
      }

      console.log('Submitting test:', {
        testId: test.id,
        userId: user.uid,
        answers,
        scores,
        duration: timeElapsed,
      });

      // Save to Firebase
      await saveTestResult({
        userId: user.uid,
        testId: test.id,
        testName: test.name,
        answers,
        scores,
        duration: timeElapsed,
      });

      // Redirect to results
      navigate('/results');
    } catch (error) {
      console.error('Error submitting test:', error);
      alert(t.tests.errorSaving);
    }
  };

  const question = test.questions[currentQuestion];
  const selectedAnswer = answers[question.id];
  const progressPercent = ((currentQuestion + 1) / test.questions.length) * 100;
  const isLastQuestion = currentQuestion === test.questions.length - 1;

  return (
    <div className="min-h-screen bg-deep text-ocean-50">
      <AppHeader showLogo showUserMenu sticky={false} />

      {/* Progress Bar */}
      <div className="h-1 bg-ocean-900">
        <div
          className="h-full bg-gradient-to-r from-warm-300 to-sage-500 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-8 py-12">
        {/* Question Card */}
        <div className="bg-deep-surface border border-ocean-800 rounded-2xl p-12 mb-8">
          <div className="mb-8">
            <p className="text-ocean-400 text-sm mb-2">{t.tests.question} {currentQuestion + 1}</p>
            <h2 className="text-2xl font-light text-white leading-relaxed">{question.text}</h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option: any) => {
              const isSelected = selectedAnswer === option.value;
              return (
                <button
                  key={`${question.id}-${option.value}`}
                  type="button"
                  onClick={() => handleSelectAnswer(question.id, option.value)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'bg-warm-500/10 border-warm-400 text-ocean-100'
                      : 'bg-ocean-950/30 border-ocean-800 text-ocean-300 hover:bg-ocean-900/40 hover:border-warm-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'border-warm-400 bg-warm-400'
                          : 'border-ocean-600'
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 bg-deep rounded-full"></div>
                      )}
                    </div>
                    <span className="flex-1">{option.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all ${
              currentQuestion === 0
                ? 'bg-ocean-950 text-ocean-600 cursor-not-allowed border-ocean-800'
                : 'bg-ocean-900 hover:bg-ocean-800 text-ocean-300 hover:text-ocean-100 border-ocean-700 hover:border-ocean-600'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            {t.tests.previous}
          </button>

          <div className="text-sm text-ocean-400">
            {currentQuestion + 1} / {test.questions.length}
          </div>

          <button
            onClick={handleNext}
            disabled={selectedAnswer === undefined}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all ${
              selectedAnswer === undefined
                ? 'bg-ocean-950 text-ocean-600 cursor-not-allowed border-ocean-800'
                : 'bg-gradient-to-r from-warm-400 to-warm-500 hover:shadow-lg hover:shadow-warm-500/50 text-white font-semibold border-warm-300 hover:border-warm-200'
            }`}
          >
            {isLastQuestion ? t.tests.complete : t.tests.next}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
