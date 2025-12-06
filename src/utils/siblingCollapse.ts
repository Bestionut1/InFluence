import type { Person, Relation } from '../types/genogram';

/**
 * Sistem de collapse pentru grupuri de frați
 * Când sunt detectați >2 frați, al doilea devine grup colapsabil
 */

export interface SiblingGroup {
  id: string; // ID-ul celui de-al doilea frate
  parentIds: string[]; // Părinții acestui grup
  siblingIds: string[]; // Toți frații (inclusiv cel cu ID-ul grupului)
  collapsedSiblingIds: string[]; // Frații ascunși (toți după al doilea)
  isCollapsed: boolean;
}

export interface CollapsedPeopleInfo {
  personId: string;
  isInCollapsedGroup: boolean;
  groupId?: string; // ID-ul celui care conține grupul
  hiddenCount: number;
}

/**
 * Detectează grupuri de frați care trebuie collapse-ate
 * Acum cu logică degree-aware din principalId
 * Regula: Dacă sunt >2 frați, al doilea devine grup colapsabil
 */
export function detectSiblingGroups(
  _people: Person[],
  relations: Relation[],
  principalId?: string
): Map<string, SiblingGroup> {
  const groups = new Map<string, SiblingGroup>();

  // Build sibling groups from direct sibling relations
  const siblingClusters = new Map<string, Set<string>>();
  
  // Find all sibling relations
  relations.forEach((rel) => {
    if (['biological-sibling', 'half-sibling', 'full-sibling', 'twin', 'fraternal-twin', 'identical-twin', 'step-sibling'].includes(rel.type)) {
      // For each sibling, add both to a cluster
      const sourceCluster = siblingClusters.get(rel.sourceId) || new Set();
      const targetCluster = siblingClusters.get(rel.targetId) || new Set();
      
      // Merge clusters
      const merged = new Set([...sourceCluster, ...targetCluster, rel.sourceId, rel.targetId]);
      
      // Update all members to point to same cluster
      merged.forEach(id => siblingClusters.set(id, merged));
    }
  });
  
  // Convert clusters to unique groups (avoid processing same cluster multiple times)
  const processedClusters = new Set<string>();
  
  siblingClusters.forEach((cluster) => {
    const clusterId = Array.from(cluster).sort().join('|');
    
    if (!processedClusters.has(clusterId) && cluster.size > 1) {
      processedClusters.add(clusterId);
      
      // Sort siblings for consistent behavior
      const sortedSiblings = Array.from(cluster).sort();
      
      // Check if we should allow collapse for this group
      const shouldCollapse = principalId 
        ? shouldAllowCollapseForGroup(sortedSiblings, principalId, relations)
        : sortedSiblings.length > 2; // Default behavior if no principal
      
      if (shouldCollapse && sortedSiblings.length > 2) {
        const secondSiblingId = sortedSiblings[1]; // Al doilea devine container
        
        groups.set(secondSiblingId, {
          id: secondSiblingId,
          parentIds: [], // Not tracking parents for sibling-only relations
          siblingIds: sortedSiblings,
          collapsedSiblingIds: sortedSiblings.slice(2), // All except first 2
          isCollapsed: true,
        });
      }
    }
  });

  return groups;
}

/**
 * Verifică dacă o persoană este în grup colapsabil și returnează info
 */
export function getCollapsedPeopleInfo(
  personId: string,
  siblingGroups: Map<string, SiblingGroup>
): CollapsedPeopleInfo {
  // Verifică dacă această persoană este un grup
  const group = siblingGroups.get(personId);
  if (group && group.isCollapsed) {
    return {
      personId,
      isInCollapsedGroup: true,
      groupId: personId,
      hiddenCount: group.collapsedSiblingIds.length,
    };
  }

  // Verifică dacă această persoană e ascunsă într-un grup
  for (const [groupId, group] of siblingGroups) {
    if (group.isCollapsed && group.collapsedSiblingIds.includes(personId)) {
      return {
        personId,
        isInCollapsedGroup: true,
        groupId,
        hiddenCount: 0,
      };
    }
  }

  return {
    personId,
    isInCollapsedGroup: false,
    hiddenCount: 0,
  };
}

/**
 * Obține lista de persoane care ar trebui ascunse din afișare
 */
export function getHiddenPeopleIds(
  siblingGroups: Map<string, SiblingGroup>
): Set<string> {
  const hidden = new Set<string>();
  
  siblingGroups.forEach((group) => {
    if (group.isCollapsed) {
      group.collapsedSiblingIds.forEach(id => hidden.add(id));
    }
  });

  return hidden;
}

/**
 * Toggle collapse pentru un grup de frați
 */
export function toggleGroupCollapse(
  groupId: string,
  siblingGroups: Map<string, SiblingGroup>
): Map<string, SiblingGroup> {
  const group = siblingGroups.get(groupId);
  if (!group) return siblingGroups;

  const newGroups = new Map(siblingGroups);
  newGroups.set(groupId, {
    ...group,
    isCollapsed: !group.isCollapsed,
  });

  return newGroups;
}

/**
 * Validează că grupul de collapse e consistent
 */
export function validateSiblingGroup(group: SiblingGroup): boolean {
  return (
    group.siblingIds.length > 2 &&
    group.collapsedSiblingIds.length > 0 &&
    group.siblingIds.includes(group.id) &&
    group.collapsedSiblingIds.every(id => group.siblingIds.includes(id))
  );
}

/**
 * Calculate the generational distance/degree from principal person
 * Uses BFS (breadth-first search) to find shortest path
 * 
 * Degree 0: The principal person themselves
 * Degree 1: Parents, children, partners, grandparents
 * Degree 2: Siblings, aunts/uncles, cousins
 * Degree 3+: Distant relatives
 */
export function calculateDegreeFromPrincipal(
  personId: string,
  relations: Relation[],
  principalId: string
): number {
  if (personId === principalId) return 0;

  const visited = new Set<string>();
  const queue: [personId: string, degree: number][] = [[principalId, 0]];

  while (queue.length > 0) {
    const [currentId, currentDegree] = queue.shift()!;

    if (currentId === personId) return currentDegree;
    if (visited.has(currentId)) continue;

    visited.add(currentId);

    // Find all directly related people (any relation type)
    const relatedIds = new Set<string>();
    relations.forEach((rel) => {
      if (rel.sourceId === currentId) relatedIds.add(rel.targetId);
      if (rel.targetId === currentId) relatedIds.add(rel.sourceId);
    });

    // Add unvisited related people to queue
    relatedIds.forEach((id) => {
      if (!visited.has(id)) {
        queue.push([id, currentDegree + 1]);
      }
    });
  }

  return 999; // Not found / not related
}

/**
 * Determine if a sibling group should allow collapse based on degree from principal
 * 
 * Degree 0 (principal): Never collapse
 * Degree 1 (parents, children, partners, grandparents): Never collapse
 * Degree 2 (siblings, uncles/aunts, cousins): Collapse if >2 siblings
 * Degree 3+ (distant relatives): Collapse if >1
 */
export function shouldAllowCollapseForGroup(
  siblingGroupIds: string[],
  principalId: string,
  relations: Relation[]
): boolean {
  if (siblingGroupIds.length < 2) return false;

  // Calculate degree for first sibling (all in group have same degree)
  const degree = calculateDegreeFromPrincipal(
    siblingGroupIds[0],
    relations,
    principalId
  );

  // Degree 0 & 1: Never collapse
  if (degree <= 1) return false;

  // Degree 2: Collapse only if >2 siblings
  if (degree === 2) return siblingGroupIds.length > 2;

  // Degree 3+: Collapse if >1
  return siblingGroupIds.length > 1;
}
