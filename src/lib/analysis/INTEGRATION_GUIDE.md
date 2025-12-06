# Advanced Psycho-Genealogy Analysis Integration Guide

**Status**: ✅ Complete - All 4 analysis modules implemented and tested

## Overview

This guide covers integration of the advanced analysis library into your PsychoGenealogy components. The library provides **deterministic, client-side analysis** of family systems without AI calls.

---

## What's Implemented

### 1. **Triangle Detection (Bowen Family Systems)**
- Detects 3-person emotional entanglement patterns
- Types: Coalition, Projection, Mediation, Exclusion
- Returns severity (High/Medium/Low) and confidence scores
- File: `src/lib/analysis/detectTriangles.ts`

### 2. **Pattern Detection (Transgenerational)**
- **Anniversary Syndrome**: Events repeating on similar dates across generations
- **Age Repetition**: Critical events at similar ages across generations
- **Generational Echoes**: Shared attributes/conditions repeating across generations
- File: `src/lib/analysis/detectPatterns.ts`

### 3. **Sibling Rank Analysis (Toman Birth Order Theory)**
- Determines birth order: Oldest, Middle, Youngest, OnlyChild
- Analyzes couple compatibility based on rank pairings
- Identifies power conflicts (two Oldest) vs. complementarity (Oldest + Youngest)
- File: `src/lib/analysis/siblingAnalysis.ts`

### 4. **Topology & Isolation Analysis (Graph Centrality)**
- Identifies **Isolates**: Members with no/only negative connections
- Identifies **Scapegoats**: People receiving disproportionate conflict (>50%)
- Identifies **Central Hubs**: Emotional anchors (top 25% by positive connections)
- File: `src/lib/analysis/topologyAnalysis.ts`

---

## Quick Start: Using the Analysis Hook

### Basic Usage

```tsx
import { useGenogramAnalysis } from '@/lib/analysis';

function MyComponent() {
  // Get people and relations from your Zustand store
  const { people, relations } = useGenogramStore();

  // Run full analysis
  const analysis = useGenogramAnalysis(people, relations);

  return (
    <div>
      <h2>System Health: {analysis.systemHealth}/100</h2>
      <p>Triangles detected: {analysis.triangles.length}</p>
      <p>Patterns detected: {analysis.patterns.length}</p>
      <p>Isolates: {analysis.topology.isolates.length}</p>
    </div>
  );
}
```

### Return Object Structure

```typescript
interface FamilySystemAnalysis {
  // Pattern Detection Results
  triangles: TriangleResult[];        // Bowen triangulation patterns
  patterns: PatternResult[];          // Transgenerational patterns
  
  // Sibling Analysis Results
  siblingRanks: Record<string, SiblingRankResult>;
  coupleDynamics: CoupleAnalysisResult[];
  
  // Topology Analysis Results
  topology: TopologyResult;           // Isolates, scapegoats, hubs
  
  // Synthesis
  systemHealth: number;               // 0-100 score
  insights: string[];                 // Clinical insights
  atRiskRelationships: Array<{
    personIds: [string, string];
    riskFactor: string;
    severity: 'high' | 'medium' | 'low';
  }>;
  
  analyzedAt: string;                 // ISO timestamp
}
```

---

## Integration Example: Analysis Page

### Option 1: Create New Page (Recommended)

Create `src/pages/AnalysisPage.tsx`:

```tsx
import React from 'react';
import { useGenogramStore } from '@/store/genogramStore';
import { FamilyAnalysisReport } from '@/components/FamilyAnalysisReport';

export const AnalysisPage = () => {
  const { people, relations } = useGenogramStore();

  if (!people.length) {
    return <div className="p-8">Create a genogram first to analyze.</div>;
  }

  return (
    <div className="p-8">
      <FamilyAnalysisReport people={people} relations={relations} />
    </div>
  );
};
```

Add route in `App.tsx`:

```tsx
import { AnalysisPage } from '@/pages/AnalysisPage';

function App() {
  return (
    <Routes>
      {/* ... existing routes ... */}
      <Route path="/analysis" element={<AnalysisPage />} />
    </Routes>
  );
}
```

### Option 2: Add to Existing Editor Page

In `src/pages/Editor.tsx`:

```tsx
import { useGenogramAnalysis } from '@/lib/analysis';

function Editor() {
  const { people, relations } = useGenogramStore();
  const analysis = useGenogramAnalysis(people, relations);

  const [showAnalysis, setShowAnalysis] = React.useState(false);

  return (
    <div>
      {/* Existing canvas */}
      <GenogramCanvas />

      {/* Toggle button */}
      <button onClick={() => setShowAnalysis(!showAnalysis)}>
        View Analysis ({analysis.systemHealth}/100)
      </button>

      {/* Analysis panel */}
      {showAnalysis && (
        <div className="analysis-panel">
          <h2>Health Score: {analysis.systemHealth}</h2>
          <section>
            <h3>Triangles: {analysis.triangles.length}</h3>
            {analysis.triangles.map((t, i) => (
              <div key={i}>{t.type} - {t.severity}</div>
            ))}
          </section>
          {/* More sections... */}
        </div>
      )}
    </div>
  );
}
```

---

## Component Reference

### FamilyAnalysisReport Component

Ready-to-use component showing full analysis:

```tsx
import { FamilyAnalysisReport } from '@/components/FamilyAnalysisReport';

<FamilyAnalysisReport 
  people={people} 
  relations={relations} 
/>
```

**Displays**:
- System Health Score (0-100 progress bar)
- Key Insights (clinical summary)
- Triangulation Patterns (color-coded by severity)
- Generational Patterns (date/age/attribute based)
- Birth Order Analysis (Toman theory)
- Couple Compatibility Assessment
- Family Structure (isolates, scapegoats, hubs)
- At-Risk Relationships

---

## Data Structures

### TriangleResult

```typescript
interface TriangleResult {
  nodes: [string, string, string];     // Three person IDs [A, B, C]
  type: 'coalition' | 'projection' | 'mediation' | 'exclusion';
  severity: 'high' | 'medium' | 'low';
  description: string;
  relations: {
    ab: string;  // relation type A-B
    ac: string;  // relation type A-C
    bc: string;  // relation type B-C
  };
  confidence: number;  // 0-1 score
}
```

### PatternResult

```typescript
interface PatternResult {
  type: 'anniversary_date' | 'age_repetition' | 'generational_echo';
  sourcePersonId: string;
  targetPersonId: string;
  generationDifference: number;  // 1 = parent-child, 2 = grandparent-grandchild
  description: string;
  sourceEvent?: {
    type: 'death' | 'divorce' | 'trauma' | 'illness' | 'birth' | 'marriage';
    date?: string;
    age?: number;
  };
  targetEvent?: { /* same structure */ };
  confidence: number;
  daysDifference?: number;  // For anniversary syndrome
  ageDifference?: number;   // For age repetition
}
```

### SiblingRankResult

```typescript
interface SiblingRankResult {
  personId: string;
  rank: 'Oldest' | 'Middle' | 'Youngest' | 'OnlyChild';
  rankDescription: string;  // Psychological description
}
```

### CoupleAnalysisResult

```typescript
interface CoupleAnalysisResult {
  relationId: string;
  coupleIds: [string, string];
  compatibility: 'High' | 'Low' | 'Neutral';
  insight: string;  // Detailed explanation
}
```

### TopologyResult

```typescript
interface TopologyResult {
  isolates: string[];      // IDs of isolated/cutoff members
  scapegoats: string[];    // IDs of conflict targets
  centralHubs: string[];   // IDs of emotional anchors
}
```

---

## Configuration

### Custom Thresholds

```tsx
const analysis = useGenogramAnalysis(people, relations, {
  anniversaryTolerance: 14,    // Days (default: 7)
  ageTolerance: 2,             // Years (default: 1)
  confidenceThreshold: 0.7,    // 0-1 (default: 0.6)
  maxGenerationDepth: 4,       // Generations (default: 5)
});
```

---

## Clinical Insights Generated

The hook automatically generates insights from detected patterns:

### For Triangles
- High-severity triangulations noted
- Coalition patterns identified
- Mediator roles detected
- Power conflicts flagged

### For Patterns
- Anniversary syndrome documented
- Age-based repetitions noted
- Generational echoes identified
- Transmission risk assessed

### For Sibling Ranks
- Birth order psychology summarized
- Couple compatibility assessed
- Role conflicts identified

### For Topology
- Isolated members flagged with isolation risk
- Scapegoat roles identified with mental health risk
- Central hubs identified with burnout risk

---

## System Health Scoring

**Starting**: 100 points

**Deductions**:
- High-severity triangle: -15 points each
- Medium-severity triangle: -8 points each
- High-confidence pattern: -5 points each
- Each isolate: -10 points
- Each scapegoat: -12 points

**Final**: 0-100 range (clamped)

**Interpretation**:
- **75-100**: Healthy system with minimal patterns
- **50-74**: Moderate issues, recommend family therapy
- **0-49**: Significant dysfunction, urgent intervention recommended

---

## Helper Functions

### Extract Specific Data

```tsx
// Get all triangles for one person
import { findTrianglesForPerson } from '@/lib/analysis';
const personTriangles = findTrianglesForPerson('person-123', analysis.triangles);

// Get patterns by type
import { filterPatternsByType } from '@/lib/analysis';
const anniversaryPatterns = filterPatternsByType(analysis.patterns, 'anniversary_date');

// Get triangle statistics
import { useTriangleStatistics } from '@/lib/analysis';
const stats = useTriangleStatistics(analysis.triangles);
// => { total, byType, bySeverity, averageConfidence }

// Get sibling insights for one person
import { getSiblingInsights } from '@/lib/analysis';
const insights = getSiblingInsights('person-123', analysis.siblingRanks);
// => ["As firstborn...", "May have perfectionist...", ...]

// Get topology insights
import { getTopologyInsights } from '@/lib/analysis';
const hints = getTopologyInsights(analysis.topology, nameMap);
// => ["FAMILY HUB: John is central...", "ISOLATION RISK: Mary...", ...]
```

---

## Performance Notes

- **Memoization**: Hook uses `useMemo` to prevent recalculation on re-renders
- **Complexity**: O(n³) for triangles, O(n²) for patterns (both acceptable for <100 people)
- **Memory**: Results cached until people or relations change
- **No Network Calls**: Pure deterministic algorithms (no API calls)

---

## Testing the Analysis

### Manual Test Scenario

1. Create a test genogram with 5+ people
2. Add multiple relation types:
   - Parent-child (build triangles)
   - Partner relationships (analyze compatibility)
   - Conflict edges (identify scapegoats)
   - Cutoff edges (identify isolates)
3. Check results:
   - Triangles detected: Yes
   - Ranks assigned: Oldest/Middle/Youngest
   - Couple compatibility: High/Low/Neutral
   - Topology identified: Hubs/Isolates

### Example Test Data

```tsx
const testPeople = [
  { id: '1', name: 'John', gender: 'male', dateOfBirth: '1960-01-15' },
  { id: '2', name: 'Mary', gender: 'female', dateOfBirth: '1962-03-20' },
  { id: '3', name: 'Sarah', gender: 'female', dateOfBirth: '1985-06-10' },
  { id: '4', name: 'Tom', gender: 'male', dateOfBirth: '1987-02-28' },
];

const testRelations = [
  { id: 'r1', sourceId: '1', targetId: '3', type: 'parent-child' },
  { id: 'r2', sourceId: '2', targetId: '3', type: 'parent-child' },
  { id: 'r3', sourceId: '1', targetId: '4', type: 'parent-child' },
  { id: 'r4', sourceId: '2', targetId: '4', type: 'parent-child' },
  { id: 'r5', sourceId: '1', targetId: '2', type: 'partner' },
  { id: 'r6', sourceId: '3', targetId: '4', type: 'sibling' },
  { id: 'r7', sourceId: '3', targetId: '1', type: 'conflict' },
];

const analysis = useGenogramAnalysis(testPeople, testRelations);
// => Should detect triangles (John-Mary-Sarah), ranks, isolates, etc.
```

---

## Troubleshooting

### Issue: No triangles detected
- **Cause**: Need 3+ people with interconnected relations
- **Solution**: Add more family members and relationships

### Issue: System health always 100
- **Cause**: No high-severity issues or very few family members
- **Solution**: Create conflicts, cutoffs, or triangulation to test scoring

### Issue: Couple compatibility shows "Neutral"
- **Cause**: Missing dateOfBirth for one/both partners
- **Solution**: Add birth dates to all people for sibling rank calculation

### Issue: Performance lag with large genogram
- **Cause**: O(n³) complexity with 100+ people
- **Solution**: Consider paginating analysis or analyzing subtrees only

---

## Files Reference

| File | Purpose | Exports |
|------|---------|---------|
| `src/lib/analysis/types.ts` | All TypeScript interfaces | Types only |
| `src/lib/analysis/detectTriangles.ts` | Triangle detection algorithm | `detectTriangles()`, `filterTrianglesBySeverity()`, `findTrianglesForPerson()`, `getTriangleStatistics()` |
| `src/lib/analysis/detectPatterns.ts` | Pattern detection algorithm | `detectPatterns()`, `filterPatternsByType()`, `findPatternsForPerson()`, `getPatternStatistics()` |
| `src/lib/analysis/siblingAnalysis.ts` | Birth order analysis | `analyzeSiblings()`, `getSiblingInsights()` |
| `src/lib/analysis/topologyAnalysis.ts` | Structural analysis | `analyzeTopology()`, `getTopologyInsights()` |
| `src/lib/analysis/useGenogramAnalysis.ts` | Main hook combining all | `useGenogramAnalysis()`, `useTriangleStatistics()`, `usePatternStatistics()` |
| `src/lib/analysis/index.ts` | Barrel exports | Everything above |
| `src/components/FamilyAnalysisReport.tsx` | Full UI component | `FamilyAnalysisReport` |

---

## Next Steps

1. **Try the component**: Add `<FamilyAnalysisReport>` to Editor page
2. **Customize insights**: Modify `generateInsights()` in useGenogramAnalysis hook
3. **Add visualizations**: Create charts for health score trends
4. **Integrate with AI**: Send analysis insights to therapist chat
5. **Export reports**: Include analysis in PDF export

---

**Last Updated**: December 6, 2025  
**Version**: 1.0.0  
**Build Status**: ✅ Passing
