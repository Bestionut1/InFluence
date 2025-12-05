/**
 * Genogram Validation Utility
 * Provides data validation rules for family tree data
 * Validates age gaps, death dates, status consistency, and data completeness
 */

import type { Person, Relation } from '../types/genogram';

export interface ValidationError {
  type: 'error' | 'warning';
  personId?: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Validate an entire genogram
 * Runs all validation rules and returns comprehensive results
 */
export const validateGenogram = (
  people: Person[],
  relations: Relation[]
): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Rule 1: Check for invalid age gaps between parents and children
  errors.push(...validateAgeGaps(people, relations));

  // Rule 2: Check for death before birth scenarios
  errors.push(...validateDeathBeforeBirth(people));

  // Rule 3: Check for missing critical data
  warnings.push(...validateMissingData(people));

  // Rule 4: Check for status consistency issues
  warnings.push(...validateStatusConsistency(people));

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * RULE 1: Validate age gaps between generations
 * Parents should be at least 15-17 years older than children
 * Flags suspicious scenarios (e.g., 10-year gap, or parent younger than child)
 */
const validateAgeGaps = (people: Person[], relations: Relation[]): ValidationError[] => {
  const errors: ValidationError[] = [];
  const MIN_PARENT_AGE_AT_BIRTH = 15; // Minimum realistic age for parent at child's birth
  const MAX_PARENT_AGE_AT_BIRTH = 75; // Maximum realistic age for parent at child's birth (allow advanced paternal age)

  // Build parent-child relationships
  const parentChildMap = new Map<string, string[]>();
  relations.forEach((rel) => {
    if (rel.type === 'parent-child') {
      const children = parentChildMap.get(rel.sourceId) || [];
      children.push(rel.targetId);
      parentChildMap.set(rel.sourceId, children);
    }
  });

  // Check each parent-child pair
  parentChildMap.forEach((childIds, parentId) => {
    const parent = people.find((p) => p.id === parentId);
    if (!parent || parent.age === undefined) return;

    childIds.forEach((childId) => {
      const child = people.find((p) => p.id === childId);
      if (!child || child.age === undefined) return;

      const ageDifference = parent.age! - child.age!;

      if (ageDifference < MIN_PARENT_AGE_AT_BIRTH) {
        errors.push({
          type: 'error',
          personId: parentId,
          message: `Age gap too small: ${parent.name} (age ${parent.age}) appears to be only ${ageDifference} years older than ${child.name} (age ${child.age}). Minimum 15 years required.`,
          severity: 'high',
        });
      }

      if (ageDifference > MAX_PARENT_AGE_AT_BIRTH) {
        errors.push({
          type: 'error',
          personId: parentId,
          message: `Age gap too large: ${parent.name} (age ${parent.age}) is ${ageDifference} years older than ${child.name} (age ${child.age}). Consider if this is accurate.`,
          severity: 'medium',
        });
      }

      if (ageDifference < 0) {
        errors.push({
          type: 'error',
          personId: parentId,
          message: `Invalid age gap: ${parent.name} is younger than child ${child.name}. Please correct the ages.`,
          severity: 'high',
        });
      }
    });
  });

  return errors;
};

/**
 * RULE 2: Validate death date consistency
 * Death date should not be before birth date
 * Living people should not have a death date
 * Deceased people should have status === 'deceased'
 */
const validateDeathBeforeBirth = (people: Person[]): ValidationError[] => {
  const errors: ValidationError[] = [];

  people.forEach((person) => {
    if (!person.dateOfBirth || !person.dateOfDeath) return;

    // Check if death is before birth
    const birthDate = new Date(person.dateOfBirth);
    const deathDate = new Date(person.dateOfDeath);

    if (deathDate < birthDate) {
      errors.push({
        type: 'error',
        personId: person.id,
        message: `${person.name}: Death date (${person.dateOfDeath}) is before birth date (${person.dateOfBirth}). Please correct this.`,
        severity: 'high',
      });
    }

    // Check status consistency
    if (person.status === 'living' && person.dateOfDeath) {
      errors.push({
        type: 'error',
        personId: person.id,
        message: `${person.name} is marked as 'living' but has a death date (${person.dateOfDeath}). Change status to 'deceased' or remove death date.`,
        severity: 'high',
      });
    }

    if (person.status === 'deceased' && !person.dateOfDeath) {
      errors.push({
        type: 'error',
        personId: person.id,
        message: `${person.name} is marked as 'deceased' but has no death date recorded. Add death date for accuracy.`,
        severity: 'medium',
      });
    }
  });

  return errors;
};

/**
 * RULE 3: Validate missing critical data
 * Warns about missing names, ages, gender, or dates that affect analysis
 */
const validateMissingData = (people: Person[]): ValidationError[] => {
  const warnings: ValidationError[] = [];

  people.forEach((person) => {
    if (!person.name || person.name.trim() === '') {
      warnings.push({
        type: 'warning',
        personId: person.id,
        message: 'Missing name: Person has no name recorded.',
        severity: 'high',
      });
    }

    if (!person.age && person.status === 'living') {
      warnings.push({
        type: 'warning',
        personId: person.id,
        message: `${person.name}: Missing age. Age helps validate family relationships and patterns.`,
        severity: 'low',
      });
    }

    if (!person.gender || person.gender === 'unknown') {
      warnings.push({
        type: 'warning',
        personId: person.id,
        message: `${person.name}: Gender not specified. This affects genogram symbols and may impact analysis.`,
        severity: 'low',
      });
    }

    if (!person.dateOfBirth && person.status === 'living') {
      warnings.push({
        type: 'warning',
        personId: person.id,
        message: `${person.name}: Missing birth date. Recording dates improves accuracy of family history.`,
        severity: 'low',
      });
    }

    if (person.healthHistory && person.healthHistory.length > 0 && !person.healthHistory[0].diagnosedDate) {
      warnings.push({
        type: 'warning',
        personId: person.id,
        message: `${person.name}: Health conditions recorded but no diagnosis dates. Dating conditions helps track patterns.`,
        severity: 'low',
      });
    }
  });

  return warnings;
};

/**
 * RULE 4: Validate status consistency
 * Checks that deceased individuals have consistent death-related data
 * Validates that living people don't have conflicting status indicators
 */
const validateStatusConsistency = (people: Person[]): ValidationError[] => {
  const warnings: ValidationError[] = [];

  people.forEach((person) => {
    // Deceased people should have some death-related information
    if (person.status === 'deceased') {
      if (!person.causeOfDeath && !person.dateOfDeath) {
        warnings.push({
          type: 'warning',
          personId: person.id,
          message: `${person.name} is marked as deceased but has no death date or cause recorded. Add details to create complete record.`,
          severity: 'medium',
        });
      }
    }

    // Living people shouldn't have cause of death
    if (person.status === 'living' && person.causeOfDeath && person.causeOfDeath !== 'unknown') {
      warnings.push({
        type: 'warning',
        personId: person.id,
        message: `${person.name} is marked as living but has a cause of death recorded. Remove or change status.`,
        severity: 'medium',
      });
    }

    // Check for conflicting health status
    if (person.status === 'deceased' && person.healthHistory && person.healthHistory.length > 0) {
      const activeConditions = person.healthHistory.filter((h) => h.status === 'active');
      if (activeConditions.length > 0) {
        warnings.push({
          type: 'warning',
          personId: person.id,
          message: `${person.name} is deceased but has 'active' health conditions. Update condition status to 'resolved' or mark as cause of death.`,
          severity: 'low',
        });
      }
    }
  });

  return warnings;
};

/**
 * Validate a single person's data
 * Used for real-time validation in forms
 */
export const validatePerson = (person: Partial<Person>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!person.name || person.name.trim() === '') {
    errors.push({
      type: 'error',
      personId: person.id,
      message: 'Name is required',
      severity: 'high',
    });
  }

  if (person.age && (person.age < 0 || person.age > 150)) {
    errors.push({
      type: 'error',
      personId: person.id,
      message: 'Age must be between 0 and 150',
      severity: 'high',
    });
  }

  if (person.dateOfBirth && person.dateOfDeath) {
    const birth = new Date(person.dateOfBirth);
    const death = new Date(person.dateOfDeath);
    if (death < birth) {
      errors.push({
        type: 'error',
        personId: person.id,
        message: 'Death date cannot be before birth date',
        severity: 'high',
      });
    }
  }

  return errors;
};

/**
 * Get validation error summary
 * Used for logging and reporting
 */
export const getValidationSummary = (result: ValidationResult): string => {
  const errorCount = result.errors.length;
  const warningCount = result.warnings.length;
  const highSeverity = [...result.errors, ...result.warnings].filter((e) => e.severity === 'high').length;

  return `Validation: ${errorCount} errors, ${warningCount} warnings (${highSeverity} high priority)`;
};
