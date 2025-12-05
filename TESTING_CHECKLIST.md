# Quick Test Checklist for IndexedDB Migration

## 🚀 After Deploying Changes

Run through these tests to verify everything works:

### ✅ Test 1: Create & Persist Data (5 min)

```
1. Open app
2. Click "New Genogram" 
3. Add title: "Test Family"
4. Add 3 family members:
   - John (Male, Living)
   - Jane (Female, Living)
   - Bob (Male, Deceased)
5. Create relationships (parent-child, partners)
6. Click Save
7. Press F5 (or Cmd+R on Mac) to REFRESH
8. ✅ VERIFY: All members still there, no data loss
```

### ✅ Test 2: Multiple Genograms (3 min)

```
1. Create 3 different genograms:
   - "Smith Family"
   - "Johnson Family"
   - "Williams Family"
2. Each with 5+ members
3. Go to Dashboard
4. ✅ VERIFY: All 3 genograms visible
5. Click on each one
6. ✅ VERIFY: Correct members load
```

### ✅ Test 3: Offline Mode (5 min)

```
1. Create a genogram with members
2. Press F12 → Network tab
3. Disconnect (set to "Offline")
4. App still shows all data
5. Try adding a new member
6. ✅ VERIFY: Works offline
7. Refresh page (F5)
8. ✅ VERIFY: Data still loads offline
9. Go back Online
10. ✅ VERIFY: Data remains safe
```

### ✅ Test 4: Offline Indicator (1 min)

```
1. Go offline in DevTools
2. ✅ VERIFY: Banner shows "You're Offline"
3. ✅ VERIFY: Reassuring message about local storage
4. Go back online
5. ✅ VERIFY: Success message appears
```

### ✅ Test 5: Browser Storage (3 min)

```
1. Press F12 → Application tab
2. Expand "IndexedDB" in left sidebar
3. Click "psychogenealogy-local"
4. Expand "genograms" object store
5. ✅ VERIFY: Your created genograms appear as entries
6. Click on one entry
7. ✅ VERIFY: See your genogram JSON with all members
```

### ✅ Test 6: Complete App Closure (5 min)

```
1. Create a new genogram with members
2. Save it
3. Completely close browser (not just tab)
4. Reopen browser
5. Navigate back to app
6. Go to Dashboard
7. ✅ VERIFY: Genogram still exists
8. Open it
9. ✅ VERIFY: All members intact, zero data loss
```

### ✅ Test 7: Delete Genogram (2 min)

```
1. Open a genogram
2. Find delete button
3. Click delete
4. ✅ VERIFY: Gone from dashboard
5. Refresh page
6. ✅ VERIFY: Still gone (not just UI refresh)
7. No ghosts, no residual data
```

### ✅ Test 8: Heavy Load Test (5 min)

```
1. Create 1 genogram with 50+ members
2. Add complex relationships
3. Add multiple profiles per member
4. Save
5. ✅ VERIFY: All saves instantly (no lag)
6. Refresh
7. ✅ VERIFY: All 50+ members load quickly
8. No performance degradation
```

## 📊 What to Look For

### Good Signs ✅
- Data appears instantly after refresh
- Offline mode works without error messages
- Storage indicator shows usage
- No console errors
- Smooth, responsive UI
- All old genograms are gone (cloud-only now)

### Bad Signs ❌
- Data missing after refresh → IndexedDB not saving
- Offline shows error → Need to handle gracefully
- Console errors about IDB → Check schema
- Slow load times → Check network throttling
- Old Firestore data showing → Need migration

## 🔧 Debugging Commands

Run these in DevTools Console:

```javascript
// Check if IndexedDB is available
console.log('IndexedDB available:', !!window.indexedDB);

// Get all genograms
const db = await indexedDB.databases();
console.log('All DBs:', db);

// Clear IndexedDB if needed (DESTRUCTIVE!)
const req = indexedDB.deleteDatabase('psychogenealogy-local');

// Check storage quota
if (navigator.storage && navigator.storage.estimate) {
  const estimate = await navigator.storage.estimate();
  console.log(`Used: ${estimate.usage} bytes of ${estimate.quota} bytes`);
}

// Get all Zustand store state
import { useGenogramStore } from '@/store/genogramStore';
const store = useGenogramStore.getState();
console.log('Store state:', store);
console.log('All genograms:', store.allGenograms);
```

## 📈 Expected Results

After migration, you should see:

| Metric | Before | After |
|--------|--------|-------|
| First Load | 3-5s | <100ms ⚡ |
| Save Time | 2-3s | Instant ⚡ |
| Offline Access | ❌ No | ✅ Yes |
| Data Size Limit | 1MB (localStorage) | 50MB+ (IndexedDB) |
| Cloud Sync | Required | Not used |
| Privacy | Data in cloud | 100% local ✅ |

## 🎯 Sign-Off Criteria

✅ All 8 tests pass
✅ No console errors
✅ Offline mode works
✅ Data persists perfectly
✅ UI shows offline status
✅ Performance is fast
✅ No data loss scenarios

## 🚀 Deployment Checklist

Before going live:

- [ ] All tests pass locally
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors
- [ ] Offline indicator shows correctly
- [ ] Mobile testing (iOS Safari, Android Chrome)
- [ ] Clear browser cache before testing
- [ ] Test on slow 3G network
- [ ] Document for users about local-only storage

## 📝 User Communication

After deploying, consider letting users know:

> "Your genograms are now stored locally on your device. This means:
> - ✅ Works offline
> - ✅ Fast, instant access
> - ✅ 100% private (no cloud uploads)
> - ✅ Survives page refreshes
> 
> Make sure to regularly backup important genograms!"

---

**Questions during testing?** Check `INDEXEDDB_GUIDE.md` for detailed documentation!
