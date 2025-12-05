# AI Coding Agent Guidelines for PsychoGenealogy

This document provides essential context for AI agents working on the PsychoGenealogy codebase to be immediately productive.

## Project Overview

**PsychoGenealogy** is a React + TypeScript therapy-focused genogram (family tree) builder with AI-powered psychological analysis. Unlike traditional genealogy tools, it emphasizes mental health patterns, trauma tracking, and clinical psychology integration.

### Core Purpose
- Help therapists and clients visualize family systems
- Identify intergenerational patterns (trauma, addiction, mental health)
- AI-powered analysis of family dynamics
- Export for clinical documentation

### Tech Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 4 + custom design system
- **State**: Zustand (with persistence middleware)
- **Canvas**: ReactFlow for visual genogram
- **Database**: Firebase (Firestore + Auth)
- **AI**: Gemini API + OpenAI
- **Export**: jsPDF + html-to-image

---

## Architecture Overview

### Critical Data Flow

```
User Action (add person/relation)
    ↓
Zustand Store (genogramStore.ts)
    ├→ LocalStorage (offline support)
    └→ Firebase Firestore (cloud sync)
    ↓
Alignment Engine (utils/alignment.ts)
    ├→ Sibling positioning
    └→ Partner alignment
    ↓
Layout Engine (utils/layout.ts)
    ├→ Dagre graph layout
    └→ Generation hierarchy
    ↓
ReactFlow Canvas (GenogramCanvas.tsx)
    └→ PersonNode visual rendering
```

### State Management Pattern

```typescript
// All genogram data flows through ONE store:
const { 
  people, 
  relations, 
  profiles,
  addPerson,
  updatePerson,
  addRelation,
  saveCurrentGenogram  // Saves to both localStorage AND Firestore
} = useGenogramStore();
```

**Key insight**: This app ALWAYS saves to localStorage immediately (guaranteed offline access), then syncs to Firestore asynchronously.

---

## Core Data Structures

### Person (src/types/genogram.ts)
```typescript
interface Person {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'non-binary' | 'unknown';
  status: 'living' | 'deceased';
  age?: number;
  
  // Therapy tracking
  attributes?: string[];  // e.g., ['depression', 'anxiety', 'addiction']
  templateCategory?: TemplateCategory;  // Archetypal role
  profileId?: string;  // Links to PersonProfile
  
  // Positioning
  isPrincipal?: boolean;  // The focus person (centered, highlighted)
  position?: { x: number; y: number };  // Saved coordinates
  
  // Clinical data
  dateOfBirth?: string;
  dateOfDeath?: string;
  medicalConditions?: string[];
  significantEvents?: string[];
  notes?: string;
}
```

**Template categories** (12 types from Bowen family systems theory):
- `authoritarian-parent`, `neglectful-parent`, `enabling-parent`
- `dependent-child`, `rebellious-child`, `peacekeeper`, `scapegoat`, `hero`, `lost-child`
- `traumatized-adult`, `achiever`, `codependent`

### Relation (src/types/genogram.ts)
```typescript
interface Relation {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationType;  // 'parent-child' | 'partner' | 'ex-partner' | 'sibling' | 'conflict' | 'close' | 'distant' | 'fused'
}
```

### Alignment System (The "Why" Behind Structure)

Your app has a **custom alignment engine** - this is NOT standard React Flow. When you add a sibling or partner relation, the system automatically repositions people to maintain proper genogram structure:

- **Siblings**: Lined up horizontally under their parents
- **Partners**: Positioned side-by-side
- **Parents**: Centered above children

**Key files**: `utils/alignment.ts` (calculations) + `genogramStore.ts` (applies on relation add)

---

## Essential Developer Workflows

### Adding a Person
1. User clicks "+ Add Person"
2. `AddPersonModal.tsx` opens
3. Form submission calls `store.addPerson()`
4. Store automatically saves to localStorage
5. Canvas re-renders via ReactFlow nodes
6. Alignment engine adjusts positions

### Adding a Relationship
1. User clicks "Link Relations"
2. `AddRelationModal.tsx` - select source/target person & relation type
3. Form submission calls `store.addRelation()`
4. **Alignment engine runs** (applies sibling/partner positioning)
5. Store updates both people positions & relations array
6. Canvas re-renders with new edges & adjusted node positions

### Saving to Cloud
```typescript
// On every significant change + manual save button:
await saveCurrentGenogram();
// This function:
// 1. Saves to localStorage immediately ✅
// 2. Attempts Firestore sync (can fail, user still has local copy)
// 3. Updates lastSyncTime timestamp
```

### Build & Development Commands
```bash
npm run dev      # Vite dev server (hot reload) - http://localhost:5173
npm run build    # TypeScript compile + Vite bundle
npm run lint     # ESLint check
```

---

## Project-Specific Patterns

### 1. Component Organization

```
src/components/
├── ui/                 # Reusable: Button, Card, Modal, Input, etc.
├── layout/            # Page structure: AppHeader, etc.
├── genogram/          # EMPTY - genogram components are at root level
├── modals/            # Add/Edit modals for Person, Relation, Profile
├── personHub/         # Person detail views & relations display
├── common/            # Shared utilities
└── [Root level]       # GenogramCanvas, PersonNode, GenogramLegend
    ├── GenogramCanvas.tsx
    ├── PersonNode.tsx
    └── GenogramLegend.tsx
```

**Pattern**: Main feature components at root, UI primitives in `ui/`

### 2. Modal Pattern

All modals follow this structure:
```tsx
export const MyModal = ({ isOpen, onClose }) => {
  const { people, addX, error } = useGenogramStore();
  const [formData, setFormData] = useState({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addX(formData);  // Call store action
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      {/* Modal content */}
    </div>
  );
};
```

### 3. Store Actions Pattern

All store methods use this structure:
```typescript
// Local updates (sync)
addPerson: (person) => set((state) => ({ 
  people: [...state.people, person] 
})),

// Async Firestore operations
loadGenogram: async (id) => {
  set({ isLoading: true, error: null });
  try {
    const data = await firestoreService.getGenogram(id);
    set({ people: data.people, relations: data.relations });
  } catch (error) {
    set({ error: error.message });
  } finally {
    set({ isLoading: false });
  }
}
```

**Key**: Always wrap with loading/error state

### 4. Psychology Profile System

Profiles are separate from Person but linked:
```typescript
// Create profile first
const profile = {
  id: uuid(),
  personId: person.id,
  profileType: 'template',
  templateCategory: 'hero',
  coreWounds: ['abandonment', 'rejection'],
  copingMechanisms: ['overworking', 'perfectionism'],
  strengthsAndResources: ['intelligence', 'resilience']
};

store.addProfile(profile);  // Stores in profiles array
```

**Reference**: `AddProfileModal.tsx`, `ProfileTemplates.ts`

### 5. Styling Convention

Uses Tailwind + custom design system:
```tsx
// Colors (defined in tailwind.config.js)
const oceanColors = {
  50: '#F0F8FF',
  100: '#E0F2FE',
  900: '#001D46'
};

// Always use predefined color set
<div className="bg-ocean-900 text-ocean-100 border border-ocean-700">

// Dark mode support
<div className="dark:bg-deep-surface light:bg-white">
```

**Reference**: `src/App.css`, `tailwind.config.js`

---

## Common Pitfalls & Solutions

### ❌ DON'T: Modify `people` array directly in components
```tsx
// BAD - React won't detect the change
people[0].age = 30;

// GOOD - Use store action
updatePerson(people[0].id, { age: 30 });
```

### ❌ DON'T: Forget offline support
```tsx
// BAD - assumes Firestore always works
await saveToFirestore();

// GOOD - save to localStorage first, Firestore second
store.saveCurrentGenogram();  // Handles both
```

### ❌ DON'T: Assume positioned nodes
```tsx
// BAD - person might not have position yet
const x = person.position.x;

// GOOD - check for position, use dagre fallback
const x = person.position?.x ?? dagreGraph.node(person.id).x;
```

### ✅ DO: Run alignment after adding relations
```tsx
// Store automatically does this on addRelation()
const alignedPositions = applySiblingAlignment(...);
updatedPeople.forEach(person => {
  if (alignedPositions.has(person.id)) {
    person.position = alignedPositions.get(person.id);
  }
});
```

---

## Key Files Map

| File | Purpose | Modify When |
|------|---------|-------------|
| `genogramStore.ts` | Central state hub | Adding store actions, new state properties |
| `types/genogram.ts` | Data models | Adding new data fields (Person, Relation, etc.) |
| `utils/alignment.ts` | Position calculations | Tweaking sibling/partner spacing |
| `utils/layout.ts` | Dagre graph layout | Changing generation spacing |
| `GenogramCanvas.tsx` | React Flow wrapper | Canvas-level features (theme, zoom, pan) |
| `PersonNode.tsx` | Node rendering | Visual style, symbol colors, status indicators |
| `genogram.ts` in `services/` | Firebase queries | Cloud sync logic |
| `pages/Editor.tsx` | Main editor page | Workflow orchestration, modals |
| `tailwind.config.js` | Design tokens | Colors, spacing, theme |

---

## Data Persistence Strategy

### localStorage (Primary - Guaranteed)
- Saved **immediately** on every action
- Format: JSON string in `genogram-{id}` key
- Survives: Browser close, network loss, Firestore outage
- Used by: Offline access, quick feedback

### Firestore (Secondary - Cloud Backup)
- Synced **asynchronously** after localStorage
- Can fail silently (user doesn't see data loss)
- Used by: Multi-device sync, permanent backup
- Collections: `genograms` (metadata), `users` (auth)

**Never trade off localStorage for speed** - it's the safety net.

---

## Testing Genogram Logic

When making changes to alignment, layout, or data flow:

```bash
# Test locally
npm run dev

# Create test genogram:
1. Add 2 parents (male, female)
2. Add 3 children under them
3. Verify siblings auto-align horizontally
4. Add partner to one child
5. Verify partner positioned correctly

# Test offline: DevTools Network → Offline → Reload page
# Should still see all data in canvas
```

---

## AI-Powered Features

### Gemini Analysis (src/services/geminiAi.ts)
- Analyzes family patterns
- Generates psychological insights
- Requires `VITE_GOOGLE_GENERATIVE_AI_KEY` env var

### OpenAI Chat (src/services/aiChat.ts)
- Therapist-assist chat interface
- Suggests follow-up questions
- Requires `VITE_OPENAI_API_KEY` env var

**When adding features**: If you need AI capabilities, check `services/ai.ts` for prompts and patterns.

---

## Common Code Examples

### Add a new field to Person
1. Update `types/genogram.ts` interface
2. Update `AddPersonModal.tsx` form
3. Update `PersonEditModal.tsx` form
4. Update store serialization if needed (usually not)
5. Test: Create person, edit to set field, save, reload page

### Add a new relation type
1. Add to `RelationType` enum in `types/genogram.ts`
2. Add to dropdown in `AddRelationModal.tsx`
3. If alignment needed, update `utils/alignment.ts`
4. Add visual styling in `PersonNode.tsx` or `GenogramLegend.tsx`

### Add a new page
1. Create `src/pages/NewPage.tsx`
2. Export as `export const NewPage = () => { ... }`
3. Add route in `App.tsx`
4. Add navigation link in `AppHeader.tsx`
5. Use `useGenogramStore()` to access data

---

## Where to Find Things

- **Gen psychology templates**: `services/profileTemplates.ts`
- **Relation types & visuals**: `components/GenogramLegend.tsx`
- **Export logic**: `services/pdfExport.ts`
- **Firebase setup**: `services/firebase.ts`
- **Design tokens**: `tailwind.config.js`, `App.css`
- **Tutorial content**: `pages/TutorialPage.tsx`
- **Test questions**: `data/testQuestions.ts`

---

## Priority Rules for Changes

1. **Data model changes** → Update `types/genogram.ts` FIRST
2. **UI changes** → Update after testing locally with `npm run dev`
3. **Alignment/layout changes** → Test with multi-generational genogram
4. **Cloud features** → Always test offline first
5. **AI features** → Have API keys ready before implementing

---

## Communication with Humans

When asking for clarification:
- Show specific file paths and line numbers
- Include code snippets of what you found
- Ask about "psychology/therapy impact" not just technical details
- Remember this is for clinical use - errors have real consequences

---

## Success Metrics

Your changes succeed if:
- ✅ Genogram still renders without errors
- ✅ Can still create/edit/save persons & relations
- ✅ Alignment system still positions nodes correctly
- ✅ Offline mode still works (test with Network offline)
- ✅ No console errors
- ✅ New feature is documented in `GENOPRO_COMPARISON.md` roadmap

---

## External Documentation

- ReactFlow: https://reactflow.dev/
- Zustand: https://github.com/pmndrs/zustand
- Firebase: https://firebase.google.com/docs
- Dagre (layout): https://dagrejs.github.io/
- Tailwind: https://tailwindcss.com/

---

## Version Info

- React: 19.2
- TypeScript: ~5.9
- Vite: 7.2
- Firebase: 12.6
- Node: 18+ recommended

---

**Last Updated**: December 2025
**Document Purpose**: Onboard AI agents to reduce learning curve and prevent high-cost mistakes
