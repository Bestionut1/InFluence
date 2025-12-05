# Data Flow Diagnostic Guide

## Issue: Genograms showing 0 members instead of real data

### Changes Made for Debugging

#### 1. **Enhanced Logging in Firestore Service** (`src/services/firestore.ts`)
- `createGenogram()`: Logs when genogram is created with people/relations/profiles counts
- `getUserGenograms()`: Logs all fetched genograms with member counts
- `subscribeToUserGenograms()`: Logs real-time updates with detailed breakdown

#### 2. **Enhanced Logging in useGenograms Hook** (`src/hooks/useGenograms.ts`)
- Logs hook initialization with lifecycle markers (🚀, 📦, 🔌, 📡)
- Logs each state dispatch with genogram counts
- Logs CREATE_OPTIMISTIC with new genogram details

#### 3. **Enhanced Logging in GenogramCard** (`src/components/Dashboard/GenogramCard.tsx`)
- Logs each rendered card with people array details
- Shows sample person name if available

#### 4. **Improved AdminCleanup Debug Display** (`src/pages/AdminCleanup.tsx`)
- Shows member count for each genogram
- Shows relations and profiles counts
- Shows first person's name if available
- Better visual organization of debug data

---

## Testing Steps

### Step 1: Clean Up Existing Test Data
1. Open browser to `http://localhost:5174/admin/cleanup`
2. Check what genograms exist in debug panel
3. Note the member counts - should all be 0 if it's a real bug
4. Confirm and delete all genograms
5. Return to dashboard - should see "No genograms" message

### Step 2: Create New Genogram and Monitor Logs
1. Open DevTools → Console tab
2. Filter for debug logs (search for 🚀, 📝, ✅, 🔄)
3. Go to `/dashboard`
4. Click "+ Nou Genogram"
5. Enter title "Test Genogram" 
6. Watch console logs:
   - 📝 Creating genogram (from Firestore service)
   - ✅ Genogram created successfully (from Firestore service)
   - ➕ CREATE_OPTIMISTIC (from hook)
   - 📡 Real-time subscription callback (from hook)

**Expected Console Output:**
```
📝 Creating genogram: {
  id: "genogram_1733323...",
  title: "Test Genogram",
  people_count: 0,  ← New genograms should have 0 people
  relations_count: 0,
  profiles_count: 0
}
✅ Genogram created successfully in Firestore
➕ CREATE_OPTIMISTIC: { id: "...", title: "Test Genogram", people_count: 0 }
📡 Real-time Firestore update: { count: 1, items: [...] }
```

### Step 3: Open Genogram and Add Members
1. From dashboard, click on the genogram card you just created
2. Opens in Editor at `/editor/{genogramId}`
3. Add at least 2 people:
   - Parent 1 (Male): "John"
   - Parent 2 (Female): "Jane"
4. Save the genogram (Auto-save should trigger every 5 seconds)
5. Watch console for update logs

**Expected Console Output When Saving:**
```
📝 Creating genogram: {
  people_count: 2,  ← Should reflect added members
  people_sample: "John"  ← Should show first person
}
```

### Step 4: Return to Dashboard and Check Display
1. Navigate back to `/dashboard`
2. Check if member count updated from 0 to 2
3. If still showing 0:
   - Check console for all logs (Ctrl+Shift+K)
   - Look for error messages (red text)
   - Check "Network" tab - any failed Firestore calls?

---

## Console Log Markers

| Marker | Meaning | File |
|--------|---------|------|
| 📝 | Creating genogram | `firestore.ts:createGenogram()` |
| ✅ | Genogram created successfully | `firestore.ts:createGenogram()` |
| 📊 | Fetched genograms from Firestore | `firestore.ts:getUserGenograms()` |
| 🔄 | Real-time Firestore update | `firestore.ts:subscribeToUserGenograms()` |
| 🚀 | Hook initializing | `useGenograms.ts:useEffect` |
| 📦 | Initial fetch complete | `useGenograms.ts:initializeData()` |
| 🔌 | Setting up real-time subscription | `useGenograms.ts:useEffect` |
| 📡 | Real-time subscription callback | `useGenograms.ts:callback` |
| 📥 | Hook FETCH_SUCCESS dispatch | `useGenograms.ts:genogramReducer` |
| ➕ | CREATE_OPTIMISTIC dispatch | `useGenograms.ts:genogramReducer` |
| 🎨 | GenogramCard rendered | `GenogramCard.tsx:useEffect` |

---

## Debugging Checklist

- [ ] Can you see genograms in AdminCleanup debug panel?
- [ ] Do member counts show 0 for all genograms?
- [ ] After deletion, is dashboard empty?
- [ ] Can you create new genogram? (Check console for 📝✅ logs)
- [ ] Does new genogram appear on dashboard?
- [ ] Can you open genogram in editor?
- [ ] Does adding members trigger save? (Check console for logs)
- [ ] After return to dashboard, does member count update?
- [ ] Are there any red error logs in console?
- [ ] Does Network tab show successful Firestore writes?

---

## If Member Count Still Shows 0 After Adding Members

The bug is in one of these places:

1. **Data not persisting to Firestore**
   - Check Firestore Console (Firebase Admin)
   - Look at 'genograms' collection
   - View specific genogram document
   - Is 'people' array populated?

2. **Hook not receiving updated data**
   - Look for 📡 Real-time subscription logs
   - Check if people_count in log matches Firestore

3. **Component not reading data correctly**
   - GenogramCard should show `genogram.people?.length || 0`
   - Check console for 🎨 GenogramCard logs
   - Verify people array is in the log

4. **Data structure mismatch**
   - Check if 'people' field name is correct
   - Verify timestamps are Firestore.Timestamp objects

---

## Recovery If Data Gets Lost

All console logs are visible in DevTools. To recover debugging context:
1. Open DevTools (F12)
2. Go to Console tab
3. Search for specific genogram ID
4. Trace the data through each log entry
5. Look for point where data disappeared

This comprehensive logging should make the root cause obvious!
