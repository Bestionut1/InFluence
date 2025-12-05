import { Send, Loader } from 'lucide-react';
import { useRef } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder,
}: ChatInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    onSubmit(e);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="border-t border-ocean-800 bg-deep">
      <div className="max-w-4xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || t.chat.chatInputPlaceholder}
            disabled={disabled}
            className="flex-1 px-4 py-3 bg-ocean-900/40 border border-ocean-700 rounded-lg text-ocean-100 placeholder-ocean-500 focus:outline-none focus:border-orange-500 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={disabled || !value.trim()}
            className="px-4 py-3 bg-gradient-to-r from-orange-700 to-orange-800 hover:from-orange-600 hover:to-orange-700 disabled:from-ocean-700 disabled:to-ocean-800 disabled:text-ocean-600 text-white rounded-lg font-medium flex items-center gap-2 transition-all disabled:cursor-not-allowed shadow-md"
          >
            {disabled ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{t.chat.send}</span>
          </button>
        </form>
        <div className="text-xs text-ocean-500 mt-3">
          {t.chat.disclaimer}
        </div>
      </div>
    </div>
  );
};
