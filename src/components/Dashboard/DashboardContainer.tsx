/**
 * DashboardContainer - Root Dashboard Page
 * Manages state, search, sort, modals, and orchestrates all dashboard components
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, RotateCw, BookOpen, AlertCircle } from 'lucide-react';
import { useGenograms } from '../../hooks/useGenograms';
import { useGenogramStore } from '../../store/genogramStore';
import { useTranslation } from '../../hooks/useTranslation';
import { GenogramList } from './GenogramList';
import { NewGenogramModal } from './NewGenogramModal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardBody } from '../ui/Card';
import { debounce } from '../../utils/performance';

const ONBOARDING_KEY = 'genogram-onboarding-completed';

export const DashboardContainer = React.memo(() => {
  const navigate = useNavigate();
  const t = useTranslation();
  const {
    genograms,
    loading,
    error,
    lastSync,
    refresh,
    deleteGenogram,
    clearError,
  } = useGenograms();
  
  console.log('📊 [DashboardContainer] Rendering - loading:', loading, 'genograms:', genograms.length);
  
  const { createNewGenogram } = useGenogramStore();

  // Local UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'members'>('recent');
  const [newGenogramModalOpen, setNewGenogramModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if should show onboarding
  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      setShowOnboarding(true);
    }
  }, []);

  // Refresh on mount and window focus
  useEffect(() => {
    console.log('📊 [Dashboard] useEffect: Initial refresh or refocus');
    refresh();

    // Refresh when window regains focus
    const handleFocus = () => {
      console.log('📊 [Dashboard] Window focus event');
      refresh();
    };

    // Also refresh when page becomes visible (for tab switching)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('📊 [Dashboard] Page visible after tab switch');
        refresh();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refresh]);

  // Debounced search handler
  const handleSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
    }, 300),
    []
  );

  // Handle new genogram creation
  const handleCreateGenogram = useCallback(
    async (title: string) => {
      try {
        console.log('📝 [DashboardContainer] handleCreateGenogram START:', title);
        
        // Use store's createNewGenogram which properly initializes state
        console.log('⏳ [DashboardContainer] Calling createNewGenogram...');
        const newGenogramId = await createNewGenogram(title, 'Blank family tree');
        
        console.log('✅ [DashboardContainer] Genogram created:', newGenogramId);
        console.log('🔍 [DashboardContainer] ID type:', typeof newGenogramId, 'ID value:', newGenogramId);
        
        if (newGenogramId) {
          // Close modal immediately
          console.log('🚪 [DashboardContainer] Closing modal');
          setNewGenogramModalOpen(false);
          
          // Navigate to editor
          const editorPath = `/editor/${newGenogramId}`;
          console.log('🚀 [DashboardContainer] Navigating to:', editorPath);
          navigate(editorPath);
          console.log('✅ [DashboardContainer] Navigation complete');
        } else {
          console.error('❌ [DashboardContainer] No ID returned from createNewGenogram');
          throw new Error('No genogram ID returned');
        }
      } catch (err) {
        console.error('❌ [DashboardContainer] Failed to create genogram:', err);
        const message = err instanceof Error ? err.message : 'Failed to create genogram';
        throw new Error(message);
      }
    },
    [createNewGenogram, navigate]
  );

  // Handle open genogram
  const handleOpen = useCallback(
    (id: string) => {
      navigate(`/editor/${id}`);
    },
    [navigate]
  );

  // Handle delete request (show confirmation)
  const handleDeleteRequest = useCallback((id: string) => {
    setShowDeleteConfirm(id);
  }, []);

  // Handle confirm delete
  const handleConfirmDelete = useCallback(
    async (id: string) => {
      setShowDeleteConfirm(null);
      setDeletingId(id);

      try {
        console.log('🗑️ [Dashboard] Deleting genogram:', id);
        await deleteGenogram(id);
        console.log('✅ [Dashboard] Delete successful, refreshing list...');
        // Refresh the list to remove the deleted item from UI
        await refresh();
        console.log('✅ [Dashboard] List refreshed after delete');
      } catch (err) {
        console.error('❌ [Dashboard] Failed to delete:', err);
      } finally {
        setDeletingId(null);
      }
    },
    [deleteGenogram, refresh]
  );

  // Handle close delete confirmation
  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirm(null);
  }, []);

  // Handle close onboarding
  const handleCloseOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  }, []);

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-red-950 border border-red-700 rounded-lg p-4 flex items-start justify-between gap-4"
        >
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-200">{t.common.error}</h3>
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearError}
            className="text-red-300 hover:text-red-200"
          >
            ✕
          </Button>
        </motion.div>
      )}

      {/* Onboarding Banner */}
      {showOnboarding && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gradient-to-r from-ocean-900/40 to-ocean-800/20 rounded-lg p-5 mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex gap-3">
              <BookOpen className="w-6 h-6 text-ocean-300 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-ocean-100 text-lg">{t.dashboard.myGenograms}</h3>
                <p className="text-sm text-ocean-300 mt-1">
                  {t.dashboard.noGenograms}
                </p>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/tutorial')}
                className="whitespace-nowrap"
              >
                {t.common.next}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseOnboarding}
                className="text-ocean-300 hover:text-ocean-200"
              >
                ✕
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Controls - Hidden Search */}
      <div className="space-y-4 hidden">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search */}
          <div className="flex-1">
            <Input
              type="text"
              placeholder={t.common.search}
              onChange={e => handleSearch(e.target.value)}
              disabled={loading}
              className="w-full"
            />
          </div>

          {/* Sort */}
          <div>
            <label htmlFor="dashboard-sort-select" className="sr-only">Sort by</label>
            <select
              id="dashboard-sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              disabled={loading}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm hover:border-slate-600 focus:outline-none focus:border-ocean-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
            <option value="recent">{t.dashboard.updatedAt}</option>
            <option value="name">Name (A-Z)</option>
            <option value="members">{t.personHub.relationships}</option>
          </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => refresh()}
              disabled={loading}
              className="px-4"
              title="Refresh genograms"
            >
              <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              onClick={() => {
                console.log('🔘 [DashboardContainer] Create New button clicked');
                setNewGenogramModalOpen(true);
              }}
              disabled={loading}
              className="px-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t.dashboard.createNew}
            </Button>
          </div>
        </div>

        {/* Last Sync Info */}
        {lastSync && (
          <p className="text-xs text-slate-500">
            Last synced: {new Date(lastSync).toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && genograms.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardBody className="p-6 space-y-4">
                <div className="h-6 bg-slate-700 rounded w-2/3" />
                <div className="h-4 bg-slate-700 rounded w-full" />
                <div className="h-4 bg-slate-700 rounded w-1/2" />
                <div className="flex gap-2 pt-4">
                  <div className="h-8 bg-slate-700 rounded flex-1" />
                  <div className="h-8 bg-slate-700 rounded flex-1" />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Genogram List */}
      {!loading && (
        <GenogramList
          genograms={genograms}
          searchQuery={searchQuery}
          sortBy={sortBy}
          onOpen={handleOpen}
          onDelete={handleDeleteRequest}
          onShare={() => {}} // Implement if needed
          deletingId={deletingId || undefined}
        />
      )}

      {/* New Genogram Modal */}
      <NewGenogramModal
        isOpen={newGenogramModalOpen}
        onClose={() => setNewGenogramModalOpen(false)}
        onCreateGenogram={handleCreateGenogram}
        isLoading={loading}
        error={error}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={handleCancelDelete}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm"
          >
            <Card className="border border-slate-700 shadow-2xl">
              <CardBody className="p-6 space-y-4">
                <h2 className="text-lg font-bold text-slate-100">{t.dashboard.deleteGenogram}?</h2>
                <p className="text-slate-400">
                  {t.errors.deleteError}
                </p>
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="ghost"
                    onClick={handleCancelDelete}
                    disabled={deletingId === showDeleteConfirm}
                    className="flex-1"
                  >
                    {t.common.cancel}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleConfirmDelete(showDeleteConfirm)}
                    isLoading={deletingId === showDeleteConfirm}
                    className="flex-1"
                  >
                    {t.common.delete}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
});

DashboardContainer.displayName = 'DashboardContainer';
