/**
 * IndexedDB Service for PsychoGenealogy
 * Handles all local persistence for genograms, people, relations, and profiles
 * Replaces Firestore for complete offline-first architecture
 */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Person, Relation, PersonProfile } from '../types/genogram';

interface GenogramRecord {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  people: Person[];
  relations: Relation[];
  profiles: PersonProfile[];
  createdAt: number;
  updatedAt: number;
  lastSyncAt?: number;
}

interface PsychoGenealogieDB extends DBSchema {
  genograms: {
    key: string;
    value: GenogramRecord;
    indexes: {
      'userId': string;
      'updatedAt': number;
      'createdAt': number;
    };
  };
}

const DB_NAME = 'psychogenealogy-local';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<PsychoGenealogieDB> | null = null;

/**
 * Initialize IndexedDB with all required stores
 */
export async function initializeIndexedDB(): Promise<IDBPDatabase<PsychoGenealogieDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<PsychoGenealogieDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create genograms store if it doesn't exist
      if (!db.objectStoreNames.contains('genograms')) {
        const store = db.createObjectStore('genograms', { keyPath: 'id' });
        // Indexes for faster queries
        store.createIndex('userId', 'userId');
        store.createIndex('updatedAt', 'updatedAt');
        store.createIndex('createdAt', 'createdAt');
      }
    },
  });

  return dbInstance;
}

/**
 * Save a complete genogram with all its data
 */
export async function saveGenogram(genogramId: string, data: {
  title: string;
  description?: string;
  people: Person[];
  relations: Relation[];
  profiles: PersonProfile[];
  userId?: string;
}): Promise<void> {
  const db = await initializeIndexedDB();
  
  const genogram = {
    id: genogramId,
    ...data,
    updatedAt: Date.now(),
    createdAt: (await getGenogram(genogramId))?.createdAt || Date.now(),
  };

  await db.put('genograms', genogram);
  
  if (import.meta.env.DEV) {
    console.log(`[IndexedDB] ✅ Saved genogram: ${genogramId}`, genogram);
  }
}

/**
 * Get a complete genogram
 */
export async function getGenogram(genogramId: string) {
  const db = await initializeIndexedDB();
  const genogram = await db.get('genograms', genogramId);
  
  if (import.meta.env.DEV && genogram) {
    console.log(`[IndexedDB] ✅ Retrieved genogram: ${genogramId}`, genogram);
  }

  return genogram || null;
}

/**
 * Get all genograms (for dashboard listing)
 */
export async function getAllGenograms() {
  const db = await initializeIndexedDB();
  const allGenograms = await db.getAll('genograms');
  
  if (import.meta.env.DEV) {
    console.log(`[IndexedDB] ✅ Retrieved ${allGenograms.length} genograms`);
  }

  return allGenograms;
}

/**
 * Delete a genogram completely
 */
export async function deleteGenogram(genogramId: string): Promise<void> {
  const db = await initializeIndexedDB();
  
  await db.delete('genograms', genogramId);
  
  if (import.meta.env.DEV) {
    console.log(`[IndexedDB] ✅ Deleted genogram: ${genogramId}`);
  }
}

/**
 * Update only the people in a genogram
 */
export async function updateGenogramPeople(genogramId: string, people: Person[]): Promise<void> {
  const genogram = await getGenogram(genogramId);
  
  if (!genogram) {
    throw new Error(`Genogram not found: ${genogramId}`);
  }

  await saveGenogram(genogramId, {
    title: genogram.title,
    description: genogram.description,
    people,
    relations: genogram.relations,
    profiles: genogram.profiles,
    userId: genogram.userId,
  });
}

/**
 * Update only the relations in a genogram
 */
export async function updateGenogramRelations(genogramId: string, relations: Relation[]): Promise<void> {
  const genogram = await getGenogram(genogramId);
  
  if (!genogram) {
    throw new Error(`Genogram not found: ${genogramId}`);
  }

  await saveGenogram(genogramId, {
    title: genogram.title,
    description: genogram.description,
    people: genogram.people,
    relations,
    profiles: genogram.profiles,
    userId: genogram.userId,
  });
}

/**
 * Update only the profiles in a genogram
 */
export async function updateGenogramProfiles(genogramId: string, profiles: PersonProfile[]): Promise<void> {
  const genogram = await getGenogram(genogramId);
  
  if (!genogram) {
    throw new Error(`Genogram not found: ${genogramId}`);
  }

  await saveGenogram(genogramId, {
    title: genogram.title,
    description: genogram.description,
    people: genogram.people,
    relations: genogram.relations,
    profiles,
    userId: genogram.userId,
  });
}

/**
 * Clear all data from IndexedDB (careful with this!)
 */
export async function clearAllData(): Promise<void> {
  const db = await initializeIndexedDB();
  const tx = db.transaction('genograms', 'readwrite');
  await tx.store.clear();
  
  if (import.meta.env.DEV) {
    console.log('[IndexedDB] ⚠️ Cleared all genograms');
  }
}

/**
 * Get storage usage info
 */
export async function getStorageInfo(): Promise<{
  usedBytes: number;
  quota: number;
  percentage: number;
}> {
  if (!navigator.storage || !navigator.storage.estimate) {
    return { usedBytes: 0, quota: 0, percentage: 0 };
  }

  const estimate = await navigator.storage.estimate();
  return {
    usedBytes: estimate.usage || 0,
    quota: estimate.quota || 0,
    percentage: estimate.usage && estimate.quota ? (estimate.usage / estimate.quota) * 100 : 0,
  };
}

/**
 * Request persistent storage permission
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage || !navigator.storage.persist) {
    return false;
  }

  try {
    const persistent = await navigator.storage.persist();
    if (import.meta.env.DEV) {
      console.log(`[IndexedDB] Storage persistence ${persistent ? 'granted' : 'denied'}`);
    }
    return persistent;
  } catch (error) {
    console.warn('[IndexedDB] Could not request persistent storage:', error);
    return false;
  }
}
