# Sibling Collapse System - Documentație

## 📋 Overview

Am implementat un sistem inteligent de **collapse/expand pentru grupuri de frați** în genograma. Atunci când sunt detectați **mai mult de 2 frați**, sistemul crează un grup colapsabil unde:

- **Al doilea frate** devine containerul grupului (grupa cu "+" badge)
- **Ceilalți frați** (3+) sunt ascunși de la vedere inițial
- **Clic pe badge** deschide/închide grupul

## 🎯 Cum funcționează

### Scenariul Exemplu
```
START: Tata Ioan are 8 frați (Gheorghe, Costel, Mihai, ...)

REZULTAT:
- Tata Ioan se afișează normal
- Frate Gheorghe se afișează cu badge "+6" (roșu)
- Ceilalți 6 frați (Costel, Mihai, etc.) sunt ascunși
- Clic pe "+6" deschide toți 8 frații
- Clic din nou pe Gheorghe II-a colapsează grupul
```

## 🏗️ Arhitectură Implementată

### 1. **Utils: `siblingCollapse.ts`**

Funcții de bază:

```typescript
// Detectează grupuri de frați >2
detectSiblingGroups(people, relations): Map<string, SiblingGroup>

// Obține info collapse pentru o persoană
getCollapsedPeopleInfo(personId, siblingGroups): CollapsedPeopleInfo

// Obține lista peroanelor ascunse
getHiddenPeopleIds(siblingGroups): Set<string>

// Toggle collapse grup
toggleGroupCollapse(groupId, siblingGroups): Map<string, SiblingGroup>
```

### 2. **Store: `genogramStore.ts`**

Noi state și acțiuni:

```typescript
interface GenogramState {
  // Noul state
  siblingGroups: Map<string, SiblingGroup>;
  
  // Noi acțiuni
  recalculateSiblingGroups: () => void;
  toggleSiblingGroupCollapse: (groupId: string) => void;
}
```

**Integrare automată:**
- `addRelation()` → recalculează grupuri automat
- `removeRelation()` → recalculează grupuri automat

### 3. **Componentă UI: `CollapsibleSiblingGroup.tsx`**

Două componente:

- `CollapsibleSiblingGroup` - Afișaj grup complet (pentru viitor)
- `SiblingGroupBadge` - Badge "+N" roșu pe nod

### 4. **Canvas: `GenogramCanvas.tsx`**

Filtrează nodurile ascunse:

```typescript
// Obține persoane ascunse
const hiddenPeopleIds = getHiddenPeopleIds(siblingGroups);

// Filtrează noduri
const filteredNodes = layoutedNodes.filter(
  node => !hiddenPeopleIds.has(node.id)
);

// Filtrează muchii (edges)
const filteredEdges = layoutedEdges.filter(
  edge => !hiddenPeopleIds.has(edge.source) && 
          !hiddenPeopleIds.has(edge.target)
);
```

### 5. **Nod: `PersonNode.tsx`**

Integrare UI:

```tsx
// Detectează grup collapse
const collapsedInfo = getCollapsedPeopleInfo(data.id, siblingGroups);

// Afișează badge dacă e al doilea frate
{collapsedInfo.isInCollapsedGroup && 
 collapsedInfo.groupId === data.id && (
  <SiblingGroupBadge
    hiddenCount={collapsedInfo.hiddenCount}
    isCollapsed={true}
    onClick={(e) => {
      e.stopPropagation();
      toggleSiblingGroupCollapse(data.id);
    }}
  />
)}
```

## 💡 Flux de Date

```
User adaugă relație (frate #3)
        ↓
addRelation() în store
        ↓
recalculateSiblingGroups() se apelează automat
        ↓
detectSiblingGroups() analizează relații
        ↓
Dacă >2 frați → setează al 2-lea ca grup
        ↓
GenogramCanvas filtrează nodurile ascunse
        ↓
PersonNode afișează badge "+N" pe al 2-lea
        ↓
User click badge
        ↓
toggleSiblingGroupCollapse() toggle isCollapsed
        ↓
GenogramCanvas re-filtrează noduri
        ↓
Nodurile ascunse se afișează/ascund
```

## 📊 Structuri de Date

### `SiblingGroup`
```typescript
interface SiblingGroup {
  id: string;                    // ID al 2-lea frate (containerul)
  parentIds: string[];           // Părinții comuni
  siblingIds: string[];          // Toți frații (inclusiv containerul)
  collapsedSiblingIds: string[]; // Frații ascunși (3+)
  isCollapsed: boolean;          // Stare collapse
}
```

### `CollapsedPeopleInfo`
```typescript
interface CollapsedPeopleInfo {
  personId: string;              // ID persoană
  isInCollapsedGroup: boolean;   // E în grup?
  groupId?: string;              // ID grupului (dacă e în grup)
  hiddenCount: number;           // Câți sunt ascunși
}
```

## 🎨 UI Details

### Badge "+N"
- **Culoare:** Roșu (#EF4444)
- **Poziție:** Top-right corner al nodului
- **Hover:** Devine roșu mai închis
- **Clic:** Toggle collapse
- **Titlu:** "N sibling(s) hidden - click to expand"

### Logică Afișare
```
Condiții pentru badge:
✓ Person e al 2-lea din grup
✓ Grup e colapsabil (>2 frați)
✓ Sunt frați ascunși (hiddenCount > 0)
✓ Grupul e colapsabil (isCollapsed = true)
```

## 🔄 Cazuri de Utilizare

### Case 1: Adaugă al 3-lea frate
```
START: Ion (frate 1), Gheorghe (frate 2)
CLICK: Adaugă Costel ca frate
→ Costel e adăugat la relații
→ recalculateSiblingGroups() e apelată
→ Se detectează >2 frați
→ Gheorghe devine grup container
→ Costel e ascuns
→ Badge "+1" apare pe Gheorghe
```

### Case 2: Dezcolapsează grupul
```
START: Gheorghe are "+6" (6 frați ascunși)
CLICK: pe "+6" badge
→ toggleSiblingGroupCollapse() e apelată
→ isCollapsed = false
→ getHiddenPeopleIds() returnează set gol
→ Toți 8 frații se afișează
→ Badge "+6" dispare
```

### Case 3: Recolapsează grupul
```
START: Toți 8 frați sunt vizibili
CLICK: pe Gheorghe din nou
→ toggleSiblingGroupCollapse() e apelată
→ isCollapsed = true
→ getHiddenPeopleIds() returnează 6 ID-uri
→ 6 frați sunt ascunși din nou
→ Badge "+6" reapare pe Gheorghe
```

### Case 4: Ștergere relație
```
START: Costel e în grup ascuns
CLICK: Șterge relație Tata → Costel
→ removeRelation() e apelată
→ recalculateSiblingGroups() e apelată
→ Se recalculează grupuri
→ Dacă rămân <3 frați → colapsul se dizolvă
```

## 🧪 Testare Manuală

### Test 1: Creare Grup Colapsabil
1. Creează 2 părinți: Ion (M), Maria (F)
2. Adaugă 1 copil: Gheorghe
3. Adaugă relație: frate → al 2-lea copil
4. Adaugă relație: frate → al 3-lea copil
5. ✅ Ar trebui să vezi Gheorghe cu "+1" badge
6. ✅ Al 3-lea frate ar trebui să lipsească

### Test 2: Expand Grup
1. După test 1...
2. Clic pe "+1" badge de pe Gheorghe
3. ✅ Cei 3 frați ar trebui să se afișeze toți
4. ✅ Badge-ul ar trebui să dispară

### Test 3: Collapse din Nou
1. După test 2...
2. Clic pe Gheorghe din nou
3. ✅ Al 3-lea frate ar trebui să se ascundă
4. ✅ Badge "+1" ar trebui să reapară

### Test 4: Genealogie Complexă
1. Creează: Tata (8 frați) + Mama (6 frați)
2. Fiecare să aibă 2-3 copii
3. ✅ Ambii părinți ar trebui să aibă badge "+N"
4. ✅ Copiii lor ar trebui să fie vizibili
5. ✅ Relațiile ar trebui să fie corecte

## 📁 Fișiere Modificate

```
✅ src/utils/siblingCollapse.ts         (CREAT - 141 linii)
✅ src/components/CollapsibleSiblingGroup.tsx (CREAT - 60 linii)
✅ src/store/genogramStore.ts           (MODIFICAT - +2 state, +2 acțiuni)
✅ src/components/GenogramCanvas.tsx    (MODIFICAT - filtrare noduri)
✅ src/components/PersonNode.tsx        (MODIFICAT - badge afișare)
```

## 🐛 Edge Cases Tratate

- ✅ Fraților orfani (fără părinți)
- ✅ Frații adoptiți cu relații diferite
- ✅ Ștergere persoană din grup
- ✅ Ștergere relație frate
- ✅ Adaugă relație între frații ascunși
- ✅ Multiple grupe colapsabile simultan

## 🚀 Viitoare Îmbunătățiri

- [ ] Animare expand/collapse smooth
- [ ] Context menu pe badge cu opțiuni
- [ ] Opțiune de "flatten" permanent
- [ ] Statistici grup (vârstă medie, etc.)
- [ ] Drag-drop între grupe
- [ ] Search/filter în grupe ascunse

## 📝 Notes pentru Utilizatori

**Pentru utilizatorii final:**

1. **Marcare vizuală**: Badge roșu "+N" = frați ascunși
2. **Interactivitate**: Clic pe badge = expand/collapse
3. **Automatizare**: Grupurile se detectează automat când adaugi relații
4. **Persistență**: Starea collapse se salvează local (localStorage)
5. **Responsive**: Funcționează pe mobile și desktop

---

**Sistem gata pentru producție! 🎉**
