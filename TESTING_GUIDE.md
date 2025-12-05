# Testing & Verification Guide

## Changes Made

### 1. ✅ FIXED: createNewGenogram now localStorage-first
**File:** `src/store/genogramStore.ts` (lines 556-619)

**What changed:**
- BEFORE: Waiting for Firestore to create genogram FIRST, then save to localStorage. If Firebase fails → genogram creation fails.
- AFTER: Creates instantly in localStorage with locally-generated ID, then sends to Firestore in background (non-blocking).

**Code logic:**
```
User clicks "Create Genogram"
    ↓
createNewGenogram('My Family')
    ↓
Generate unique ID locally: genogram_${timestamp}_${random}
    ↓
localStorage.setItem('genogram-ABC123', {...})  ✅ INSTANT
    ↓
set({ currentGenogramId: 'ABC123', ... })  ✅ UI READY
    ↓
navigate('/editor/ABC123')  ✅ INSTANT REDIRECT
    ↓
[Background] Firestore sync starts (5ms later, non-blocking)
```

### 2. ✅ FIXED: useGenograms sorting and timestamps
**File:** `src/hooks/useGenograms.ts` (4 locations)

**Bugs fixed:**
1. **Inverted sort logic**: Was using `(b.updatedAt... || 0)` as aTime and `(a.updatedAt... || 0)` as bTime → reversed order
2. **Wrong timestamps**: Was using `new Date()` (current time) instead of `data.lastUpdated` from localStorage → all genograms appeared "just now"

**Fixed:**
- Sort now correctly uses `a.updatedAt` for a and `b.updatedAt` for b
- `updatedAt` now created from actual `data.lastUpdated` timestamp: `new Date(data.lastUpdated || Date.now())`

---

## Testing Checklist

### Test 1: Create Genogram (localStorage-first)
```
1. Go to http://localhost:5174/dashboard
2. Click "+ New Genogram"
3. Enter title: "Test Family"
4. Click "Create Genogram"
5. ✅ EXPECTED: Instantly redirects to /editor/ABC123 (NO delays)
6. ✅ VERIFY in DevTools localStorage:
   - Key: genogram-genogram_[timestamp]_[random]
   - Contains: title, people: [], relations: [], profiles: []
```

### Test 2: Add People (auto-saves to localStorage)
```
1. From /editor/ABC123:
2. Click "+ Add Person"
3. Fill: Name="John", Gender="Male"
4. Click "Add Person"
5. ✅ Person appears on canvas
6. ✅ VERIFY in DevTools localStorage:
   - Key: genogram-ABC123
   - Contains: people: [{id, name: "John", ...}]
   - Check: lastUpdated timestamp is NEWER than created
```

### Test 3: Refresh Persists Data
```
1. From /editor/ABC123 with John added
2. Press F5 (refresh page)
3. ✅ EXPECTED: John still visible (NO empty state flash)
4. ✅ VERIFY in DevTools console:
   - Should see: "✅ SYNC: Restored from localStorage (1 people)"
```

### Test 4: Dashboard Shows Correct Data
```
1. From /editor/ABC123 with 3-4 people added
2. Click "Dashboard" header button
3. ✅ EXPECTED: Genogram card shows "Test Family" with "4 members"
4. ✅ VERIFY card displays actual people count, not 0
5. Click genogram card
6. ✅ EXPECTED: Redirects to /editor/ABC123
7. ✅ EXPECTED: All 4 people load instantly (no delays)
```

### Test 5: Offline Mode (localStorage only)
```
1. Go to DevTools → Network tab
2. Click "Offline" checkbox
3. Navigate to http://localhost:5174/dashboard
4. ✅ EXPECTED: Existing genograms visible (from localStorage)
5. Click "+ New Genogram"
6. Enter title: "Offline Test"
7. Click "Create Genogram"
8. ✅ EXPECTED: Creates successfully (offline, no Firebase needed)
9. Add 3 people
10. Press F5 (refresh)
11. ✅ EXPECTED: All data persists (NO network required)
12. Go back online (uncheck Offline)
13. ✅ EXPECTED: Genograms sync to Firestore in background
```

### Test 6: Complete User Journey
```
Step 1: Start from Dashboard
  ✅ Dashboard loads with existing genograms
  
Step 2: Create new
  ✅ Click "+ New Genogram"
  ✅ Modal opens
  ✅ Enter "Smith Family"
  ✅ Click "Create"
  ✅ Redirects INSTANTLY to /editor/ABC123
  
Step 3: Add people
  ✅ Click "+ Add Person"
  ✅ Add "Sarah" (Female, Age 45)
  ✅ Add "John" (Male, Age 47)
  ✅ Add "Emma" (Female, Age 18)
  
Step 4: Add relationship
  ✅ Click "Link Relations"
  ✅ Select Sarah → John
  ✅ Choose "Partner"
  ✅ Emma shows as child
  
Step 5: Refresh
  ✅ Press F5
  ✅ Page reloads
  ✅ All 3 people visible INSTANTLY
  ✅ Relationships intact
  
Step 6: Go to Dashboard
  ✅ Click "Dashboard"
  ✅ "Smith Family" card shows "3 members"
  
Step 7: Return to Editor
  ✅ Click on "Smith Family" card
  ✅ Data loads INSTANTLY
  ✅ All people and relationships visible
  
Step 8: Edit and re-refresh
  ✅ Add "Michael" (Male)
  ✅ Press F5
  ✅ Michael visible, "Smith Family" now shows "4 members"
```

---

## Troubleshooting

### Issue: "Cannot create new genogram"
**Check:**
1. Open DevTools → Console
2. Should see: `📝 Creating new genogram: [title]`
3. If not appearing, form submission is broken
4. Check browser console for JavaScript errors

**Solution:**
```
1. Clear browser cache (Ctrl+Shift+Delete)
2. Clear localStorage (DevTools → Application → localStorage → Clear All)
3. F5 refresh
4. Try creating again
```

### Issue: "Created genogram but doesn't appear in Dashboard"
**Check:**
1. DevTools → Application → localStorage
2. Look for key starting with `genogram-genogram_`
3. If key exists but Dashboard empty:
   - Problem is in useGenograms.ts refresh()
   - Check sort logic is correct
   - Check timestamps are using data.lastUpdated

### Issue: "Dashboard shows wrong people count"
**Check:**
1. DevTools → Application → localStorage
2. Open genogram-ABC123 key
3. Verify `people` array length matches displayed count
4. If mismatch: saveCurrentGenogram() not being called

### Issue: "Refreshing page clears data"
**Check:**
1. Verify onRehydrateStorage is REMOVED from genogramStore.ts
2. Verify loadGenogram() uses SYNC restore (not async)
3. Check localStorage key exists and has lastUpdated

---

## Development Console Commands

To help with testing, use these in browser console:

```javascript
// Check all genograms in localStorage
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key?.startsWith('genogram-')) {
    const data = JSON.parse(localStorage.getItem(key));
    console.log(`${key}:`, data);
  }
}

// Check specific genogram
const data = JSON.parse(localStorage.getItem('genogram-ABC123'));
console.log('Genogram data:', data);
console.log('People:', data.people.length);
console.log('Last updated:', new Date(data.lastUpdated));

// Force refresh Dashboard genograms
// (from Dashboard page)
const { refresh } = useGenograms();
refresh();
```

---

## Expected Console Logs (If working correctly)

When **creating genogram:**
```
📝 Creating new genogram: My Family
✅ SYNC: Created genogram in localStorage: My Family
```

When **refreshing page:**
```
✅ SYNC: Restored from localStorage (3 people)
```

When **Dashboard loads:**
```
✅ Loaded 2 genograms from localStorage
```

When **adding person:**
```
Saved to localStorage: My Family
```

---

## Build Status
✅ Build successful (20.61s, 0 errors)
✅ App running at http://localhost:5174
✅ All changes compiled correctly

---

## Next Steps if Issues

If you encounter any problems during testing:

1. **Take a screenshot of the error**
2. **Check browser console** (DevTools F12 → Console tab)
3. **Check localStorage** (DevTools F12 → Application → localStorage)
4. **Report the exact steps** that caused the problem
5. **I'll debug and provide targeted fixes**

The app should now:
- ✅ Create genograms INSTANTLY (no waiting)
- ✅ Save data INSTANTLY (no delays)
- ✅ Persist on refresh (F5)
- ✅ Work offline (no Firestore required)
- ✅ Show correct data in Dashboard
- ✅ Load instantly when returning to genogram
