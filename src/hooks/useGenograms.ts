/**
 * Central hook for genogram data management
 * Provides single source of truth for all genogram operations
 * Includes optimistic updates with rollback on failure
 */

import { useState, useCallback, useEffect, useReducer } from 'react';
import { Timestamp } from 'firebase/firestore';
import * as firestoreService from '../services/firestore';
import * as indexedDbService from '../services/indexedDbService';
import type { GenogramDocument } from '../services/firestore';

interface GenogramState {
  data: GenogramDocument[];
  loading: boolean;
  error: string | null;
  lastSync: number;
}

interface GenogramAction {
  type: 'FETCH_START' | 'FETCH_SUCCESS' | 'FETCH_ERROR' | 
         'CREATE_OPTIMISTIC' | 'DELETE_OPTIMISTIC' | 'ROLLBACK' |
         'UPDATE_SYNC';
  payload?: any;
}

const initialState: GenogramState = {
  data: [],
  loading: false,
  error: null,
  lastSync: 0,
};

function genogramReducer(state: GenogramState, action: GenogramAction): GenogramState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    
    case 'FETCH_SUCCESS':
      console.log('📥 Hook FETCH_SUCCESS received:', {
        genograms_count: action.payload?.length || 0,
        genograms: action.payload?.map((g: GenogramDocument) => ({
          id: g.id,
          title: g.title,
          people_count: g.people?.length || 0
        }))
      });
      return {
        ...state,
        data: action.payload || [],
        loading: false,
        error: null,
        lastSync: Date.now(),
      };
    
    case 'FETCH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload || 'Failed to load genograms',
      };
    
    case 'CREATE_OPTIMISTIC': {
      const newGenogram = action.payload;
      console.log('➕ CREATE_OPTIMISTIC:', {
        id: newGenogram.id,
        title: newGenogram.title,
        people_count: newGenogram.people?.length || 0
      });
      return {
        ...state,
        data: [newGenogram, ...state.data],
      };
    }
    
    case 'DELETE_OPTIMISTIC': {
      const id = action.payload;
      return {
        ...state,
        data: state.data.filter(g => g.id !== id),
      };
    }
    
    case 'ROLLBACK': {
      // Restore previous state
      return action.payload;
    }
    
    case 'UPDATE_SYNC':
      return {
        ...state,
        lastSync: Date.now(),
      };
    
    default:
      return state;
  }
}

export interface UseGenogramsReturn {
  genograms: GenogramDocument[];
  loading: boolean;
  error: string | null;
  lastSync: number;
  
  // Operations
  refresh: () => Promise<void>;
  createGenogram: (title: string, description?: string) => Promise<string>;
  deleteGenogram: (id: string) => Promise<void>;
  updateGenogram: (id: string, updates: Partial<GenogramDocument>) => Promise<void>;
  clearError: () => void;
}

/**
 * Main hook for genogram state management
 */
export function useGenograms(): UseGenogramsReturn {
  const [state, dispatch] = useReducer(genogramReducer, initialState);
  const [previousState, setPreviousState] = useState<GenogramState>(initialState);

  // Initial fetch and setup subscription
  useEffect(() => {
    const controller = new AbortController();
    
    const initializeData = async () => {
      try {
        console.log('🚀 useGenograms: Initializing...');
        
        dispatch({ type: 'FETCH_START' });
        
        // PRIORITY: Load from IndexedDB (instant, local-first, offline support)
        try {
          console.log('📚 useGenograms: Loading from IndexedDB...');
          const idbGenograms = await indexedDbService.getAllGenograms();
          
          if (idbGenograms && idbGenograms.length > 0) {
            console.log('✅ Loaded from IndexedDB:', idbGenograms.length, 'genograms', 
              idbGenograms.map((g: any) => ({ id: g.id, title: g.title, people: g.people?.length || 0 })));
            
            // Convert IndexedDB records to GenogramDocument format
            const genograms: GenogramDocument[] = idbGenograms.map((record: any) => ({
              id: record.id,
              userId: record.userId || 'local',
              title: record.title || 'Untitled Genogram',
              description: record.description || '',
              people: record.people || [],
              relations: record.relations || [],
              profiles: record.profiles || [],
              createdAt: record.createdAt ? new Date(record.createdAt) : new Date(0),
              updatedAt: record.updatedAt ? new Date(record.updatedAt) : new Date(),
              isPublic: record.isPublic || false,
              sharedWith: record.sharedWith || [],
            }));
            
            // Sort by updatedAt (newest first)
            genograms.sort((a, b) => {
              const aTime = new Date(a.updatedAt).getTime();
              const bTime = new Date(b.updatedAt).getTime();
              return bTime - aTime;
            });
            
            console.log('📊 useGenograms: Dispatching genograms:', genograms.length);
            dispatch({ type: 'FETCH_SUCCESS', payload: genograms });
            return; // Success! Don't need to try anything else
          }
        } catch (idbError) {
          console.warn('⚠️ Failed to load from IndexedDB:', idbError);
        }
        
        // FALLBACK: If IndexedDB empty, try to load from old localStorage format
        try {
          console.log('🔄 useGenograms: No IndexedDB data, trying localStorage fallback...');
          let genograms: GenogramDocument[] = [];
          
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('genogram-') && !key.includes('theme') && !key.includes('language') && !key.endsWith('data')) {
              const stored = localStorage.getItem(key);
              if (stored) {
                try {
                  const data = JSON.parse(stored);
                  if (!data.currentGenogramTitle) continue;
                  
                  const genogramId = key.replace('genogram-', '');
                  const genogramDoc: GenogramDocument = {
                    id: genogramId,
                    userId: 'local',
                    title: data.currentGenogramTitle || 'Untitled Genogram',
                    description: data.currentGenogramDescription || '',
                    people: data.people || [],
                    relations: data.relations || [],
                    profiles: data.profiles || [],
                    createdAt: null as any,
                    updatedAt: new Date(data.lastUpdated || Date.now()) as any,
                    isPublic: false,
                    sharedWith: [],
                  };
                  genograms.push(genogramDoc);
                } catch (parseError) {
                  // Skip invalid entries
                }
              }
            }
          }
          
          if (genograms.length > 0) {
            genograms.sort((a, b) => {
              const aTime = (a.updatedAt as any)?.getTime?.() || 0;
              const bTime = (b.updatedAt as any)?.getTime?.() || 0;
              return bTime - aTime;
            });
            
            console.log('✅ Refresh complete:', genograms.length, 'genograms from localStorage fallback');
            dispatch({ type: 'FETCH_SUCCESS', payload: genograms });
            return;
          }
        } catch (localError) {
          console.warn('Failed to load from localStorage:', localError);
        }
        
        // All sources failed - empty list
        console.log('📭 No genograms found anywhere');
        dispatch({ type: 'FETCH_SUCCESS', payload: [] });
      } catch (error) {
        console.error('Failed to load genograms:', error);
        dispatch({
          type: 'FETCH_ERROR',
          payload: error instanceof Error ? error.message : 'Failed to load genograms',
        });
      }
    };

    initializeData();

    return () => {
      controller.abort();
    };
  }, []);

  // Explicit refresh
  const refresh = useCallback(async () => {
    try {
      console.log('🔄 Refresh triggered from dashboard');
      dispatch({ type: 'FETCH_START' });
      
      // Load from IndexedDB (primary source)
      try {
        console.log('📚 Refresh: Loading from IndexedDB...');
        const idbGenograms = await indexedDbService.getAllGenograms();
        
        if (idbGenograms && idbGenograms.length > 0) {
          console.log('✅ Refresh complete:', idbGenograms.length, 'genograms from IndexedDB');
          
          // Convert to GenogramDocument format
          const genograms: GenogramDocument[] = idbGenograms.map((record: any) => ({
            id: record.id,
            userId: record.userId || 'local',
            title: record.title || 'Untitled Genogram',
            description: record.description || '',
            people: record.people || [],
            relations: record.relations || [],
            profiles: record.profiles || [],
            createdAt: record.createdAt ? new Date(record.createdAt) : new Date(0),
            updatedAt: record.updatedAt ? new Date(record.updatedAt) : new Date(),
            isPublic: record.isPublic || false,
            sharedWith: record.sharedWith || [],
          }));
          
          // Deduplicate by ID (keep only the most recent version)
          const uniqueGenograms = Array.from(
            new Map(genograms.map(g => [g.id, g])).values()
          );
          
          // Sort by updatedAt (newest first)
          uniqueGenograms.sort((a, b) => {
            const aTime = new Date(a.updatedAt).getTime();
            const bTime = new Date(b.updatedAt).getTime();
            return bTime - aTime;
          });
          
          dispatch({ type: 'FETCH_SUCCESS', payload: uniqueGenograms });
          return;
        }
      } catch (idbError) {
        console.warn('⚠️ Failed to load from IndexedDB in refresh:', idbError);
      }
      
      // FALLBACK: If IndexedDB empty, try localStorage
      let genograms: GenogramDocument[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('genogram-') && !key.endsWith('genogram-data') && !key.includes('theme') && !key.includes('language')) {
          const stored = localStorage.getItem(key);
          if (stored) {
            try {
              const data = JSON.parse(stored);
              const genogramId = key.replace('genogram-', '');
              const genogramDoc: GenogramDocument = {
                id: genogramId,
                userId: 'local',
                title: data.currentGenogramTitle || 'Untitled Genogram',
                description: data.currentGenogramDescription || '',
                people: data.people || [],
                relations: data.relations || [],
                profiles: data.profiles || [],
                createdAt: null as any,
                updatedAt: new Date(data.lastUpdated || Date.now()) as any,
                isPublic: false,
                sharedWith: [],
              };
              genograms.push(genogramDoc);
            } catch (parseError) {
              console.warn('Failed to parse genogram:', key);
            }
          }
        }
      }
      
      // Deduplicate by ID
      const uniqueGenograms = Array.from(
        new Map(genograms.map(g => [g.id, g])).values()
      );
      
      // Sort by newest (descending order)
      uniqueGenograms.sort((a, b) => {
        const aTime = (a.updatedAt as any)?.getTime?.() || 0;
        const bTime = (b.updatedAt as any)?.getTime?.() || 0;
        return bTime - aTime; // descending order (newest first)
      });
      
      console.log('✅ Refresh complete:', uniqueGenograms.length, 'genograms from localStorage fallback');
      dispatch({ type: 'FETCH_SUCCESS', payload: uniqueGenograms });
    } catch (error) {
      console.error('❌ Refresh error:', error);
      dispatch({
        type: 'FETCH_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to refresh',
      });
    }
  }, []);

  // Create new genogram
  const createGenogram = useCallback(
    async (title: string, description?: string): Promise<string> => {
      try {
        console.log('➕ Creating genogram:', title);
        // Create on server first
        const genogram = await firestoreService.createGenogram(
          title,
          { people: [], relations: [], profiles: [] },
          description
        );

        console.log('✅ Genogram created with ID:', genogram.id);

        // Add to local state optimistically (will be confirmed by real-time listener)
        const newGenogram: GenogramDocument = {
          id: genogram.id,
          userId: genogram.userId,
          title,
          description: description || '',
          people: [],
          relations: [],
          profiles: [],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          isPublic: false,
          sharedWith: [],
        };

        dispatch({ type: 'CREATE_OPTIMISTIC', payload: newGenogram });

        return genogram.id;
      } catch (error) {
        console.error('❌ Failed to create genogram:', error);
        dispatch({
          type: 'FETCH_ERROR',
          payload: error instanceof Error ? error.message : 'Failed to create genogram',
        });
        throw error;
      }
    },
    []
  );

  // Delete genogram
  const deleteGenogram = useCallback(
    async (id: string): Promise<void> => {
      try {
        console.log('🗑️ deleteGenogram START:', id);
        
        // Save previous state for rollback
        setPreviousState(state);

        // Optimistic delete from UI
        console.log('➖ DELETE_OPTIMISTIC - removing from UI');
        dispatch({ type: 'DELETE_OPTIMISTIC', payload: id });

        // Delete from IndexedDB (primary storage)
        console.log('💾 Deleting from IndexedDB...');
        try {
          await indexedDbService.deleteGenogram(id);
          console.log('✅ Deleted from IndexedDB');
        } catch (idbError) {
          console.warn('⚠️ Failed to delete from IndexedDB:', idbError);
        }

        // Remove from localStorage (legacy fallback)
        console.log('🗑️ Removing from localStorage...');
        localStorage.removeItem(`genogram-${id}`);
        console.log('✅ Removed from localStorage');

        // Try to delete from Firestore (if available, but don't fail if it doesn't work)
        try {
          console.log('🌐 Attempting to delete from Firestore...');
          await firestoreService.deleteGenogram(id);
          console.log('✅ Deleted from Firestore');
        } catch (firebaseError) {
          console.warn('⚠️ Firestore delete failed (offline OK):', firebaseError);
          // Don't throw - we already deleted locally
        }

        console.log('✅ deleteGenogram COMPLETE');
      } catch (error) {
        console.error('❌ deleteGenogram ERROR:', error);
        // Rollback on error
        dispatch({ type: 'ROLLBACK', payload: previousState });
        dispatch({
          type: 'FETCH_ERROR',
          payload: error instanceof Error ? error.message : 'Failed to delete genogram',
        });
        throw error;
      }
    },
    [state, previousState]
  );

  // Update genogram (for metadata like title, description)
  const updateGenogram = useCallback(
    async (id: string, updates: Partial<GenogramDocument>): Promise<void> => {
      try {
        // Call server
        await firestoreService.saveGenogramData(
          id,
          updates.title || '',
          {
            people: updates.people || [],
            relations: updates.relations || [],
            profiles: updates.profiles || [],
          },
          updates.description
        );

        // State will be updated by real-time listener
      } catch (error) {
        dispatch({
          type: 'FETCH_ERROR',
          payload: error instanceof Error ? error.message : 'Failed to update genogram',
        });
        throw error;
      }
    },
    []
  );

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'FETCH_ERROR', payload: null });
  }, []);

  return {
    genograms: state.data,
    loading: state.loading,
    error: state.error,
    lastSync: state.lastSync,
    refresh,
    createGenogram,
    deleteGenogram,
    updateGenogram,
    clearError,
  };
}
