import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  User, 
  FileText, 
  Sparkles, 
  Lightbulb,
  Users,
  BookOpen,
  X,
  ChevronRight,
  PlayCircle,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppHeader } from '../components/layout/AppHeader';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { useTranslation } from '../hooks/useTranslation';

interface GuidedTourStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  highlightColor?: string;
}

interface KnowledgeBaseArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  icon: React.ReactNode;
  readTime: number;
}

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  completed: boolean;
}

const guidedTourSteps = (t: any): GuidedTourStep[] => [
  {
    id: 'step-1',
    title: t.tutorial.guidedTourSteps.step1Title,
    description: t.tutorial.guidedTourSteps.step1Desc,
    highlightColor: 'from-primary-500 to-primary-700',
  },
  {
    id: 'step-2',
    title: t.tutorial.guidedTourSteps.step2Title,
    description: t.tutorial.guidedTourSteps.step2Desc,
    position: 'bottom',
    highlightColor: 'from-primary-500 to-primary-700',
  },
  {
    id: 'step-3',
    title: t.tutorial.guidedTourSteps.step3Title,
    description: t.tutorial.guidedTourSteps.step3Desc,
    position: 'bottom',
    highlightColor: 'from-primary-500 to-primary-700',
  },
  {
    id: 'step-4',
    title: t.tutorial.guidedTourSteps.step4Title,
    description: t.tutorial.guidedTourSteps.step4Desc,
    position: 'bottom',
    highlightColor: 'from-primary-500 to-primary-700',
  },
  {
    id: 'step-5',
    title: t.tutorial.guidedTourSteps.step5Title,
    description: t.tutorial.guidedTourSteps.step5Desc,
    position: 'bottom',
    highlightColor: 'from-primary-500 to-primary-700',
  },
  {
    id: 'step-6',
    title: t.tutorial.guidedTourSteps.step6Title,
    description: t.tutorial.guidedTourSteps.step6Desc,
    position: 'bottom',
    highlightColor: 'from-primary-500 to-primary-700',
  },
];

const knowledgeBase = (t: any): KnowledgeBaseArticle[] => [
  {
    id: 'kb-1',
    title: t.tutorial.articles.kb1Title,
    category: t.tutorial.articles.basics,
    content: t.tutorial.articles.kb1Content,
    icon: <BookOpen className="w-6 h-6" />,
    readTime: 3,
  },
  {
    id: 'kb-2',
    title: t.tutorial.articles.kb2Title,
    category: t.tutorial.articles.genogramSymbols,
    content: t.tutorial.articles.kb2Content,
    icon: <Users className="w-6 h-6" />,
    readTime: 5,
  },
  {
    id: 'kb-3',
    title: t.tutorial.articles.kb3Title,
    category: t.tutorial.articles.profiles,
    content: t.tutorial.articles.kb3Content,
    icon: <User className="w-6 h-6" />,
    readTime: 4,
  },
  {
    id: 'kb-4',
    title: t.tutorial.articles.kb4Title,
    category: t.tutorial.articles.aiFeatures,
    content: t.tutorial.articles.kb4Content,
    icon: <Sparkles className="w-6 h-6" />,
    readTime: 4,
  },
  {
    id: 'kb-5',
    title: t.tutorial.articles.kb5Title,
    category: t.tutorial.articles.account,
    content: t.tutorial.articles.kb5Content,
    icon: <AlertCircle className="w-6 h-6" />,
    readTime: 3,
  },
  {
    id: 'kb-6',
    title: t.tutorial.articles.kb6Title,
    category: t.tutorial.articles.export,
    content: t.tutorial.articles.kb6Content,
    icon: <FileText className="w-6 h-6" />,
    readTime: 3,
  },
];

const onboardingSteps = (t: any): OnboardingStep[] => [
  {
    id: 'onboard-1',
    title: t.tutorial.onboardingSteps.step1Title,
    subtitle: t.tutorial.onboardingSteps.step1Subtitle,
    description: t.tutorial.onboardingSteps.step1Desc,
    icon: <Plus className="w-8 h-8" />,
    action: t.tutorial.onboardingSteps.step1Action,
    completed: false,
  },
  {
    id: 'onboard-2',
    title: t.tutorial.onboardingSteps.step2Title,
    subtitle: t.tutorial.onboardingSteps.step2Subtitle,
    description: t.tutorial.onboardingSteps.step2Desc,
    icon: <Users className="w-8 h-8" />,
    action: t.tutorial.onboardingSteps.step2Action,
    completed: false,
  },
  {
    id: 'onboard-3',
    title: t.tutorial.onboardingSteps.step3Title,
    subtitle: t.tutorial.onboardingSteps.step3Subtitle,
    description: t.tutorial.onboardingSteps.step3Desc,
    icon: <Lightbulb className="w-8 h-8" />,
    action: t.tutorial.onboardingSteps.step3Action,
    completed: false,
  },
  {
    id: 'onboard-4',
    title: t.tutorial.onboardingSteps.step4Title,
    subtitle: t.tutorial.onboardingSteps.step4Subtitle,
    description: t.tutorial.onboardingSteps.step4Desc,
    icon: <Sparkles className="w-8 h-8" />,
    action: t.tutorial.onboardingSteps.step4Action,
    completed: false,
  },
];

// Guided Tour Modal Component
const GuidedTourModal = ({ 
  isOpen, 
  currentStep, 
  totalSteps,
  onNext,
  onSkip,
  onComplete,
  t
}: any) => {
  const tours = guidedTourSteps(t);
  const step = tours[currentStep];
  
  if (!isOpen || !step) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs font-semibold text-primary-400 uppercase tracking-wider mb-1">
                {t.tutorial.guidedTourSteps.stepLabel} {currentStep + 1} {t.tutorial.guidedTourSteps.of} {totalSteps}
              </div>
              <h2 className="text-xl font-bold text-white">{step.title}</h2>
            </div>
            <button
              onClick={onSkip}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1 bg-slate-700 rounded-full mb-6 overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              className="h-full bg-gradient-to-r from-primary-500 to-primary-700"
            />
          </div>

          {/* Description */}
          <p className="text-slate-300 mb-6">{step.description}</p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onSkip}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              {t.tutorial.guidedTourSteps.skipTour}
            </button>
            <button
              onClick={currentStep === totalSteps - 1 ? onComplete : onNext}
              className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {currentStep === totalSteps - 1 ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {t.tutorial.guidedTourSteps.completeButton}
                </>
              ) : (
                <>
                  {t.tutorial.guidedTourSteps.nextButton}
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Knowledge Base Section
const KnowledgeBaseSection = ({ articles, t }: { articles: KnowledgeBaseArticle[], t: any }) => {
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const selectedItem = articles.find(a => a.id === selectedArticle);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">{t.tutorial.knowledgeBaseTitle}</h2>
        <p className="text-slate-400">{t.tutorial.knowledgeBaseDesc}</p>
      </div>

      {/* Articles Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map(article => (
          <motion.button
            key={article.id}
            onClick={() => setSelectedArticle(article.id)}
            whileHover={{ y: -4 }}
            className="text-left"
          >
            <Card isHoverable className="h-full">
              <CardBody className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="text-primary-400">{article.icon}</div>
                  <span className="px-2 py-1 rounded bg-primary-500/20 text-primary-300 text-xs font-medium">
                    {article.category}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{article.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{article.content}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  {article.readTime} {t.tutorial.minRead}
                </div>
              </CardBody>
            </Card>
          </motion.button>
        ))}
      </div>

      {/* Article Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedArticle(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedArticle(null)}
                className="float-right text-slate-400 hover:text-white transition-colors mb-4"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="text-primary-400">{selectedItem.icon}</div>
                <div>
                  <span className="px-2 py-1 rounded bg-primary-500/20 text-primary-300 text-xs font-medium">
                    {selectedItem.category}
                  </span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">{selectedItem.title}</h2>
              <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
                <Clock className="w-4 h-4" />
                {selectedItem.readTime} min read
              </div>

              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedItem.content}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Onboarding Checklist
const OnboardingChecklist = ({ steps, t }: { steps: OnboardingStep[], t: any }) => {
  const [completed, setCompleted] = useState<string[]>([]);
  const completionPercentage = Math.round((completed.length / steps.length) * 100);

  const toggleComplete = useCallback((id: string) => {
    setCompleted(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">{t.tutorial.getStartedTitle}</h2>
        <p className="text-slate-400">{t.tutorial.getStartedDesc}</p>
      </div>

      {/* Progress */}
      <div className="bg-slate-800/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-300">{t.tutorial.progressLabel}</span>
          <span className="text-sm font-bold text-primary-400">{completionPercentage}%</span>
        </div>
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: `${completionPercentage}%` }}
            className="h-full bg-gradient-to-r from-primary-500 to-primary-700"
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, idx) => (
          <motion.button
            key={step.id}
            onClick={() => toggleComplete(step.id)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="w-full text-left"
          >
            <Card isHoverable className={`${completed.includes(step.id) ? 'opacity-75' : ''}`}>
              <CardBody className="p-4 flex items-center gap-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                  completed.includes(step.id)
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-primary-500/20 text-primary-400'
                }`}>
                  {completed.includes(step.id) ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    step.icon
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-white">{step.title}</h3>
                  <p className="text-sm text-slate-400">{step.subtitle}</p>
                  <p className="text-xs text-slate-500 mt-1">{step.description}</p>
                </div>

                <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${
                  completed.includes(step.id) ? 'rotate-90' : ''
                }`} />
              </CardBody>
            </Card>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export const InteractiveTutorial = () => {
  const navigate = useNavigate();
  const t = useTranslation();
  const [activeTab, setActiveTab] = useState<'tour' | 'onboarding' | 'kb'>('onboarding');
  const [showGuidedTour, setShowGuidedTour] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  const tours = guidedTourSteps(t);
  const knowledgeBase_ = knowledgeBase(t);
  const onboardingSteps_ = onboardingSteps(t);

  const handleStartTour = useCallback(() => {
    setShowGuidedTour(true);
    setCurrentStep(0);
  }, []);

  const handleNextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, tours.length - 1));
  }, []);

  const handleCompleteTour = useCallback(() => {
    setShowGuidedTour(false);
    navigate('/dashboard');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-bg-dark page-enter">
      <AppHeader showLogo showUserMenu sticky={false} />

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary-950/40 to-transparent border-b border-slate-800 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary-400" />
              <span className="text-sm font-semibold text-primary-400 uppercase tracking-wider">{t.tutorial.learningCenter}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">{t.tutorial.masterTitle}</h1>
            <p className="text-lg text-slate-400 max-w-2xl">
              {t.tutorial.masterDescription}
            </p>
            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                icon={<PlayCircle className="w-4 h-4" />}
                onClick={handleStartTour}
              >
                {t.tutorial.startGuidedTour}
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/dashboard')}
              >
                {t.tutorial.backToDashboard}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 bg-slate-900/30 sticky top-[65px] z-40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1">
            {['onboarding', 'tour', 'kb'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-primary-400 border-b-2 border-primary-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'onboarding' && t.tutorial.gettingStarted}
                {tab === 'tour' && t.tutorial.guidedTour}
                {tab === 'kb' && t.tutorial.knowledgeBase}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'onboarding' && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <OnboardingChecklist steps={onboardingSteps_} t={t} />
            </motion.div>
          )}

          {activeTab === 'tour' && (
            <motion.div
              key="tour"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{t.tutorial.guidedTourTitle}</h2>
                <p className="text-slate-400">{t.tutorial.guidedTourDesc}</p>
              </div>

              <Button
                variant="primary"
                size="lg"
                icon={<PlayCircle className="w-5 h-5" />}
                onClick={handleStartTour}
                className="w-full justify-center"
              >
                {t.tutorial.startGuidedTourWithSteps}
              </Button>

              {/* Tour Steps Preview */}
              <div className="space-y-3">
                {tours.map((step, idx) => (
                  <Card key={step.id}>
                    <CardBody className="p-4 flex items-center gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{step.title}</h3>
                        <p className="text-sm text-slate-400">{step.description}</p>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'kb' && (
            <motion.div
              key="kb"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <KnowledgeBaseSection articles={knowledgeBase_} t={t} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Guided Tour Modal */}
      <GuidedTourModal
        isOpen={showGuidedTour}
        currentStep={currentStep}
        totalSteps={tours.length}
        onNext={handleNextStep}
        onSkip={() => setShowGuidedTour(false)}
        onComplete={handleCompleteTour}
        t={t}
      />
    </div>
  );
};
