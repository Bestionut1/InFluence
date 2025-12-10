import type { Person, Relation } from '../types/genogram';

/**
 * Test genogram with the Popescu family - 4 generations
 * Based on user's custom layout with exact positioning
 */

// Simple ID generator
let relationIdCounter = 0;
function genRelationId(): string {
  return `rel-${Date.now()}-${++relationIdCounter}`;
}

export const testPeople: Person[] = [
  // Grandparents
  {
    id: 'gf',
    name: 'Ion Popescu',
    gender: 'male',
    status: 'living',
    age: 85,
    position: { x: -245, y: -488 },
    attributes: ['intelligent', 'strict'],
    templateCategory: 'authoritarian-parent',
    notes: 'Grandfather - patriarch of the family'
  },
  {
    id: 'gm',
    name: 'Maria Popescu',
    gender: 'female',
    status: 'living',
    age: 88,
    position: { x: 108, y: -488 },
    attributes: ['caring', 'wise'],
    templateCategory: 'enabling-parent',
    notes: 'Grandmother - family mediator'
  },

  // Parents generation
  {
    id: 'father',
    name: 'Mihai Popescu',
    gender: 'male',
    status: 'living',
    age: 60,
    position: { x: -131, y: -209 },
    attributes: ['disciplined', 'practical'],
    templateCategory: 'achiever',
    notes: 'Father - successful professional'
  },
  {
    id: 'mother',
    name: 'Elena Popescu',
    gender: 'female',
    status: 'living',
    age: 58,
    position: { x: 251, y: -212 },
    attributes: ['caring', 'organized'],
    templateCategory: 'peacekeeper',
    notes: 'Mother - family organizer'
  },
  {
    id: 'uncle',
    name: 'Andrei Popescu',
    gender: 'male',
    status: 'living',
    age: 55,
    position: { x: -366, y: -205 },
    attributes: ['serious', 'intellectual'],
    templateCategory: 'achiever',
    notes: 'Uncle - academic background'
  },

  // Current generation
  {
    id: 'self',
    name: 'Alexandru Popescu',
    gender: 'male',
    status: 'living',
    age: 32,
    position: { x: 0, y: 0 },
    attributes: ['creative', 'anxious'],
    templateCategory: 'dependent-child',
    isPrincipal: true,
    notes: 'Main focus person - experiencing life transitions'
  },
  {
    id: 'sister',
    name: 'Laura Popescu',
    gender: 'female',
    status: 'living',
    age: 35,
    position: { x: -248, y: 2 },
    attributes: ['ambitious', 'caring'],
    templateCategory: 'hero',
    notes: 'Sister - overachiever in family'
  },
  {
    id: 'wife',
    name: 'Diana Marinescu',
    gender: 'female',
    status: 'living',
    age: 31,
    position: { x: 504, y: 2 },
    attributes: ['artistic', 'supportive'],
    templateCategory: 'peacekeeper',
    notes: 'Wife - bridge to Marinescu family'
  },
  {
    id: 'cousin',
    name: 'Adrian Popescu',
    gender: 'male',
    status: 'living',
    age: 28,
    position: { x: -545, y: 19 },
    attributes: ['practical', 'friendly'],
    templateCategory: 'lost-child',
    notes: 'Cousin - uncle\'s son'
  },

  // Children generation
  {
    id: 'child-1',
    name: 'David Popescu',
    gender: 'male',
    status: 'living',
    age: 7,
    position: { x: 87, y: 283 },
    attributes: ['curious', 'playful'],
    templateCategory: 'dependent-child',
    notes: 'Son - first child'
  },
  {
    id: 'child-2',
    name: 'Emma Popescu',
    gender: 'female',
    status: 'living',
    age: 5,
    position: { x: 340, y: 286 },
    attributes: ['creative', 'sensitive'],
    templateCategory: 'dependent-child',
    notes: 'Daughter - youngest'
  }
];

export const testRelations: Relation[] = [
  // Grandparents to parents
  { id: genRelationId(), sourceId: 'gf', targetId: 'father', type: 'parent-child' },
  { id: genRelationId(), sourceId: 'gf', targetId: 'uncle', type: 'parent-child' },
  { id: genRelationId(), sourceId: 'gm', targetId: 'father', type: 'parent-child' },
  { id: genRelationId(), sourceId: 'gm', targetId: 'uncle', type: 'parent-child' },

  // Grandparents partnership
  { id: genRelationId(), sourceId: 'gf', targetId: 'gm', type: 'partner' },

  // Parents to children
  { id: genRelationId(), sourceId: 'father', targetId: 'self', type: 'parent-child' },
  { id: genRelationId(), sourceId: 'father', targetId: 'sister', type: 'parent-child' },
  { id: genRelationId(), sourceId: 'mother', targetId: 'self', type: 'parent-child' },
  { id: genRelationId(), sourceId: 'mother', targetId: 'sister', type: 'parent-child' },

  // Parents partnership
  { id: genRelationId(), sourceId: 'father', targetId: 'mother', type: 'partner' },

  // Uncle to cousin
  { id: genRelationId(), sourceId: 'uncle', targetId: 'cousin', type: 'parent-child' },

  // Siblings (using close relation type for siblings)
  { id: genRelationId(), sourceId: 'father', targetId: 'uncle', type: 'close' },
  { id: genRelationId(), sourceId: 'self', targetId: 'sister', type: 'fused' },

  // Alexandru to Diana (married)
  { id: genRelationId(), sourceId: 'self', targetId: 'wife', type: 'partner' },

  // Alexandru & Diana to children
  { id: genRelationId(), sourceId: 'self', targetId: 'child-1', type: 'parent-child' },
  { id: genRelationId(), sourceId: 'self', targetId: 'child-2', type: 'parent-child' },
  { id: genRelationId(), sourceId: 'wife', targetId: 'child-1', type: 'parent-child' },
  { id: genRelationId(), sourceId: 'wife', targetId: 'child-2', type: 'parent-child' },

  // Children siblings (close relation)
  { id: genRelationId(), sourceId: 'child-1', targetId: 'child-2', type: 'close' },

  // Relationship dynamics
  { id: genRelationId(), sourceId: 'father', targetId: 'self', type: 'close' },
  { id: genRelationId(), sourceId: 'wife', targetId: 'mother', type: 'close' },
];

export function loadTestGenogram() {
  return {
    people: testPeople,
    relations: testRelations
  };
}
