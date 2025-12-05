import { useLanguageStore } from '../store/languageStore';
import { getTranslation } from '../i18n';

export const useTranslation = () => {
  const { language } = useLanguageStore();
  const t = getTranslation(language);
  return t;
};

export const useLanguage = () => {
  const { language, setLanguage } = useLanguageStore();
  return { language, setLanguage };
};
