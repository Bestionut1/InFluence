import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { OfflineStatusIndicator } from './components/OfflineStatusIndicator';
import { LandingPage } from './pages/LandingPage';

// Lazy load heavy pages
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Editor = lazy(() => import('./pages/Editor').then(m => ({ default: m.Editor })));
const AIAnalysisPage = lazy(() => import('./pages/AIAnalysisPage').then(m => ({ default: m.AIAnalysisPage })));
const PsychologyChatPage = lazy(() => import('./pages/PsychologyChatPage').then(m => ({ default: m.PsychologyChatPage })));
const UserProfile = lazy(() => import('./pages/UserProfile').then(m => ({ default: m.UserProfile })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./pages/TermsOfService').then(m => ({ default: m.TermsOfService })));
const TutorialPage = lazy(() => import('./pages/TutorialPage').then(m => ({ default: m.TutorialPage })));
const PsychologicalTestsPage = lazy(() => import('./pages/PsychologicalTestsPage').then(m => ({ default: m.PsychologicalTestsPage })));
const TestFlowPage = lazy(() => import('./pages/TestFlowPage').then(m => ({ default: m.TestFlowPage })));
const PsychologicalResultsPage = lazy(() => import('./pages/PsychologicalResultsPage').then(m => ({ default: m.PsychologicalResultsPage })));
const PersonHubPage = lazy(() => import('./pages/PersonHubPage').then(m => ({ default: m.PersonHubPage })));
const AnamnesisPage = lazy(() => import('./pages/AnamnesisPage').then(m => ({ default: m.AnamnesisPage })));
const AdminCleanup = lazy(() => import('./pages/AdminCleanup').then(m => ({ default: m.AdminCleanup })));

const LoadingFallback = () => (
  <div className="min-h-screen bg-deep flex items-center justify-center">
    <div className="animate-pulse text-ocean-300">Loading...</div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <OfflineStatusIndicator />
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            {/* Public editor access */}
            <Route path="/editor/:id" element={<Editor />} />
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
               <Route path="/dashboard" element={<Dashboard />} />
               <Route path="/profile" element={<UserProfile />} />
               <Route path="/tutorial" element={<TutorialPage />} />
               <Route path="/tests" element={<PsychologicalTestsPage />} />
               <Route path="/tests/:testId" element={<TestFlowPage />} />
               <Route path="/results" element={<PsychologicalResultsPage />} />
               <Route path="/anamnesis/:id" element={<AnamnesisPage />} />
               <Route path="/analysis/:id" element={<AIAnalysisPage />} />
               <Route path="/chat/:id" element={<PsychologyChatPage />} />
               <Route path="/person/:personId" element={<PersonHubPage />} />
               <Route path="/admin/cleanup" element={<AdminCleanup />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
