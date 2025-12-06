/**
 * Triangle Detection Utility
 * Implements Bowen Family Systems Theory - Triangulation Detection
 * Detects toxic 3-person patterns: coalitions, projections, mediations
 */

import type {
  TriangleResult,
  AnalysisNode,
  AnalysisEdge,
  Clique3,
  TriangleType,
  TriangleSeverity,
} from './types';

/**
 * Tension relationship types - indicate conflict/distance
 */
const TENSION_RELATIONS = new Set(['conflict', 'distant', 'ex-partner']);

/**
 * Alliance relationship types - indicate closeness/fusion
 */
const ALLIANCE_RELATIONS = new Set(['close', 'fused']);

/**
 * Finds all 3-node cliques in the graph
 * A clique of 3 is a triangle: A-B, B-C, C-A all connected
 */
function findAll3Cliques(
  nodes: AnalysisNode[],
  edges: AnalysisEdge[]
): Clique3[] {
  const cliques: Clique3[] = [];
  // Note: adjMap could be used for optimization in future
  const edgeMap = new Map<string, AnalysisEdge>();

  // Create edge lookup map (key: "id1-id2" sorted)
  edges.forEach((edge) => {
    const key = [edge.sourceId, edge.targetId].sort().join('-');
    edgeMap.set(key, edge);
  });

  // Find all combinations of 3 nodes
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      for (let k = j + 1; k < nodes.length; k++) {
        const a = nodes[i].id;
        const b = nodes[j].id;
        const c = nodes[k].id;

        // Check if all three pairs are connected
        const abKey = [a, b].sort().join('-');
        const acKey = [a, c].sort().join('-');
        const bcKey = [b, c].sort().join('-');

        const abEdge = edgeMap.get(abKey);
        const acEdge = edgeMap.get(acKey);
        const bcEdge = edgeMap.get(bcKey);

        if (abEdge && acEdge && bcEdge) {
          cliques.push({
            nodeA: a,
            nodeB: b,
            nodeC: c,
            edges: { ab: abEdge, ac: acEdge, bc: bcEdge },
          });
        }
      }
    }
  }

  return cliques;
}

/**
 * Analyzes a single clique to detect triangulation patterns
 */
function analyzeClique(clique: Clique3, nodeMap: Map<string, AnalysisNode>): TriangleResult | null {
  const { nodeA, nodeB, nodeC, edges } = clique;
  const { ab, ac, bc } = edges;

  if (!ab || !ac || !bc) return null;

  // Count tension and alliance edges
  const edgeTypes = [ab.type, ac.type, bc.type];
  const tensionCount = edgeTypes.filter((t) => TENSION_RELATIONS.has(t)).length;
  // Note: allianceCount could be used for more sophisticated pattern detection

  // Calculate severity and confidence based on pattern
  let type: TriangleType = 'projection';
  let severity: TriangleSeverity = 'medium';
  let confidence = 0.5;
  let description = '';

  // Pattern 1: Coalition (A and C allied against B)
  if (
    TENSION_RELATIONS.has(ab.type) &&
    ALLIANCE_RELATIONS.has(ac.type) &&
    ALLIANCE_RELATIONS.has(bc.type)
  ) {
    type = 'coalition';
    severity = 'high';
    confidence = 0.95;
    const aName = nodeMap.get(nodeA)?.name || nodeA;
    const bName = nodeMap.get(nodeB)?.name || nodeB;
    const cName = nodeMap.get(nodeC)?.name || nodeC;
    description = `Coalition: ${aName} and ${cName} are allied against ${bName}`;
  }

  // Pattern 2: Mediation (B mediates between A and C)
  else if (
    TENSION_RELATIONS.has(ac.type) &&
    ALLIANCE_RELATIONS.has(ab.type) &&
    ALLIANCE_RELATIONS.has(bc.type)
  ) {
    type = 'mediation';
    severity = 'medium';
    confidence = 0.85;
    const aName = nodeMap.get(nodeA)?.name || nodeA;
    const bName = nodeMap.get(nodeB)?.name || nodeB;
    const cName = nodeMap.get(nodeC)?.name || nodeC;
    description = `Mediation: ${bName} mediates between ${aName} and ${cName}`;
  }

  // Pattern 3: Projection (multiple tensions suggest one is scapegoat)
  else if (tensionCount >= 2) {
    type = 'projection';
    severity = tensionCount === 3 ? 'high' : 'medium';
    confidence = 0.75;
    const tensionNodes = edgeTypes
      .map((t, i) => (TENSION_RELATIONS.has(t) ? [nodeA, nodeB, nodeC][i] : null))
      .filter(Boolean);
    description = `Projection: Tension distributed among ${tensionNodes.length} relationships`;
  }

  // Pattern 4: Exclusion (one node isolated from the other two)
  else if (
    ALLIANCE_RELATIONS.has(ab.type) &&
    ALLIANCE_RELATIONS.has(ac.type) &&
    !ALLIANCE_RELATIONS.has(bc.type)
  ) {
    type = 'exclusion';
    severity = 'medium';
    confidence = 0.7;
    const bName = nodeMap.get(nodeB)?.name || nodeB;
    const cName = nodeMap.get(nodeC)?.name || nodeC;
    description = `Exclusion: ${bName} and ${cName} are not connected (isolated)`;
  }

  // Low confidence if no clear pattern
  if (confidence < 0.5) {
    return null;
  }

  return {
    nodes: [nodeA, nodeB, nodeC],
    type,
    severity,
    description,
    relations: {
      ab: ab.type,
      ac: ac.type,
      bc: bc.type,
    },
    confidence,
  };
}

/**
 * Main function: Detect all triangles in the family system
 * @param nodes - Array of people
 * @param edges - Array of relationships
 * @returns Array of detected triangles
 */
export function detectTriangles(
  nodes: AnalysisNode[],
  edges: AnalysisEdge[]
): TriangleResult[] {
  if (nodes.length < 3) return [];

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const cliques = findAll3Cliques(nodes, edges);
  const triangles: TriangleResult[] = [];

  cliques.forEach((clique) => {
    const result = analyzeClique(clique, nodeMap);
    if (result && result.confidence > 0.5) {
      // Only include high-confidence results
      triangles.push(result);
    }
  });

  // Remove duplicates (same triangle detected multiple times)
  const seen = new Set<string>();
  const unique: TriangleResult[] = [];

  triangles.forEach((triangle) => {
    const key = triangle.nodes.sort().join('-');
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(triangle);
    }
  });

  return unique;
}

/**
 * Filters triangles by severity
 */
export function filterTrianglesBySeverity(
  triangles: TriangleResult[],
  severity: TriangleSeverity
): TriangleResult[] {
  return triangles.filter((t) => t.severity === severity);
}

/**
 * Finds triangles involving a specific person
 */
export function findTrianglesForPerson(
  triangles: TriangleResult[],
  personId: string
): TriangleResult[] {
  return triangles.filter((t) => t.nodes.includes(personId));
}

/**
 * Gets statistics about detected triangles
 */
export function getTriangleStatistics(triangles: TriangleResult[]) {
  const byType = new Map<TriangleType, number>();
  const bySeverity = new Map<TriangleSeverity, number>();

  triangles.forEach((t) => {
    byType.set(t.type, (byType.get(t.type) || 0) + 1);
    bySeverity.set(t.severity, (bySeverity.get(t.severity) || 0) + 1);
  });

  return {
    total: triangles.length,
    byType: Object.fromEntries(byType),
    bySeverity: Object.fromEntries(bySeverity),
    averageConfidence: triangles.length > 0
      ? triangles.reduce((sum, t) => sum + t.confidence, 0) / triangles.length
      : 0,
  };
}
