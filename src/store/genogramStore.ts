import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Person, Relation, GenogramData, PersonProfile, RelationType, HealthRecord, MedicationRecord } from '../types/genogram';
import type { Timestamp } from 'firebase/firestore';
import * as indexedDbService from '../services/indexedDbService';
import { devLog, devWarn, devError } from '../utils/errors';
import { 
  applySiblingAlignment, 
  applyPartnerAlignment,
} from '../utils/alignment';
import { validateGenogram, type ValidationResult } from '../utils/genogramValidation';
import { 
  detectSiblingGroups, 
  toggleGroupCollapse,
  type SiblingGroup 
} from '../utils/siblingCollapse';

// Helper function to check if a relation type is a sibling relation
const isSiblingRelationType = (type: RelationType): boolean => {
  return ['biological-sibling', 'half-sibling', 'full-sibling', 'twin', 'fraternal-twin', 'identical-twin', 'step-sibling'].includes(type);
};

export interface GenogramDocument extends GenogramData {
  id: string;
  userId: string;
  title: string;
  description?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  isPublic: boolean;
  sharedWith: string[];
}

interface GenogramState {
  // Current editing state
  people: Person[];
  relations: Relation[];
  profiles: PersonProfile[];
  currentGenogramId: string | null;
  currentGenogramTitle: string;
  currentGenogramDescription: string;
  lastRelationSourceId: string | null; // For UX: remember last "from" person in relations
  
  // Sibling collapse state
  siblingGroups: Map<string, SiblingGroup>;
  
  // Validation state
  validationResult: ValidationResult | null;
  
  // Dashboard state
  allGenograms: GenogramDocument[];
  isLoading: boolean;
  error: string | null;
  lastSyncTime: number;
  
  // Local actions
  addPerson: (person: Person) => void;
  updatePerson: (id: string, updates: Partial<Person>) => void;
  removePerson: (id: string) => void;
  
  addRelation: (relation: Relation) => void;
  removeRelation: (id: string) => void;
  
  addProfile: (profile: PersonProfile) => void;
  updateProfile: (id: string, updates: Partial<PersonProfile>) => void;
  getProfileByPersonId: (personId: string) => PersonProfile | undefined;
  
  // Health management actions
  addHealthRecord: (personId: string, record: HealthRecord) => void;
  updateHealthRecord: (personId: string, recordId: string, updates: Partial<HealthRecord>) => void;
  removeHealthRecord: (personId: string, recordId: string) => void;
  
  addMedicationRecord: (personId: string, record: MedicationRecord) => void;
  updateMedicationRecord: (personId: string, recordId: string, updates: Partial<MedicationRecord>) => void;
  removeMedicationRecord: (personId: string, recordId: string) => void;
  
  // Principal person management
  setPrincipalPerson: (personId: string) => void;
  
  // Sibling collapse actions
  recalculateSiblingGroups: () => void;
  toggleSiblingGroupCollapse: (groupId: string) => void;
  
  setGenogram: (data: GenogramData) => void;
  
  // Validation actions
  validateCurrentGenogram: () => void;
  clearValidation: () => void;
  
  // Firestore sync actions
  setCurrentGenogramId: (id: string | null) => void;
  setCurrentGenogramTitle: (title: string) => void;
  setCurrentGenogramDescription: (description: string) => void;
  setAllGenograms: (genograms: GenogramDocument[]) => void;
  loadAllGenograms: () => Promise<void>;
  loadGenogram: (id: string) => Promise<void>;
  createNewGenogram: (title: string, description?: string) => Promise<string>;
  saveCurrentGenogram: () => Promise<void>;
  deleteGenogram: (id: string) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

const STORAGE_KEY = 'genogram-data';

export const useGenogramStore = create<GenogramState>()(
  persist(
    (set, get) => ({
      // Initial state
      people: [],
      relations: [],
      profiles: [],
      currentGenogramId: null,
      currentGenogramTitle: 'Untitled Genogram',
      currentGenogramDescription: '',
      lastRelationSourceId: null,
      siblingGroups: new Map(),
      validationResult: null,
      allGenograms: [],
      isLoading: false,
      error: null,
      lastSyncTime: 0,

      // Local actions
      addPerson: (person) => {
        set((state) => ({ people: [...state.people, person] }));
        // Auto-save in background (don't wait)
        setTimeout(() => {
          get().saveCurrentGenogram().catch(err => console.warn('Auto-save failed:', err));
        }, 0);
      },
      
      updatePerson: (id, updates) => {
        set((state) => {
          // If trying to set isPrincipal to true, validate there's no other principal
          if (updates.isPrincipal === true) {
            const currentPrincipal = state.people.find(p => p.isPrincipal && p.id !== id);
            if (currentPrincipal) {
              console.warn('Cannot set principal: another principal already exists. Delete current principal first.');
              return { people: state.people };
            }
          }
          
          return {
            people: state.people.map((p) => (p.id === id ? { ...p, ...updates } : p)),
          };
        });
        // Auto-save in background
        setTimeout(() => {
          get().saveCurrentGenogram().catch(err => console.warn('Auto-save failed:', err));
        }, 0);
      },
      
      removePerson: (id) => {
        set((state) => ({
          people: state.people.filter((p) => p.id !== id),
          relations: state.relations.filter((r) => r.sourceId !== id && r.targetId !== id),
          profiles: state.profiles.filter((prof) => prof.personId !== id),
        }));
        // Auto-save in background
        setTimeout(() => {
          get().saveCurrentGenogram().catch(err => console.warn('Auto-save failed:', err));
        }, 0);
      },

      addRelation: (relation) => {
        set((state) => {
          let updatedRelations = [...state.relations];
          const updatedPeople = [...state.people];
          
          // Prevent self-relations
          if (relation.sourceId === relation.targetId) {
            console.warn('Cannot create self-relation');
            return { 
              relations: updatedRelations,
              people: updatedPeople,
              lastRelationSourceId: relation.sourceId,
            };
          }
          
          // Check if relation already exists to avoid duplicates
          const relationExists = updatedRelations.some(
            r => r.sourceId === relation.sourceId && r.targetId === relation.targetId && r.type === relation.type
          );
          
          if (relationExists) {
            return { 
              relations: updatedRelations,
              people: updatedPeople,
              lastRelationSourceId: relation.sourceId,
            };
          }
          
          // Add the main relation
          updatedRelations = [...updatedRelations, relation];
          
          // Helper function to check if two people are already connected
          const areConnected = (personA: string, personB: string, relType?: RelationType): boolean => {
            if (!relType) {
              // Any connection
              return updatedRelations.some(
                r => (r.sourceId === personA && r.targetId === personB) ||
                     (r.sourceId === personB && r.targetId === personA)
              );
            }
            // Specific type connection
            return updatedRelations.some(
              r => (r.sourceId === personA && r.targetId === personB && r.type === relType) ||
                   (r.sourceId === personB && r.targetId === personA && r.type === relType)
            );
          };
          
          // Auto-create sibling relations (BIDIRECTIONAL)
          if (isSiblingRelationType(relation.type)) {
            // Find all existing siblings of relation.targetId
            const existingSiblingsOfTarget = new Set<string>();
            updatedRelations
              .filter(r => isSiblingRelationType(r.type))
              .forEach(r => {
                if (r.sourceId === relation.targetId) existingSiblingsOfTarget.add(r.targetId);
                if (r.targetId === relation.targetId) existingSiblingsOfTarget.add(r.sourceId);
              });
            
            // Find all existing siblings of relation.sourceId
            const existingSiblingsOfSource = new Set<string>();
            updatedRelations
              .filter(r => isSiblingRelationType(r.type) && !(r.sourceId === relation.sourceId && r.targetId === relation.targetId))
              .forEach(r => {
                if (r.sourceId === relation.sourceId) existingSiblingsOfSource.add(r.targetId);
                if (r.targetId === relation.sourceId) existingSiblingsOfSource.add(r.sourceId);
              });
            
            // Connect sourceId to all siblings of targetId (avoid duplicates)
            existingSiblingsOfTarget.forEach(siblingId => {
              if (siblingId !== relation.sourceId && !areConnected(relation.sourceId, siblingId, relation.type)) {
                updatedRelations.push({
                  id: `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  sourceId: relation.sourceId,
                  targetId: siblingId,
                  type: relation.type,
                });
              }
            });
            
            // Connect targetId to all siblings of sourceId (avoid duplicates)
            existingSiblingsOfSource.forEach(siblingId => {
              if (siblingId !== relation.targetId && !areConnected(relation.targetId, siblingId, relation.type)) {
                updatedRelations.push({
                  id: `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  sourceId: relation.targetId,
                  targetId: siblingId,
                  type: relation.type,
                });
              }
            });
            
            // Create the inverse relation for full bidirectionality
            const inverseExists = updatedRelations.some(
              r => r.sourceId === relation.targetId && r.targetId === relation.sourceId && r.type === relation.type
            );
            
            if (!inverseExists) {
              updatedRelations.push({
                id: `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                sourceId: relation.targetId,
                targetId: relation.sourceId,
                type: relation.type,
              });
            }
            
            // Get all siblings for alignment
            const allSiblings = new Set<string>();
            updatedRelations
              .filter(r => isSiblingRelationType(r.type))
              .forEach(r => {
                if (r.sourceId === relation.sourceId) allSiblings.add(r.targetId);
                if (r.targetId === relation.sourceId) allSiblings.add(r.sourceId);
              });
            
            if (allSiblings.size > 0) {
              const alignedPositions = applySiblingAlignment(
                [relation.sourceId, ...Array.from(allSiblings)],
                updatedPeople,
                updatedRelations
              );
              
              updatedPeople.forEach(person => {
                if (alignedPositions.has(person.id)) {
                  person.position = alignedPositions.get(person.id);
                }
              });
            }
          } 
          // Auto-connect parents to all children
          else if (relation.type === 'parent-child' || relation.type === 'adoptive-parent' || relation.type === 'foster-parent') {
            const parent = relation.sourceId;
            const child = relation.targetId;
            
            // Find all children of this parent
            const siblingIds = new Set<string>();
            updatedRelations
              .filter(r => ['parent-child', 'adoptive-parent', 'foster-parent'].includes(r.type))
              .filter(r => r.sourceId === parent && r.targetId !== child)
              .forEach(r => siblingIds.add(r.targetId));
            
            // Connect new child to all existing children (siblings)
            siblingIds.forEach(siblingId => {
              // Check both directions to avoid duplicates
              const forwardExists = updatedRelations.some(
                r => r.sourceId === child && r.targetId === siblingId && isSiblingRelationType(r.type)
              );
              const backwardExists = updatedRelations.some(
                r => r.sourceId === siblingId && r.targetId === child && isSiblingRelationType(r.type)
              );
              
              if (!forwardExists) {
                updatedRelations.push({
                  id: `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  sourceId: child,
                  targetId: siblingId,
                  type: 'biological-sibling',
                });
              }
              
              if (!backwardExists) {
                updatedRelations.push({
                  id: `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  sourceId: siblingId,
                  targetId: child,
                  type: 'biological-sibling',
                });
              }
            });
            
            // Find other parents of this child and connect new parent to their children
            const otherParents = new Set<string>();
            updatedRelations
              .filter(r => ['parent-child', 'adoptive-parent', 'foster-parent'].includes(r.type))
              .filter(r => r.targetId === child && r.sourceId !== parent)
              .forEach(r => otherParents.add(r.sourceId));
            
            otherParents.forEach(otherParent => {
              // Get all children of other parent
              updatedRelations
                .filter(r => ['parent-child', 'adoptive-parent', 'foster-parent'].includes(r.type))
                .filter(r => r.sourceId === otherParent)
                .forEach(r => {
                  const otherChild = r.targetId;
                  
                  // Check if new parent is already connected to this child
                  const alreadyConnected = updatedRelations.some(
                    rel => ['parent-child', 'adoptive-parent', 'foster-parent'].includes(rel.type) &&
                           rel.sourceId === parent && rel.targetId === otherChild
                  );
                  
                  if (!alreadyConnected) {
                    updatedRelations.push({
                      id: `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                      sourceId: parent,
                      targetId: otherChild,
                      type: relation.type,
                    });
                  }
                });
            });
          }
          else if (relation.type === 'partner') {
            // Apply partner alignment
            const alignedPositions = applyPartnerAlignment(
              relation.sourceId,
              relation.targetId,
              updatedPeople
            );
            
            // Update people with new positions
            updatedPeople.forEach(person => {
              if (alignedPositions.has(person.id)) {
                person.position = alignedPositions.get(person.id);
              }
            });
          }
          
          return { 
            relations: updatedRelations,
            people: updatedPeople,
            lastRelationSourceId: relation.sourceId,
          };
        });
        // Recalculate sibling groups after adding relation
        setTimeout(() => {
          get().recalculateSiblingGroups();
          get().saveCurrentGenogram().catch(err => console.warn('Auto-save failed:', err));
        }, 0);
      },
      
      removeRelation: (id) => {
        set((state) => ({
          relations: state.relations.filter((r) => r.id !== id),
        }));
        // Recalculate sibling groups after removing relation
        setTimeout(() => {
          get().recalculateSiblingGroups();
          get().saveCurrentGenogram().catch(err => console.warn('Auto-save failed:', err));
        }, 0);
      },

      addProfile: (profile) => {
        set((state) => {
          const filteredProfiles = state.profiles.filter((p) => p.personId !== profile.personId);
          return { profiles: [...filteredProfiles, profile] };
        });
        // Auto-save in background
        setTimeout(() => {
          get().saveCurrentGenogram().catch(err => console.warn('Auto-save failed:', err));
        }, 0);
      },

      updateProfile: (id, updates) => {
        set((state) => ({
          profiles: state.profiles.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }));
        // Auto-save in background
        setTimeout(() => {
          get().saveCurrentGenogram().catch(err => console.warn('Auto-save failed:', err));
        }, 0);
      },

      getProfileByPersonId: (personId) => {
        const state = get();
        return state.profiles.find((p) => p.personId === personId);
      },

      // Health management actions
      addHealthRecord: (personId, record) => {
        set((state) => ({
          people: state.people.map(person => 
            person.id === personId
              ? { ...person, healthHistory: [...(person.healthHistory || []), record] }
              : person
          ),
        }));
        // Auto-save in background
        setTimeout(() => {
          get().saveCurrentGenogram().catch(err => console.warn('Auto-save failed:', err));
        }, 0);
      },

      updateHealthRecord: (personId, recordId, updates) => {
        set((state) => ({
          people: state.people.map(person => 
            person.id === personId
              ? {
                  ...person,
                  healthHistory: (person.healthHistory || []).map(record =>
                    record.id === recordId ? { ...record, ...updates } : record
                  ),
                }
              : person
          ),
        }));
        // Auto-save in background
        setTimeout(() => {
          get().saveCurrentGenogram().catch(err => console.warn('Auto-save failed:', err));
        }, 0);
      },

      removeHealthRecord: (personId, recordId) => set((state) => ({
        people: state.people.map(person => 
          person.id === personId
            ? { ...person, healthHistory: (person.healthHistory || []).filter(r => r.id !== recordId) }
            : person
        ),
      })),

      addMedicationRecord: (personId, record) => set((state) => ({
        people: state.people.map(person => 
          person.id === personId
            ? { ...person, medications: [...(person.medications || []), record] }
            : person
        ),
      })),

      updateMedicationRecord: (personId, recordId, updates) => set((state) => ({
        people: state.people.map(person => 
          person.id === personId
            ? {
                ...person,
                medications: (person.medications || []).map(record =>
                  record.id === recordId ? { ...record, ...updates } : record
                ),
              }
            : person
        ),
      })),

      removeMedicationRecord: (personId, recordId) => set((state) => ({
        people: state.people.map(person => 
          person.id === personId
            ? { ...person, medications: (person.medications || []).filter(r => r.id !== recordId) }
            : person
        ),
      })),

      setGenogram: (data) => set({ 
        people: data.people, 
        relations: data.relations,
        profiles: data.profiles || [],
        lastRelationSourceId: null, // Reset when loading new genogram
      }),

      // Principal person management
      setPrincipalPerson: (personId: string) => {
        set((state) => {
          // Find if there's already a principal
          const currentPrincipal = state.people.find(p => p.isPrincipal && p.id !== personId);
          
          if (currentPrincipal) {
            console.warn('Cannot set principal: another principal already exists. Delete current principal first.');
            return state;
          }

          // Set the new principal and remove principal from all others
          return {
            people: state.people.map(p => ({
              ...p,
              isPrincipal: p.id === personId ? true : false
            }))
          };
        });
        // Auto-save in background
        setTimeout(() => {
          get().saveCurrentGenogram().catch(err => console.warn('Auto-save failed:', err));
        }, 0);
      },

      // Sibling collapse actions
      recalculateSiblingGroups: () => {
        const state = get();
        const principalId = state.people.find(p => p.isPrincipal)?.id;
        const groups = detectSiblingGroups(state.people, state.relations, principalId);
        set({ siblingGroups: groups });
        devLog('GenogramStore', `Recalculated ${groups.size} sibling groups`);
      },

      toggleSiblingGroupCollapse: (groupId: string) => {
        const state = get();
        const newGroups = toggleGroupCollapse(groupId, state.siblingGroups);
        set({ siblingGroups: newGroups });
        devLog('GenogramStore', `Toggled collapse for group ${groupId}`);
      },

      // Validation actions
      validateCurrentGenogram: () => {
        const state = get();
        const result = validateGenogram(state.people, state.relations);
        set({ validationResult: result });
        
        // Log validation results
        if (result.errors.length > 0) {
          devWarn('GenogramStore', `Found ${result.errors.length} validation errors:`);
          result.errors.forEach((error) => {
            devWarn('GenogramStore', `  - ${error.message}`);
          });
        }
        if (result.warnings.length > 0) {
          devLog('GenogramStore', `Found ${result.warnings.length} validation warnings:`);
          result.warnings.forEach((warning) => {
            devLog('GenogramStore', `  - ${warning.message}`);
          });
        }
      },

      clearValidation: () => set({ validationResult: null }),

      // Firestore sync actions
      setCurrentGenogramId: (id) => set({ currentGenogramId: id }),
      
      setCurrentGenogramTitle: (title) => set({ currentGenogramTitle: title }),
      
      setCurrentGenogramDescription: (description) => set({ currentGenogramDescription: description }),

      setAllGenograms: (genograms) => set({ allGenograms: genograms, lastSyncTime: Date.now() }),

      loadAllGenograms: async () => {
        set({ error: null, isLoading: true });
        try {
          // Load all genograms from IndexedDB (local storage)
          const allGenograms = await indexedDbService.getAllGenograms();
          
          // Convert to GenogramDocument format
          const genogramDocuments: GenogramDocument[] = allGenograms.map((g) => ({
            id: g.id,
            userId: g.userId || 'local',
            title: g.title,
            description: g.description || '',
            people: g.people || [],
            relations: g.relations || [],
            profiles: g.profiles || [],
            createdAt: new Date(g.createdAt),
            updatedAt: new Date(g.updatedAt),
            isPublic: false,
            sharedWith: [],
          }));

          // Sort by updatedAt descending (most recent first)
          const getTimeValue = (date: Date | Timestamp): number => {
            return date instanceof Date ? date.getTime() : (date as any).toMillis?.() ?? 0;
          };
          genogramDocuments.sort((a, b) => getTimeValue(b.updatedAt) - getTimeValue(a.updatedAt));

          set({ 
            allGenograms: genogramDocuments, 
            isLoading: false,
            lastSyncTime: Date.now()
          });

          devLog('GenogramStore', `✅ Loaded ${genogramDocuments.length} genograms from IndexedDB`);
        } catch (error) {
          set({ 
            error: 'Failed to load genograms',
            isLoading: false 
          });
          devError('GenogramStore', 'Error loading genograms from IndexedDB', error instanceof Error ? error : new Error(String(error)));
        }
      },

      loadGenogram: async (id) => {
        set({ isLoading: true, error: null });
        try {
          // ===== STEP 0: Check if already loaded in Zustand =====
          const currentState = get();
          if (currentState.currentGenogramId === id && currentState.people.length > 0) {
            devLog('GenogramStore', `✅ Already loaded in memory: ${id}`);
            set({ isLoading: false });
            return;
          }

          // ===== Load from IndexedDB (instant local access) =====
          const genogram = await indexedDbService.getGenogram(id);

          if (genogram) {
            set({
              currentGenogramId: id,
              currentGenogramTitle: genogram.title,
              currentGenogramDescription: genogram.description || '',
              people: genogram.people || [],
              relations: genogram.relations || [],
              profiles: genogram.profiles || [],
              isLoading: false,
              error: null,
            });

            devLog('GenogramStore', `✅ Loaded genogram from IndexedDB: ${genogram.title} (${genogram.people.length} members)`);
          } else {
            set({
              error: 'Genogram not found locally',
              isLoading: false,
            });

            devWarn('GenogramStore', `Genogram not found: ${id}`);
          }
        } catch (error) {
          let errorMsg = 'Failed to load genogram';
          if (error instanceof Error) {
            errorMsg = error.message;
          }
          set({ error: errorMsg, isLoading: false });
          console.error('Error loading genogram:', error);
        }
      },

      createNewGenogram: async (title, description = '') => {
        set({ isLoading: true, error: null });
        try {
          // Generate a unique ID locally
          const newGenogramId = `genogram_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          console.log('🔧 createNewGenogram START:', { title, newGenogramId });
          
          // Save immediately to IndexedDB
          console.log('💾 Saving to IndexedDB...');
          await indexedDbService.saveGenogram(newGenogramId, {
            title,
            description,
            people: [],
            relations: [],
            profiles: [],
          });
          console.log('✅ Saved to IndexedDB successfully');

          // Update store state IMMEDIATELY
          console.log('📝 Updating store state...');
          set({
            currentGenogramId: newGenogramId,
            currentGenogramTitle: title,
            currentGenogramDescription: description,
            people: [],
            relations: [],
            profiles: [],
            isLoading: false,
            error: null,
          });
          console.log('✅ Store updated');

          devLog('GenogramStore', `✅ Created new genogram: ${title} (${newGenogramId})`);
          console.log('🎉 Returning ID:', newGenogramId);

          return newGenogramId;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Failed to create genogram';
          console.error('❌ Error in createNewGenogram:', error);
          set({ error: errorMsg, isLoading: false });
          throw error;
        }
      },

      saveCurrentGenogram: async () => {
        const state = get();
        if (!state.currentGenogramId) {
          set({ error: 'No genogram selected' });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          // Save to IndexedDB (instant, local-first)
          await indexedDbService.saveGenogram(state.currentGenogramId, {
            title: state.currentGenogramTitle,
            description: state.currentGenogramDescription,
            people: state.people,
            relations: state.relations,
            profiles: state.profiles,
          });

          devLog('GenogramStore', `✅ Saved to IndexedDB: ${state.currentGenogramTitle}`);

          // Update allGenograms in state
          set((state) => {
            const existingIndex = state.allGenograms.findIndex((g) => g.id === state.currentGenogramId);
            if (existingIndex >= 0) {
              // Update existing
              const updated = [...state.allGenograms];
              updated[existingIndex] = {
                ...updated[existingIndex],
                title: state.currentGenogramTitle,
                description: state.currentGenogramDescription,
                people: state.people,
                relations: state.relations,
                profiles: state.profiles,
                updatedAt: new Date(),
              };
              return {
                allGenograms: updated,
                lastSyncTime: Date.now(),
              };
            } else {
              // Add new
              return {
                allGenograms: [
                  ...state.allGenograms,
                  {
                    id: state.currentGenogramId!,
                    userId: 'local',
                    title: state.currentGenogramTitle,
                    description: state.currentGenogramDescription,
                    people: state.people,
                    relations: state.relations,
                    profiles: state.profiles,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isPublic: false,
                    sharedWith: [],
                  },
                ],
                lastSyncTime: Date.now(),
              };
            }
          });

          // Run validation on current genogram
          get().validateCurrentGenogram();
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Failed to save genogram';
          set({ error: `Save failed: ${errorMsg}`, isLoading: false });
          devError('GenogramStore', 'Error saving genogram to IndexedDB', error instanceof Error ? error : new Error(String(error)));
        } finally {
          set({ isLoading: false });
        }
      },

      deleteGenogram: async (id) => {
        set({ isLoading: true, error: null });
        try {
          // Delete from IndexedDB
          await indexedDbService.deleteGenogram(id);
          
          // Update state - remove from allGenograms
          set((state) => ({
            allGenograms: state.allGenograms.filter((g) => g.id !== id),
            currentGenogramId: state.currentGenogramId === id ? null : state.currentGenogramId,
            ...(state.currentGenogramId === id && {
              people: [],
              relations: [],
              profiles: [],
            }),
            lastSyncTime: Date.now(),
          }));

          devLog('GenogramStore', `✅ Deleted genogram: ${id}`);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Failed to delete genogram';
          set({ error: errorMsg });
          devError('GenogramStore', 'Error deleting genogram', error instanceof Error ? error : new Error(String(error)));
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
      
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        // DON'T persist people/relations/profiles - they're persisted per-genogram
        // Only persist metadata
        currentGenogramId: state.currentGenogramId,
        currentGenogramTitle: state.currentGenogramTitle,
        currentGenogramDescription: state.currentGenogramDescription,
        lastRelationSourceId: state.lastRelationSourceId,
        // Don't persist: people, relations, profiles, allGenograms, isLoading, error, lastSyncTime
      }),

      storage: {
        getItem: (name: string) => {
          try {
            const item = localStorage.getItem(name);
            return item ? JSON.parse(item) : null;
          } catch (error) {
            console.warn('Failed to parse localStorage item:', error);
            return null;
          }
        },
        setItem: (name: string, value: any) => {
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch (error) {
            console.error('Failed to save to localStorage:', error);
          }
        },
        removeItem: (name: string) => {
          try {
            localStorage.removeItem(name);
          } catch (error) {
            console.error('Failed to remove from localStorage:', error);
          }
        },
      },
    }
  )
);

// Memoized selectors to prevent unnecessary re-renders
export const useGenogramPeople = () => useGenogramStore(state => state.people);
export const useGenogramRelations = () => useGenogramStore(state => state.relations);
export const useGenogramProfiles = () => useGenogramStore(state => state.profiles);
export const useCurrentGenogramId = () => useGenogramStore(state => state.currentGenogramId);
export const useCurrentGenogramTitle = () => useGenogramStore(state => state.currentGenogramTitle);
export const useAllGenograms = () => useGenogramStore(state => state.allGenograms);
export const useGenogramLoading = () => useGenogramStore(state => state.isLoading);
export const useGenogramError = () => useGenogramStore(state => state.error);
