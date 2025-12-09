# GENOGRAM ENGINE - Complete Implementation Guide
## 5 Phases of Architecture + Rules

---

## Table of Contents

1. [Phase Overview](#phase-overview)
2. [Phase 1: Data Modeling (temporalTypes.ts)](#phase-1-data-modeling)
3. [Phase 2: Time Engine (TemporalEngine.ts)](#phase-2-time-engine)
4. [Phase 3: Relational Logic (RelationalEngine.ts)](#phase-3-relational-logic)
5. [Phase 4: Emotional Dynamics (DynamicsEngine.ts)](#phase-4-emotional-dynamics)
6. [Phase 5: Layout Engine (LayoutEngine.ts)](#phase-5-layout-engine)
7. [Orchestrator (GenogramEngine.ts)](#orchestrator)
8. [Usage Examples](#usage-examples)
9. [Rules & Constraints](#rules--constraints)

---

## Phase Overview

### The 5 Phases Explained

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: Data Modeling (Core Structures)                    │
│ - FuzzyDate: Date with reliability (EXACT, CALCULATED, etc) │
│ - PersonTemporal: Extended person with temporal fields      │
│ - UnionNode: Virtual node for couples                       │
│ - RelationStructure: Immutable structural info              │
│ - RelationDynamics: Mutable emotional overlay               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: Time Engine (Inference Algorithms)                 │
│ - Présent - Past: Age → BirthDate                           │
│ - Death - Life: AgeAtDeath + DeathYear → BirthDate          │
│ - Backwards Propagation: Children → Parent BirthDate        │
│ - Sanity Checks: Validate age gaps                          │
│ - Caching: Performance optimization                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: Relational Logic (Graph Management)                │
│ - UnionNodeManager: Create/manage couple nodes              │
│ - SiblingTransitivity: Auto-link siblings                   │
│ - TwinDetection: Auto-identify twins                        │
│ - Cascading applies: Transitive closure                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 4: Emotional Dynamics (Historical Tracking)           │
│ - Status transitions with history                           │
│ - Directional relationships (A→B)                           │
│ - Time-travel ready (undo/redo support)                     │
│ - Strength tracking (VERY_WEAK to VERY_STRONG)             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 5: Layout Engine (Positioning Algorithms)             │
│ - Horizontal sorting: Children by birth order               │
│ - Vertical stratification: BFS generation assignment        │
│ - Coordinate calculation: (x,y) per node                    │
│ - Generation indices: For visual hierarchy                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Data Modeling

**File**: `src/types/temporalTypes.ts`

### Core Interfaces

#### FuzzyDate
```typescript
interface FuzzyDate {
  year: number;
  month?: number;      // 1-12
  day?: number;        // 1-31
  isEstimated: boolean;
  reliability: 'EXACT' | 'CALCULATED' | 'INFERRED';
}
```

**Example**:
- User input: "I'm 54 years old"
- FuzzyDate: `{ year: 1971, isEstimated: true, reliability: 'CALCULATED' }`
- Formatted: `~1971` (tilde indicates estimated)

#### PersonTemporal
```typescript
interface PersonTemporal {
  // Identity
  id: string;
  name: string;
  gender: 'male' | 'female' | 'non-binary' | 'unknown';
  status: 'living' | 'deceased' | ...;
  
  // User INPUT
  inputMode?: 'DATE' | 'AGE_CURRENT' | 'AGE_AT_DEATH';
  numericValue?: number;        // Age or year
  referenceYear?: number;       // Death year (for AGE_AT_DEATH)
  
  // System OUTPUT (calculated)
  computedBirthDate?: FuzzyDate;
  computedDeathDate?: FuzzyDate;
  calculationMethod?: 'DIRECT_INPUT' | 'INFERRED_FROM_CHILDREN' | ...;
  lastCalculatedAt?: number;
}
```

#### UnionNode (Couple)
```typescript
interface UnionNode {
  id: string;
  members: string[];           // [personId1, personId2] (or more for polyamory)
  status: 'MARRIED' | 'PARTNERSHIP' | 'DIVORCED' | 'DISSOLVED';
  marriageDate?: FuzzyDate;
  divorceDate?: FuzzyDate;
  children: string[];          // Array of child personIds
  notes?: string;
  createdAt: number;
}
```

**Why UnionNode?**
- In genograms, children connect to their parents' *couple*, not individual parents
- Visual hierarchy is cleaner: parents → union → children
- Makes traversal algorithms simpler (BFS)

#### RelationDynamics (Emotional Overlay)
```typescript
interface RelationDynamics {
  currentStatus: 'CLOSE' | 'DISTANT' | 'CONFLICTED' | 'HOSTILE' | 'ABUSIVE' | ...;
  statusStartDate: number;  // Timestamp
  direction: 'BIDIRECTIONAL' | 'FROM_A_TO_B' | 'FROM_B_TO_A';
  history: DynamicsHistoryEntry[];
  strength?: 'VERY_WEAK' | 'WEAK' | 'MODERATE' | 'STRONG' | 'VERY_STRONG';
}

interface DynamicsHistoryEntry {
  status: RelationDynamicsStatus;
  startDate: number;
  endDate?: number;  // undefined = ongoing
  notes?: string;
}
```

**Key Feature**: Time-travel ready - every status change is recorded with timestamps

---

## Phase 2: Time Engine

**File**: `src/engines/TemporalEngine.ts`

### Algorithm 1: Present - Past
```
Age → Birth Year

Input:  Person { inputMode: 'AGE_CURRENT', numericValue: 54 }
Output: FuzzyDate { year: 1971, reliability: 'CALCULATED' }

Formula: birthYear = currentYear - age
```

### Algorithm 2: Death - Life
```
Age at Death + Death Year → Birth Year

Input:  Person { 
          inputMode: 'AGE_AT_DEATH', 
          numericValue: 67, 
          referenceYear: 2015 
        }
Output: FuzzyDate { year: 1948, reliability: 'CALCULATED' }

Formula: birthYear = deathYear - ageAtDeath
```

### Algorithm 3: Backwards Propagation
```
Children → Parent Birth Year (when parent has no direct data)

Steps:
1. Find all children of person X
2. Take child with oldest birth date
3. Subtract GENERATION_OFFSET (default: 30 years)
4. Result has reliability: 'INFERRED'

Example:
  Child born 1965 → Parent born ~1935
```

### Algorithm 4: Sanity Checks
```
Validate parent-child age gaps

Rules:
1. Parent must be older than child
2. Age gap between 12 and 70 years (configurable)

Violations:
- ERRORS: Child older than parent → FAIL
- WARNINGS: Too small/large gap → LOG but allow
```

### Usage

```typescript
import { TemporalEngine } from './TemporalEngine';

const engine = new TemporalEngine({
  GENERATION_OFFSET: 30,
  MIN_PARENT_CHILD_AGE: 12,
  MAX_PARENT_CHILD_AGE: 70,
});

// Calculate birth date from current age
const birthDate = engine.calculateBirthDateFromCurrentAge(54);
// → { year: 1971, isEstimated: true, reliability: 'CALCULATED' }

// Apply all calculations to a person
const processed = engine.applyTemporalCalculations(person);

// Validate parent-child relationship
const validation = engine.verifySanityParentChild(parent, child);
if (!validation.isValid) {
  console.log('ERROR:', validation.errors[0].message);
}
```

---

## Phase 3: Relational Logic

**File**: `src/engines/RelationalEngine.ts`

### UnionNodeManager

**Responsibility**: Create and manage virtual couple nodes

```typescript
// Create a marriage union
const unionId = unionManager.createUnion(
  ['person1', 'person2'],
  'MARRIED'
);

// Add child to union
unionManager.addChildToUnion(unionId, 'child1');

// Find union by members
const union = unionManager.findUnionByMembers('person1', 'person2');

// Get all unions where person is a member
const unions = unionManager.findUnionsByMember('person1');
```

### SiblingTransitivityManager

**Responsibility**: Auto-link siblings transitively

**Algorithm**: When user links A and B as siblings:

```
1. If A has parents/union:
     → Link B to A's union
   
2. Else if B has parents/union:
     → Link A to B's union
   
3. Else:
     → Create empty union, link both to it
   
4. Result: Both siblings now share same union ✓
```

**Example**:

```
Before:
  A (no parents) —sibling— B (no parents)

After:
  [UnionNode]
      ↙      ↘
     A        B
```

### TwinDetectionManager

**Responsibility**: Auto-detect twins

```typescript
const detection = twinManager.detectTwins(sibling1, sibling2);

if (detection.areTwins) {
  console.log('Detected twins!');
  console.log('Type:', detection.twinType); // IDENTICAL | FRATERNAL | UNKNOWN
}
```

**Rule**: Twins if birth date difference < 24 hours

---

## Phase 4: Emotional Dynamics

**File**: `src/engines/DynamicsEngine.ts`

### Status Transitions with History

**Paradigm**: "Time Travel Ready"

Every status change is recorded:

```typescript
const dynamics = dynamicsManager.createInitialDynamics('CLOSE');

// User reports relationship deteriorates
dynamics = dynamicsManager.transitionStatus(
  dynamics,
  'CONFLICTED',
  'Marriage problems started'
);

// History automatically recorded
dynamics.history = [
  {
    status: 'CLOSE',
    startDate: 2020-01-01,
    endDate: 2023-06-15,
    notes: 'Marriage problems started'
  }
];

dynamics.currentStatus = 'CONFLICTED';
```

### Directionality Rules

```typescript
// Some relationships REQUIRE directionality
validateDirectionalityRequired('ABUSIVE');
// → { required: true, reason: "..." }

// Force user to specify FROM_A_TO_B or FROM_B_TO_A
```

### Undo/Redo Support

```typescript
// Undo last transition
const previous = dynamicsManager.undoLastTransition(dynamics);
// Reverts to 'CLOSE', removes from history

// Get complete timeline
const timeline = dynamicsManager.getCompleteTimeline(dynamics);
```

---

## Phase 5: Layout Engine

**File**: `src/engines/LayoutEngine.ts`

### Algorithm 1: Horizontal Sorting

**Sort children by birth order** (ascending year)

```
Input:  [Child_born_1965, Child_born_1960, Child_born_1963]
Output: [Child_1960, Child_1963, Child_1965]
        sortOrder: [0, 1, 2]

Visual:
  [1960]  [1963]  [1965]
    ↓       ↓       ↓
  (left)          (right)
```

### Algorithm 2: Vertical Stratification (BFS)

**Assign generation indices using Breadth-First Search**

```
Starting from Proband (generation 0):
- Parents = generation +1
- Children = generation -1
- Siblings = generation 0

Example:

Generation +1:    [Grandma]      [Grandpa]
                       ↓              ↓
Generation +2:     [Union] ←────────┘
                       ↓
Generation 0:      [Mother] ←──→ [Father]
                       ↓
Generation -1:    [UnionChildren]
                  ↙  ↓  ↓  ↘
Generation -2:  [C1][C2][C3][C4]
```

### Algorithm 3: Coordinate Calculation

**Spread nodes in 2D space**

```typescript
const nodes = layoutEngine.calculateCoordinates(
  layoutNodes,
  spacingX = 150,  // pixels between siblings
  spacingY = 200   // pixels between generations
);

// Result:
// [
//   { id: 'person1', generationIndex: 0, x: -75, y: 0 },
//   { id: 'person2', generationIndex: 0, x: 75, y: 0 },
//   { id: 'child1', generationIndex: -1, x: -225, y: -200 },
// ]
```

### Orchestrator

```typescript
const layoutNodes = layoutEngine.orchestrateLayout(
  people,
  unions,
  probandId,
  spacingX,
  spacingY
);
```

**Runs all algorithms in sequence**:
1. Sort children horizontally
2. BFS stratification vertically
3. Assign generation indices
4. Calculate (x, y) coordinates

---

## Orchestrator

**File**: `src/engines/GenogramEngine.ts`

### Main Interface

```typescript
const engine = createGenogramEngine({
  GENERATION_OFFSET: 30,
  MIN_PARENT_CHILD_AGE: 12,
  MAX_PARENT_CHILD_AGE: 70,
});

// Workflow 1: Initialize
engine.initializeGenogram(peopleArray, unionsArray, probandId);

// Workflow 2: Add person
engine.addPerson(personTemporal);

// Workflow 3: Add marriage
const unionId = engine.addPartnershipRelation('personA', 'personB', 'MARRIED');

// Workflow 4: Add parent-child
const result = engine.addParentChildRelation('parent', 'child');
if (result.valid) console.log('Valid!');
else console.log('Warnings:', result.warnings);

// Workflow 5: Add sibling (with auto-transitivity + twin detection)
const sibResult = engine.addSiblingRelation('sibA', 'sibB');
if (sibResult.twins) console.log('Twins detected!');

// Workflow 6: Update dynamics
engine.updateRelationDynamics(relationId, 'CONFLICTED');

// Workflow 7: Calculate layout
const { nodes, layoutMetrics } = engine.calculateLayout();

// Export state
const exported = engine.export();
```

---

## Usage Examples

### Example 1: Basic Workflow

```typescript
import { createGenogramEngine } from './engines/GenogramEngine';

const engine = createGenogramEngine();

// Add mother
engine.addPerson({
  id: 'mother-1',
  name: 'Ana',
  gender: 'female',
  status: 'living',
  inputMode: 'AGE_CURRENT',
  numericValue: 62,
});

// Add son (proband)
engine.addPerson({
  id: 'son-1',
  name: 'David',
  gender: 'male',
  status: 'living',
  inputMode: 'DATE',
  computedBirthDate: { year: 1995, isEstimated: false, reliability: 'EXACT' },
});

// Create parent-child relation
const { relationId, valid, warnings } = engine.addParentChildRelation('mother-1', 'son-1');

// Calculate layout
engine.setProband('son-1');
const { nodes } = engine.calculateLayout();

// Render nodes to canvas
nodes.forEach(node => {
  console.log(`${node.id}: (${node.x}, ${node.y}) gen=${node.generationIndex}`);
});
```

### Example 2: Complex Family with Dynamics

```typescript
// Add marriage
const unionId = engine.addPartnershipRelation('mother', 'father', 'MARRIED');

// Add children
engine.addPerson(child1);
engine.addPerson(child2);

engine.addParentChildRelation('mother', 'child1');
engine.addParentChildRelation('mother', 'child2');

// Link as siblings (auto-transitivity + twin check)
const sibResult = engine.addSiblingRelation('child1', 'child2');

// Simulate conflict
engine.updateRelationDynamics(sibResult.relationId, 'CONFLICTED');

// Export for database
const data = engine.export();
firebase.saveGenogram(data);
```

---

## Rules & Constraints

### Global Rules

| Rule | Description | Enforcement |
|------|-------------|-------------|
| **FuzzyDate Reliability** | Non-EXACT dates get `~` prefix | Formatting |
| **Backwards Propagation** | Parent birth = oldest child birth - 30 years | TemporalEngine |
| **Parent-Child Age Gap** | 12-70 years (configurable) | Sanity check |
| **Child Older Than Parent** | ERROR - relationship invalid | Sanity check |
| **UnionNode Requirement** | Every marriage/partnership must have UnionNode | RelationalEngine |
| **Sibling Transivity** | Linking A-B siblings auto-links both to same union | SiblingTransitivityManager |
| **Twin Detection** | Auto-detect if birth dates differ < 24h | TwinDetectionManager |
| **Dynamics History** | Every status change recorded with timestamps | DynamicsManager |
| **Directional Required** | ABUSIVE & ONE_SIDED_LOVE require FROM/TO | DynamicsManager |
| **BFS Generation** | Every node assigned unique generation index | LayoutEngine |
| **Horizontal Sort** | Children sorted by birth year (ascending) | LayoutEngine |

### Phase Interactions

```
┌─ Person added with AGE_CURRENT
│  └─ TemporalEngine calculates birth date
│  └─ Stored in computedBirthDate
│
├─ Parent-child relation added
│  └─ TemporalEngine sanity checks ages
│  └─ RelationalEngine links to UnionNode (if exists)
│  └─ DynamicsManager creates initial 'CLOSE' status
│
├─ Sibling relation added
│  └─ SiblingTransitivityManager applies cascade
│  └─ TwinDetectionManager checks for twins
│  └─ Union node auto-created/updated
│
├─ Status update
│  └─ DynamicsManager transitions with history
│
└─ Layout calculation
   └─ LayoutEngine BFS generates generation map
   └─ Coordinates calculated
   └─ Ready for rendering
```

---

## Configuration

```typescript
interface TemporalEngineConfig {
  GENERATION_OFFSET: number;           // Default: 30 years
  MIN_PARENT_CHILD_AGE: number;        // Default: 12 years
  MAX_PARENT_CHILD_AGE: number;        // Default: 70 years
  CURRENT_YEAR: number;                // Auto-updated
  WARNING_THRESHOLD_LOW: number;       // Default: 12
  WARNING_THRESHOLD_HIGH: number;      // Default: 70
}
```

---

## API Quick Reference

### TemporalEngine
- `calculateBirthDateFromCurrentAge(age)` → FuzzyDate
- `calculateBirthDateFromAgeAtDeath(age, year)` → FuzzyDate
- `calculateBirthDateFromChildren(personId, childDates)` → FuzzyDate
- `applyTemporalCalculations(person)` → PersonTemporal
- `verifySanityParentChild(parent, child)` → SanityCheckResult

### UnionNodeManager
- `createUnion(members, status)` → unionId
- `addChildToUnion(unionId, childId)`
- `findUnionByMembers(id1, id2)` → UnionNode
- `findUnionsByMember(personId)` → UnionNode[]

### SiblingTransitivityManager
- `applyFraternalTransitivity(sibA, sibB, managers, map)` → unionId

### TwinDetectionManager
- `detectTwins(sib1, sib2)` → { areTwins, twinType }
- `detectTwinsInSiblingGroup(siblings)` → detection[]

### DynamicsManager
- `createInitialDynamics(status, type)` → RelationDynamics
- `transitionStatus(dynamics, newStatus, notes)` → RelationDynamics
- `undoLastTransition(dynamics)` → RelationDynamics | null
- `validateDirectionalityRequired(status)` → { required, reason }

### LayoutEngine
- `sortChildrenHorizontally(children)` → { sorted, layoutNodes }
- `stratifyVerticallyBFS(probandId, people, unions, map)` → generationMap
- `calculateCoordinates(nodes, spacingX, spacingY)` → LayoutNode[]
- `orchestrateLayout(people, unions, probandId, spacing)` → LayoutNode[]

### GenogramEngine (Main)
- `initializeGenogram(people, unions, probandId)`
- `addPerson(person)`
- `addPartnershipRelation(personA, personB, status)` → unionId
- `addParentChildRelation(parent, child)` → { relationId, valid, warnings }
- `addSiblingRelation(sibA, sibB)` → { relationId, unionId, twins }
- `updateRelationDynamics(relationId, newStatus)` → boolean
- `calculateLayout()` → { nodes, layoutMetrics }
- `export()` → { people, unions, relations, probandId }

---

## Testing Checklist

- [ ] FuzzyDate formatting with `~` prefix
- [ ] Birth date calculation from age (multiple input modes)
- [ ] Backwards propagation (children → parent date)
- [ ] Sanity checks (parent age >= child age)
- [ ] UnionNode creation on marriage
- [ ] Sibling transitivity (all siblings linked to same union)
- [ ] Twin detection (< 24h difference)
- [ ] Dynamics history (transitions recorded)
- [ ] BFS generation assignment (correct hierarchy)
- [ ] Horizontal sorting (children by birth order)
- [ ] Layout coordinate calculation (correct spacing)
- [ ] Export/import (roundtrip test)

---

## Performance Considerations

- **Cache**: TemporalEngine caches calculation results
- **BFS**: O(V + E) complexity for generation assignment
- **UnionNodes**: Reduces graph complexity vs individual parent links
- **Lazy Evaluation**: Layout only calculated on demand

---

**Last Updated**: December 6, 2025
**Version**: 1.0.0 (Complete Implementation)
