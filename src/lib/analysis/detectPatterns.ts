/**
 * Pattern Detection Utility
 * Detects Anniversary Syndrome, Age Repetition, and Generational Echoes
 * Based on transgenerational psychology and psychosomatic patterns
 */

import type { PatternResult, AnalysisNode, AnalysisEdge, PatternType } from './types';

const DEFAULT_ANNIVERSARY_TOLERANCE_DAYS = 7;
const DEFAULT_AGE_TOLERANCE_YEARS = 1;

/**
 * Parses a date string to extract year, month, day
 * Handles various formats: YYYY-MM-DD, MM/DD/YYYY, etc.
 */
function parseDate(dateStr?: string): { year?: number; month?: number; day?: number } | null {
  if (!dateStr) return null;

  const patterns = [
    /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
    /(\d{2})\/(\d{2})\/(\d{4})/, // MM/DD/YYYY
    /(\d{4})/, // Just year
  ];

  for (const pattern of patterns) {
    const match = dateStr.match(pattern);
    if (match) {
      if (match.length === 4) {
        // YYYY-MM-DD format
        return { year: parseInt(match[1]), month: parseInt(match[2]), day: parseInt(match[3]) };
      } else if (match.length === 4 && dateStr.includes('/')) {
        // MM/DD/YYYY format
        return { year: parseInt(match[3]), month: parseInt(match[1]), day: parseInt(match[2]) };
      } else if (match.length === 2) {
        // Just year
        return { year: parseInt(match[1]) };
      }
    }
  }

  return null;
}

/**
 * Calculates age at a given date
 * @param birthDate - Birth date string
 * @param eventDate - Event date string
 * @returns Age in years or null if cannot calculate
 */
function calculateAgeAtEvent(birthDate?: string, eventDate?: string): number | null {
  if (!birthDate || !eventDate) return null;

  const birth = parseDate(birthDate);
  const event = parseDate(eventDate);

  if (!birth?.year || !event?.year) return null;

  let age = event.year - birth.year;

  // Adjust if month/day info is available and event hasn't occurred yet in the year
  if (birth.month && event.month && event.month < birth.month) {
    age--;
  } else if (birth.month && event.month === birth.month && birth.day && event.day && event.day < birth.day) {
    age--;
  }

  return Math.max(0, age);
}

/**
 * Calculates days between two dates
 * Returns absolute difference
 */
function daysBetweenDates(date1?: string, date2?: string): number | null {
  if (!date1 || !date2) return null;

  try {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;

    return Math.abs(Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
  } catch {
    return null;
  }
}

/**
 * Finds parent-child relationships
 */
function findParentChildPairs(edges: AnalysisEdge[]): Array<[string, string]> {
  return edges
    .filter((e) => e.type === 'parent-child')
    .map((e) => [e.sourceId, e.targetId] as [string, string]);
}

/**
 * Detects anniversary syndrome - trauma/events repeating on same date across generations
 */
function detectAnniversarySyndrome(
  nodes: AnalysisNode[],
  parentChildPairs: Array<[string, string]>,
  tolerance: number
): PatternResult[] {
  const patterns: PatternResult[] = [];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Define significant event types
  const eventTypes = ['death', 'divorce', 'trauma', 'illness'];

  parentChildPairs.forEach(([parentId, childId]) => {
    const parent = nodeMap.get(parentId);
    const child = nodeMap.get(childId);

    if (!parent || !child) return;

    // Check for death anniversaries
    if (parent.dateOfDeath && child.dateOfDeath) {
      const daysDiff = daysBetweenDates(parent.dateOfDeath, child.dateOfDeath);
      if (daysDiff !== null && daysDiff <= tolerance) {
        patterns.push({
          type: 'anniversary_date',
          sourcePersonId: parentId,
          targetPersonId: childId,
          generationDifference: 1,
          description: `Anniversary syndrome: Both died ${daysDiff} days apart (${parent.name || parentId} and ${child.name || childId})`,
          sourceEvent: {
            type: 'death',
            date: parent.dateOfDeath,
          },
          targetEvent: {
            type: 'death',
            date: child.dateOfDeath,
          },
          confidence: 1 - daysDiff / tolerance, // Higher confidence for closer dates
          timeDifference: daysDiff,
        });
      }
    }

    // Check for significant event coincidences
    if (parent.significantEvents && child.significantEvents) {
      parent.significantEvents.forEach((parentEvent) => {
        child.significantEvents?.forEach((childEvent) => {
          // Very simple heuristic: if both mention same type (divorce, trauma, etc.)
          const eventTypeMatch = eventTypes.some(
            (type) => parentEvent.toLowerCase().includes(type) && childEvent.toLowerCase().includes(type)
          );

          if (eventTypeMatch) {
            patterns.push({
              type: 'anniversary_date',
              sourcePersonId: parentId,
              targetPersonId: childId,
              generationDifference: 1,
              description: `Event repetition: "${parentEvent}" (parent) and "${childEvent}" (child)`,
              confidence: 0.6,
            });
          }
        });
      });
    }
  });

  return patterns;
}

/**
 * Detects age repetition - trauma/events occurring at same age across generations
 */
function detectAgeRepetition(
  nodes: AnalysisNode[],
  parentChildPairs: Array<[string, string]>,
  tolerance: number
): PatternResult[] {
  const patterns: PatternResult[] = [];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  parentChildPairs.forEach(([parentId, childId]) => {
    const parent = nodeMap.get(parentId);
    const child = nodeMap.get(childId);

    if (!parent || !child) return;

    // Compare death ages
    if (parent.dateOfBirth && parent.dateOfDeath && child.dateOfBirth && child.dateOfDeath) {
      const parentDeathAge = calculateAgeAtEvent(parent.dateOfBirth, parent.dateOfDeath);
      const childDeathAge = calculateAgeAtEvent(child.dateOfBirth, child.dateOfDeath);

      if (parentDeathAge !== null && childDeathAge !== null) {
        const ageDiff = Math.abs(parentDeathAge - childDeathAge);

        if (ageDiff <= tolerance) {
          patterns.push({
            type: 'age_repetition',
            sourcePersonId: parentId,
            targetPersonId: childId,
            generationDifference: 1,
            description: `Age repetition: ${parent.name || parentId} died at ${parentDeathAge}, ${child.name || childId} died at ${childDeathAge}`,
            sourceEvent: {
              type: 'death',
              date: parent.dateOfDeath,
              age: parentDeathAge,
            },
            targetEvent: {
              type: 'death',
              date: child.dateOfDeath,
              age: childDeathAge,
            },
            confidence: 1 - ageDiff / (tolerance * 2), // Higher confidence for closer ages
            timeDifference: ageDiff,
          });
        }
      }
    }

    // Compare marriage/divorce ages (if we had that data)
    // This is a placeholder for future enhancement
  });

  return patterns;
}

/**
 * Detects generational echoes - behavioral or attribute patterns repeating
 */
function detectGenerationalEchoes(
  nodes: AnalysisNode[],
  parentChildPairs: Array<[string, string]>
): PatternResult[] {
  const patterns: PatternResult[] = [];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Map of psychological attributes to watch for
  const psychAttributes = new Set(['depression', 'anxiety', 'addiction', 'narcissism', 'bipolar', 'schizophrenia']);

  parentChildPairs.forEach(([parentId, childId]) => {
    const parent = nodeMap.get(parentId);
    const child = nodeMap.get(childId);

    if (!parent || !child) return;

    // Check if parent and child have similar attributes
    const parentAttrs = parent.attributes || [];
    const childAttrs = child.attributes || [];

    const sharedAttrs = parentAttrs.filter((attr) => {
      return childAttrs.some((childAttr) => {
        const pLower = attr.toLowerCase();
        const cLower = childAttr.toLowerCase();
        // Simple match: exact match or both contain same word
        return (
          pLower === cLower ||
          psychAttributes.has(pLower) && psychAttributes.has(cLower) && pLower === cLower
        );
      });
    });

    if (sharedAttrs.length > 0) {
      patterns.push({
        type: 'generational_echo',
        sourcePersonId: parentId,
        targetPersonId: childId,
        generationDifference: 1,
        description: `Generational echo: Both share attributes - ${sharedAttrs.join(', ')}`,
        confidence: Math.min(0.9, 0.5 + sharedAttrs.length * 0.2),
      });
    }
  });

  return patterns;
}

/**
 * Main function: Detect all patterns in the family tree
 */
export function detectPatterns(
  nodes: AnalysisNode[],
  edges: AnalysisEdge[],
  anniversaryTolerance: number = DEFAULT_ANNIVERSARY_TOLERANCE_DAYS,
  ageTolerance: number = DEFAULT_AGE_TOLERANCE_YEARS
): PatternResult[] {
  if (nodes.length < 2) return [];

  const parentChildPairs = findParentChildPairs(edges);
  if (parentChildPairs.length === 0) return [];

  const patterns: PatternResult[] = [];

  // Detect anniversary syndrome
  patterns.push(...detectAnniversarySyndrome(nodes, parentChildPairs, anniversaryTolerance));

  // Detect age repetition
  patterns.push(...detectAgeRepetition(nodes, parentChildPairs, ageTolerance));

  // Detect generational echoes
  patterns.push(...detectGenerationalEchoes(nodes, parentChildPairs));

  // Remove very low confidence results
  return patterns.filter((p) => p.confidence > 0.3);
}

/**
 * Filters patterns by type
 */
export function filterPatternsByType(patterns: PatternResult[], type: PatternType): PatternResult[] {
  return patterns.filter((p) => p.type === type);
}

/**
 * Finds patterns involving a specific person
 */
export function findPatternsForPerson(patterns: PatternResult[], personId: string): PatternResult[] {
  return patterns.filter((p) => p.sourcePersonId === personId || p.targetPersonId === personId);
}

/**
 * Gets statistics about detected patterns
 */
export function getPatternStatistics(patterns: PatternResult[]) {
  const byType = new Map<PatternType, number>();

  patterns.forEach((p) => {
    byType.set(p.type, (byType.get(p.type) || 0) + 1);
  });

  return {
    total: patterns.length,
    byType: Object.fromEntries(byType),
    averageConfidence: patterns.length > 0
      ? patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length
      : 0,
  };
}
