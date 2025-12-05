import { en } from './en';
import { ro } from './ro';

export type Language = 'en' | 'ro';

export type TranslationKeys = typeof en;

export const translations: Record<Language, TranslationKeys> = {
  en,
  ro,
};

export const getTranslation = (language: Language): TranslationKeys => {
  return translations[language] || translations.en;
};

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română' },
] as const;
