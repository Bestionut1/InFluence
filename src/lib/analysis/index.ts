/**
 * Index file for analysis library
 * Exports all analysis utilities and types
 */

// Export types
export type {
  TriangleResult,
  PatternResult,
  FamilySystemAnalysis,
  AnalysisNode,
  AnalysisEdge,
  AnalysisConfig,
  AnalysisResult,
  SiblingRankResult,
  CoupleAnalysisResult,
  TopologyResult,
} from './types';

export type { TriangleType, TriangleSeverity, PatternType } from './types';

// Export triangle detection functions
export {
  detectTriangles,
  filterTrianglesBySeverity,
  findTrianglesForPerson,
  getTriangleStatistics,
} from './detectTriangles';

// Export pattern detection functions
export {
  detectPatterns,
  filterPatternsByType,
  findPatternsForPerson,
  getPatternStatistics,
} from './detectPatterns';

// Export sibling analysis functions
export {
  analyzeSiblings,
  getSiblingInsights,
} from './siblingAnalysis';

// Export topology analysis functions
export {
  analyzeTopology,
  getTopologyInsights,
} from './topologyAnalysis';

// Export main analysis hook
export {
  useGenogramAnalysis,
  useTriangleStatistics,
  usePatternStatistics,
  DEFAULT_CONFIG,
} from './useGenogramAnalysis';
