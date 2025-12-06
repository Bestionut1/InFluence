/**
 * Topology & Isolation Analysis
 * Graph centrality analysis to identify family structural roles:
 * - Emotional hubs (central support figures)
 * - Isolated/cutoff members
 * - Scapegoats (targets of conflict)
 * - Support networks
 */

import type { TopologyResult } from './types';
import type { AnalysisEdge } from './types';

type EdgeQuality = 'positive' | 'negative' | 'neutral' | 'cutoff';

/**
 * Classifies relationship quality based on type
 */
function classifyEdgeQuality(relationType: string): EdgeQuality {
  const type = relationType?.toLowerCase() || '';

  // Positive edges - supportive relationships
  if (type.includes('close') || type.includes('fused') || type.includes('support')) {
    return 'positive';
  }

  // Cutoff - no relationship
  if (type.includes('cutoff')) {
    return 'cutoff';
  }

  // Negative edges - conflictual relationships
  if (
    type.includes('conflict') ||
    type.includes('abuse') ||
    type.includes('hostile') ||
    type.includes('distant')
  ) {
    return 'negative';
  }

  // Neutral: parent-child, sibling, partner (unless specified otherwise)
  return 'neutral';
}

/**
 * Calculates the degree and edge distribution for each person
 * Returns detailed connectivity metrics
 */
function calculateNodeMetrics(
  peopleIds: string[],
  relations: AnalysisEdge[]
) {
  const metrics = new Map<
    string,
    {
      totalDegree: number;
      positiveDegree: number;
      negativeDegree: number;
      neutralDegree: number;
      cutoffDegree: number;
      incomingConflict: number;
      outgoingConflict: number;
    }
  >();

  // Initialize metrics for all people
  peopleIds.forEach((id) => {
    metrics.set(id, {
      totalDegree: 0,
      positiveDegree: 0,
      negativeDegree: 0,
      neutralDegree: 0,
      cutoffDegree: 0,
      incomingConflict: 0,
      outgoingConflict: 0,
    });
  });

  // Count edges
  relations.forEach((relation) => {
    const quality = classifyEdgeQuality(relation.type);

    // Update source node
    if (metrics.has(relation.sourceId)) {
      const sourceMetrics = metrics.get(relation.sourceId)!;
      sourceMetrics.totalDegree++;

      if (quality === 'positive') sourceMetrics.positiveDegree++;
      else if (quality === 'negative') {
        sourceMetrics.negativeDegree++;
        sourceMetrics.outgoingConflict++;
      } else if (quality === 'neutral') sourceMetrics.neutralDegree++;
      else if (quality === 'cutoff') sourceMetrics.cutoffDegree++;
    }

    // Update target node
    if (metrics.has(relation.targetId)) {
      const targetMetrics = metrics.get(relation.targetId)!;
      targetMetrics.totalDegree++;

      if (quality === 'positive') targetMetrics.positiveDegree++;
      else if (quality === 'negative') {
        targetMetrics.negativeDegree++;
        targetMetrics.incomingConflict++;
      } else if (quality === 'neutral') targetMetrics.neutralDegree++;
      else if (quality === 'cutoff') targetMetrics.cutoffDegree++;
    }
  });

  return metrics;
}

/**
 * Identifies isolated or cutoff members
 * Isolates: nodes with minimal connections or only negative/cutoff edges
 */
function findIsolates(
  peopleIds: string[],
  metrics: Map<
    string,
    {
      totalDegree: number;
      positiveDegree: number;
      negativeDegree: number;
      neutralDegree: number;
      cutoffDegree: number;
      incomingConflict: number;
      outgoingConflict: number;
    }
  >
): string[] {
  const isolates: string[] = [];

  peopleIds.forEach((personId) => {
    const m = metrics.get(personId);
    if (!m) return;

    // Isolate criteria:
    // 1. Zero connections OR
    // 2. Only cutoff connections OR
    // 3. Only negative/conflict connections
    const hasPositive = m.positiveDegree > 0 || m.neutralDegree > 0;
    const isCompletlyCutoff = m.totalDegree === 0 || m.totalDegree === m.cutoffDegree;
    const isOnlyNegative =
      m.totalDegree > 0 && m.totalDegree === m.negativeDegree;

    if (isCompletlyCutoff || isOnlyNegative || !hasPositive) {
      isolates.push(personId);
    }
  });

  return isolates;
}

/**
 * Identifies scapegoats - people receiving disproportionate conflict
 * Scapegoat: >50% of incoming edges are conflict/abuse
 */
function findScapegoats(
  peopleIds: string[],
  metrics: Map<
    string,
    {
      totalDegree: number;
      positiveDegree: number;
      negativeDegree: number;
      neutralDegree: number;
      cutoffDegree: number;
      incomingConflict: number;
      outgoingConflict: number;
    }
  >
): string[] {
  const scapegoats: string[] = [];

  peopleIds.forEach((personId) => {
    const m = metrics.get(personId);
    if (!m || m.incomingConflict === 0) return;

    // Scapegoat criteria: >50% of incoming edges are conflict
    const conflictRatio = m.incomingConflict / Math.max(1, m.totalDegree);
    if (conflictRatio > 0.5 && m.incomingConflict >= 2) {
      scapegoats.push(personId);
    }
  });

  return scapegoats;
}

/**
 * Identifies central hubs - people with high positive connectivity
 * Hubs: people with the most positive/supportive relationships
 */
function findCentralHubs(
  peopleIds: string[],
  metrics: Map<
    string,
    {
      totalDegree: number;
      positiveDegree: number;
      negativeDegree: number;
      neutralDegree: number;
      cutoffDegree: number;
      incomingConflict: number;
      outgoingConflict: number;
    }
  >
): string[] {
  const hubs: string[] = [];

  // Filter people with significant positive connections
  const candidateHubs = Array.from(peopleIds)
    .map((id) => ({
      id,
      metrics: metrics.get(id),
    }))
    .filter((c) => c.metrics && (c.metrics.positiveDegree >= 2 || c.metrics.neutralDegree >= 3))
    .sort(
      (a, b) =>
        (b.metrics?.positiveDegree || 0) - (a.metrics?.positiveDegree || 0)
    );

  // Take top 25% as hubs (but at least 1 if anyone qualifies)
  const hubCount = Math.max(1, Math.ceil(candidateHubs.length * 0.25));
  for (let i = 0; i < Math.min(hubCount, candidateHubs.length); i++) {
    hubs.push(candidateHubs[i].id);
  }

  return hubs;
}

/**
 * Analyzes family topology to identify structural roles and at-risk dynamics
 * @param peopleIds - All person IDs in the genogram
 * @param relations - All relationships in the genogram
 * @returns TopologyResult with isolates, scapegoats, and hubs
 */
export function analyzeTopology(
  peopleIds: string[],
  relations: AnalysisEdge[]
): TopologyResult {
  if (peopleIds.length === 0) {
    return {
      isolates: [],
      scapegoats: [],
      centralHubs: [],
    };
  }

  const metrics = calculateNodeMetrics(peopleIds, relations);

  return {
    isolates: findIsolates(peopleIds, metrics),
    scapegoats: findScapegoats(peopleIds, metrics),
    centralHubs: findCentralHubs(peopleIds, metrics),
  };
}

/**
 * Generates clinical insights about family topology
 * @param topology - TopologyResult from analyzeTopology
 * @param peopleNames - Optional map of person ID to name for readable output
 * @returns Array of clinical insights
 */
export function getTopologyInsights(
  topology: TopologyResult,
  peopleNames?: Map<string, string>
): string[] {
  const insights: string[] = [];

  // Isolate insights
  if (topology.isolates.length > 0) {
    const names = topology.isolates
      .map((id) => peopleNames?.get(id) || id)
      .join(', ');
    if (topology.isolates.length === 1) {
      insights.push(
        `ISOLATION RISK: ${names} appears isolated or cutoff from family. Possible estrangement, unresolved conflict, or emotional distance.`
      );
    } else {
      insights.push(
        `MULTIPLE ISOLATES: ${names} are not well integrated into family support network. This suggests systemic fragmentation.`
      );
    }
  }

  // Scapegoat insights
  if (topology.scapegoats.length > 0) {
    const names = topology.scapegoats
      .map((id) => peopleNames?.get(id) || id)
      .join(', ');
    if (topology.scapegoats.length === 1) {
      insights.push(
        `SCAPEGOAT ROLE: ${names} is receiving disproportionate conflict/blame from family. High risk for depression, anxiety, or behavioral issues.`
      );
    } else {
      insights.push(
        `MULTIPLE SCAPEGOATS: ${names} share scapegoat roles. Family may be displacing systemic dysfunction onto specific individuals.`
      );
    }
  }

  // Hub insights
  if (topology.centralHubs.length === 0) {
    insights.push(
      'NO CLEAR HUB: Family lacks a central emotional support figure. May indicate diffuse responsibility or potential fragmentation if one person leaves.'
    );
  } else if (topology.centralHubs.length === 1) {
    const hubName = peopleNames?.get(topology.centralHubs[0]) || topology.centralHubs[0];
    insights.push(
      `FAMILY HUB: ${hubName} is the central emotional anchor. Family stability heavily depends on this person's wellbeing. Watch for burnout.`
    );
  } else {
    const names = topology.centralHubs
      .map((id) => peopleNames?.get(id) || id)
      .join(', ');
    insights.push(
      `DISTRIBUTED SUPPORT: ${names} serve as emotional anchors. Good resilience - family not over-dependent on single person.`
    );
  }

  return insights;
}
