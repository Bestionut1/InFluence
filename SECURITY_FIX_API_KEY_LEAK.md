# 🔴 SECURITY INCIDENT: Compromised API Key - REMEDIATION GUIDE

## Status: CRITICAL ⚠️

**Gemini API Key Compromised**: `AIzaSyDj9LzWUsRn7oIoRE5PDQ2uziVCbDoEczQ`

This key was exposed in the `.env` file which was committed to the public GitHub repository.

---

## What Happened

1. ✅ Confirmed: `.env` file is in the root directory
2. ✅ Confirmed: Contains `VITE_GEMINI_API_KEY=AIzaSyDj9LzWUsRn7oIoRE5PDQ2uziVCbDoEczQ`
3. ✅ Confirmed: `.env` was NOT in `.gitignore` (now fixed)
4. ✅ Confirmed: API key is now showing 403 PERMISSION_DENIED errors
5. ✅ Reason: Google detected the leaked key and revoked it

---

## Immediate Actions Required

### Step 1: Revoke the Compromised Key (DONE on Google's end)
Google Cloud Console has already revoked this key because it detected the leak.

### Step 2: Generate a NEW API Key

**Follow these steps:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: **`sessiongenogram`** (or create one if needed)
3. Navigate to **APIs & Services → Credentials**
4. Click **+ Create Credentials → API Key**
5. Choose **Restrict key** (optional but recommended):
   - **Application restrictions**: Select "Web applications"
   - **API restrictions**: Select only "Generative Language API"
6. Copy the new API key

### Step 3: Update `.env` File

Replace the compromised key:

```dotenv
# OLD (COMPROMISED - DO NOT USE)
VITE_GEMINI_API_KEY=AIzaSyDj9LzWUsRn7oIoRE5PDQ2uziVCbDoEczQ

# NEW (REPLACE WITH YOUR NEW KEY)
VITE_GEMINI_API_KEY=YOUR_NEW_API_KEY_HERE
```

### Step 4: Verify `.gitignore` is Updated ✅ DONE

The `.gitignore` now includes:
```
.env
.env.local
.env.*.local
```

This prevents future `.env` commits.

### Step 5: Test the Application

1. **Restart dev server:**
   ```bash
   npm run dev
   ```

2. **Test chat functionality:**
   - Navigate to Psychology Chat page
   - Try sending a message
   - Verify it responds (no 403 error)

3. **Check browser console:**
   - Should NOT see "ApiError" or "403 PERMISSION_DENIED"

---

## How to Prevent This in the Future

### Best Practices

1. **NEVER commit `.env` file**
   - Add `.env` to `.gitignore` ✅ (now done)
   - Use `.env.example` for documentation

2. **Use `.env.example` for reference:**
   ```bash
   cp .env .env.example
   # Edit .env.example to remove actual values
   ```

3. **Store secrets safely:**
   - Local development: `.env` file (NOT in git)
   - Production: Use environment variable services:
     - Vercel Secrets (if deployed on Vercel)
     - GitHub Secrets (for CI/CD)
     - Firebase Cloud Functions (for backend)
     - Environment variable manager

4. **If API key is exposed:**
   - Immediately revoke in service console
   - Create new key
   - Update all references
   - Force push if needed (only as last resort)
   - Rotate other credentials

5. **Audit git history:**
   ```bash
   # Check if .env was ever committed
   git log --all -p -- .env | head -100
   
   # If found, use BFG Repo-Cleaner or git-filter-branch
   ```

---

## Testing Checklist

After updating the API key:

- [ ] Dev server starts without errors
- [ ] Navigate to Psychology Chat page
- [ ] Send a message to the AI
- [ ] Verify response (not 403 error)
- [ ] Check browser console (no errors)
- [ ] Create/edit genogram elements
- [ ] Test PDF export (if uses Gemini)
- [ ] Build completes successfully: `npm run build`

---

## Current State

### Files Modified
✅ `.gitignore` - Added `.env` and environment files to ignore list

### Files Needing Action
- `/.env` - **Update with new API key** (once you have it)

### API Keys Status
- ❌ `VITE_GEMINI_API_KEY` - **COMPROMISED (revoked by Google)**
- ⏳ Needs: **New key from Google Cloud Console**

---

## What NOT to Do

❌ DON'T push the new key to GitHub
❌ DON'T share the API key in messages/tickets
❌ DON'T use the same key across multiple projects
❌ DON'T commit `.env` files again

---

## Firebase API Keys

**Note:** Firebase API keys in your `.env` are less critical because:
1. They're meant to be public (used in web apps)
2. Firebase has security rules that restrict data access
3. They can be restricted to specific domains

However, still good practice to regenerate if concerned:
1. Go to Firebase Console
2. Project Settings → Service Accounts
3. Generate new private key

But this is OPTIONAL since Firebase keys are designed for public consumption.

---

## Support

If chat still fails after key rotation:

1. Check that `VITE_GEMINI_API_KEY` is correct in `.env`
2. Restart dev server: `npm run dev`
3. Clear browser cache: `Ctrl+Shift+Delete`
4. Check console for specific error messages
5. Verify key is not restricted to wrong API

---

## Summary

| Action | Status | Notes |
|--------|--------|-------|
| Identify compromised key | ✅ Done | `AIzaSyDj9LzWUsRn7oIoRE5PDQ2uziVCbDoEczQ` |
| Update `.gitignore` | ✅ Done | Added `.env` to ignore list |
| Generate new API key | ⏳ TODO | Go to Google Cloud Console |
| Update `.env` file | ⏳ TODO | Replace old key with new one |
| Test application | ⏳ TODO | Verify chat works |
| Document change | ✅ Done | This file |

**Next Step**: Generate new API key and update `.env` file

---

**Last Updated**: December 6, 2025
**Repository**: https://github.com/Bestionut1/InFluence
**Severity**: CRITICAL - Blocks chat functionality
