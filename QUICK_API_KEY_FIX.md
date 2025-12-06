# 🚀 QUICK FIX: API Key Leak - 5 Minute Solution

## Problem
```
Chat error: ApiError: {"error":{"code":403,"message":"Your API key was reported as leaked..."}}
```

## Root Cause
Gemini API key was exposed in public GitHub repository and Google revoked it.

---

## Quick Fix (5 Minutes)

### 1️⃣ Get New API Key (2 min)
Go to: https://console.cloud.google.com/

- Select project
- APIs & Services → Credentials
- Click "+ Create Credentials" → API Key
- Copy the new key

### 2️⃣ Update .env (1 min)
Edit `.env` file in project root:

```dotenv
VITE_GEMINI_API_KEY=PASTE_YOUR_NEW_KEY_HERE
```

### 3️⃣ Restart Dev Server (1 min)
```bash
npm run dev
```

### 4️⃣ Test Chat (1 min)
Go to Psychology Chat page, send a message.
Should work now! ✅

---

## What Changed in Code

✅ Updated `.gitignore` to prevent future key leaks:
```
.env            ← Now protected
.env.local
.env.*.local
```

✅ Created `.env.example` as template for team

---

## Key Files
- 📄 `.env` - **Update with new key**
- 📄 `.gitignore` - **Already fixed ✅**
- 📄 `.env.example` - **Template for reference**
- 📄 `SECURITY_FIX_API_KEY_LEAK.md` - **Full details**

---

That's it! Chat should work after replacing the key.

**Do NOT commit .env file!**
