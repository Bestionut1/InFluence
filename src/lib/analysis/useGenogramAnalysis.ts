/**
 * Main Analysis Hook
 * Combines triangle detection, pattern detection, sibling analysis, and topology analysis
 * Integrates with Zustand stores for reactive analysis
 */

import { useMemo } from 'react';
import { detectTriangles } from './detectTriangles';
import { detectPatterns } from './detectPatterns';
import { analyzeSiblings, getSiblingInsights } from './siblingAnalysis';
import { analyzeTopology, getTopologyInsights } from './topologyAnalysis';
import type {
  FamilySystemAnalysis,
  AnalysisNode,
  AnalysisEdge,
  AnalysisConfig,
  TriangleResult,
  PatternResult,
} from './types';

// Default analysis configuration
const DEFAULT_CONFIG: AnalysisConfig = {
  anniversaryTolerance: 7,
  ageTolerance: 1,
  confidenceThreshold: 0.6,
  maxGenerationDepth: 5,
};

/**
 * Calculates overall family system health (0-100)
 * Based on number and severity of issues detected
 */
function calculateSystemHealth(
  triangles: TriangleResult[],
  patterns: PatternResult[],
  isolateCount: number,
  scapegoatCount: number,
  _totalPeople: number
): number {
  // Note: totalPeople could be used for more sophisticated scoring

  // Start with 100 (perfect health)
  let health = 100;

  // Deduct points for high-severity triangles
  const highTriangles = triangles.filter((t) => t.severity === 'high').length;
  const mediumTriangles = triangles.filter((t) => t.severity === 'medium').length;

  health -= highTriangles * 15; // High severity: -15 points each
  health -= mediumTriangles * 8; // Medium severity: -8 points each

  // Deduct points for high-confidence patterns
  const highConfidencePatterns = patterns.filter((p) => p.confidence > 0.8).length;
  health -= highConfidencePatterns * 5;

  // Deduct points for isolates and scapegoats
  health -= isolateCount * 10;
  health -= scapegoatCount * 12;

  return Math.max(0, Math.min(100, health));
}

/**
 * Generates clinical insights based on analysis
 */
function generateInsights(
  triangles: TriangleResult[],
  patterns: PatternResult[],
  siblingInsights: string[],
  topologyInsights: string[],
  _totalPeople: number
): string[] {
  const insights: string[] = [];

  if (triangles.length === 0 && patterns.length === 0 && siblingInsights.length === 0 && topologyInsights.length === 0) {
    insights.push('No significant family system patterns detected.');
    return insights;
  }

  // Insight 1: About triangles
  const highTriangles = triangles.filter((t) => t.severity === 'high');
  if (highTriangles.length > 0) {
    insights.push(
      `⚠️ Detected ${highTriangles.length} high-severity triangulation(s). These represent significant emotional entanglements that may benefit from family systems work.`
    );
  }

  const coalitions = triangles.filter((t) => t.type === 'coalition');
  if (coalitions.length > 0) {
    insights.push(
      `🚨 Coalition patterns detected: Subgroups may be forming alliances against others. Consider addressing underlying conflicts.`
    );
  }

  const mediations = triangles.filter((t) => t.type === 'mediation');
  if (mediations.length > 0) {
    insights.push(
      `🤝 Mediator roles detected: Some family members are positioned between conflicting parties. Be aware of caretaking or boundary issues.`
    );
  }

  // Insight 2: About patterns
  const anniversarySyndrome = patterns.filter((p) => p.type === 'anniversary_date');
  if (anniversarySyndrome.length > 0) {
    insights.push(
      `📅 Anniversary syndrome detected: Significant events may repeat on similar dates across generations. Worth exploring unconscious connections.`
    );
  }

  const ageRepetitions = patterns.filter((p) => p.type === 'age_repetition');
  if (ageRepetitions.length > 0) {
    insights.push(
      `🔄 Age-based repetition patterns: Critical events occurring at similar ages across generations. May indicate transgenerational transmission.`
    );
  }

  const generationalEchoes = patterns.filter((p) => p.type === 'generational_echo');
  if (generationalEchoes.length > 0) {
    insights.push(
      `👥 Generational echoes: Similar psychological attributes appearing across generations. Consider exploring family legacy and inherited patterns.`
    );
  }

  // Add sibling insights
  insights.push(...siblingInsights);

  // Add topology insights
  insights.push(...topologyInsights);

  return insights;
}

/**
 * Custom Hook: useGenogramAnalysis
 * Analyzes the family system for triangulation and patterns
 *
 * @param people - Array of people in the genogram
 * @param relations - Array of relationships
 * @param config - Analysis configuration
 * @returns FamilySystemAnalysis results
 */
export function useGenogramAnalysis(
  people: AnalysisNode[],
  relations: AnalysisEdge[],
  config: Partial<AnalysisConfig> = {}
): FamilySystemAnalysis {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Memoize analysis to avoid recalculation on every render
  const analysis = useMemo(() => {
    // Convert data to analysis format
    const nodes: AnalysisNode[] = people || [];
    const edges: AnalysisEdge[] = relations || [];

    // Run triangle detection
    const triangles = detectTriangles(nodes, edges);

    // Filter by confidence threshold
    const filteredTriangles = triangles.filter((t) => t.confidence >= finalConfig.confidenceThreshold);

    // Run pattern detection
    const patterns = detectPatterns(
      nodes,
      edges,
      finalConfig.anniversaryTolerance,
      finalConfig.ageTolerance
    );

    // Filter by confidence threshold
    const filteredPatterns = patterns.filter((p) => p.confidence >= finalConfig.confidenceThreshold);

    // Run sibling analysis
    const { siblingRanks, coupleDynamics } = analyzeSiblings(nodes, edges);

    // Run topology analysis
    const topology = analyzeTopology(
      nodes.map((n) => n.id),
      edges
    );

    // Generate sibling insights
    const siblingInsightsList = Object.values(siblingRanks).flatMap((rank) =>
      getSiblingInsights(rank.personId, siblingRanks)
    );

    // Generate topology insights
    const nameMap = new Map(nodes.map((n) => [n.id, n.name]));
    const topologyInsightsList = getTopologyInsights(topology, nameMap);

    // Calculate system health
    const systemHealth = calculateSystemHealth(
      filteredTriangles,
      filteredPatterns,
      topology.isolates.length,
      topology.scapegoats.length,
      nodes.length
    );

    // Generate insights
    const insights = generateInsights(
      filteredTriangles,
      filteredPatterns,
      siblingInsightsList,
      topologyInsightsList,
      nodes.length
    );

    // Identify at-risk relationships
    const atRiskRelationships = edges
      .filter((edge) => {
        // A relationship is at-risk if it's a conflict or distant and part of a high-severity triangle
        if (!['conflict', 'distant', 'ex-partner'].includes(edge.type)) return false;

        const relatedTriangle = filteredTriangles.find(
          (t) =>
            t.severity === 'high' &&
            t.nodes.includes(edge.sourceId) &&
            t.nodes.includes(edge.targetId)
        );

        return !!relatedTriangle;
      })
      .map((edge) => ({
        personIds: [edge.sourceId, edge.targetId] as [string, string],
        riskFactor: edge.type,
        severity: (['conflict'].includes(edge.type) ? 'high' : 'medium') as 'high' | 'medium',
      }));

    return {
      triangles: filteredTriangles,
      patterns: filteredPatterns,
      siblingRanks,
      coupleDynamics,
      topology,
      systemHealth,
      insights,
      atRiskRelationships,
      analyzedAt: new Date().toISOString(),
    };
  }, [people, relations, finalConfig]);

  return analysis;
}

/**
 * Helper function to get triangle statistics
 */
export function useTriangleStatistics(triangles: TriangleResult[]) {
  return useMemo(() => {
    const byType = new Map<string, number>();
    const bySeverity = new Map<string, number>();

    triangles.forEach((t) => {
      byType.set(t.type, (byType.get(t.type) || 0) + 1);
      bySeverity.set(t.severity, (bySeverity.get(t.severity) || 0) + 1);
    });

    const avgConfidence =
      triangles.length > 0 ? triangles.reduce((sum, t) => sum + t.confidence, 0) / triangles.length : 0;

    return {
      total: triangles.length,
      byType: Object.fromEntries(byType),
      bySeverity: Object.fromEntries(bySeverity),
      averageConfidence: avgConfidence,
    };
  }, [triangles]);
}

/**
 * Helper function to get pattern statistics
 */
export function usePatternStatistics(patterns: PatternResult[]) {
  return useMemo(() => {
    const byType = new Map<string, number>();

    patterns.forEach((p) => {
      byType.set(p.type, (byType.get(p.type) || 0) + 1);
    });

    const avgConfidence =
      patterns.length > 0 ? patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length : 0;

    return {
      total: patterns.length,
      byType: Object.fromEntries(byType),
      averageConfidence: avgConfidence,
    };
  }, [patterns]);
}

export { DEFAULT_CONFIG };
