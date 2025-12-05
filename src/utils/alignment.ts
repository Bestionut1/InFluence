import type { Person, Relation, RelationType } from '../types/genogram';

const NODE_WIDTH = 120;
const SIBLING_SPACING = 180; // Fixed spacing between siblings (width of one member's square)

// Helper function to check if a relation type is a sibling relation
const isSiblingRelationType = (type: RelationType): boolean => {
  return ['biological-sibling', 'half-sibling', 'full-sibling', 'twin', 'fraternal-twin', 'identical-twin', 'step-sibling'].includes(type);
};

/**
 * Calculate aligned positions for a group of siblings
 * All siblings share the same Y coordinate and are evenly spaced horizontally
 * @param siblings Array of sibling Person objects
 * @param baseY Y coordinate for all siblings (typically parent's Y + generationSpacing)
 * @param centerX Optional center X to align around (default: average position)
 * @returns Map of personId -> { x, y } positions
 */
export function calculateSiblingAlignment(
  siblings: Person[],
  baseY: number,
  centerX?: number
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  
  if (siblings.length === 0) return positions;
  
  // Calculate total width needed for all siblings
  const totalWidth = (siblings.length - 1) * SIBLING_SPACING;
  
  // Determine center X position
  let alignCenterX = centerX;
  if (!alignCenterX) {
    // Use average of existing positions or 0 if none exist
    const existingPositions = siblings
      .map(s => s.position?.x ?? 0)
      .filter(x => x !== undefined);
    
    alignCenterX = existingPositions.length > 0 
      ? existingPositions.reduce((a, b) => a + b, 0) / existingPositions.length
      : 0;
  }
  
  // Position each sibling relative to center
  const startX = alignCenterX - totalWidth / 2;
  
  siblings.forEach((sibling, index) => {
    positions.set(sibling.id, {
      x: startX + index * SIBLING_SPACING,
      y: baseY,
    });
  });
  
  return positions;
}

/**
 * Calculate aligned positions for a partner pair
 * Partners should be positioned side-by-side with no gap
 * @param person1 First partner
 * @param person2 Second partner
 * @param baseY Y coordinate for both partners
 * @param person1OnLeft Whether person1 should be on the left (default: true)
 * @returns Map with two entries for each partner's position
 */
export function calculatePartnerAlignment(
  person1: Person,
  person2: Person,
  baseY: number,
  person1OnLeft: boolean = true
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  
  // Get current center position (average of both partners)
  const p1X = person1.position?.x ?? 0;
  const p2X = person2.position?.x ?? 0;
  const centerX = (p1X + p2X) / 2;
  
  // Position partners side-by-side with no gap
  // Each takes NODE_WIDTH space, total width = 2 * NODE_WIDTH
  // They should be centered around centerX
  
  const totalWidth = 2 * NODE_WIDTH;
  const leftX = centerX - totalWidth / 2;
  const rightX = leftX + NODE_WIDTH;
  
  if (person1OnLeft) {
    positions.set(person1.id, { x: leftX, y: baseY });
    positions.set(person2.id, { x: rightX, y: baseY });
  } else {
    positions.set(person1.id, { x: rightX, y: baseY });
    positions.set(person2.id, { x: leftX, y: baseY });
  }
  
  return positions;
}

/**
 * Get all siblings for a given person based on relations
 * Siblings can be determined by:
 * 1. Explicit sibling relations
 * 2. Sharing the same parent(s)
 * @param personId ID of the person to find siblings for
 * @param people Array of all people
 * @param relations Array of all relations
 * @returns Array of sibling Person objects (excluding the person itself)
 */
export function getSiblingsForPerson(
  personId: string,
  people: Person[],
  relations: Relation[]
): Person[] {
  const siblingIds = new Set<string>();
  
  // 1. Find explicit sibling relations
  relations
    .filter(r => isSiblingRelationType(r.type) && (r.sourceId === personId || r.targetId === personId))
    .forEach(r => {
      const otherId = r.sourceId === personId ? r.targetId : r.sourceId;
      siblingIds.add(otherId);
    });
  
  // 2. Find shared parents (implicit siblings)
  const parentIds = relations
    .filter(r => r.type === 'parent-child' && r.targetId === personId)
    .map(r => r.sourceId);
  
  parentIds.forEach(parentId => {
    relations
      .filter(r => r.type === 'parent-child' && r.sourceId === parentId && r.targetId !== personId)
      .forEach(r => {
        siblingIds.add(r.targetId);
      });
  });
  
  return Array.from(siblingIds)
    .map(id => people.find(p => p.id === id))
    .filter((p): p is Person => p !== undefined);
}

/**
 * Get partner(s) for a given person
 * @param personId ID of the person to find partners for
 * @param relations Array of all relations
 * @returns Array of partner IDs
 */
export function getPartnersForPerson(
  personId: string,
  relations: Relation[]
): string[] {
  return relations
    .filter(r => 
      (r.type === 'partner' || r.type === 'ex-partner') && 
      (r.sourceId === personId || r.targetId === personId)
    )
    .map(r => r.sourceId === personId ? r.targetId : r.sourceId);
}

/**
 * Calculate sibling group Y position based on parent(s)
 * Children should be aligned below their parent(s)
 * @param siblings Array of sibling Person objects
 * @param people Array of all people
 * @param relations Array of all relations
 * @param generationSpacing Vertical spacing between generations
 * @returns Y coordinate for the sibling group
 */
export function calculateSiblingGroupYPosition(
  siblings: Person[],
  people: Person[],
  relations: Relation[],
  generationSpacing: number = 150
): number {
  if (siblings.length === 0) return 0;
  
  // Find all parents of this sibling group
  const parentIds = new Set<string>();
  siblings.forEach(sibling => {
    relations
      .filter(r => r.type === 'parent-child' && r.targetId === sibling.id)
      .forEach(r => parentIds.add(r.sourceId));
  });
  
  if (parentIds.size === 0) {
    // No parents found, use average Y of siblings
    const siblingYs = siblings
      .map(s => s.position?.y ?? 0)
      .filter(y => y !== undefined);
    return siblingYs.length > 0 
      ? siblingYs.reduce((a, b) => a + b, 0) / siblingYs.length
      : 0;
  }
  
  // Get parent positions
  const parentPositions = Array.from(parentIds)
    .map(id => people.find(p => p.id === id))
    .filter((p): p is Person => p !== undefined)
    .map(p => p.position?.y ?? 0);
  
  if (parentPositions.length === 0) return 0;
  
  // Position siblings below average parent Y
  const avgParentY = parentPositions.reduce((a, b) => a + b, 0) / parentPositions.length;
  return avgParentY + generationSpacing;
}

/**
 * Get center X position for sibling group (between parents if they exist)
 * @param siblings Array of sibling Person objects
 * @param people Array of all people
 * @param relations Array of all relations
 * @returns Center X coordinate for the sibling group
 */
export function calculateSiblingGroupCenterX(
  siblings: Person[],
  people: Person[],
  relations: Relation[]
): number {
  if (siblings.length === 0) return 0;
  
  // Find all parents of this sibling group
  const parentIds = new Set<string>();
  siblings.forEach(sibling => {
    relations
      .filter(r => r.type === 'parent-child' && r.targetId === sibling.id)
      .forEach(r => parentIds.add(r.sourceId));
  });
  
  if (parentIds.size === 0) {
    // No parents, center on existing sibling positions
    const siblingXs = siblings
      .map(s => s.position?.x ?? 0)
      .filter(x => x !== undefined);
    return siblingXs.length > 0 
      ? siblingXs.reduce((a, b) => a + b, 0) / siblingXs.length
      : 0;
  }
  
  // Center between parents
  const parentPositions = Array.from(parentIds)
    .map(id => people.find(p => p.id === id))
    .filter((p): p is Person => p !== undefined)
    .map(p => p.position?.x ?? 0);
  
  if (parentPositions.length === 1) {
    return parentPositions[0];
  }
  
  // Average parent X positions
  return parentPositions.reduce((a, b) => a + b, 0) / parentPositions.length;
}

/**
 * Apply sibling alignment to a group of siblings
 * Updates all sibling positions to be aligned horizontally
 * @param siblings Array of sibling Person objects (or IDs)
 * @param people Array of all people
 * @param relations Array of all relations
 * @returns Map of updated positions (personId -> {x, y})
 */
export function applySiblingAlignment(
  siblings: (Person | string)[],
  people: Person[],
  relations: Relation[]
): Map<string, { x: number; y: number }> {
  // Convert IDs to Person objects
  const siblingPeople = siblings.map(s => 
    typeof s === 'string' ? people.find(p => p.id === s) : s
  ).filter((p): p is Person => p !== undefined);
  
  if (siblingPeople.length === 0) return new Map();
  
  // Calculate Y position based on parents
  const y = calculateSiblingGroupYPosition(siblingPeople, people, relations);
  
  // Calculate center X based on parents or existing positions
  const centerX = calculateSiblingGroupCenterX(siblingPeople, people, relations);
  
  // Apply alignment
  return calculateSiblingAlignment(siblingPeople, y, centerX);
}

/**
 * Apply partner alignment to a pair
 * Updates both partner positions to be side-by-side
 * @param personId1 First partner ID
 * @param personId2 Second partner ID
 * @param people Array of all people
 * @param relations Array of all relations
 * @param generationSpacing Vertical spacing (default: 150)
 * @returns Map of updated positions (personId -> {x, y})
 */
export function applyPartnerAlignment(
personId1: string, personId2: string, people: Person[], _updatedRelations?: Relation[]): Map<string, { x: number; y: number }> {
  const person1 = people.find(p => p.id === personId1);
  const person2 = people.find(p => p.id === personId2);
  
  if (!person1 || !person2) return new Map();
  
  // Determine Y position (should be same for both partners)
  // Use average of their current Y positions, or 0 if none
  const y1 = person1.position?.y ?? 0;
  const y2 = person2.position?.y ?? 0;
  const y = (y1 + y2) / 2;
  
  return calculatePartnerAlignment(person1, person2, y, true);
}

/**
 * Get all people that should maintain alignment when a person moves
 * Includes: siblings, partners, children (if parents)
 * @param personId ID of the person being moved
 * @param people Array of all people
 * @param relations Array of all relations
 * @returns Array of related people who need position updates
 */
export function getRelatedPeopleForAlignment(
  personId: string,
  people: Person[],
  relations: Relation[]
): Person[] {
  const related = new Set<string>();
  const person = people.find(p => p.id === personId);
  
  if (!person) return [];
  
  // Add siblings
  getSiblingsForPerson(personId, people, relations).forEach(s => related.add(s.id));
  
  // Add partners
  getPartnersForPerson(personId, relations).forEach(p => related.add(p));
  
  return Array.from(related)
    .map(id => people.find(p => p.id === id))
    .filter((p): p is Person => p !== undefined);
}
