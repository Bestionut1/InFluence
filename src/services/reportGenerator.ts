import type { Person, Relation } from '../types/genogram';

export interface PersonStatistics {
  totalPeople: number;
  livingCount: number;
  deceasedCount: number;
  maleCount: number;
  femaleCount: number;
  nonBinaryCount: number;
  unknownGenderCount: number;
  averageAge: number;
  ageRange: { min: number; max: number } | null;
}

export interface HealthStatistics {
  totalHealthRecords: number;
  totalMedicationRecords: number;
  conditionFrequency: Record<string, number>;
  severityDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
  topConditions: Array<{ condition: string; count: number }>;
}

export interface RelationshipStatistics {
  totalRelations: number;
  relationshipTypeFrequency: Record<string, number>;
  averageConnectionsPerPerson: number;
  mostConnectedPerson: { personId: string; personName: string; connectionCount: number } | null;
}

export interface FamilyPattern {
  type: 'health-pattern' | 'relationship-pattern' | 'demographic-pattern';
  title: string;
  description: string;
  prevalence: number; // 0-1, indicating how common this pattern is
  affectedPeople: string[]; // person IDs
  clinicalNote?: string;
}

export interface GenogramReport {
  personStats: PersonStatistics;
  healthStats: HealthStatistics;
  relationshipStats: RelationshipStatistics;
  patterns: FamilyPattern[];
  generatedAt: Date;
}

/**
 * Generate comprehensive statistics for a genogram
 */
export const generateStatistics = (people: Person[], relations: Relation[]): GenogramReport => {
  const personStats = calculatePersonStatistics(people);
  const healthStats = calculateHealthStatistics(people);
  const relationshipStats = calculateRelationshipStatistics(people, relations);
  const patterns = identifyPatterns(people, relations);

  return {
    personStats,
    healthStats,
    relationshipStats,
    patterns,
    generatedAt: new Date(),
  };
};

/**
 * Calculate basic person statistics
 */
const calculatePersonStatistics = (people: Person[]): PersonStatistics => {
  const livingPeople = people.filter((p) => p.status === 'living');
  const deceasedPeople = people.filter((p) => p.status === 'deceased');
  
  const maleCount = people.filter((p) => p.gender === 'male').length;
  const femaleCount = people.filter((p) => p.gender === 'female').length;
  const nonBinaryCount = people.filter((p) => p.gender === 'non-binary').length;
  const unknownGenderCount = people.filter((p) => p.gender === 'unknown').length;

  // Calculate average age for living people with age data
  const peopleWithAge = livingPeople.filter((p) => p.age !== undefined && p.age > 0);
  const averageAge = peopleWithAge.length > 0 
    ? peopleWithAge.reduce((sum, p) => sum + (p.age || 0), 0) / peopleWithAge.length 
    : 0;

  // Get age range
  const ages = peopleWithAge.map((p) => p.age || 0).filter((a) => a > 0);
  const ageRange = ages.length > 0 
    ? { min: Math.min(...ages), max: Math.max(...ages) } 
    : null;

  return {
    totalPeople: people.length,
    livingCount: livingPeople.length,
    deceasedCount: deceasedPeople.length,
    maleCount,
    femaleCount,
    nonBinaryCount,
    unknownGenderCount,
    averageAge: Math.round(averageAge * 10) / 10, // Round to 1 decimal
    ageRange,
  };
};

/**
 * Calculate health-related statistics
 */
const calculateHealthStatistics = (people: Person[]): HealthStatistics => {
  const conditionFrequency: Record<string, number> = {};
  const severityDistribution: Record<string, number> = {};
  const statusDistribution: Record<string, number> = {};
  let totalHealthRecords = 0;
  let totalMedicationRecords = 0;

  people.forEach((person) => {
    // Count health records
    if (person.healthHistory && person.healthHistory.length > 0) {
      totalHealthRecords += person.healthHistory.length;
      
      person.healthHistory.forEach((record) => {
        // Track condition frequency
        conditionFrequency[record.condition] = (conditionFrequency[record.condition] || 0) + 1;
        
        // Track severity distribution
        severityDistribution[record.severity] = (severityDistribution[record.severity] || 0) + 1;
        
        // Track status distribution
        statusDistribution[record.status] = (statusDistribution[record.status] || 0) + 1;
      });
    }

    // Count medication records
    if (person.medications && person.medications.length > 0) {
      totalMedicationRecords += person.medications.length;
    }
  });

  // Get top 5 conditions
  const topConditions = Object.entries(conditionFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([condition, count]) => ({ condition, count }));

  return {
    totalHealthRecords,
    totalMedicationRecords,
    conditionFrequency,
    severityDistribution,
    statusDistribution,
    topConditions,
  };
};

/**
 * Calculate relationship statistics
 */
const calculateRelationshipStatistics = (people: Person[], relations: Relation[]): RelationshipStatistics => {
  const relationshipTypeFrequency: Record<string, number> = {};
  const connectionCounts: Record<string, number> = {};

  // Initialize connection counts for all people
  people.forEach((person) => {
    connectionCounts[person.id] = 0;
  });

  // Count relationships
  relations.forEach((relation) => {
    relationshipTypeFrequency[relation.type] = (relationshipTypeFrequency[relation.type] || 0) + 1;
    connectionCounts[relation.sourceId] = (connectionCounts[relation.sourceId] || 0) + 1;
    connectionCounts[relation.targetId] = (connectionCounts[relation.targetId] || 0) + 1;
  });

  // Calculate average connections
  const totalConnections = Object.values(connectionCounts).reduce((sum, count) => sum + count, 0);
  const averageConnectionsPerPerson = people.length > 0 ? totalConnections / people.length : 0;

  // Find most connected person
  let mostConnectedPerson: { personId: string; personName: string; connectionCount: number } | null = null;
  let maxConnections = 0;
  
  Object.entries(connectionCounts).forEach(([personId, count]) => {
    if (count > maxConnections) {
      maxConnections = count;
      const person = people.find((p) => p.id === personId);
      if (person) {
        mostConnectedPerson = {
          personId,
          personName: person.name || 'Unknown',
          connectionCount: count,
        };
      }
    }
  });

  return {
    totalRelations: relations.length,
    relationshipTypeFrequency,
    averageConnectionsPerPerson: Math.round(averageConnectionsPerPerson * 10) / 10,
    mostConnectedPerson,
  };
};

/**
 * Identify patterns in family dynamics and health data
 */
const identifyPatterns = (people: Person[], relations: Relation[]): FamilyPattern[] => {
  const patterns: FamilyPattern[] = [];

  // Pattern 1: Recurring health conditions
  const conditionCounts: Record<string, { people: string[]; count: number }> = {};
  people.forEach((person) => {
    if (person.healthHistory) {
      person.healthHistory.forEach((record) => {
        if (!conditionCounts[record.condition]) {
          conditionCounts[record.condition] = { people: [], count: 0 };
        }
        conditionCounts[record.condition].people.push(person.id);
        conditionCounts[record.condition].count++;
      });
    }
  });

  // Add patterns for conditions affecting 2+ people
  Object.entries(conditionCounts).forEach(([condition, data]) => {
    if (data.count >= 2) {
      patterns.push({
        type: 'health-pattern',
        title: `${condition} (Multiple Family Members)`,
        description: `${data.count} family member(s) have ${condition}. This may indicate genetic predisposition or shared environmental factors.`,
        prevalence: data.count / people.length,
        affectedPeople: data.people,
        clinicalNote: `Consider screening relatives for ${condition} and exploring preventive measures.`,
      });
    }
  });

  // Pattern 2: High mortality rate or multiple deceased
  const deceasedCount = people.filter((p) => p.status === 'deceased').length;
  if (deceasedCount >= 3 && people.length >= 5) {
    patterns.push({
      type: 'demographic-pattern',
      title: 'Higher Than Average Mortality',
      description: `${deceasedCount} deceased family members detected. Consider exploring cause of death and generational patterns.`,
      prevalence: deceasedCount / people.length,
      affectedPeople: people.filter((p) => p.status === 'deceased').map((p) => p.id),
      clinicalNote: 'Explore historical context, medical history, and potential hereditary patterns.',
    });
  }

  // Pattern 3: Age gap inconsistencies (potential data issues)
  const ageGapIssues: { personId: string; issue: string }[] = [];
  relations.forEach((relation) => {
    if (relation.type.includes('parent-child') || relation.type === 'parent-child') {
      const parent = people.find((p) => p.id === relation.sourceId);
      const child = people.find((p) => p.id === relation.targetId);
      
      if (parent && child && parent.age && child.age) {
        const ageDiff = parent.age - child.age;
        if (ageDiff < 15 || ageDiff > 75) {
          ageGapIssues.push({
            personId: parent.id,
            issue: `Unusual age gap with child (${ageDiff} years)`,
          });
        }
      }
    }
  });

  if (ageGapIssues.length > 0) {
    patterns.push({
      type: 'demographic-pattern',
      title: 'Age Gap Anomalies',
      description: `${ageGapIssues.length} unusual parent-child age gap(s) detected. Consider reviewing data for accuracy.`,
      prevalence: ageGapIssues.length / Math.max(relations.length, 1),
      affectedPeople: ageGapIssues.map((issue) => issue.personId),
      clinicalNote: 'Verify birth dates and relationship types.',
    });
  }

  // Pattern 4: Isolated individuals (no relationships)
  const isolatedPeople = people.filter((person) => {
    const isConnected = relations.some(
      (rel) => rel.sourceId === person.id || rel.targetId === person.id
    );
    return !isConnected;
  });

  if (isolatedPeople.length > 0 && people.length > 3) {
    patterns.push({
      type: 'relationship-pattern',
      title: 'Isolated Family Members',
      description: `${isolatedPeople.length} family member(s) have no documented relationships. Consider if these are complete family records.`,
      prevalence: isolatedPeople.length / people.length,
      affectedPeople: isolatedPeople.map((p) => p.id),
      clinicalNote: 'Add missing relationships or clarify if individuals are disconnected from the primary family system.',
    });
  }

  return patterns;
};

/**
 * Get a human-readable summary of the report
 */
export const getReportSummary = (report: GenogramReport): string => {
  const { personStats, healthStats, relationshipStats } = report;
  
  return `
Family Overview:
- Total family members: ${personStats.totalPeople} (${personStats.livingCount} living, ${personStats.deceasedCount} deceased)
- Gender distribution: ${personStats.maleCount} male, ${personStats.femaleCount} female, ${personStats.nonBinaryCount} non-binary
- Average age: ${personStats.averageAge}${personStats.ageRange ? ` (range: ${personStats.ageRange.min}-${personStats.ageRange.max})` : ''}

Health Profile:
- Total health conditions tracked: ${healthStats.totalHealthRecords}
- Total medications: ${healthStats.totalMedicationRecords}
- Top condition: ${healthStats.topConditions[0]?.condition || 'None tracked'} (${healthStats.topConditions[0]?.count || 0} cases)

Relationships:
- Total relationships: ${relationshipStats.totalRelations}
- Average connections per person: ${relationshipStats.averageConnectionsPerPerson}
- Most connected: ${relationshipStats.mostConnectedPerson?.personName || 'None'} (${relationshipStats.mostConnectedPerson?.connectionCount || 0} connections)

Identified Patterns: ${report.patterns.length}
${report.patterns.map((p) => `- ${p.title}`).join('\n')}
  `.trim();
};
