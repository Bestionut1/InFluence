/**
 * Shared utility functions for genogram operations
 * Reduces repeated logic and improves maintainability
 */

import type { Person, Relation, GenogramData } from '../types/models';

// Generate a simple unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new person with default values
 */
export function createNewPerson(name: string, gender: string, status: string = 'living'): Person {
  return {
    id: generateId(),
    name,
    gender: gender as any,
    status: status as any,
    isPrincipal: false,
    position: { x: 0, y: 0 },
  };
}

/**
 * Create a new relation between two people
 */
export function createNewRelation(sourceId: string, targetId: string, type: string): Relation {
  return {
    id: generateId(),
    sourceId,
    targetId,
    type: type as any,
  };
}

/**
 * Find person by ID
 */
export function findPersonById(people: Person[], id: string): Person | undefined {
  return people.find(p => p.id === id);
}

/**
 * Find all people matching a predicate
 */
export function findPeople(people: Person[], predicate: (p: Person) => boolean): Person[] {
  return people.filter(predicate);
}

/**
 * Find all relations for a person
 */
export function findRelationsForPerson(relations: Relation[], personId: string): Relation[] {
  return relations.filter(r => r.sourceId === personId || r.targetId === personId);
}

/**
 * Find all children of a person
 */
export function findChildren(people: Person[], relations: Relation[], parentId: string): Person[] {
  const childIds = relations
    .filter(r => r.sourceId === parentId && r.type === 'parent-child')
    .map(r => r.targetId);
  return people.filter(p => childIds.includes(p.id));
}

/**
 * Find all parents of a person
 */
export function findParents(people: Person[], relations: Relation[], childId: string): Person[] {
  const parentIds = relations
    .filter(r => r.targetId === childId && r.type === 'parent-child')
    .map(r => r.sourceId);
  return people.filter(p => parentIds.includes(p.id));
}

/**
 * Find partner of a person
 */
export function findPartner(people: Person[], relations: Relation[], personId: string): Person | undefined {
  const partnerRelation = relations.find(
    r => (r.sourceId === personId || r.targetId === personId) && 
    (r.type === 'partner' || r.type === 'ex-partner' || r.type === 'divorced')
  );
  
  if (!partnerRelation) return undefined;
  
  const partnerId = partnerRelation.sourceId === personId ? partnerRelation.targetId : partnerRelation.sourceId;
  return findPersonById(people, partnerId);
}

/**
 * Find siblings of a person
 */
export function findSiblings(people: Person[], relations: Relation[], personId: string): Person[] {
  const person = findPersonById(people, personId);
  if (!person) return [];

  // Find parents
  const parents = findParents(people, relations, personId);
  if (parents.length === 0) return [];

  // Find all children of those parents (excluding self)
  const siblingIds = new Set<string>();
  parents.forEach(parent => {
    findChildren(people, relations, parent.id).forEach(child => {
      if (child.id !== personId) {
        siblingIds.add(child.id);
      }
    });
  });

  return people.filter(p => siblingIds.has(p.id));
}

/**
 * Get generational level of a person
 */
export function getGenerationalLevel(people: Person[], relations: Relation[], personId: string): number {
  const person = findPersonById(people, personId);
  if (!person) return 0;

  const parents = findParents(people, relations, personId);
  if (parents.length === 0) return 0;

  // Get the max level of all parents and add 1
  return Math.max(...parents.map(p => getGenerationalLevel(people, relations, p.id))) + 1;
}

/**
 * Calculate statistics about a genogram
 */
export function calculateGenogramStats(data: GenogramData) {
  const { people, relations } = data;

  return {
    totalPeople: people.length,
    livingPeople: people.filter(p => p.status === 'living').length,
    deceasedPeople: people.filter(p => p.status === 'deceased').length,
    totalRelations: relations.length,
    maleCount: people.filter(p => p.gender === 'male').length,
    femaleCount: people.filter(p => p.gender === 'female').length,
    generations: Math.max(0, ...people.map((p) => {
      if (people.length === 0) return 0;
      return getGenerationalLevel(people, relations, p.id);
    })) + 1,
  };
}

/**
 * Validate person data
 */
export function validatePerson(person: Person): string[] {
  const errors: string[] = [];

  if (!person.name || person.name.trim().length === 0) {
    errors.push('Person name is required');
  }

  if (!person.gender) {
    errors.push('Person gender is required');
  }

  if (!person.status) {
    errors.push('Person status is required');
  }

  return errors;
}

/**
 * Validate relation data
 */
export function validateRelation(relation: Relation, people: Person[]): string[] {
  const errors: string[] = [];

  if (!relation.sourceId || !findPersonById(people, relation.sourceId)) {
    errors.push('Source person not found');
  }

  if (!relation.targetId || !findPersonById(people, relation.targetId)) {
    errors.push('Target person not found');
  }

  if (relation.sourceId === relation.targetId) {
    errors.push('Cannot create relation with the same person');
  }

  return errors;
}

/**
 * Export genogram data to JSON
 */
export function exportToJSON(data: GenogramData, title: string): string {
  return JSON.stringify(
    {
      title,
      exportedAt: new Date().toISOString(),
      ...data,
    },
    null,
    2
  );
}

/**
 * Safely clone genogram data
 */
export function cloneGenogramData(data: GenogramData): GenogramData {
  return {
    people: data.people.map(p => ({ ...p })),
    relations: data.relations.map(r => ({ ...r })),
    profiles: data.profiles.map(p => ({ ...p })),
  };
}
