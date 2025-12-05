/**
 * Person Service - Unified data layer for person-centric operations
 * Single source of truth: Firestore
 * This service consolidates all person-related data queries and operations
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import type { Person, PersonProfile, Relation } from '../types/genogram';

export interface PersonDocument extends Person {
  id: string;
  genogramId: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PersonProfileDocument extends Omit<PersonProfile, 'createdAt' | 'updatedAt'> {
  genogramId: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

function getCurrentUserId(): string {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('User not authenticated');
  return userId;
}

/**
 * Get a single person by ID
 */
export async function getPerson(personId: string, genogramId: string): Promise<PersonDocument | null> {
  try {
    const docSnap = await getDoc(doc(db, 'genograms', genogramId, 'people', personId));
    
    if (!docSnap.exists()) {
      return null;
    }

    return docSnap.data() as PersonDocument;
  } catch (error) {
    console.error('Error fetching person:', error);
    throw error;
  }
}

/**
 * Get all people in a genogram
 */
export async function getPeopleInGenogram(genogramId: string): Promise<PersonDocument[]> {
  try {
    const querySnapshot = await getDocs(
      collection(db, 'genograms', genogramId, 'people')
    );

    const people: PersonDocument[] = [];
    querySnapshot.forEach((doc) => {
      people.push(doc.data() as PersonDocument);
    });

    return people;
  } catch (error) {
    console.error('Error fetching people in genogram:', error);
    throw error;
  }
}

/**
 * Create a new person
 */
export async function createPerson(
  genogramId: string,
  personData: Person
): Promise<PersonDocument> {
  const userId = getCurrentUserId();

  try {
    const personId = personData.id || `person_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const personDoc: PersonDocument = {
      ...personData,
      id: personId,
      genogramId,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(
      doc(db, 'genograms', genogramId, 'people', personId),
      personDoc
    );

    return personDoc;
  } catch (error) {
    console.error('Error creating person:', error);
    throw error;
  }
}

/**
 * Update a person's data
 */
export async function updatePerson(
  personId: string,
  genogramId: string,
  updates: Partial<Person>
): Promise<void> {
  try {
    await updateDoc(
      doc(db, 'genograms', genogramId, 'people', personId),
      {
        ...updates,
        updatedAt: Timestamp.now(),
      }
    );
  } catch (error) {
    console.error('Error updating person:', error);
    throw error;
  }
}

/**
 * Delete a person
 */
export async function deletePerson(personId: string, genogramId: string): Promise<void> {
  try {
    // Delete person
    await deleteDoc(doc(db, 'genograms', genogramId, 'people', personId));

    // Delete associated profile
    const profileDoc = doc(db, 'genograms', genogramId, 'people', personId, 'profile', 'data');
    const profileSnap = await getDoc(profileDoc);
    if (profileSnap.exists()) {
      await deleteDoc(profileDoc);
    }
  } catch (error) {
    console.error('Error deleting person:', error);
    throw error;
  }
}

/**
 * Get psychological profile for a person
 */
export async function getPersonProfile(
  personId: string,
  genogramId: string
): Promise<PersonProfileDocument | null> {
  try {
    const docSnap = await getDoc(
      doc(db, 'genograms', genogramId, 'people', personId, 'profile', 'data')
    );

    if (!docSnap.exists()) {
      return null;
    }

    return docSnap.data() as PersonProfileDocument;
  } catch (error) {
    console.error('Error fetching person profile:', error);
    throw error;
  }
}

/**
 * Create or update psychological profile for a person
 */
export async function setPersonProfile(
  personId: string,
  genogramId: string,
  profileData: PersonProfile
): Promise<PersonProfileDocument> {
  const userId = getCurrentUserId();

  try {
    const profileDoc: PersonProfileDocument = {
      ...profileData,
      genogramId,
      userId,
      createdAt: profileData.createdAt instanceof Date 
        ? Timestamp.fromDate(profileData.createdAt)
        : Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(
      doc(db, 'genograms', genogramId, 'people', personId, 'profile', 'data'),
      profileDoc
    );

    return profileDoc;
  } catch (error) {
    console.error('Error saving person profile:', error);
    throw error;
  }
}

/**
 * Get all relations involving a specific person
 */
export async function getPersonRelations(
  personId: string,
  genogramId: string
): Promise<Relation[]> {
  try {
    const relationsSnap = await getDoc(
      doc(db, 'genograms', genogramId, 'metadata', 'relations')
    );

    if (!relationsSnap.exists()) {
      return [];
    }

    const allRelations = relationsSnap.data().relations as Relation[];
    
    // Filter relations involving this person
    return allRelations.filter(
      r => r.sourceId === personId || r.targetId === personId
    );
  } catch (error) {
    console.error('Error fetching person relations:', error);
    throw error;
  }
}

/**
 * Get test results for a person (if available)
 */
export async function getPersonTestResults(
  personId: string,
  genogramId: string
): Promise<any[]> {
  try {
    const querySnapshot = await getDocs(
      collection(db, 'genograms', genogramId, 'people', personId, 'testResults')
    );

    const results: any[] = [];
    querySnapshot.forEach((doc) => {
      results.push(doc.data());
    });

    return results;
  } catch (error) {
    console.error('Error fetching person test results:', error);
    return [];
  }
}

/**
 * Get AI analysis cache for a person (if exists)
 */
export async function getPersonAIAnalysis(
  personId: string,
  genogramId: string
): Promise<any | null> {
  try {
    const docSnap = await getDoc(
      doc(db, 'genograms', genogramId, 'people', personId, 'ai', 'analysis')
    );

    if (!docSnap.exists()) {
      return null;
    }

    return docSnap.data();
  } catch (error) {
    console.error('Error fetching AI analysis:', error);
    return null;
  }
}

/**
 * Save AI analysis for a person
 */
export async function setPersonAIAnalysis(
  personId: string,
  genogramId: string,
  analysis: any
): Promise<void> {
  const userId = getCurrentUserId();

  try {
    await setDoc(
      doc(db, 'genograms', genogramId, 'people', personId, 'ai', 'analysis'),
      {
        ...analysis,
        userId,
        generatedAt: Timestamp.now(),
      }
    );
  } catch (error) {
    console.error('Error saving AI analysis:', error);
    throw error;
  }
}

/**
 * Get complete person hub data (unified query)
 * Returns person + profile + relations + test results in one call
 */
export async function getPersonHubData(
  personId: string,
  genogramId: string
): Promise<{
  person: PersonDocument | null;
  profile: PersonProfileDocument | null;
  relations: Relation[];
  testResults: any[];
  aiAnalysis: any | null;
}> {
  try {
    const [person, profile, relations, testResults, aiAnalysis] = await Promise.all([
      getPerson(personId, genogramId),
      getPersonProfile(personId, genogramId),
      getPersonRelations(personId, genogramId),
      getPersonTestResults(personId, genogramId),
      getPersonAIAnalysis(personId, genogramId),
    ]);

    return {
      person,
      profile,
      relations,
      testResults,
      aiAnalysis,
    };
  } catch (error) {
    console.error('Error fetching person hub data:', error);
    throw error;
  }
}

/**
 * Batch update person data (efficient for multiple operations)
 */
export async function batchUpdatePersons(
  genogramId: string,
  updates: Array<{ personId: string; data: Partial<Person> }>
): Promise<void> {
  try {
    // Note: Firestore doesn't have native batch in modular SDK like this
    // We'll do sequential updates - in production, use WriteBatch
    for (const update of updates) {
      await updatePerson(update.personId, genogramId, update.data);
    }
  } catch (error) {
    console.error('Error batch updating persons:', error);
    throw error;
  }
}
