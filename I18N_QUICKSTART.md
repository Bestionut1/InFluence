# I18N System - Quick Start Guide

## 🌍 What's New?

Your PsychoGenealogy app now supports multiple languages! Currently:
- 🇬🇧 English
- 🇷🇴 Romanian (Română)

---

## 🎯 Features

✅ **Language Switcher** - Top-right globe icon in app header
✅ **Persistent Preference** - Your language choice is saved
✅ **Automatic Translations** - All major UI elements translated
✅ **Type-Safe** - Full TypeScript support
✅ **Easy to Extend** - Add new languages/translations quickly

---

## 🚀 How to Use

### 1. Switch Language in App

Click the **language switcher** (globe icon) in:
- App header (right side, next to username)
- Landing page (top-right corner)
- User profile page (Language section)

### 2. Change Language in Code

```typescript
import { useLanguage } from '../hooks/useTranslation';

const { language, setLanguage } = useLanguage();

// Switch to Romanian
setLanguage('ro');

// Switch to English
setLanguage('en');
```

### 3. Use Translations in Components

```typescript
import { useTranslation } from '../hooks/useTranslation';

export const MyComponent = () => {
  const t = useTranslation();
  
  return (
    <div>
      <h1>{t.dashboard.title}</h1>
      <button>{t.common.save}</button>
      <p>{t.errors.required}</p>
    </div>
  );
};
```

---

## 📁 File Structure

```
src/
├── i18n/
│   ├── en.ts                    # English translations
│   ├── ro.ts                    # Romanian translations
│   └── index.ts                 # Export types & utilities
├── store/
│   └── languageStore.ts         # Language state (Zustand)
├── hooks/
│   └── useTranslation.ts        # Translation hooks
└── components/
    └── LanguageSwitcher.tsx     # Language selector UI
```

---

## ➕ Adding a New Language

### Step 1: Create translation file
Create `src/i18n/xx.ts` (replace `xx` with language code)

```typescript
export const xx = {
  nav: { /* ... */ },
  common: { /* ... */ },
  // ... copy structure from en.ts and translate
};
```

### Step 2: Add to language index
Edit `src/i18n/index.ts`:

```typescript
import { xx } from './xx';

export const translations: Record<Language, TranslationKeys> = {
  en,
  ro,
  xx,  // Add here
};

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română' },
  { code: 'xx', name: 'Language Name', nativeName: 'Native Name' },  // Add here
];
```

### Step 3: Update type
```typescript
export type Language = 'en' | 'ro' | 'xx';  // Add 'xx'
```

---

## 🔍 Translation Keys

### Common Structure
```
editor.addPerson         // Button to add a person
editor.name              // Label for name field
common.save              // Universal save button
dashboard.myGenograms    // Dashboard title
errors.required          // Error message
```

### Key Groups
- `nav.*` - Navigation
- `common.*` - Reusable UI
- `dashboard.*` - Dashboard page
- `editor.*` - Editor forms
- `profile.*` - Person profiles
- `errors.*` - Error messages
- `messages.*` - Success messages
- And more...

---

## 💾 Language Storage

- Saved in **localStorage** as `language-preferences`
- JSON format: `{ "language": "ro", "version": 1 }`
- Auto-restored on page load

---

## ✨ Currently Translated Pages/Components

✅ Landing Page
✅ App Header
✅ Dashboard
✅ User Profile (with language selector)
✅ Add Person Modal
✅ Add Relation Modal

---

## 📋 Still Need Translation

These components need i18n integration:
- Editor page
- All modals
- Chat components
- Test pages
- AI Analysis
- Other pages

---

## 🧪 Testing

```bash
# Start development server
npm run dev

# Visit app
# http://localhost:5173

# Click language switcher and test
# Refresh page - language should persist
```

---

## 📝 Best Practices

1. ✅ Use `useTranslation()` for dynamic text
2. ✅ Never hardcode user-facing text
3. ✅ Group translations logically
4. ✅ Test with longer translations (Romanian)
5. ✅ Use descriptive key names
6. ✅ Keep translations organized by feature

---

## 🆘 Troubleshooting

### Language doesn't change
- Check browser console for errors
- Verify localStorage is enabled
- Clear browser cache

### Translations missing
- Add missing keys to `en.ts` AND `ro.ts`
- Rebuild project: `npm run build`
- TypeScript will catch missing keys

### Type errors
- Import `useTranslation` correctly
- Ensure key exists in translation object
- Check spelling of translation keys

---

## 📞 Support

For questions about the i18n system:
1. Check `I18N_IMPLEMENTATION_GUIDE.md`
2. Review component examples (LandingPage, Dashboard)
3. Look at `src/i18n/en.ts` structure
4. Check `src/hooks/useTranslation.ts` implementation

---

**Status**: ✅ Ready to Use
**Languages**: 2 (English, Romanian)
**Last Updated**: December 2025
