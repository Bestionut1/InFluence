import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import type { GenogramData } from '../types/genogram';

export interface GenogramDocument extends GenogramData {
  id: string;
  userId: string;
  title: string;
  description?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isPublic: boolean;
  sharedWith: string[]; // User IDs
}

/**
 * Helper: Check if error is offline-related
 */
function isOfflineError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return msg.includes('offline') || 
           msg.includes('client is offline') ||
           msg.includes('network') ||
           msg.includes('connection');
  }
  return false;
}

/**
 * Check actual network connectivity with real HTTP test
 * Fixes: navigator.onLine can lag 30+ seconds after actual connection
 * Returns true only if real connection verified
 */
async function checkRealConnectivity(): Promise<boolean> {
  // Quick check first
  if (!navigator.onLine) {
    return false;
  }

  // Verify with actual HTTP connectivity test
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    // Use a Google endpoint that returns 204 No Content
    const response = await fetch('https://www.google.com/generate_204', {
      method: 'HEAD',
      cache: 'no-cache',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.status === 204;
  } catch (error) {
    return false;
  }
}

/**
 * Helper: Wait for online status with real connectivity verification
 * Returns true if online within timeout, false if timeout
 * 
 * FIXED: Now uses actual HTTP connectivity test instead of just navigator.onLine
 * This fixes the bug where app shows "offline" 30+ seconds after reconnecting
 */
export async function waitForOnline(timeoutMs: number = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    // Check actual connectivity first
    checkRealConnectivity().then((isOnline) => {
      if (isOnline) {
        resolve(true);
        return;
      }

      // Not online yet, listen for online event
      const handleOnline = async () => {
        window.removeEventListener('online', handleOnline);
        clearTimeout(timeoutId);
        
        // Verify actual connectivity on online event
        const realOnline = await checkRealConnectivity();
        resolve(realOnline);
      };

      const timeoutId = setTimeout(() => {
        window.removeEventListener('online', handleOnline);
        // Final check before timeout
        checkRealConnectivity().then(resolve);
      }, timeoutMs);

      window.addEventListener('online', handleOnline);
    });
  });
}

/**
 * Get current user ID from Firebase Auth
 */
function getCurrentUserId(): string {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('User not authenticated');
  return userId;
}

/**
 * Create a new genogram in Firestore
 */
export async function createGenogram(
  title: string,
  data: GenogramData,
  description: string = ''
): Promise<GenogramDocument> {
  const userId = getCurrentUserId();
  const genogramId = `genogram_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const genogramDoc: GenogramDocument = {
    id: genogramId,
    userId,
    title,
    description,
    people: data.people,
    relations: data.relations,
    profiles: data.profiles || [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    isPublic: false,
    sharedWith: [],
  };

  console.log('📝 Creating genogram:', {
    id: genogramId,
    title,
    people_count: data.people?.length || 0,
    relations_count: data.relations?.length || 0,
    profiles_count: (data.profiles || []).length,
    full_data: genogramDoc
  });

  await setDoc(doc(db, 'genograms', genogramId), genogramDoc);
  
  console.log('✅ Genogram created successfully in Firestore');
  
  return genogramDoc;
}

/**
 * Get a specific genogram by ID
 */
export async function getGenogram(genogramId: string): Promise<GenogramDocument | null> {
  const userId = getCurrentUserId();
  
  try {
    const docSnap = await getDoc(doc(db, 'genograms', genogramId));
    
    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data() as GenogramDocument;
    
    // Check if user owns this genogram or it's shared with them
    if (data.userId !== userId && !data.sharedWith.includes(userId)) {
      throw new Error('Access denied');
    }

    return data;
  } catch (error) {
    console.error('Error fetching genogram:', error);
    throw error;
  }
}

/**
 * Get all genograms for current user
 */
export async function getUserGenograms(): Promise<GenogramDocument[]> {
  const userId = getCurrentUserId();

  try {
    const q = query(
      collection(db, 'genograms'),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const genograms: GenogramDocument[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as GenogramDocument;
      genograms.push(data);
    });

    // Sort by newest first
    const sorted = genograms.sort((a, b) => 
      b.updatedAt.toMillis() - a.updatedAt.toMillis()
    );

    console.log('📊 Fetched genograms from Firestore:', {
      total: sorted.length,
      items: sorted.map(g => ({
        id: g.id,
        title: g.title,
        people_count: g.people?.length || 0,
        relations_count: g.relations?.length || 0,
        profiles_count: g.profiles?.length || 0
      }))
    });

    return sorted;
  } catch (error) {
    console.error('Error fetching user genograms:', error);
    throw error;
  }
}

/**
 * Update a genogram in Firestore
 */
export async function updateGenogram(
  genogramId: string,
  updates: Partial<GenogramDocument>
): Promise<void> {
  const userId = getCurrentUserId();

  try {
    const docSnap = await getDoc(doc(db, 'genograms', genogramId));
    
    if (!docSnap.exists()) {
      throw new Error('Genogram not found');
    }

    const genogram = docSnap.data() as GenogramDocument;
    
    // Only owner can update
    if (genogram.userId !== userId) {
      throw new Error('Access denied');
    }

    await updateDoc(doc(db, 'genograms', genogramId), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating genogram:', error);
    throw error;
  }
}

/**
 * Delete a genogram from Firestore with retry logic for offline scenarios
 * Strategy: Try immediately, then retry when online with exponential backoff
 */
export async function deleteGenogram(genogramId: string): Promise<void> {
  let lastError: Error | null = null;

  // Try to delete with retries
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      console.log(`🗑️ Firestore delete attempt ${attempt + 1}/3:`, genogramId);
      
      // Direct delete without read verification (optimization for offline support)
      // The app layer has already verified ownership and existence
      await deleteDoc(doc(db, 'genograms', genogramId));
      console.log('✅ Deleted from Firestore:', genogramId);
      return; // Success!
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (isOfflineError(error)) {
        console.warn(`🔌 Offline - attempt ${attempt + 1}/3 failed, will retry...`);
        
        // Wait for online before retrying (with exponential backoff)
        if (attempt < 2) {
          const waitTime = 1000 * Math.pow(2, attempt); // 1s, 2s
          console.log(`⏳ Waiting ${waitTime}ms before retry...`);
          
          const online = await waitForOnline(waitTime);
          if (!online) {
            console.warn('⏳ Still offline, will queue delete for when online');
            // Will try again on next attempt
          }
        }
      } else {
        // Non-offline error - don't retry
        console.error('❌ Error deleting genogram from Firestore:', lastError.message);
        throw lastError;
      }
    }
  }

  // All retries exhausted
  if (lastError && isOfflineError(lastError)) {
    console.warn('⏳ Offline after 3 attempts - queuing delete for when online');
    // Queue in localStorage for later sync
    localStorage.setItem(`delete-queue-${genogramId}`, JSON.stringify({
      type: 'delete-genogram',
      genogramId,
      timestamp: Date.now(),
    }));
    throw new Error('offline');
  }

  throw lastError || new Error('Unknown error during delete');
}

/**
 * Delete ALL genograms for current user (for cleanup/testing)
 */
export async function deleteAllUserGenograms(): Promise<void> {
  const userId = getCurrentUserId();
  console.log('🗑️ Starting cleanup of all genograms for user:', userId);

  try {
    const q = query(
      collection(db, 'genograms'),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    let deleted = 0;

    for (const docSnap of querySnapshot.docs) {
      await deleteDoc(docSnap.ref);
      deleted++;
      console.log(`Deleted genogram ${deleted}: ${docSnap.id}`);
    }

    console.log('✅ Cleanup complete! Deleted', deleted, 'genograms');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

/**
 * Save genogram data (auto-sync from local state)
 * Handles both create and update
 */
export async function saveGenogramData(
  genogramId: string,
  title: string,
  data: GenogramData,
  description?: string
): Promise<GenogramDocument> {
  const userId = getCurrentUserId();

  try {
    const docSnap = await getDoc(doc(db, 'genograms', genogramId));

    if (docSnap.exists()) {
      // Update existing
      const genogram = docSnap.data() as GenogramDocument;
      
      if (genogram.userId !== userId) {
        throw new Error('Access denied');
      }

      await updateDoc(doc(db, 'genograms', genogramId), {
        title,
        description,
        people: data.people,
        relations: data.relations,
        profiles: data.profiles || [],
        updatedAt: Timestamp.now(),
      });

      return {
        ...genogram,
        title,
        description,
        people: data.people,
        relations: data.relations,
        profiles: data.profiles || [],
        updatedAt: Timestamp.now(),
      };
    } else {
      // Create new if doesn't exist
      return createGenogram(title, data, description);
    }
  } catch (error) {
    console.error('Error saving genogram data:', error);
    throw error;
  }
}

/**
 * Share a genogram with another user
 */
export async function shareGenogram(
  genogramId: string,
  userEmail: string
): Promise<void> {
  const userId = getCurrentUserId();

  try {
    const docSnap = await getDoc(doc(db, 'genograms', genogramId));
    
    if (!docSnap.exists()) {
      throw new Error('Genogram not found');
    }

    const genogram = docSnap.data() as GenogramDocument;
    
    // Only owner can share
    if (genogram.userId !== userId) {
      throw new Error('Access denied');
    }

    const updatedSharedWith = Array.from(new Set([...(genogram.sharedWith || []), userEmail]));

    await updateDoc(doc(db, 'genograms', genogramId), {
      sharedWith: updatedSharedWith,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error sharing genogram:', error);
    throw error;
  }
}

/**
 * Get genograms shared with current user
 */
export async function getSharedGenograms(): Promise<GenogramDocument[]> {
  const user = auth.currentUser;

  if (!user?.email) {
    return [];
  }

  try {
    const q = query(
      collection(db, 'genograms'),
      where('sharedWith', 'array-contains', user.email)
    );

    const querySnapshot = await getDocs(q);
    const genograms: GenogramDocument[] = [];

    querySnapshot.forEach((doc) => {
      genograms.push(doc.data() as GenogramDocument);
    });

    return genograms.sort((a, b) => 
      b.updatedAt.toMillis() - a.updatedAt.toMillis()
    );
  } catch (error) {
    console.error('Error fetching shared genograms:', error);
    throw error;
  }
}

/**
 * Unshare a genogram with a user
 */
export async function unshareGenogram(
  genogramId: string,
  userEmail: string
): Promise<void> {
  const userId = getCurrentUserId();

  try {
    const docSnap = await getDoc(doc(db, 'genograms', genogramId));
    
    if (!docSnap.exists()) {
      throw new Error('Genogram not found');
    }

    const genogram = docSnap.data() as GenogramDocument;
    
    // Only owner can unshare
    if (genogram.userId !== userId) {
      throw new Error('Access denied');
    }

    const updatedSharedWith = (genogram.sharedWith || []).filter((email) => email !== userEmail);

    await updateDoc(doc(db, 'genograms', genogramId), {
      sharedWith: updatedSharedWith,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error unsharing genogram:', error);
    throw error;
  }
}

/**
 * Make a genogram public
 */
export async function setGenogramPublic(
  genogramId: string,
  isPublic: boolean
): Promise<void> {
  const userId = getCurrentUserId();

  try {
    const docSnap = await getDoc(doc(db, 'genograms', genogramId));
    
    if (!docSnap.exists()) {
      throw new Error('Genogram not found');
    }

    const genogram = docSnap.data() as GenogramDocument;
    
    // Only owner can change public status
    if (genogram.userId !== userId) {
      throw new Error('Access denied');
    }

    await updateDoc(doc(db, 'genograms', genogramId), {
      isPublic,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating genogram public status:', error);
    throw error;
  }
}

/**
 * Sync pending delete operations from localStorage when online
 * Call this when app detects network is back online
 */
export async function syncPendingDeletes(): Promise<void> {
  if (!navigator.onLine) {
    console.log('⏳ Not online yet - skipping sync');
    return;
  }

  console.log('🔄 Syncing pending deletes...');
  let syncedCount = 0;

  // Find all pending deletes
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith('delete-queue-')) continue;

    try {
      const genogramId = key.replace('delete-queue-', '');
      console.log(`🔄 Syncing delete for: ${genogramId}`);

      // Try to delete from Firestore
      await deleteDoc(doc(db, 'genograms', genogramId));
      
      // Remove from queue
      localStorage.removeItem(key);
      syncedCount++;
      console.log(`✅ Synced delete for: ${genogramId}`);
    } catch (error) {
      console.warn(`⚠️ Failed to sync delete:`, error);
      // Leave in queue for next sync attempt
    }
  }

  if (syncedCount > 0) {
    console.log(`✅ Synced ${syncedCount} pending deletes`);
  }
}

/**
 * Setup online/offline event listeners for sync
 * Call this once on app startup
 */
export function setupOnlineOfflineSync(): void {
  const handleOnline = async () => {
    console.log('🟢 Online - syncing pending operations');
    try {
      // FIXED BUG #4: Now syncs both deletes AND saves
      await Promise.all([
        syncPendingDeletes(),
        syncPendingSaves(),
      ]);
      console.log('✅ All pending operations synced');
    } catch (error) {
      console.error('Error syncing pending operations:', error);
    }
  };

  window.addEventListener('online', handleOnline);

  // Export for cleanup if needed
  if (import.meta.env.DEV) {
    (window as any).__firebaseSync = {
      cleanup: () => window.removeEventListener('online', handleOnline),
      syncNow: async () => Promise.all([syncPendingDeletes(), syncPendingSaves()]),
    };
  }
}

/**
 * Queue a save operation for retry when online
 * Used when Firestore save fails but localStorage saved successfully
 * 
 * FIXED BUG #2: Previously only deletes were queued, now saves are too
 */
export function queueSave(genogramId: string, data: any, title: string, description?: string): void {
  try {
    const saveQueue = JSON.parse(localStorage.getItem('save-queue') || '[]');
    
    // Check if this genogram already queued
    const existingIndex = saveQueue.findIndex((item: any) => item.genogramId === genogramId);
    
    const queueItem = {
      genogramId,
      title,
      description,
      data,
      timestamp: Date.now(),
      attempts: 0,
    };

    if (existingIndex >= 0) {
      // Update existing (merge data)
      saveQueue[existingIndex] = {
        ...saveQueue[existingIndex],
        data,
        title,
        description,
        timestamp: Date.now(),
      };
    } else {
      saveQueue.push(queueItem);
    }

    localStorage.setItem('save-queue', JSON.stringify(saveQueue));
    console.log(`📝 Queued save for genogram: ${genogramId}`);
  } catch (error) {
    console.error('Error queuing save:', error);
  }
}

/**
 * Sync all pending saves when online
 * Called by setupOnlineOfflineSync on 'online' event
 * 
 * FIXED BUG #4: New function to retry failed saves on online event
 */
export async function syncPendingSaves(): Promise<void> {
  if (!navigator.onLine) {
    console.log('⏳ Not online yet - skipping save sync');
    return;
  }

  console.log('🔄 Syncing pending saves...');
  let syncedCount = 0;

  try {
    const saveQueue = JSON.parse(localStorage.getItem('save-queue') || '[]');
    
    if (saveQueue.length === 0) {
      console.log('✅ No pending saves to sync');
      return;
    }

    for (const item of saveQueue) {
      try {
        item.attempts = (item.attempts || 0) + 1;
        console.log(`🔄 Syncing save for: ${item.genogramId} (attempt ${item.attempts})`);

        // Retry the save
        await saveGenogramData(
          item.genogramId,
          item.title,
          item.data,
          item.description
        );

        // Remove from queue on success
        const updatedQueue = saveQueue.filter((q: any) => q.genogramId !== item.genogramId);
        localStorage.setItem('save-queue', JSON.stringify(updatedQueue));
        
        syncedCount++;
        console.log(`✅ Synced save for: ${item.genogramId}`);
      } catch (error) {
        console.warn(`⚠️ Failed to sync save (will retry later):`, error);
        // Leave in queue for next retry
        
        // Don't retry more than 5 times
        if (item.attempts >= 5) {
          console.error(`❌ Failed to sync save after 5 attempts: ${item.genogramId}`);
          const updatedQueue = saveQueue.filter((q: any) => q.genogramId !== item.genogramId);
          localStorage.setItem('save-queue', JSON.stringify(updatedQueue));
        } else {
          // Update attempt count
          const queueIndex = saveQueue.findIndex((q: any) => q.genogramId === item.genogramId);
          if (queueIndex >= 0) {
            saveQueue[queueIndex].attempts = item.attempts;
            localStorage.setItem('save-queue', JSON.stringify(saveQueue));
          }
        }
      }
    }

    if (syncedCount > 0) {
      console.log(`✅ Synced ${syncedCount} pending saves`);
    }
  } catch (error) {
    console.error('Error syncing pending saves:', error);
  }
}

/**
 * Subscribe to real-time updates of current user's genograms
 * Returns unsubscribe function
 */
export function subscribeToUserGenograms(
  callback: (genograms: GenogramDocument[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  try {
    const userId = getCurrentUserId();
    
    const q = query(
      collection(db, 'genograms'),
      where('userId', '==', userId)
    );

    // Real-time listener with Firestore
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const genograms: GenogramDocument[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data() as GenogramDocument;
          genograms.push(data);
        });

        // Sort by newest first
        genograms.sort((a, b) => 
          b.updatedAt.toMillis() - a.updatedAt.toMillis()
        );

        console.log('🔄 Real-time Firestore update:', {
          count: genograms.length,
          items: genograms.map(g => ({
            id: g.id,
            title: g.title,
            people_count: g.people?.length || 0,
            relations_count: g.relations?.length || 0,
            profiles_count: g.profiles?.length || 0,
            people_sample: g.people?.[0] ? `${g.people[0].name || 'unnamed'}` : 'none'
          }))
        });
        
        callback(genograms);
      },
      (error) => {
        console.error('❌ Firestore listener error:', error);
        if (onError) onError(error as Error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up real-time listener:', error);
    throw error;
  }
}

