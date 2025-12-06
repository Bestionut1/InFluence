import type { Person, RelationType } from '../types/genogram';

export interface RelationValidation {
  isValid: boolean;
  warnings: string[];
  suggestions: Array<{
    type: RelationType;
    reason: string;
    confidence: 'high' | 'medium' | 'low';
  }>;
}

/**
 * Validates a relation between two people and suggests corrections
 */
export function validateRelation(
  sourcePerson: Person | undefined,
  targetPerson: Person | undefined,
  relationType: RelationType,
  // allPeople parameter kept for future extensibility
  _allPeople?: Person[]
): RelationValidation {
  const validation: RelationValidation = {
    isValid: true,
    warnings: [],
    suggestions: [],
  };

  if (!sourcePerson || !targetPerson) {
    validation.isValid = false;
    return validation;
  }

  // Check age-based logic
  const sourceAge = sourcePerson.age;
  const targetAge = targetPerson.age;

  if (sourceAge !== undefined && targetAge !== undefined) {
    const ageDiff = sourceAge - targetAge;

    // Parent-child: parent should typically be older
    if (relationType === 'parent-child' && ageDiff < 13) {
      validation.warnings.push(
        `Age difference is only ${Math.abs(ageDiff)} years. Parent-child relations typically have 13+ year difference.`
      );
    }

    // Siblings: should be relatively close in age
    if (
      ['biological-sibling', 'half-sibling', 'full-sibling', 'step-sibling', 'twin'].includes(
        relationType
      )
    ) {
      if (Math.abs(ageDiff) > 30) {
        validation.warnings.push(
          `Age difference is ${Math.abs(ageDiff)} years. Siblings are typically closer in age.`
        );
      }
      if (relationType === 'twin' && ageDiff !== 0) {
        validation.warnings.push('Twins should have the same age.');
      }
    }
  }

  // Note: Existing relation check is handled at modal level with relations array

  // Suggest relations based on ages
  if (sourceAge !== undefined && targetAge !== undefined) {
    const ageDiff = sourceAge - targetAge;

    if (ageDiff >= 13 && ageDiff <= 50) {
      validation.suggestions.push({
        type: 'parent-child',
        reason: 'Age difference suggests parent-child relation',
        confidence: 'high',
      });
    }

    if (Math.abs(ageDiff) <= 10 && Math.abs(ageDiff) > 0) {
      validation.suggestions.push({
        type: 'biological-sibling',
        reason: 'Similar ages suggest sibling relation',
        confidence: 'high',
      });
    }

    if (ageDiff === 0 && sourcePerson.gender !== targetPerson.gender) {
      validation.suggestions.push({
        type: 'partner',
        reason: 'Same age with different gender could indicate partnership',
        confidence: 'medium',
      });
    }
  }

  return validation;
}

/**
 * Suggests relation types based on two people
 */
export function suggestRelationTypes(
  sourcePerson: Person,
  targetPerson: Person,
  allPeople: Person[]
): Array<{ type: RelationType; label: string; confidence: 'high' | 'medium' | 'low' }> {
  const suggestions: Array<{ type: RelationType; label: string; confidence: 'high' | 'medium' | 'low' }> = [];

  const validation = validateRelation(sourcePerson, targetPerson, 'parent-child', allPeople);

  validation.suggestions.forEach((sugg) => {
    suggestions.push({
      type: sugg.type,
      label: `${sugg.reason} (${sugg.confidence} confidence)`,
      confidence: sugg.confidence,
    });
  });

  return suggestions.sort((a, b) => {
    const confidenceOrder = { high: 0, medium: 1, low: 2 };
    return confidenceOrder[a.confidence] - confidenceOrder[b.confidence];
  });
}

/**
 * Checks if two people likely already have a relation
 */
export function hasExistingRelation(
  sourcePerson: Person,
  targetPerson: Person,
  relations: any[]
): {
  exists: boolean;
  type?: string;
  direction?: string;
} {
  const directRelation = relations.find(
    (r) =>
      (r.sourceId === sourcePerson.id && r.targetId === targetPerson.id) ||
      (r.sourceId === targetPerson.id && r.targetId === sourcePerson.id)
  );

  if (directRelation) {
    const isSource = directRelation.sourceId === sourcePerson.id;
    return {
      exists: true,
      type: directRelation.type,
      direction: isSource ? '→' : '←',
    };
  }

  return { exists: false };
}
