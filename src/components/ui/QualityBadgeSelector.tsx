type QualityValue = 'strong' | 'supportive' | 'moderate' | 'distant' | 'conflict';

interface QualityOption {
  value: QualityValue;
  label: string;
  icon: string;
  color: string;
}

interface QualityBadgeSelectorProps {
  value: QualityValue;
  onChange: (value: QualityValue) => void;
  disabled?: boolean;
}

export const QualityBadgeSelector = ({
  value,
  onChange,
  disabled = false,
}: QualityBadgeSelectorProps) => {
  const qualityOptions: QualityOption[] = [
    {
      value: 'strong',
      label: 'Strong',
      icon: '❤️',
      color: 'bg-red-900/40 border-red-700 text-red-200 hover:bg-red-900/60',
    },
    {
      value: 'supportive',
      label: 'Supportive',
      icon: '🤝',
      color: 'bg-green-900/40 border-green-700 text-green-200 hover:bg-green-900/60',
    },
    {
      value: 'moderate',
      label: 'Moderate',
      icon: '💭',
      color: 'bg-blue-900/40 border-blue-700 text-blue-200 hover:bg-blue-900/60',
    },
    {
      value: 'distant',
      label: 'Distant',
      icon: '📍',
      color: 'bg-slate-700/40 border-slate-600 text-slate-300 hover:bg-slate-700/60',
    },
    {
      value: 'conflict',
      label: 'Conflict',
      icon: '⚡',
      color: 'bg-orange-900/40 border-orange-700 text-orange-200 hover:bg-orange-900/60',
    },
  ];

  return (
    <div className="space-y-2">
      <label className="block text-sm text-ocean-300 font-semibold">Relationship Quality</label>
      
      {/* Badge Row */}
      <div className="flex flex-wrap gap-2">
        {qualityOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={`py-2 px-3 rounded-full border text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
              value === option.value
                ? `${option.color} border-opacity-100 ring-2 ring-offset-1 ring-offset-slate-900`
                : `${option.color} border-opacity-50`
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span className="text-base">{option.icon}</span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>

      {/* Help Text */}
      <p className="text-xs text-ocean-400 italic">
        How would you describe the quality of this relationship?
      </p>
    </div>
  );
};
