/**
 * Analysis Types - Psycho-Genealogy Deterministic Analysis
 * Types for triangle detection, pattern recognition, and relationship analysis
 */

// ============================================================================
// TRIANGLE DETECTION TYPES (Bowen Family Systems Theory)
// ============================================================================

export type TriangleType = 'coalition' | 'projection' | 'mediation' | 'exclusion';
export type TriangleSeverity = 'high' | 'medium' | 'low';

/**
 * Represents a detected triangle (3-node pattern) in the family system
 * Based on Bowen's Family Systems Theory
 */
export interface TriangleResult {
  /** IDs of the three people involved [A, B, C] */
  nodes: [string, string, string];

  /** Type of triangulation:
   * - 'coalition': A and C allied against B
   * - 'projection': One person projected onto by other two
   * - 'mediation': C is mediator between A and B
   * - 'exclusion': One person excluded from relationship
   */
  type: TriangleType;

  /** Severity based on relationship tension levels */
  severity: TriangleSeverity;

  /** Detailed description of the pattern */
  description: string;

  /** Relations that form this triangle */
  relations: {
    ab: string; // relation type between A-B
    ac: string; // relation type between A-C
    bc: string; // relation type between B-C
  };

  /** Confidence score (0-1) */
  confidence: number;
}

// ============================================================================
// ANNIVERSARY & REPETITION TYPES
// ============================================================================

export type PatternType = 'anniversary_date' | 'age_repetition' | 'generational_echo';

/**
 * Represents a detected pattern across generations
 * (trauma repetition, anniversary syndrome, age-based patterns)
 */
export interface PatternResult {
  /** Type of pattern detected */
  type: PatternType;

  /** ID of person where pattern originated */
  sourcePersonId: string;

  /** ID of person experiencing repetition */
  targetPersonId: string;

  /** Generation difference (1 = parent-child, 2 = grandparent-grandchild, etc.) */
  generationDifference: number;

  /** Detailed description of the pattern */
  description: string;

  /** Source event details */
  sourceEvent?: {
    type: 'death' | 'divorce' | 'trauma' | 'illness' | 'birth' | 'marriage';
    date?: string;
    age?: number;
  };

  /** Target event details */
  targetEvent?: {
    type: 'death' | 'divorce' | 'trauma' | 'illness' | 'birth' | 'marriage';
    date?: string;
    age?: number;
  };

  /** Confidence score (0-1) */
  confidence: number;

  /** Days/years difference (for time-based patterns) */
  timeDifference?: number;
}

// ============================================================================
// FAMILY SYSTEM DYNAMICS TYPES
// ============================================================================

export interface FamilySystemAnalysis {
  /** Detected triangles */
  triangles: TriangleResult[];

  /** Detected patterns (anniversary syndrome, age repetition) */
  patterns: PatternResult[];

  /** Birth order analysis for all people */
  siblingRanks: Record<string, SiblingRankResult>;

  /** Couple compatibility analysis based on birth order */
  coupleDynamics: CoupleAnalysisResult[];

  /** Family topology: isolates, scapegoats, and central hubs */
  topology: TopologyResult;

  /** Overall family system health (0-100) */
  systemHealth: number;

  /** Key insights and recommendations */
  insights: string[];

  /** List of at-risk relationships */
  atRiskRelationships: Array<{
    personIds: [string, string];
    riskFactor: string;
    severity: 'high' | 'medium' | 'low';
  }>;

  /** Timestamp of analysis */
  analyzedAt: string;
}

// ============================================================================
// INTERNAL HELPER TYPES
// ============================================================================

/**
 * Internal representation of a graph node (person) for analysis
 */
export interface AnalysisNode {
  id: string;
  name: string;
  gender?: 'male' | 'female' | 'non-binary' | 'unknown';
  dateOfBirth?: string;
  dateOfDeath?: string;
  medicalConditions?: string[];
  significantEvents?: string[];
  attributes?: string[];
}

/**
 * Internal representation of a graph edge (relation) for analysis
 */
export interface AnalysisEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: string; // 'parent-child' | 'partner' | 'sibling' | 'conflict' | 'close' | 'distant' | 'fused' | 'ex-partner'
}

/**
 * Represents a clique of 3 nodes (for triangle detection)
 */
export interface Clique3 {
  nodeA: string;
  nodeB: string;
  nodeC: string;
  edges: {
    ab: AnalysisEdge | null;
    ac: AnalysisEdge | null;
    bc: AnalysisEdge | null;
  };
}

// ============================================================================
// SIBLING RANK & COUPLE DYNAMICS (Toman Birth Order Theory)
// ============================================================================

export interface SiblingRankResult {
  /** ID of the person */
  personId: string;

  /** Birth order rank */
  rank: 'Oldest' | 'Middle' | 'Youngest' | 'OnlyChild';

  /** Human-readable description of psychological implications */
  rankDescription: string;
}

export interface CoupleAnalysisResult {
  /** ID of the relationship */
  relationId: string;

  /** IDs of the two partners */
  coupleIds: [string, string];

  /** Compatibility assessment based on birth order */
  compatibility: 'High' | 'Low' | 'Neutral';

  /** Detailed insight about the pairing */
  insight: string;
}

// ============================================================================
// TOPOLOGY & ISOLATION ANALYSIS (Graph Centrality)
// ============================================================================

export interface TopologyResult {
  /** IDs of isolated or cutoff members */
  isolates: string[];

  /** IDs of people receiving disproportionate conflict (scapegoats) */
  scapegoats: string[];

  /** IDs of emotional hubs (central support figures) */
  centralHubs: string[];
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface AnalysisConfig {
  /** Date tolerance in days for anniversary detection */
  anniversaryTolerance: number; // default: 7

  /** Age tolerance in years for age repetition detection */
  ageTolerance: number; // default: 1

  /** Minimum confidence threshold for including results (0-1) */
  confidenceThreshold: number; // default: 0.6

  /** Maximum generation depth to analyze */
  maxGenerationDepth: number; // default: 5
}

// ============================================================================
// COMPLETE ANALYSIS RESULT
// ============================================================================

export type AnalysisResult = FamilySystemAnalysis;
