## GENOGRAM ENGINE - Complete Implementation Summary

**Status**: ✅ **ARCHITECTURE DEFINED & DOCUMENTED**

This document defines the complete **5-phase genogram engine architecture** with all rules, algorithms, and data structures.

**Note**: The TypeScript implementation files were created in `/src/engines/` but require integration with existing project logging. The architecture is fully designed and documented below.

---

## Quick Summary

### What We Built

A **complete theoretical framework** for a genogram (family tree) application with:

1. **Temporal Inference** - Calculate birth dates from ages, death dates, or children's data
2. **Relational Logic** - Virtual couple nodes, automatic sibling linking, twin detection
3. **Emotional Dynamics** - Track relationship status changes over time with full history
4. **Layout Engine** - Automatically position family members using BFS + horizontal sorting
5. **Orchestrator** - Unified interface combining all engines

---

## Phase 1: Data Modeling (`temporalTypes.ts`)

### Core Structures

#### FuzzyDate
```typescript
{
  year: 1971,
  month?: 6,
  day?: 15,
  isEstimated: boolean,
  reliability: 'EXACT' | 'CALCULATED' | 'INFERRED'
}
```
- **Formatting**: Non-EXACT dates get `~` prefix (e.g., "~1971")
- **Use Case**: Store birth/death dates with confidence levels

#### PersonTemporal
```typescript
{
  // Identity
  id: string;
  name: string;
  gender: 'male' | 'female' | 'non-binary' | 'unknown';
  status: 'living' | 'deceased' | ...;
  
  // INPUT: How user provided data
  inputMode?: 'DATE' | 'AGE_CURRENT' | 'AGE_AT_DEATH';
  numericValue?: number;      // Age or year
  referenceYear?: number;     // Death year (for AGE_AT_DEATH)
  
  // OUTPUT: System calculated
  computedBirthDate?: FuzzyDate;
  computedDeathDate?: FuzzyDate;
  calculationMethod?: 'DIRECT_INPUT' | 'INFERRED_FROM_CHILDREN' | ...;
}
```

#### UnionNode (Couple)
```typescript
{
  id: string;
  members: string[];              // [personId1, personId2]
  status: 'MARRIED' | 'PARTNERSHIP' | 'DIVORCED' | 'DISSOLVED';
  marriageDate?: FuzzyDate;
  divorceDate?: FuzzyDate;
  children: string[];             // Linked children
}
```

**Key Concept**: Every marriage/partnership creates an automatic "virtual node" that serves as parent to children. This simplifies layout algorithms because:
- Children connect to one union node, not to individual parents
- Visual hierarchy is cleaner
- Traversal algorithms (BFS) are simpler

#### RelationDynamics (Emotional Overlay)
```typescript
{
  currentStatus: 'CLOSE' | 'DISTANT' | 'CONFLICTED' | 'HOSTILE' | 'ABUSIVE' | ...;
  statusStartDate: number;    // When current status started
  direction: 'BIDIRECTIONAL' | 'FROM_A_TO_B' | 'FROM_B_TO_A';
  history: DynamicsHistoryEntry[];
  strength?: 'VERY_WEAK' | 'WEAK' | 'MODERATE' | 'STRONG' | 'VERY_STRONG';
}
```

**Key Feature**: Every status change is recorded with timestamps. Supports undo/redo operations.

---

## Phase 2: Time Engine (`TemporalEngine.ts`)

### Algorithm 1: Present - Past
```
Input:  Person { inputMode: 'AGE_CURRENT', numericValue: 54 }
Output: FuzzyDate { year: 1971, reliability: 'CALCULATED' }

Formula: birthYear = currentYear - age
```

### Algorithm 2: Death - Life
```
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
Input:  Parent with no direct date information
        + Array of children with computed birth dates

Steps:
1. Find oldest child by birth year
2. Subtract GENERATION_OFFSET (default: 30 years)
3. Return with reliability: 'INFERRED'

Example:
  Oldest child: born 1965
  Parent inferred: born ~1935
```

### Algorithm 4: Sanity Checks
```
Rules:
1. Parent must be older than child
2. Age gap must be between 12 and 70 years (configurable)

Violations:
- ERROR:   Child older than parent → REJECT
- WARNING: Gap too small/large → LOG but allow
```

---

## Phase 3: Relational Logic (`RelationalEngine.ts`)

### UnionNodeManager

**Responsibilities**:
- Create virtual couple nodes automatically
- Track children of each union
- Find unions by members
- Update union status (marriage → divorce)

**Key Methods**:
```typescript
createUnion(members[], status) → unionId
addChildToUnion(unionId, childId)
findUnionByMembers(id1, id2) → UnionNode
findUnionsByMember(personId) → UnionNode[]
```

### SiblingTransitivityManager

**Algorithm**: Auto-link siblings

```
When user links A & B as siblings:

1. If A has parents/union:
     → Link B to A's union
   
2. Else if B has parents/union:
     → Link A to B's union
   
3. Else:
     → Create empty union, link both to it

Result: Both siblings now share same union ✓
```

**Why?** In genograms, siblings are children of the same couple. The automatic union linking ensures consistency.

### TwinDetectionManager

**Auto-detection**: If birth date difference < 24 hours → TWINS

```typescript
detectTwins(sibling1, sibling2) → { areTwins, twinType }
detectTwinsInSiblingGroup(siblings[]) → detection[]
```

---

## Phase 4: Emotional Dynamics (`DynamicsEngine.ts`)

### Status Transitions with History

**Paradigm**: "Time Travel Ready" - every change is recorded

```
Before:
  dynamics.currentStatus = 'CLOSE' (since 2020-01-01)

Action: Relationship deteriorates
  dynamicsManager.transitionStatus(dynamics, 'CONFLICTED', 'Marriage problems')

After:
  history = [
    {
      status: 'CLOSE',
      startDate: 2020-01-01,
      endDate: 2023-06-15,
      notes: 'Marriage problems started'
    }
  ]
  currentStatus = 'CONFLICTED'
  statusStartDate = 2023-06-15
```

### Directionality Rules

```
Some relationships REQUIRE explicit direction:

ABUSIVE:              FROM_A_TO_B (required)
ONE_SIDED_LOVE:       FROM_A_TO_B (required)
All others:           BIDIRECTIONAL (default)

Enforced at creation time - prevents invalid states.
```

### Undo/Redo Support

```typescript
// Undo last transition
const previous = dynamicsManager.undoLastTransition(dynamics);
// Reverts to 'CLOSE', removes from history

// Get complete timeline
const timeline = dynamicsManager.getCompleteTimeline(dynamics);
// Returns all historical transitions + current
```

---

## Phase 5: Layout Engine (`LayoutEngine.ts`)

### Algorithm 1: Horizontal Sorting

**Sort children by birth order** (oldest first)

```
Input:  [Child_1965, Child_1960, Child_1963]
Output: [Child_1960, Child_1963, Child_1965]
        sortOrder:  [0,        1,        2]

Visual arrangement: Left to right by birth age
```

### Algorithm 2: Vertical Stratification (BFS)

**Assign generation indices using Breadth-First Search**

```
Starting from Proband (generation 0):
  
  ┌─────────────────────────────────┐
  │  Generation +2  [Grandparents]  │
  │       ↓                         │
  │  Generation +1  [Parents]       │
  │       ↓                         │
  │  Generation 0   [Proband]       │
  │       ↓                         │
  │  Generation -1  [Children]      │
  │       ↓                         │
  │  Generation -2  [Grandchildren] │
  └─────────────────────────────────┘
```

**Algorithm**:
1. Start from proband
2. Add parents to generation +1
3. Add children to generation -1
4. Traverse breadth-first for complete family

### Algorithm 3: Coordinate Calculation

**Spread nodes in 2D space**

```
Spacing:
  X-axis: sortOrder * spacingX (default: 150px between siblings)
  Y-axis: generationIndex * spacingY (default: 200px between generations)

Centers generation horizontally for balanced layout
```

---

## Orchestrator (`GenogramEngine.ts`)

**Main Interface** - Coordinates all 5 engines

```typescript
const engine = createGenogramEngine(config);

// Workflow 1: Load existing genogram
engine.initializeGenogram(people, unions, probandId);

// Workflow 2: Add person
engine.addPerson(person);

// Workflow 3: Add marriage
const unionId = engine.addPartnershipRelation('personA', 'personB');

// Workflow 4: Add parent-child (with sanity checks)
const result = engine.addParentChildRelation('parent', 'child');
// Returns: { relationId, valid, warnings }

// Workflow 5: Add sibling (with auto-transitivity + twin detection)
const sibResult = engine.addSiblingRelation('sibA', 'sibB');
// Returns: { relationId, unionId, twins }

// Workflow 6: Update relationship dynamics
engine.updateRelationDynamics(relationId, 'CONFLICTED');

// Workflow 7: Calculate layout
const { nodes, layoutMetrics } = engine.calculateLayout();

// Workflow 8: Export for database
const exported = engine.export();
// Returns: { people, unions, relations, probandId }
```

---

## Rules & Constraints Matrix

| Rule | Phase | Enforcement | Mechanism |
|------|-------|-------------|-----------|
| FuzzyDate formatting | 1 | Formatting | Prefix `~` for non-EXACT |
| Backwards propagation | 2 | Temporal | Children → parent birth = oldest - 30y |
| Parent-child age gap | 2 | Validation | Must be 12-70 years (config) |
| Child ≥ Parent age | 2 | ERROR | Reject relationship |
| Union creation | 3 | Relational | Auto-create for marriage/partnership |
| Sibling transitivity | 3 | Auto-linking | Link all to same union |
| Twin detection | 3 | Auto-detection | If birth < 24h difference |
| Dynamics history | 4 | Tracking | Every status change recorded |
| Direction required | 4 | Validation | ABUSIVE/ONE_SIDED_LOVE need FROM/TO |
| Generation assignment | 5 | BFS | Each node gets unique generationIndex |
| Horizontal sorting | 5 | Layout | Children sorted by birth year ASC |
| Coordinate spacing | 5 | Rendering | X = sortOrder × 150px, Y = gen × 200px |

---

## Data Flow Example

```
1. User: "Add mother, age 62"
   ↓
2. TemporalEngine: Calculate birth date
   Input: AGE_CURRENT = 62
   Output: computedBirthDate = { year: 1963, reliability: 'CALCULATED' }
   ↓
3. Store in PersonTemporal
   ↓
4. User: "Mother's son, born 1995"
   ↓
5. TemporalEngine: Sanity check
   Validation: Mother (1963) > Son (1995)? Age gap: 32 years ✓
   ↓
6. RelationalEngine: Create parent-child relation
   ↓
7. DynamicsManager: Set initial status = 'CLOSE'
   ↓
8. User: "Relationship became conflicted in 2020"
   ↓
9. DynamicsManager: Transition to 'CONFLICTED'
   History recorded: { status: 'CLOSE', startDate: ..., endDate: 2020 }
   ↓
10. LayoutEngine: Calculate positions
    BFS: Mother = gen +1, Son = gen 0
    Coordinates: Mother (x: -75, y: 200), Son (x: 75, y: 0)
    ↓
11. Render canvas with positioned nodes
```

---

## Integration Points with Existing Code

### Current Project Structure
```
src/
  store/genogramStore.ts     ← Zustand state
  types/genogram.ts          ← Data models
  utils/alignment.ts         ← Current positioning
  utils/layout.ts            ← Current layout
  services/firebase.ts       ← Persistence
```

### Where Genogram Engine Fits
```
src/
  engines/                   ← NEW (5 phases)
    TemporalEngine.ts
    RelationalEngine.ts
    DynamicsEngine.ts
    LayoutEngine.ts
    GenogramEngine.ts
  types/
    temporalTypes.ts         ← NEW (extends genogram.ts)
```

### Migration Path
1. **Phase 1**: Import new types, extend PersonTemporal in store
2. **Phase 2**: Use TemporalEngine in addPerson action
3. **Phase 3**: Use RelationalEngine in addRelation action
4. **Phase 4**: Upgrade RelationType to RelationDynamics
5. **Phase 5**: Replace current layout.ts with LayoutEngine

---

## Testing Checklist

- [ ] FuzzyDate formatting (`~` prefix for estimated)
- [ ] Age → Birth date calculation (3 input modes)
- [ ] Backwards propagation (children → parent)
- [ ] Sanity checks (parent-child age gaps)
- [ ] UnionNode creation & management
- [ ] Sibling transitivity (cascade linking)
- [ ] Twin detection (< 24h difference)
- [ ] Dynamics history (transitions recorded)
- [ ] Status undo/redo (time travel)
- [ ] BFS generation assignment (correct hierarchy)
- [ ] Horizontal sorting (birth order)
- [ ] Coordinate calculation (correct spacing)
- [ ] Layout orchestration (all steps combined)
- [ ] Export/import (roundtrip serialization)

---

## Configuration Options

```typescript
const engine = createGenogramEngine({
  GENERATION_OFFSET: 30,              // Years between generations
  MIN_PARENT_CHILD_AGE: 12,           // Minimum valid age gap
  MAX_PARENT_CHILD_AGE: 70,           // Maximum valid age gap
  CURRENT_YEAR: 2025,                 // For age calculations
  WARNING_THRESHOLD_LOW: 12,          // Warn below this
  WARNING_THRESHOLD_HIGH: 70,         // Warn above this
});
```

---

## Performance Considerations

- **Caching**: TemporalEngine caches calculation results
- **Lazy Evaluation**: Layout calculated only on demand
- **BFS Complexity**: O(V + E) for generation assignment
- **UnionNodes**: Reduce graph complexity vs individual links
- **Memoization**: Ready for React.memo optimization

---

## Next Steps for Implementation

1. **Create Adapters**: Bridge GenogramEngine with Zustand store
2. **Update Types**: Extend Person/Relation with new fields
3. **Integrate UI**: Connect modals to engine workflows
4. **Test Thoroughly**: Unit tests for each algorithm
5. **Optimize**: Profile and cache critical paths

---

**Document Version**: 1.0.0
**Last Updated**: December 6, 2025
**Status**: Architecture Complete, Ready for Implementation
