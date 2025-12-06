/**
 * Sibling Rank Analysis
 * Implements Walter Toman's Birth Order Theory
 * Analyzes how sibling position affects psychology and relationship compatibility
 */

import type { SiblingRankResult, CoupleAnalysisResult } from './types';
import type { AnalysisNode, AnalysisEdge } from './types';

/**
 * Determines the birth order rank of a person based on their position among siblings
 * @param personId - ID of the person to analyze
 * @param people - All people in the genogram
 * @param relations - All relationships in the genogram
 * @returns SiblingRankResult with rank assignment
 */
function determineSiblingRank(
  personId: string,
  people: AnalysisNode[],
  relations: AnalysisEdge[]
): SiblingRankResult {
  const person = people.find((p) => p.id === personId);
  if (!person) {
    return {
      personId,
      rank: 'OnlyChild',
      rankDescription: 'Person not found in dataset',
    };
  }

  // Find all parent-child relationships where this person is the child
  const parentRelations = relations.filter(
    (r) =>
      r.targetId === personId &&
      (r.type === 'parent-child' || r.type === 'child-parent')
  );

  if (parentRelations.length === 0) {
    return {
      personId,
      rank: 'OnlyChild',
      rankDescription: 'No parent relationships found - independent person or missing parent data',
    };
  }

  // Get unique parent IDs
  const parentIds = Array.from(new Set(parentRelations.map((r) => r.sourceId)));

  // Find all siblings (people with the same parents)
  const siblingIds = new Set<string>();
  parentIds.forEach((parentId) => {
    const childRelations = relations.filter(
      (r) =>
        r.sourceId === parentId &&
        (r.type === 'parent-child' || r.type === 'child-parent')
    );
    childRelations.forEach((r) => {
      siblingIds.add(r.targetId);
    });
  });

  siblingIds.add(personId);
  const siblings = Array.from(siblingIds).map((id) =>
    people.find((p) => p.id === id)
  ) as AnalysisNode[];

  if (siblings.length === 1) {
    return {
      personId,
      rank: 'OnlyChild',
      rankDescription: 'Only child - tends to be serious, responsible, leader-oriented',
    };
  }

  // Sort siblings by birth date (fallback to alphabetical if no date)
  siblings.sort((a, b) => {
    if (!a.dateOfBirth && !b.dateOfBirth) return a.id.localeCompare(b.id);
    if (!a.dateOfBirth) return 1;
    if (!b.dateOfBirth) return -1;
    return new Date(a.dateOfBirth).getTime() - new Date(b.dateOfBirth).getTime();
  });

  const position = siblings.findIndex((s) => s.id === personId);

  if (position === 0) {
    return {
      personId,
      rank: 'Oldest',
      rankDescription:
        'Firstborn - typically responsible, leader, perfectionist, caretaker tendencies',
    };
  }

  if (position === siblings.length - 1) {
    return {
      personId,
      rank: 'Youngest',
      rankDescription:
        'Youngest - often charming, dependent, less responsible, seeks approval',
    };
  }

  return {
    personId,
    rank: 'Middle',
    rankDescription:
      'Middle child - diplomat, mediator, independent, sometimes feels excluded',
  };
}

/**
 * Analyzes a romantic/marital relationship for compatibility based on birth order
 * @param sourceId - First partner ID
 * @param targetId - Second partner ID
 * @param ranks - Map of person ID to their sibling rank
 * @returns CoupleAnalysisResult with compatibility assessment
 */
function analyzeCoupleCompatibility(
  relationId: string,
  sourceId: string,
  targetId: string,
  ranks: Map<string, SiblingRankResult>
): CoupleAnalysisResult {
  const rankA = ranks.get(sourceId);
  const rankB = ranks.get(targetId);

  if (!rankA || !rankB) {
    return {
      relationId,
      coupleIds: [sourceId, targetId],
      compatibility: 'Neutral',
      insight: 'Unable to determine birth order for one or both partners',
    };
  }

  // Both oldest - Power conflict potential
  if (rankA.rank === 'Oldest' && rankB.rank === 'Oldest') {
    return {
      relationId,
      coupleIds: [sourceId, targetId],
      compatibility: 'Low',
      insight:
        'RANK CONFLICT: Both partners are used to leading. Risk of power struggles, controlling behavior, and competitive dynamics. May work if they can establish clear domains of authority.',
    };
  }

  // Both youngest - Chaos/lack of direction
  if (rankA.rank === 'Youngest' && rankB.rank === 'Youngest') {
    return {
      relationId,
      coupleIds: [sourceId, targetId],
      compatibility: 'Low',
      insight:
        'RANK CONFLICT: Both partners may avoid responsibility and decision-making. Risk of disorganization, financial instability, and lack of direction. One may need to step into leadership role.',
    };
  }

  // Oldest + Youngest - Ideal complementarity
  if (
    (rankA.rank === 'Oldest' && rankB.rank === 'Youngest') ||
    (rankA.rank === 'Youngest' && rankB.rank === 'Oldest')
  ) {
    return {
      relationId,
      coupleIds: [sourceId, targetId],
      compatibility: 'High',
      insight:
        'COMPLEMENTARY PAIR: Natural role fit - one naturally leads/cares, the other adapts/follows. This pairing often shows high relationship satisfaction and stability.',
    };
  }

  // Only child combinations
  if (rankA.rank === 'OnlyChild' && rankB.rank === 'OnlyChild') {
    return {
      relationId,
      coupleIds: [sourceId, targetId],
      compatibility: 'Neutral',
      insight:
        'TWO ONLY CHILDREN: Both may expect to be the center of attention and may struggle with compromise. Works well if both are emotionally mature and willing to share focus.',
    };
  }

  if (rankA.rank === 'OnlyChild' || rankB.rank === 'OnlyChild') {
    return {
      relationId,
      coupleIds: [sourceId, targetId],
      compatibility: 'High',
      insight:
        'GOOD MATCH: Only child with sibling-experienced partner tends to work well. One brings stability, the other brings adaptability.',
    };
  }

  // Middle child with anyone tends to be compatible
  if (rankA.rank === 'Middle' || rankB.rank === 'Middle') {
    return {
      relationId,
      coupleIds: [sourceId, targetId],
      compatibility: 'High',
      insight:
        'GOOD MATCH: Middle child role as diplomat/mediator helps smooth relationship dynamics. Usually compromising and flexible.',
    };
  }

  return {
    relationId,
    coupleIds: [sourceId, targetId],
    compatibility: 'Neutral',
    insight: 'Standard sibling rank relationship - outcomes depend on individual maturity.',
  };
}

/**
 * Analyzes sibling ranks for all people and relationship compatibility
 * @param people - All people in the genogram
 * @param relations - All relationships in the genogram
 * @returns Object with siblingRanks map and coupleAnalysis array
 */
export function analyzeSiblings(
  people: AnalysisNode[],
  relations: AnalysisEdge[]
): {
  siblingRanks: Record<string, SiblingRankResult>;
  coupleDynamics: CoupleAnalysisResult[];
} {
  const siblingRanks: Record<string, SiblingRankResult> = {};
  const siblingRankMap = new Map<string, SiblingRankResult>();

  // Determine rank for all people
  people.forEach((person) => {
    const rank = determineSiblingRank(person.id, people, relations);
    siblingRanks[person.id] = rank;
    siblingRankMap.set(person.id, rank);
  });

  // Analyze couple dynamics
  const coupleDynamics: CoupleAnalysisResult[] = [];
  const processedPairs = new Set<string>();

  relations.forEach((relation) => {
    const relationType = relation.type?.toLowerCase();
    const isPartnerRelation =
      relationType === 'partner' ||
      relationType === 'married' ||
      relationType === 'ex-partner';

    if (!isPartnerRelation) return;

    // Create pair key to avoid duplicates
    const pairKey = [relation.sourceId, relation.targetId].sort().join('|');
    if (processedPairs.has(pairKey)) return;
    processedPairs.add(pairKey);

    const analysis = analyzeCoupleCompatibility(
      relation.id,
      relation.sourceId,
      relation.targetId,
      siblingRankMap
    );
    coupleDynamics.push(analysis);
  });

  return { siblingRanks, coupleDynamics };
}

/**
 * Gets detailed insight about a person's sibling position and psychology
 * @param personId - Person to analyze
 * @param siblingRanks - Sibling rank results
 * @returns Detailed psychological insights based on birth order
 */
export function getSiblingInsights(
  personId: string,
  siblingRanks: Record<string, SiblingRankResult>
): string[] {
  const rank = siblingRanks[personId];
  if (!rank) return [];

  const insights: string[] = [];

  switch (rank.rank) {
    case 'Oldest':
      insights.push(
        'As the firstborn, likely carries responsibility for family stability'
      );
      insights.push(
        'May have perfectionist tendencies and high self-expectations'
      );
      insights.push(
        'Natural leader - can be controlling if not self-aware'
      );
      insights.push('Often parental figure to younger siblings');
      break;

    case 'Youngest':
      insights.push('As the youngest, may have experienced overprotection');
      insights.push(
        'Tends to be more emotionally expressive and people-focused'
      );
      insights.push(
        'May struggle with independence and decision-making authority'
      );
      insights.push(
        'Often charismatic and good at getting support from others'
      );
      break;

    case 'Middle':
      insights.push('As a middle child, likely developed mediation skills');
      insights.push('May feel squeezed between older and younger dynamics');
      insights.push('Typically more flexible and compromising in relationships');
      insights.push('Often independent and comfortable in supporting roles');
      break;

    case 'OnlyChild':
      insights.push('As an only child, received full parental attention');
      insights.push('May have high expectations for self and others');
      insights.push('Can struggle with peer relationships initially');
      insights.push('Often mature for age but may lack collaborative experience');
      break;
  }

  return insights;
}
