# 📚 Psycho-Genealogy Analysis Library - Usage Guide

## Overview

The analysis library provides **deterministic, client-side analysis** of family systems using Bowen Family Systems Theory. It detects:

1. **Triangulation Patterns** (3-person toxic dynamics)
2. **Generational Patterns** (anniversary syndrome, age repetition, echoes)

---

## Quick Start

### Basic Usage in a Component

```typescript
import { useGenogramAnalysis } from '@/lib/analysis';
import type { AnalysisNode, AnalysisEdge } from '@/lib/analysis';

function MyAnalysisComponent() {
  // Get data from your Zustand store
  const people: AnalysisNode[] = [...];
  const relations: AnalysisEdge[] = [...];

  // Run analysis
  const analysis = useGenogramAnalysis(people, relations);

  return (
    <div>
      <h2>System Health: {analysis.systemHealth}/100</h2>
      <p>Detected Triangles: {analysis.triangles.length}</p>
      <p>Detected Patterns: {analysis.patterns.length}</p>
      
      {analysis.insights.map((insight, i) => (
        <p key={i}>{insight}</p>
      ))}
    </div>
  );
}
```

---

## Core Concepts

### 1. Triangle Detection (Bowen Theory)

Detects 3-person patterns:
- **Coalition**: A & C allied against B
- **Projection**: One person is scapegoat
- **Mediation**: One person mediates between two
- **Exclusion**: One person is isolated

```typescript
import { detectTriangles, findTrianglesForPerson } from '@/lib/analysis';

const triangles = detectTriangles(people, relations);
const personTriangles = findTrianglesForPerson(triangles, personId);

triangles.forEach(t => {
  console.log(`${t.type} - Severity: ${t.severity}`);
  console.log(`People: ${t.nodes.join(', ')}`);
  console.log(`Confidence: ${t.confidence * 100}%`);
});
```

### 2. Pattern Detection

Detects across-generation repetitions:

#### Anniversary Syndrome
Events repeating on similar dates across generations
```typescript
const anniversaryPatterns = patterns.filter(p => p.type === 'anniversary_date');
// Example: Father died May 20, Son born May 18
```

#### Age Repetition  
Critical events at similar ages
```typescript
const agePatterns = patterns.filter(p => p.type === 'age_repetition');
// Example: Father died at 40, Son divorced at 40
```

#### Generational Echo
Similar psychological traits across generations
```typescript
const echoPatterns = patterns.filter(p => p.type === 'generational_echo');
// Example: Both have depression, anxiety, addiction
```

---

## Data Model

### AnalysisNode (Person)

```typescript
interface AnalysisNode {
  id: string;
  name: string;
  gender?: 'male' | 'female' | 'non-binary' | 'unknown';
  dateOfBirth?: string;           // YYYY-MM-DD format
  dateOfDeath?: string;            // YYYY-MM-DD format
  medicalConditions?: string[];    // ['depression', 'hypertension']
  significantEvents?: string[];    // ['divorce at 35', 'trauma']
  attributes?: string[];           // ['narcissism', 'codependent']
}
```

### AnalysisEdge (Relation)

```typescript
interface AnalysisEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: string; // 'parent-child' | 'partner' | 'sibling' | 
                // 'conflict' | 'close' | 'distant' | 'fused' | 'ex-partner'
}
```

### Analysis Results

```typescript
interface FamilySystemAnalysis {
  triangles: TriangleResult[];      // Detected 3-person patterns
  patterns: PatternResult[];         // Detected generational patterns
  systemHealth: number;              // 0-100 health score
  insights: string[];                // Clinical insights
  atRiskRelationships: Array<...>;   // Relationships needing attention
  analyzedAt: string;                // ISO timestamp
}
```

---

## Advanced Usage

### Configuration

```typescript
const analysis = useGenogramAnalysis(
  people,
  relations,
  {
    anniversaryTolerance: 7,      // +/- 7 days for date matching
    ageTolerance: 1,              // +/- 1 year for age matching
    confidenceThreshold: 0.6,     // Only include results > 60% confidence
    maxGenerationDepth: 5,        // Analyze up to 5 generations
  }
);
```

### Filtering Results

```typescript
import { 
  filterTrianglesBySeverity,
  findTrianglesForPerson,
  filterPatternsByType,
  findPatternsForPerson 
} from '@/lib/analysis';

// Get only high-severity triangles
const highRisk = filterTrianglesBySeverity(analysis.triangles, 'high');

// Get triangles involving specific person
const personTriangles = findTrianglesForPerson(analysis.triangles, 'person-id-123');

// Get only anniversary syndrome patterns
const anniversaries = filterPatternsByType(analysis.patterns, 'anniversary_date');

// Get all patterns for a person
const personPatterns = findPatternsForPerson(analysis.patterns, 'person-id-123');
```

### Statistics

```typescript
import { 
  useTriangleStatistics,
  usePatternStatistics 
} from '@/lib/analysis';

const triangleStats = useTriangleStatistics(analysis.triangles);
// {
//   total: 5,
//   byType: { coalition: 2, mediation: 1, projection: 2 },
//   bySeverity: { high: 2, medium: 3 },
//   averageConfidence: 0.82
// }

const patternStats = usePatternStatistics(analysis.patterns);
// {
//   total: 3,
//   byType: { anniversary_date: 1, age_repetition: 2 },
//   averageConfidence: 0.75
// }
```

---

## Integration with Zustand Store

### Option 1: Direct Integration

```typescript
import { useGenogramStore } from '@/store/genogramStore';
import { useGenogramAnalysis } from '@/lib/analysis';

function AnalysisPanel() {
  const { people, relations } = useGenogramStore();
  
  // Convert to analysis format
  const analysisNodes = people.map(p => ({
    id: p.id,
    name: p.name,
    gender: p.gender,
    dateOfBirth: p.dateOfBirth,
    dateOfDeath: p.dateOfDeath,
    medicalConditions: p.medicalConditions,
    attributes: p.attributes,
  }));

  const analysisEdges = relations.map(r => ({
    id: r.id,
    sourceId: r.sourceId,
    targetId: r.targetId,
    type: r.type,
  }));

  const analysis = useGenogramAnalysis(analysisNodes, analysisEdges);
  
  return <div>{/* display results */}</div>;
}
```

### Option 2: Store Extension

Add to your genogram store:

```typescript
interface AnalysisState {
  analysisResults: FamilySystemAnalysis | null;
  runAnalysis: () => void;
}

// In store creation:
const analysisSlice: StateCreator<GenogramState & AnalysisState> = (set, get) => ({
  analysisResults: null,
  runAnalysis: () => {
    const { people, relations } = get();
    
    const analysisNodes = people.map(p => ({...}));
    const analysisEdges = relations.map(r => ({...}));
    const results = useGenogramAnalysis(analysisNodes, analysisEdges);
    
    set({ analysisResults: results });
  },
});
```

---

## Example: Complete Component

```typescript
import { useGenogramAnalysis } from '@/lib/analysis';
import type { AnalysisNode, AnalysisEdge, TriangleResult, PatternResult } from '@/lib/analysis';

interface AnalysisResultsPanelProps {
  people: AnalysisNode[];
  relations: AnalysisEdge[];
}

export function AnalysisResultsPanel({ people, relations }: AnalysisResultsPanelProps) {
  const analysis = useGenogramAnalysis(people, relations);

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Family System Analysis</h2>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-blue-600">{analysis.systemHealth}</span>
          <span className="text-gray-600">/ 100 System Health</span>
        </div>
      </div>

      {/* Triangles */}
      {analysis.triangles.length > 0 && (
        <div className="mb-6 p-4 bg-white rounded border-l-4 border-red-500">
          <h3 className="font-bold text-lg mb-3">⚠️ Triangulation Patterns ({analysis.triangles.length})</h3>
          <div className="space-y-2">
            {analysis.triangles.map((t) => (
              <div key={t.nodes.join('-')} className="text-sm">
                <p className="font-semibold capitalize">{t.type}</p>
                <p className="text-gray-700">{t.description}</p>
                <p className="text-xs text-gray-500">Confidence: {(t.confidence * 100).toFixed(0)}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patterns */}
      {analysis.patterns.length > 0 && (
        <div className="mb-6 p-4 bg-white rounded border-l-4 border-amber-500">
          <h3 className="font-bold text-lg mb-3">📊 Generational Patterns ({analysis.patterns.length})</h3>
          <div className="space-y-2">
            {analysis.patterns.map((p) => (
              <div key={`${p.sourcePersonId}-${p.targetPersonId}`} className="text-sm">
                <p className="font-semibold capitalize">{p.type.replace(/_/g, ' ')}</p>
                <p className="text-gray-700">{p.description}</p>
                <p className="text-xs text-gray-500">Confidence: {(p.confidence * 100).toFixed(0)}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      {analysis.insights.length > 0 && (
        <div className="p-4 bg-white rounded border-l-4 border-blue-500">
          <h3 className="font-bold text-lg mb-3">💡 Clinical Insights</h3>
          <ul className="space-y-2">
            {analysis.insights.map((insight, i) => (
              <li key={i} className="text-sm flex gap-2">
                <span className="text-blue-500">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

---

## Performance Notes

- **Memoized**: Analysis is memoized with `useMemo` to prevent recalculation on every render
- **Efficient**: O(n³) for triangles (small for typical family trees), O(n²) for patterns
- **Scalable**: Tested with 100+ person genograms
- **No Network**: All computation happens client-side, no API calls

---

## Testing

The analysis library is designed for easy unit testing:

```typescript
import { detectTriangles, detectPatterns } from '@/lib/analysis';
import type { AnalysisNode, AnalysisEdge } from '@/lib/analysis';

// Create test data
const testPeople: AnalysisNode[] = [
  { id: '1', name: 'Parent' },
  { id: '2', name: 'Child' },
  { id: '3', name: 'GrandChild' },
];

const testRelations: AnalysisEdge[] = [
  { id: 'r1', sourceId: '1', targetId: '2', type: 'parent-child' },
  { id: 'r2', sourceId: '1', targetId: '3', type: 'close' },
  { id: 'r3', sourceId: '2', targetId: '3', type: 'conflict' },
];

// Test
const triangles = detectTriangles(testPeople, testRelations);
const patterns = detectPatterns(testPeople, testRelations);

expect(triangles.length).toBeGreaterThan(0);
```

---

## Files Overview

- **`types.ts`** - TypeScript interfaces and types
- **`detectTriangles.ts`** - Triangle detection algorithm
- **`detectPatterns.ts`** - Generational pattern detection
- **`useGenogramAnalysis.ts`** - Main hook and helper hooks
- **`index.ts`** - Barrel export for clean imports

---

## Next Steps

1. Import and use `useGenogramAnalysis` in your components
2. Display results in a UI panel
3. Highlight high-risk nodes in ReactFlow
4. Export analysis results with genogram PDF
5. Add custom insight generation based on your needs

---

**Version**: 1.0  
**Last Updated**: December 6, 2025
