# Internationalization (i18n) System

## Overview

PsychoGenealogy now has full support for multiple languages. The system is built using:

- **Zustand** for state management (language preference)
- **TypeScript** for type-safe translations
- **localStorage** for persisting language preference

## Supported Languages

- 🇬🇧 English (`en`)
- 🇷🇴 Romanian (`ro`)

## Architecture

```
src/i18n/
├── en.ts          # English translations
├── ro.ts          # Romanian translations
└── index.ts       # Export types and getTranslation function

src/store/
└── languageStore.ts  # Zustand store for language state

src/hooks/
└── useTranslation.ts # Hooks for using translations

src/components/
└── LanguageSwitcher.tsx # UI component for switching languages
```

## Usage

### In Components

```typescript
import { useTranslation } from '../hooks/useTranslation';

export const MyComponent = () => {
  const t = useTranslation();
  
  return (
    <div>
      <h1>{t.dashboard.title}</h1>
      <button>{t.common.save}</button>
    </div>
  );
};
```

### Change Language Programmatically

```typescript
import { useLanguage } from '../hooks/useTranslation';

export const LanguageSettings = () => {
  const { language, setLanguage } = useLanguage();
  
  return (
    <button onClick={() => setLanguage('ro')}>
      Switch to Romanian
    </button>
  );
};
```

### LanguageSwitcher Component

The `LanguageSwitcher` component is already integrated in:
- **AppHeader** - Top-right menu
- **LandingPage** - Top-right corner

You can add it anywhere with:
```typescript
<LanguageSwitcher />
```

## Adding New Translations

### Step 1: Add to English translations (`src/i18n/en.ts`)

```typescript
export const en = {
  // ... existing translations
  myNewFeature: {
    title: 'My Feature Title',
    description: 'Feature description',
  },
};
```

### Step 2: Add to Romanian translations (`src/i18n/ro.ts`)

```typescript
export const ro = {
  // ... existing translations
  myNewFeature: {
    title: 'Titlul Caracteristicii Mele',
    description: 'Descrierea caracteristicii',
  },
};
```

### Step 3: Use in Component

```typescript
const t = useTranslation();
<h2>{t.myNewFeature.title}</h2>
```

## Translation Structure

All translations follow a hierarchical structure:

- `nav.*` - Navigation items
- `common.*` - Common UI elements (buttons, labels)
- `landing.*` - Landing page specific
- `dashboard.*` - Dashboard page
- `editor.*` - Editor page
- `profile.*` - Profile/person related
- `templates.*` - Psychological templates
- `analysis.*` - AI analysis
- `chat.*` - Chat/messaging
- `tests.*` - Psychological tests
- `settings.*` - Settings page
- `errors.*` - Error messages
- `messages.*` - Success/info messages
- And more...

## Persistence

Language preference is automatically saved to localStorage under the key `language-preferences`. The preference persists across sessions.

## Type Safety

The translation system is fully typed. TypeScript will warn if you try to access a non-existent translation key:

```typescript
const t = useTranslation();
t.nonExistent.key  // ❌ TypeScript error
t.dashboard.title  // ✅ Correct
```

## Future Enhancements

- [ ] Add more languages (French, Spanish, etc.)
- [ ] Server-side language preference storage
- [ ] Automatic language detection based on browser locale
- [ ] Translation management UI for admins
- [ ] RTL language support (Arabic, Hebrew)
- [ ] Date/time localization formatting

## Current Components with i18n Support

✅ LandingPage
✅ AppHeader
✅ Dashboard (DashboardContainer)
✅ UserProfile

## Components Needing i18n Integration

- [ ] AddPersonModal
- [ ] AddRelationModal
- [ ] Editor page
- [ ] PersonNode
- [ ] AIAnalysisPage
- [ ] PsychologyChatPage
- [ ] Other modal components

---

**Last Updated**: December 2025
