/**
 * Core TypeScript Models for PsychoGenealogy
 * Provides strict type definitions for all major entities
 */

/**
 * Person - Core family member entity
 */
export interface Person {
  // Identification
  id: string;
  name: string;

  // Demographics
  gender: 'male' | 'female' | 'non-binary' | 'unknown';
  status: 'living' | 'deceased';
  dateOfBirth?: string; // YYYY-MM-DD
  dateOfDeath?: string; // YYYY-MM-DD
  age?: number;

  // Visual representation
  isPrincipal?: boolean; // Main focus of genogram
  position?: { x: number; y: number };
  profileImage?: string; // Base64 or URL

  // Psychological profiling
  templateCategory?: TemplateCategory;
  profileId?: string; // Reference to detailed profile

  // Health & clinical data
  healthHistory?: HealthRecord[];
  medications?: MedicationRecord[];
  causeOfDeath?: CauseOfDeath;
  medicalConditions?: string[];

  // Additional info
  occupation?: string;
  attributes?: string[]; // e.g., 'depression', 'anxiety'
  significantEvents?: string[];
  notes?: string;
}

/**
 * Relation - Connection between two people
 */
export interface Relation {
  id: string;
  sourceId: string; // From person
  targetId: string; // To person
  type: RelationType;
}

/**
 * Genogram - Collection of people, relations, and profiles
 */
export interface GenogramData {
  people: Person[];
  relations: Relation[];
  profiles: PersonProfile[];
}

/**
 * GenogramDocument - Full genogram with metadata
 */
export interface GenogramDocument extends GenogramData {
  id: string;
  userId: string;
  title: string;
  description?: string;
  createdAt: any; // Firestore timestamp
  updatedAt: any; // Firestore timestamp
  isPublic: boolean;
  sharedWith: string[];
}

/**
 * PersonProfile - Detailed psychological profile for a person
 */
export interface PersonProfile {
  id: string;
  personId: string;
  profileType: 'template' | 'custom';
  templateCategory?: TemplateCategory;
  description?: string;
  psychologicalTraits?: string[];
  coreWounds?: string[];
  copingMechanisms?: string[];
  strengthsAndResources?: string[];
  therapeuticRecommendations?: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * HealthRecord - Medical/psychological condition tracking
 */
export interface HealthRecord {
  id: string;
  personId: string;
  condition: string; // e.g., 'depression', 'diabetes'
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  status: 'active' | 'managed' | 'remission' | 'resolved';
  diagnosedDate?: string; // YYYY-MM-DD
  resolvedDate?: string; // YYYY-MM-DD
  notes?: string;
  treatedBy?: string;
}

/**
 * MedicationRecord - Medication tracking
 */
export interface MedicationRecord {
  id: string;
  personId: string;
  medicationName: string;
  dosage?: string;
  frequency?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  prescribedBy?: string;
  notes?: string;
  sideEffects?: string[];
}

/**
 * Template categories from Bowen family systems theory
 */
export type TemplateCategory =
  | 'authoritarian-parent'
  | 'neglectful-parent'
  | 'enabling-parent'
  | 'dependent-child'
  | 'rebellious-child'
  | 'peacekeeper'
  | 'scapegoat'
  | 'hero'
  | 'lost-child'
  | 'traumatized-adult'
  | 'achiever'
  | 'codependent';

/**
 * Relationship types between people
 */
export type RelationType =
  // Blood relations
  | 'parent-child'
  | 'biological-sibling'
  | 'half-sibling'
  | 'full-sibling'
  | 'twin'
  | 'fraternal-twin'
  | 'identical-twin'
  | 'step-sibling'
  // Partnerships
  | 'partner'
  | 'ex-partner'
  | 'divorced'
  // Emotional dynamics
  | 'conflict'
  | 'close'
  | 'distant'
  | 'fused'
  | 'estranged';

/**
 * Cause of death
 */
export type CauseOfDeath =
  | 'natural'
  | 'illness'
  | 'accident'
  | 'suicide'
  | 'homicide'
  | 'unknown'
  | 'other';

/**
 * Genogram validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

/**
 * Individual validation issue
 */
export interface ValidationIssue {
  code: string;
  message: string;
  personIds?: string[];
  relationIds?: string[];
  severity: 'error' | 'warning';
}

/**
 * Type guards
 */
export function isPerson(obj: any): obj is Person {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    ['male', 'female', 'non-binary', 'unknown'].includes(obj.gender) &&
    ['living', 'deceased'].includes(obj.status)
  );
}

export function isRelation(obj: any): obj is Relation {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.sourceId === 'string' &&
    typeof obj.targetId === 'string' &&
    typeof obj.type === 'string'
  );
}

export function isGenogramDocument(obj: any): obj is GenogramDocument {
  return (
    obj &&
    typeof obj === 'object' &&
    Array.isArray(obj.people) &&
    Array.isArray(obj.relations) &&
    Array.isArray(obj.profiles) &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string'
  );
}
