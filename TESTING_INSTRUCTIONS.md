# Fix Verification & Testing Instructions

## Critical Bug Fixed: Data Loss on Page Refresh

**Status:** ✅ FIXED in Editor.tsx

### The Issue
When users refreshed the page while viewing a genogram, all data would disappear even though it was saved to IndexedDB. The genogram would load but show empty state.

### Root Cause
The Editor component had a condition that prevented loading genograms on page refresh:
```typescript
// BEFORE (BUGGY)
else if (id && id !== currentGenogramId) {
  await loadGenogram(id);
}
```

Since Zustand's persist middleware saves `currentGenogramId` to localStorage, on page refresh the persisted `currentGenogramId` would equal the URL `id`, making the condition FALSE, preventing load.

### The Fix
```typescript
// AFTER (FIXED)
else if (id) {
  await loadGenogram(id);
}
```

Always load when ID is present. The `loadGenogram()` function has built-in optimization to skip reloading if already in memory.

---

## Manual Testing Instructions

### Test 1: Create & Refresh (Basic)
**Time:** 2 minutes
```
SETUP:
- Open browser to http://localhost:5173
- Go to Dashboard

TEST:
1. Click "+ New Genogram"
2. Enter title: "Test Family Tree"
3. Click "Create Genogram"
4. → Navigate to editor
5. Click "+ Add Person"
6. Fill: Name="John", Gender="Male", Age="45"
7. Click "Add Person"
8. → Person appears on canvas ✓
9. Press Ctrl+F5 (hard refresh)
10. → WAIT for page to reload (5-10 seconds)

VERIFY:
- [ ] Title "Test Family Tree" is visible
- [ ] Person "John" is on canvas
- [ ] No errors in console
- [ ] Console shows: "[Editor] 📖 Loading genogram from URL"
- [ ] Console shows: "[GenogramStore] ✅ Loaded genogram from IndexedDB"

RESULT: ✅ PASS if all items checked
```

### Test 2: Multiple People & Relationships
**Time:** 3 minutes
```
SETUP:
- Continue from Test 1 (after refresh)

TEST:
1. Click "+ Add Person"
2. Add: Name="Mary", Gender="Female", Age="43"
3. Click "+ Add Person"
4. Add: Name="Anna", Gender="Female", Age="18"
5. Click "+ Add Person"
6. Add: Name="Bob", Gender="Male", Age="15"
7. Click "Link Relations"
8. Source: John, Target: Mary, Type: "partner"
9. Click "Link"
10. Link John → Anna as "parent"
11. Link John → Bob as "parent"
12. Link Mary → Anna as "parent"
13. Link Mary → Bob as "parent"
14. → Family tree structure visible ✓
15. Press F5 (regular refresh)
16. → WAIT for page to reload

VERIFY:
- [ ] All 4 people visible on canvas
- [ ] All relationships intact (line connections)
- [ ] Family layout/positioning correct
- [ ] Title "Test Family Tree" present
- [ ] No console errors

RESULT: ✅ PASS if all items checked
```

### Test 3: Offline Data Persistence
**Time:** 2 minutes
```
SETUP:
- Continue from Test 2

TEST:
1. Open DevTools (F12)
2. Go to Application tab
3. Click IndexedDB > psychogenealogy-local > genograms
4. Click on your test genogram entry
5. → Should see detailed JSON with all people/relations/profiles
6. Close DevTools
7. Press Ctrl+Shift+Delete (clear cache/cookies)
   - ✓ Uncheck: Cookies and Site Data
   - ✓ Check: Cached Images and Files
   - Click Clear Now
8. → Page auto-reloads
9. → Wait 5 seconds

VERIFY:
- [ ] Data still appears on canvas
- [ ] All 4 people still visible
- [ ] No error messages
- [ ] Relationships still intact

RESULT: ✅ PASS (proves IndexedDB is working)
```

### Test 4: Navigate Between Genograms
**Time:** 3 minutes
```
SETUP:
- Have Test 1 family tree loaded
- Create a second test genogram

TEST:
1. Create new genogram titled "Other Family"
2. Add person "David", Gender="Male", Age="50"
3. → "David" appears on canvas
4. Press F5 (refresh)
5. → "David" still visible ✓
6. Go to Dashboard (click logo or use back)
7. → See both genograms listed
8. Click on first genogram ("Test Family Tree")
9. → Navigate to first genogram
10. → Wait for load
11. → "John", "Mary", "Anna", "Bob" appear ✓
12. Click on second genogram ("Other Family")
13. → "David" appears ✓

VERIFY:
- [ ] Both genograms load correctly
- [ ] Data switches when navigating
- [ ] No data mixing/leakage
- [ ] Console shows correct loading
- [ ] No errors on navigation

RESULT: ✅ PASS if all items checked
```

### Test 5: Performance Check
**Time:** 2 minutes
```
SETUP:
- Have Test 1 family tree loaded

TEST:
1. Open DevTools → Performance tab
2. Click Record button
3. Press F5 (refresh)
4. Wait for page to fully load
5. Click Stop recording
6. → Performance timeline appears
7. Look for timeline markers:
   - Network request: <1s
   - IndexedDB read: <100ms
   - State update: <50ms
   - Render: <200ms
   - Total load time: <2s

VERIFY:
- [ ] Page loads within 2-3 seconds
- [ ] No long running tasks (>50ms)
- [ ] No jank/frame drops
- [ ] Memory usage stable

RESULT: ✅ PASS if load time < 3s
```

---

## Automated Test Commands

```bash
# Install dependencies
npm install

# Run build to check for TypeScript errors
npm run build

# Run dev server
npm run dev

# Run any existing tests (if configured)
npm test
```

---

## Before/After Comparison

### BEFORE (BUGGY)
```
User refreshes page:
  URL: /editor/genogram_123
  ↓
  Persist loads: currentGenogramId = "genogram_123"
  ↓
  useEffect checks: id ("genogram_123") !== currentGenogramId ("genogram_123")? 
  ↓
  FALSE - DOESN'T LOAD
  ↓
  people = [] (empty)
  ↓
  Canvas shows: BLANK PAGE ❌
```

### AFTER (FIXED)
```
User refreshes page:
  URL: /editor/genogram_123
  ↓
  Persist loads: currentGenogramId = "genogram_123"
  ↓
  useEffect checks: if id? YES
  ↓
  Calls loadGenogram("genogram_123")
  ↓
  loadGenogram fetches from IndexedDB
  ↓
  people = [{ name: "John", ... }]
  ↓
  Canvas shows: JOHN ON CANVAS ✅
```

---

## Expected Console Output

### On Page Refresh (After Fix):
```
[Editor] 🔧 useEffect triggered with URL id: genogram_1764879974172_kqrsxa6fr stored currentGenogramId: genogram_1764879974172_kqrsxa6fr
[Editor] 📖 Loading genogram from URL: genogram_1764879974172_kqrsxa6fr
[GenogramStore] ✅ Loaded genogram from IndexedDB: Test Family Tree (4 members)
[Editor] ✅ Genogram loaded
```

### Expected Network Activity:
- No network requests for genogram data (all from IndexedDB)
- Only API calls for AI features (if used)
- File requests: CSS, JS, Images

---

## Troubleshooting

### Issue: "Genogram not found locally"
**Cause:** IndexedDB corrupt or data not saved
**Fix:** 
```
1. Open DevTools → Application → Storage
2. Clear IndexedDB for psychogenealogy-local
3. Clear localStorage
4. Reload page
5. Create new genogram (fresh start)
```

### Issue: Data disappears on refresh (STILL BROKEN)
**Cause:** Fix not applied correctly
**Check:**
```
1. Open DevTools → Console
2. Refresh page
3. Should see: "[Editor] 🔧 useEffect triggered"
4. If not, Editor.tsx not loaded correctly
5. Check: Line 52 should have: else if (id) {
6. NOT: else if (id && id !== currentGenogramId) {
```

### Issue: Infinite loading or reloading
**Cause:** Dependency array issue
**Check:**
```
1. useEffect dependency array should be: [id]
2. Should NOT include: currentGenogramId, people, relations, loadGenogram
3. These would cause infinite loops
```

---

## Success Criteria

✅ **FIX IS SUCCESSFUL IF:**
1. Data persists after page refresh
2. Hard refresh (Ctrl+F5) loads data from IndexedDB
3. Multiple people & relationships maintained
4. No console errors
5. Performance acceptable (<3s load time)
6. No data mixing between genograms
7. Offline access works

❌ **FIX FAILED IF:**
- Data still disappears on refresh
- Console shows errors
- Can't navigate between genograms
- Performance degraded significantly

---

## Deployment Checklist

- [x] Fix applied to Editor.tsx
- [x] Debugging logs added
- [x] No breaking changes
- [x] Backward compatible
- [x] Documentation created (this file)
- [x] Code reviewed
- [ ] Manual testing completed
- [ ] User testing scheduled
- [ ] Release notes updated
- [ ] Monitoring set up

---

## Next Steps (After Testing)

1. **If PASS:** Deploy to production
   - Announce fix to users
   - Monitor error logs for issues
   - Gather user feedback

2. **If FAIL:** Investigate
   - Check browser console for errors
   - Verify IndexedDB is working
   - Check network tab for failed requests
   - Review DataStore state

---

## Files Changed

- **src/pages/Editor.tsx** (lines 52-76)
  - Removed condition `id !== currentGenogramId`
  - Added debug logging
  - Simplified to always call `loadGenogram(id)` when present
  - Added comments explaining the fix

---

**Created:** December 2024
**Fix Status:** Ready for Testing
**Priority:** CRITICAL (Data Loss Bug)
**Estimated Fix Time:** 2-3 minutes per test case
