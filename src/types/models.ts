/**
 * Database model types for Firestore
 * Re-exports genogram types and adds database-specific fields
 */

import { Timestamp } from 'firebase/firestore';
import type { Person, Relation, PersonProfile } from './genogram';

// Export types for backward compatibility
export type { Person, Relation, PersonProfile };

/**
 * GenogramDocument - Full genogram with metadata
 */
export interface GenogramDocument {
  id: string;
  userId: string;
  title: string;
  description?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  isPublic: boolean;
  sharedWith: string[];
  people: Person[];
  relations: Relation[];
  profiles?: PersonProfile[];
}
/**
 * Firestore-specific test result
 */
export interface FirestoreTestResult {
  id: string;
  personId: string;
  genogramId: string;
  testType: string;
  results: Record<string, unknown>;
  completedAt: Timestamp;
  score?: number;
}

/**
 * AI Analysis for person
 */
export interface PersonAIAnalysis {
  id?: string;
  personId: string;
  genogramId: string;
  generatedAt: Timestamp;
  patterns: string[];
  recommendations: string[];
  summary: string;
  metadata?: Record<string, unknown>;
}

/**
 * Type guards
 */
export function isPerson(obj: unknown): obj is Person {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as any;
  return (
    typeof o.id === 'string' &&
    typeof o.name === 'string' &&
    ['male', 'female', 'non-binary', 'unknown'].includes(o.gender) &&
    ['living', 'deceased'].includes(o.status)
  );
}

export function isRelation(obj: unknown): obj is Relation {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as any;
  return (
    typeof o.id === 'string' &&
    typeof o.sourceId === 'string' &&
    typeof o.targetId === 'string' &&
    typeof o.type === 'string'
  );
}

export function isGenogramDocument(obj: unknown): obj is GenogramDocument {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as any;
  return (
    Array.isArray(o.people) &&
    Array.isArray(o.relations) &&
    typeof o.id === 'string' &&
    typeof o.title === 'string'
  );
}

export function isFirestoreTestResult(obj: unknown): obj is FirestoreTestResult {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as any;
  return (
    typeof o.personId === 'string' &&
    typeof o.testType === 'string' &&
    typeof o.results === 'object'
  );
}

export function isPersonAIAnalysis(obj: unknown): obj is PersonAIAnalysis {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as any;
  return (
    typeof o.personId === 'string' &&
    Array.isArray(o.patterns) &&
    Array.isArray(o.recommendations) &&
    typeof o.summary === 'string'
  );
}
