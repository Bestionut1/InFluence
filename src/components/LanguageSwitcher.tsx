import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../hooks/useTranslation';
import { useTranslation } from '../hooks/useTranslation';
import { SUPPORTED_LANGUAGES } from '../i18n';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const t = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  const currentLang = SUPPORTED_LANGUAGES.find((lang) => lang.code === language);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-ocean-100 dark:hover:bg-deep-700 transition-colors"
        title={t.common.language}
      >
        <Globe size={18} />
        <span className="text-sm font-medium">{currentLang?.nativeName}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-deep-800 rounded-lg shadow-lg border border-ocean-200 dark:border-deep-600 z-50">
          <div className="py-1">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code as 'en' | 'ro');
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  language === lang.code
                    ? 'bg-ocean-100 dark:bg-ocean-900 text-ocean-900 dark:text-ocean-100 font-semibold'
                    : 'text-gray-900 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-deep-700'
                }`}
              >
                {lang.nativeName}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
