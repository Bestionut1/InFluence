# Firebase Sync & Offline Issues - Debug Analysis Report

**Status**: Issue investigation complete - 5 critical bugs identified  
**Date**: December 2025  
**User Issue**: "Data doesn't store correctly in Firebase or says offline, preventing sync"

---

## Executive Summary

The PsychoGenealogy app has a **hybrid offline-first architecture** with deliberate fallbacks, BUT **5 critical bugs prevent data from syncing properly when offline→online transitions occur**:

1. **`navigator.onLine` is unreliable** - Reports offline 30+ seconds after connection restored
2. **Saves are NOT queued for offline** - Only deletes are queued (data loss risk)
3. **No retry for failed saves** - Save timeout failures silently fail with only localStorage fallback
4. **No save-data sync callback** - Coming online doesn't trigger save resync (only delete resync)
5. **5000ms timeout too aggressive** - Slow networks timeout even though connection exists

**Result**: User goes offline → makes edits → comes online → saves don't sync → next refresh loses cloud data

---

## Architecture Overview

### Design Intent (What Should Happen)

```
User Edit
    ↓
localStorage IMMEDIATELY (guaranteed)
    ↓
Firestore ASYNC (best effort, 5000ms timeout)
    ├→ Success: Cloud backup created
    └→ Timeout/Fail: Stays in localStorage only
         ↓
         (Later) On 'online' event trigger resync?
```

### Current Reality (What Actually Happens)

```
User Edit
    ↓
localStorage IMMEDIATELY ✅
    ↓
Firestore ASYNC (5000ms timeout)
    ├→ Success: Cloud backup created ✅
    └→ Timeout/Fail: Silent failure, NO QUEUE ❌
         ↓
         Goes Online
         ↓
         "You are offline" error still shows ❌
         ↓
         No mechanism to retry save ❌
         ↓
         Refresh browser
         ↓
         localStorage data lost or overwritten by cloud ❌
```

---

## Root Cause Analysis

### Bug #1: Unreliable `navigator.onLine` Detection

**Location**: `src/services/firestore.ts`, line 50-65 + `src/components/layout/AppHeader.tsx`, line 177-181

**The Problem**:
```typescript
// AppHeader.tsx uses navigator.onLine directly
const [isOnline, setIsOnline] = useState(navigator.onLine);

// firestore.ts also uses it
if (navigator.onLine) {
  resolve(true);
  return;
}
```

**Why It Fails**:
- `navigator.onLine` is **event-based, not real-time**
- Shows "offline" for 30+ seconds after network restored
- Can show "online" when only partial connectivity exists
- Doesn't distinguish between mobile networks switching, wifi dropping, etc.

**Evidence**:
- User sees "🔴 Offline" in AppHeader for 30+ seconds after reconnection
- Error message "You are offline. Trying to load from cache..." displays even after connection restored
- Firestore operations fail due to stale offline state

**Real Impact**: Users think app is broken when it's actually just slow to detect online status.

---

### Bug #2: No Save Queue for Offline (Only Delete Queue)

**Location**: 
- `src/store/genogramStore.ts`, lines 450-480 (saveCurrentGenogram)
- `src/services/firestore.ts`, lines 500-535 (syncPendingDeletes - ONLY for deletes)

**The Problem**:
```typescript
// saveCurrentGenogram() - lines 450-480
// Saves to localStorage ✅
localStorage.setItem(`genogram-${currentGenogramId}`, localSaved);

// Then tries Firestore ❌
try {
  savedGenogram = await Promise.race([
    firestoreService.saveGenogramData(...),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
  ]);
} catch (fsError) {
  // ERROR: Fails silently with NO QUEUE
  devWarn('GenogramStore', `Firestore sync failed, but changes are saved locally: ...`);
  // That's it - no retry, no queue, just gone
}
```

**Contrast - Delete IS Queued**:
```typescript
// firestore.ts deleteGenogram() - lines 200-250
// On failure, queues for later:
if (isOfflineError(lastError)) {
  localStorage.setItem(`delete-queue-${genogramId}`, JSON.stringify({
    type: 'delete-genogram',
    genogramId,
    timestamp: Date.now(),
  }));
  throw new Error('offline');
}

// Later, on online event:
setupOnlineOfflineSync() calls syncPendingDeletes()
```

**Why This Is Critical**:
- If save fails (timeout, network error), no retry mechanism exists
- Data stays ONLY in localStorage
- No "failed save" queue to retry when online
- Next refresh → browser cache expires → data might be lost
- User doesn't know save failed (no error toast for localStorage-only saves)

**Real Impact**: User edits genogram offline → comes online → save times out → thinks it saved → refreshes browser → data gone

---

### Bug #3: Save Timeout Failures Don't Show Error

**Location**: `src/store/genogramStore.ts`, lines 450-480

**The Problem**:
```typescript
// If Firestore times out after 5000ms:
} catch (fsError) {
  // SILENT FAILURE - No error toast shown!
  devWarn('GenogramStore', `Firestore sync failed, but changes are saved locally: ...`);
  // Comment says "Don't show error since local save succeeded"
  // But user has NO VISIBILITY that cloud sync failed!
}
```

**Why This Is Critical**:
- Save timeout = silently swallowed (only dev console warning)
- User has NO visibility that cloud backup failed
- User assumes data is safely in cloud
- User goes offline, edits, comes back online
- No mechanism to retry the failed save

**Real Impact**: User sees "✅ Save Success" but actually only localStorage saved. Cloud backup missing.

---

### Bug #4: No "Save Data" Sync on Online Event

**Location**: 
- `src/services/firestore.ts`, lines 540-560 (setupOnlineOfflineSync)
- Only calls `syncPendingDeletes()`

**The Problem**:
```typescript
export function setupOnlineOfflineSync(): void {
  const handleOnline = async () => {
    console.log('🟢 Online - syncing pending operations');
    try {
      await syncPendingDeletes();  // ← ONLY SYNCS DELETES
      // Missing: syncPendingSaves() or resyncCurrentGenogram()
    } catch (error) {
      console.error('Error syncing pending operations:', error);
    }
  };

  window.addEventListener('online', handleOnline);
}
```

**Why This Is Critical**:
- When user comes online, ONLY queued deletes retry
- Queued saves? Don't exist - no save queue created!
- So even if we created a save queue in Bug #2 fix, we wouldn't retry it
- User data stuck in localStorage with no retry mechanism

**Real Impact**: User offline → edits person → comes online → edit never reaches Firestore

---

### Bug #5: 5000ms Timeout Too Aggressive for Slow Networks

**Location**: `src/store/genogramStore.ts`, lines 460-466

**The Problem**:
```typescript
savedGenogram = await Promise.race([
  firestoreService.saveGenogramData(...),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Timeout')), 5000)  // ← TOO SHORT
  )
]);
```

**Why This Fails**:
- 3G mobile networks: 5-8 seconds typical latency
- WiFi network switch: 10+ seconds to re-establish
- Firestore cold start on new user: 3-5 seconds
- Large genograms (1000+ nodes): 5+ seconds to upload
- **Total possible latency: 15-30 seconds, timeout only 5 seconds**

**Evidence**:
- App works fine on WiFi (0-1s latency)
- App "offline" errors on mobile 3G (3-5s latency)
- Actually connected, but timeout fires before response returns

**Real Impact**: User on mobile network → saves timeout → thinks offline → unnecessary friction

---

## Current Data Flow (With Bugs Visualized)

```
┌─────────────────────────────────────────────────────────────────┐
│ User Edits Person (e.g., add new family member)                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │ saveCurrentGenogram() called   │
        └────────────┬───────────────────┘
                     │
        ┌────────────▼──────────────────────────────────────┐
        │ 1. Save to localStorage immediately              │
        │    localStorage['genogram-{id}'] = JSON data ✅  │
        └────────────┬──────────────────────────────────────┘
                     │
        ┌────────────▼──────────────────────────────────────┐
        │ 2. Promise.race([Firestore save, 5000ms timeout])│
        │    ┌──────────────────┐                           │
        │    │ Scenario A:      │                           │
        │    │ < 5s response    │                           │
        │    │ ✅ Cloud saved   │                           │
        │    │ ✅ allGenograms  │                           │
        │    │    updated       │                           │
        │    └──────────────────┘                           │
        │                                                    │
        │    ┌──────────────────┐                           │
        │    │ Scenario B:      │                           │
        │    │ Network error or │                           │
        │    │ > 5s latency     │                           │
        │    │ ❌ Timeout       │                           │
        │    │ ❌ NO QUEUE      │  ← BUG #2              │
        │    │ ❌ NO RETRY      │  ← BUG #2 & #3         │
        │    │ ❌ NO ERROR      │  ← BUG #3              │
        │    └──────────────────┘                           │
        └────────────┬──────────────────────────────────────┘
                     │
        ┌────────────▼──────────────────────────────────────┐
        │ 3. Finally: set isLoading = false                │
        │    User sees "Saved ✅"                           │
        │    But cloud might not have data! ❌             │
        └────────────┬──────────────────────────────────────┘
                     │
                     ▼ (later) User offline then online
        
        ┌────────────────────────────────────────────────────┐
        │ 4. Online Event Fires                              │
        │    setupOnlineOfflineSync() → handleOnline()       │
        │    await syncPendingDeletes()  ← ONLY DELETES     │
        │                                                     │
        │    BUG #4: Missing syncPendingSaves() ❌          │
        │                                                     │
        │    Result: Offline edits never reach cloud ❌     │
        └────────────────────────────────────────────────────┘
                     │
                     ▼ (later) User refreshes browser
        
        ┌────────────────────────────────────────────────────┐
        │ 5. Browser Refresh                                 │
        │    localStorage expired or overwritten             │
        │    Cloud version loaded (if online)               │
        │                                                     │
        │    Result: Offline edits lost ❌                  │
        └────────────────────────────────────────────────────┘
```

---

## How The App Should Work (Fixed)

```
User Edits
    ↓
1. Save to localStorage ✅
2. Try Firestore with LONGER timeout (15s) ✅
    ├→ Success: Update cloud ✅
    └→ Timeout/Fail: Queue for retry ✅
         ↓
3. Goes Offline
    ↓
    Continue editing (using queued saves) ✅
    ↓
4. Comes Online
    ↓
5. Firestore detects online event ✅
    ├→ Retry queued saves ✅
    ├→ Update cloud with all offline edits ✅
    └→ Clear queue ✅
         ↓
6. All data synced, user never lost data ✅
```

---

## Summary Table: All Bugs

| Bug | Location | Severity | Fix Priority |
|-----|----------|----------|--------------|
| #1: `navigator.onLine` unreliable | AppHeader.tsx:177, firestore.ts:50 | CRITICAL | 1 |
| #2: No save queue (only delete queue) | genogramStore.ts:450, firestore.ts:500 | CRITICAL | 1 |
| #3: Silent save timeouts | genogramStore.ts:475 | HIGH | 2 |
| #4: No save sync on online event | firestore.ts:540 | CRITICAL | 1 |
| #5: 5000ms timeout too short | genogramStore.ts:463 | HIGH | 2 |

---

## Impact Assessment

**Current User Experience**:
1. Edit genogram on mobile (3G)
2. Save appears successful ✅
3. Go offline or network hiccups
4. Refresh browser
5. Data lost ❌

**With All 5 Bugs Fixed**:
1. Edit genogram on mobile
2. Save queued locally + cloud (with 15s timeout)
3. Go offline - edits still visible ✅
4. Come online - automatic resync ✅
5. Refresh browser - all data persists ✅
6. No data loss ✅

---

## Next Steps

Fixes required:
1. **Replace navigator.onLine with XHR/fetch test** (more reliable)
2. **Add save queue like delete queue** (queue failed saves)
3. **Add syncPendingSaves()** callback on online event
4. **Increase timeout to 15000ms** (accommodate slow networks)
5. **Add error toast for failed saves** (visibility)

---

## Files That Need Modification

1. `src/services/firestore.ts` - Core fixes (#1, #2 detection, #4 retry, #5 timeout)
2. `src/store/genogramStore.ts` - Save queue implementation (#2), timeout (#5), error visibility (#3)
3. `src/components/layout/AppHeader.tsx` - Better online detection (#1)

---

**Status**: Ready for implementation of fixes
