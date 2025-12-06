# ✅ STEP-BY-STEP SOLUTION: API Key Replacement

## The Problem You're Facing

```
Error in Chat: "Your API key was reported as leaked. Please use another API key."
Status: 🔴 Chat is completely broken
Root Cause: Gemini API key is revoked
Solution: Get a new key and update `.env` file
```

---

## ⏱️ Time Required: ~5-10 minutes

---

## 🎯 Step 1: Get New API Key from Google (2-3 minutes)

### Open Google Cloud Console

Go to this URL:  
**https://console.cloud.google.com/**

### Create New API Key

**Method A: Using Interface**
1. Click on your project dropdown at the top
2. Select or create project: **`sessiongenogram`**
3. Left menu → **`APIs & Services`**
4. Click **`Credentials`** in left menu
5. Click blue **`+ Create Credentials`** button
6. Select **`API Key`**
7. Wait a few seconds
8. A dialog with your new key appears
9. **Copy the entire key** (looks like: `AIzaSy...`)
10. Click `Close` or outside the dialog

### Restrict the Key (Optional but Recommended)

If you want extra security:
1. Find your newly created key in the Credentials list
2. Click on it to edit
3. Under "Application restrictions":
   - Select: `Web applications`
4. Under "API restrictions":
   - Select `Restrict key`
   - Choose: `Generative Language API`
5. Click `Save`

**Result**: You should have your new API key copied (like `AIzaSy...AaBbCc...`)

---

## 🎯 Step 2: Update `.env` File in Your Project (1-2 minutes)

### Open `.env` File

**Location**: Root of your project  
**Path**: `c:\Users\offic\Downloads\pro8iect_noiu_save\jules_session_9921943015422280810\.env`

### Edit the File

**Find this line:**
```dotenv
VITE_GEMINI_API_KEY=AIzaSyDj9LzWUsRn7oIoRE5PDQ2uziVCbDoEczQ
```

**Replace with:**
```dotenv
VITE_GEMINI_API_KEY=YOUR_NEW_KEY_FROM_STEP_1
```

**Example:**
```dotenv
VITE_GEMINI_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567890
```

### Save the File

Press: **`Ctrl+S`** (Windows) or **`Cmd+S`** (Mac)

**Check**:
- File shows as saved (no white dot on tab)
- New key is there (not old one)
- No extra spaces or newlines

---

## 🎯 Step 3: Restart Dev Server (1 minute)

### Stop Current Server

If dev server is running:
1. Go to terminal where `npm run dev` is running
2. Press: **`Ctrl+C`** (stops the server)
3. Wait for it to stop
4. You should see the prompt again

### Start Dev Server Again

Type in terminal:
```bash
npm run dev
```

**Wait for output like:**
```
  VITE v7.2.4  ready in 552 ms

  ✨  Local:   http://localhost:5175/
```

---

## 🎯 Step 4: Test Chat in Browser (1-2 minutes)

### Clear Browser Cache (Recommended)

1. Press: **`Ctrl+Shift+Delete`** (Windows) or **`Cmd+Shift+Delete`** (Mac)
2. Select: **All time**
3. Check: **Cookies and cached images/files**
4. Click: **Clear data**

### Open Application

1. Go to: **http://localhost:5175/**
2. Wait for app to load

### Test Chat Functionality

1. Click: **Psychology Chat** (in menu/navigation)
2. You should see the chat interface
3. Type a test message: **"Hello"**
4. Click: **Send**
5. Wait for AI response

### Verify Success

**✅ SUCCESS** (Expected):
- AI responds with a message
- No error appears
- Chat works normally

**❌ STILL BROKEN** (Unexpected):
- Error appears again: "API key was reported as leaked"
- Check browser console (F12 → Console tab)
- See section "If It Still Doesn't Work" below

---

## 🎯 Step 5: Verify Everything Works (1 minute)

### Test Multiple Features

1. **Chat**: Send and receive messages ✅
2. **Genogram**: Add/edit family members ✅
3. **Relations**: Add relationships ✅
4. **No Errors**: Browser console is clean ✅

### Check Console for Errors

1. Press: **F12** (open Developer Tools)
2. Click: **Console** tab
3. Look for red errors
4. Should be: **No errors** ✅

---

## 🎉 Success! Chat is Now Working

---

## ❌ If It Still Doesn't Work

### Issue 1: Still Getting 403 Error

**Check 1: Is new key in .env?**
```bash
# In terminal, run:
cat .env | grep VITE_GEMINI
```

Should show your NEW key, not the old one.

**Check 2: Did you save .env file?**
- File should show as saved (no white dot in editor)
- No * next to filename

**Check 3: Did you restart dev server?**
- Stop with: `Ctrl+C`
- Start again with: `npm run dev`
- Wait for "ready in XXX ms"

**Check 4: Is key correct?**
- Copy key directly from Google Cloud Console again
- Paste in .env (no extra spaces)
- Make sure it starts with `AIzaSy`

### Issue 2: Dev Server Won't Start

**Error**: Port already in use
**Solution**:
```bash
# Kill any existing node process
taskkill /F /IM node.exe

# Then start again
npm run dev
```

### Issue 3: Application Won't Load

**Solution**:
1. Clear browser cache: `Ctrl+Shift+Delete`
2. Go to: `http://localhost:5175/` (not cached version)
3. Hard reload: `Ctrl+Shift+R` (full reload)

### Issue 4: Still Seeing Old Key in .env

**Solution**:
1. Make sure you're editing the right file: `/.env`
2. Not: `.env.example` or `.env.local`
3. Save and close all editors
4. Open fresh terminal
5. Check: `cat .env | grep VITE_GEMINI`

### Getting Help

If still stuck:
1. Read: **REMEDIATION_CHECKLIST.md**
2. Read: **SECURITY_FIX_API_KEY_LEAK.md**
3. Follow detailed troubleshooting steps

---

## 🔍 Quick Verification Commands

Run these in terminal to verify everything:

```bash
# Check new key is in .env
cat .env | grep VITE_GEMINI

# Check .env file exists and has content
cat .env | head -5

# Check app is running
curl http://localhost:5175/
```

---

## 📋 Checklist - Mark as You Go

- [ ] Read this guide
- [ ] Got new API key from Google Cloud Console
- [ ] Key copied to clipboard
- [ ] Updated `.env` file with new key
- [ ] Saved `.env` file (Ctrl+S)
- [ ] Stopped old dev server (Ctrl+C)
- [ ] Started new dev server (`npm run dev`)
- [ ] Opened app in browser (http://localhost:5175/)
- [ ] Tested chat - sent message
- [ ] Got AI response (no error)
- [ ] ✅ Chat is working!

---

## 📞 Summary Table

| Step | Action | Time |
|------|--------|------|
| 1 | Get new API key | 2-3 min |
| 2 | Update `.env` file | 1-2 min |
| 3 | Restart dev server | 1 min |
| 4 | Test chat in browser | 1-2 min |
| 5 | Verify everything | 1 min |
| **Total** | **Complete fix** | **5-10 min** |

---

## ✨ You're Done!

Chat should now be working. If you have any issues, refer back to the "If It Still Doesn't Work" section or check the other documentation files.

Enjoy using the Psychology Chat! 🎉

---

**Next**: Consider reading `REMEDIATION_CHECKLIST.md` for best practices to prevent this in the future.
