import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GenogramCanvas } from '../components/GenogramCanvas';
import { AddPersonModal } from '../components/AddPersonModal';
import { useRef } from 'react';
import { AddRelationModal } from '../components/AddRelationModal';
import { AIAnalysisModal } from '../components/AIAnalysisModal';
import { AddProfileModal } from '../components/AddProfileModal';
import { ExportMenu } from '../components/ExportMenu';
import { AppHeader } from '../components/layout/AppHeader';
import { Plus, Link2, Save, Sparkles, BookOpen, User, Zap, AlertCircle, CheckCircle, Loader, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { useGenogramStore } from '../store/genogramStore';
import { useTranslation } from '../hooks/useTranslation';
import { testPeople, testRelations } from '../data/testGenogram';

export const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const t = useTranslation();
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const sidebarHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const {
    currentGenogramId,
    loadGenogram,
    createNewGenogram,
    saveCurrentGenogram,
    error,
    clearError,
    people,
    addPerson,
    addRelation,
  } = useGenogramStore();

  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [isRelationModalOpen, setIsRelationModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoadingTestData, setIsLoadingTestData] = useState(false);

  // Load genogram on mount
  useEffect(() => {
    const initGenogram = async () => {
      console.log('[Editor] 🔧 useEffect triggered with URL id:', id, 'stored currentGenogramId:', currentGenogramId);
      
      if (id === 'new') {
        // Create new genogram
        console.log('[Editor] 📝 Creating new genogram');
        const newId = await createNewGenogram('Untitled Genogram', '');
        navigate(`/editor/${newId}`, { replace: true });
      } else if (id) {
        // ALWAYS load the genogram from URL, even if currentGenogramId matches
        // This is important for page refresh - we need to reload from IndexedDB
        console.log('[Editor] 📖 Loading genogram from URL:', id);
        await loadGenogram(id);
        console.log('[Editor] ✅ Genogram loaded');
      }
    };

    initGenogram().catch(err => {
      console.error('Error initializing genogram:', err);
      navigate('/dashboard');
    });
    // Only depend on 'id' to avoid infinite loops and unnecessary reloads
  }, [id]);

  const handleCanvasClick = () => {
    setIsSidebarCollapsed(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isSidebarCollapsed) {
      // Show sidebar when mouse is near the left edge
      if (e.clientX < 50) {
        setIsSidebarCollapsed(false);
        if (sidebarHideTimeoutRef.current) {
          clearTimeout(sidebarHideTimeoutRef.current);
        }
      }
    }
  };

  const handleSidebarHover = () => {
    setIsSidebarCollapsed(false);
    if (sidebarHideTimeoutRef.current) {
      clearTimeout(sidebarHideTimeoutRef.current);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveCurrentGenogram();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadTestData = async () => {
    setIsLoadingTestData(true);
    try {
      // Clear existing people first
      if (people.length > 0) {
        // We'll add new ones - the store will handle duplicates via IDs
      }
      
      // Add all test people
      for (const person of testPeople) {
        addPerson(person);
      }
      
      // Add all test relations
      for (const relation of testRelations) {
        addRelation(relation);
      }
      
      // Save to storage
      await saveCurrentGenogram();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error loading test data:', err);
    } finally {
      setIsLoadingTestData(false);
    }
  };

  const handleAIAnalysis = () => {
    navigate(`/analysis/${id}`);
  };

  // const handleOpenReport = () => {
  //   navigate(`/report/${id}`);
  // };

  return (
    <div className="h-screen flex flex-col bg-bg-dark page-enter">
      {/* App Header */}
      <AppHeader 
        showLogo={true} 
        showUserMenu={true} 
        sticky={false}
        actions={
          <div className="flex items-center gap-2 sm:gap-3">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
                <button onClick={clearError} className="text-red-300 hover:text-red-200">×</button>
              </motion.div>
            )}
            
            {saveSuccess && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                Saved!
              </motion.div>
            )}
            
            <Button
              variant="primary"
              size="sm"
              icon={<Sparkles className="w-4 h-4" />}
              onClick={handleAIAnalysis}
            >
              <span className="hidden sm:inline">{t.editor.analyze}</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<Zap className="w-4 h-4" />}
              onClick={() => navigate(`/chat/${id}`)}
            >
              <span className="hidden sm:inline">{t.editor.chat}</span>
            </Button>
            <div className="h-6 w-px bg-slate-700 mx-1" />
            <ExportMenu targetRef={canvasRef} />
            <Button
              variant="secondary"
              size="sm"
              icon={isSaving ? undefined : <Save className="w-4 h-4" />}
              onClick={handleSave}
              disabled={isSaving}
            >
              <span className="hidden sm:inline">{isSaving ? t.editor.saving : t.common.save}</span>
            </Button>
          </div>
        }
      />

      {/* Main Workspace */}
      <div 
        className="flex-1 flex overflow-hidden w-full relative" 
        ref={canvasRef}
        onMouseMove={handleMouseMove}
      >
        {/* Left Sidebar - Legend & Controls - OVERLAY */}
        <motion.aside 
          initial={{ x: 0 }}
          animate={{ x: isSidebarCollapsed ? '-100%' : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          onMouseEnter={handleSidebarHover}
          className="w-64 bg-slate-900/50 border-r border-slate-800 p-4 flex flex-col gap-6 z-20 overflow-y-auto fixed left-0 top-0 h-screen md:relative md:fixed-none"
        >
          {/* Legend Section */}
          <div>
            <h3 className="text-sm font-bold text-primary-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> {t.editor.legend}
            </h3>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-900/60 border-2 border-blue-400 rounded" />
                <span>{t.editor.male}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-pink-900/60 border-2 border-pink-400 rounded" />
                <span>{t.editor.female}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-0.5 bg-slate-500" />
                <span>{t.editor.parentChild}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-0.5 border-t-2 border-dashed border-red-500" />
                <span>{t.editor.conflict}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-0.5 border-t-2 border-dashed border-teal-500" />
                <span>{t.editor.support}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-sm font-bold text-primary-300 uppercase tracking-wider mb-4">
              {t.editor.quickActions}
            </h3>
            <div className="space-y-2">
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                className="w-full justify-center"
                onClick={() => setIsPersonModalOpen(true)}
              >
                {t.editor.addPerson}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<Link2 className="w-4 h-4" />}
                className="w-full justify-center"
                onClick={() => setIsRelationModalOpen(true)}
              >
                {t.editor.addRelation}
              </Button>
              <Button
                variant="tertiary"
                size="sm"
                icon={<User className="w-4 h-4" />}
                className="w-full justify-center"
                onClick={() => setIsProfileModalOpen(true)}
              >
                {t.editor.addProfile}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={isLoadingTestData ? <Loader className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                className="w-full justify-center"
                onClick={handleLoadTestData}
                disabled={isLoadingTestData}
              >
                Load Test Data
              </Button>
              <Button
                variant="tertiary"
                size="sm"
                icon={<HelpCircle className="w-4 h-4" />}
                className="w-full justify-center"
                onClick={() => navigate('/tutorial')}
              >
                Tutorial
              </Button>
            </div>
          </div>

          {/* AI Insight */}
          <div className="glass-alt p-4 rounded-lg mb-6">
            <h4 className="text-xs font-bold text-primary-300 mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {t.editor.aiInsight}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.editor.addMoreMembers}
            </p>
          </div>
        </motion.aside>

        {/* Canvas Area */}
        <main 
          className="absolute inset-0 cursor-pointer overflow-hidden flex flex-col"
          onClick={handleCanvasClick}
        >
          {/* Tab Navigation */}
          <div className="flex justify-start border-b border-slate-700 bg-slate-900/50 backdrop-blur gap-8 pl-80">
            <button
              className={`px-4 py-3 font-medium text-sm flex items-center gap-2 transition-all border-b-2 border-primary-500 text-primary-300`}
            >
              <BookOpen className="w-4 h-4" />
              {t.editor.genogram}
            </button>
            <button
              className={`px-4 py-3 font-medium text-sm flex items-center gap-2 transition-all border-b-2 border-transparent text-slate-400 hover:text-slate-300 cursor-not-allowed opacity-50`}
              disabled
            >
              Report
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            <div className="cursor-pointer overflow-hidden h-full w-full">
              <GenogramCanvas />
            </div>
          </div>
          
          {/* Floating Action Buttons - Mobile/Tablet */}
          <div className="absolute bottom-8 right-8 flex flex-col gap-3 md:hidden">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsPersonModalOpen(true)}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/40 flex items-center justify-center transition-all hover:shadow-xl"
                title={t.editor.addPerson}
              >
                <Plus className="w-6 h-6" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsRelationModalOpen(true)}
                className="w-14 h-14 rounded-full border-2 border-primary-500/50 bg-slate-900/50 backdrop-blur text-primary-300 flex items-center justify-center transition-all hover:border-primary-400 hover:text-primary-200"
                title={t.editor.addRelation}
              >
                <Link2 className="w-6 h-6" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsProfileModalOpen(true)}
                className="w-14 h-14 rounded-full border-2 border-teal-500/50 bg-slate-900/50 backdrop-blur text-teal-300 flex items-center justify-center transition-all hover:border-teal-400 hover:text-teal-200"
                title={t.editor.addProfile}
              >
                <User className="w-6 h-6" />
              </motion.button>
            </div>
        </main>
      </div>

      {/* Old floating buttons removed - now in tab-aware section above */}

      {/* Modals */}
      <AddPersonModal isOpen={isPersonModalOpen} onClose={() => setIsPersonModalOpen(false)} />
      <AddRelationModal isOpen={isRelationModalOpen} onClose={() => setIsRelationModalOpen(false)} />
      <AIAnalysisModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
      <AddProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </div>
  );
};
