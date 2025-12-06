/**
 * Example: Family System Analysis Report Component
 * Demonstrates integration of all 4 analysis modules into a React component
 * Ready to integrate into pages/Editor.tsx or create new pages/AnalysisPage.tsx
 */

import React from 'react';
import {
  useGenogramAnalysis,
  type SiblingRankResult,
  type CoupleAnalysisResult,
  type TopologyResult,
} from '../lib/analysis';

interface AnalysisNode {
  id: string;
  name: string;
  gender?: 'male' | 'female' | 'non-binary' | 'unknown';
  dateOfBirth?: string;
  dateOfDeath?: string;
  medicalConditions?: string[];
  significantEvents?: string[];
  attributes?: string[];
}

interface AnalysisEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
}

interface FamilyAnalysisReportProps {
  people: AnalysisNode[];
  relations: AnalysisEdge[];
}

/**
 * Renders sibling rank insights with color coding
 */
function SiblingRankCard({ rank }: { rank: SiblingRankResult }) {
  const rankColors: Record<string, string> = {
    Oldest: 'bg-blue-100 border-blue-300 text-blue-900',
    Middle: 'bg-purple-100 border-purple-300 text-purple-900',
    Youngest: 'bg-green-100 border-green-300 text-green-900',
    OnlyChild: 'bg-orange-100 border-orange-300 text-orange-900',
  };

  return (
    <div className={`border p-3 rounded ${rankColors[rank.rank]}`}>
      <p className="font-semibold">{rank.rank}</p>
      <p className="text-sm">{rank.rankDescription}</p>
    </div>
  );
}

/**
 * Renders couple compatibility analysis
 */
function CoupleCompatibilityCard({ couple }: { couple: CoupleAnalysisResult }) {
  const compatibilityColors: Record<string, string> = {
    High: 'bg-green-100 border-green-500',
    Low: 'bg-red-100 border-red-500',
    Neutral: 'bg-yellow-100 border-yellow-500',
  };

  return (
    <div className={`border-l-4 p-3 rounded ${compatibilityColors[couple.compatibility]}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="font-semibold">{couple.coupleIds.join(' & ')}</p>
        <span className={`px-2 py-1 rounded text-xs font-bold ${
          couple.compatibility === 'High'
            ? 'bg-green-500 text-white'
            : couple.compatibility === 'Low'
              ? 'bg-red-500 text-white'
              : 'bg-yellow-500 text-white'
        }`}>
          {couple.compatibility}
        </span>
      </div>
      <p className="text-sm">{couple.insight}</p>
    </div>
  );
}

/**
 * Renders topology (structural) analysis
 */
function TopologyAnalysisSection({
  topology,
  peopleMap,
}: {
  topology: TopologyResult;
  peopleMap: Map<string, string>;
}) {
  return (
    <div className="space-y-4">
      {topology.isolates.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 rounded">
          <h4 className="font-semibold text-red-900 mb-2">⚠️ Isolated Members</h4>
          <p className="text-sm text-red-700">
            {topology.isolates.map((id: string) => peopleMap.get(id) || id).join(', ')} appear disconnected from family support.
          </p>
        </div>
      )}

      {topology.scapegoats.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 p-4 rounded">
          <h4 className="font-semibold text-orange-900 mb-2">🎯 Scapegoat Roles Detected</h4>
          <p className="text-sm text-orange-700">
            {topology.scapegoats.map((id: string) => peopleMap.get(id) || id).join(', ')} receive disproportionate conflict.
          </p>
        </div>
      )}

      {topology.centralHubs.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded">
          <h4 className="font-semibold text-blue-900 mb-2">🌟 Family Hubs (Support Anchors)</h4>
          <p className="text-sm text-blue-700">
            {topology.centralHubs.map((id: string) => peopleMap.get(id) || id).join(', ')} serve as emotional anchors.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Main Report Component
 */
export const FamilyAnalysisReport: React.FC<FamilyAnalysisReportProps> = ({ people, relations }) => {
  const analysis = useGenogramAnalysis(
    people as Parameters<typeof useGenogramAnalysis>[0],
    relations as Parameters<typeof useGenogramAnalysis>[1]
  );

  const peopleMap = new Map(people.map((p) => [p.id, p.name]));

  return (
    <div className="space-y-8 p-6 bg-white rounded-lg shadow">
      {/* Header with System Health Score */}
      <div>
        <h1 className="text-3xl font-bold mb-4">Family System Analysis Report</h1>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-2">System Health Score</p>
            <div className="w-full bg-gray-200 rounded-full h-8">
              <div
                className={`h-8 rounded-full flex items-center justify-center text-white font-bold transition-all ${
                  analysis.systemHealth >= 75
                    ? 'bg-green-500'
                    : analysis.systemHealth >= 50
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
                style={{ width: `${analysis.systemHealth}%` }}
              >
                {analysis.systemHealth}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* General Insights */}
      <section>
        <h2 className="text-2xl font-bold mb-4">🔍 Key Insights</h2>
        {analysis.insights.length > 0 ? (
          <ul className="space-y-2">
            {analysis.insights.map((insight: string, idx: number) => (
              <li key={idx} className="flex gap-3 p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                <span className="text-blue-600">•</span>
                <span className="text-sm">{insight}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No significant patterns detected.</p>
        )}
      </section>

      {/* Triangulation Patterns */}
      {analysis.triangles.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">⚡ Triangulation Patterns ({analysis.triangles.length})</h2>
          <div className="space-y-3">
            {analysis.triangles.map((triangle: typeof analysis.triangles[0], idx: number) => (
              <div
                key={idx}
                className={`p-4 rounded border-l-4 ${
                  triangle.severity === 'high'
                    ? 'bg-red-50 border-red-500'
                    : triangle.severity === 'medium'
                      ? 'bg-yellow-50 border-yellow-500'
                      : 'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold">
                    {triangle.nodes.map((id: string) => peopleMap.get(id) || id).join(' ↔ ')}
                  </p>
                  <span className="text-xs font-bold bg-gray-200 px-2 py-1 rounded">
                    {triangle.type.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm mb-2">{triangle.description}</p>
                <p className="text-xs text-gray-600">
                  Confidence: {(triangle.confidence * 100).toFixed(0)}% | Severity: {triangle.severity}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Generational Patterns */}
      {analysis.patterns.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">🔄 Generational Patterns ({analysis.patterns.length})</h2>
          <div className="space-y-3">
            {analysis.patterns.map((pattern: typeof analysis.patterns[0], idx: number) => (
              <div key={idx} className="p-4 bg-purple-50 rounded border-l-4 border-purple-500">
                <p className="font-semibold mb-2">
                  {pattern.type.replace(/_/g, ' ').toUpperCase()}
                </p>
                <p className="text-sm mb-2">{pattern.description}</p>
                {pattern.sourceEvent && (
                  <p className="text-xs text-gray-600">
                    Source: {pattern.sourceEvent.type}
                    {pattern.sourceEvent.date && ` (${pattern.sourceEvent.date})`}
                    {pattern.sourceEvent.age && ` at age ${pattern.sourceEvent.age}`}
                  </p>
                )}
                <p className="text-xs text-gray-600 mt-1">
                  Confidence: {(pattern.confidence * 100).toFixed(0)}% | Generation Gap: {pattern.generationDifference}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sibling Rank Analysis */}
      <section>
        <h2 className="text-2xl font-bold mb-4">👶 Birth Order Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {Object.values(analysis.siblingRanks)
            .slice(0, 6)
            .map((rank: SiblingRankResult) => (
              <div key={rank.personId}>
                <p className="text-sm font-semibold mb-2">{peopleMap.get(rank.personId)}</p>
                <SiblingRankCard rank={rank} />
              </div>
            ))}
        </div>

        {analysis.coupleDynamics.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-3">💑 Couple Compatibility</h3>
            <div className="space-y-2">
              {analysis.coupleDynamics.map((couple: CoupleAnalysisResult, idx: number) => (
                <CoupleCompatibilityCard key={idx} couple={couple} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Family Topology */}
      <section>
        <h2 className="text-2xl font-bold mb-4">🏗️ Family Structure & Roles</h2>
        <TopologyAnalysisSection topology={analysis.topology} peopleMap={peopleMap} />
      </section>

      {/* At-Risk Relationships */}
      {analysis.atRiskRelationships.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">⚠️ At-Risk Relationships ({analysis.atRiskRelationships.length})</h2>
          <div className="space-y-2">
            {analysis.atRiskRelationships.map((rel: typeof analysis.atRiskRelationships[0], idx: number) => (
              <div
                key={idx}
                className={`p-3 rounded border-l-4 ${
                  rel.severity === 'high' ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'
                }`}
              >
                <p className="text-sm">
                  <strong>{rel.personIds.map((id: string) => peopleMap.get(id) || id).join(' ↔ ')}</strong> - {rel.riskFactor}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Analysis Metadata */}
      <div className="text-xs text-gray-500 border-t pt-4">
        <p>Analysis performed: {new Date(analysis.analyzedAt).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default FamilyAnalysisReport;
