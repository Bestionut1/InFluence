import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface RelationshipTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const RelationshipTypeSelector = ({
  value,
  onChange,
  disabled = false,
}: RelationshipTypeSelectorProps) => {
  const t = useTranslation();
  const [activeTab, setActiveTab] = useState<'family' | 'partnership' | 'other' | 'trauma'>('family');

  const relationshipCategories = {
    family: {
      label: 'Family Relations',
      icon: '👨‍👩‍👧‍👦',
      types: [
        { value: 'parent-child', label: t.relationshipTypes.parentChild },
        { value: 'biological-sibling', label: t.relationshipTypes.biologicalSibling },
        { value: 'half-sibling', label: t.relationshipTypes.halfSibling },
        { value: 'full-sibling', label: t.relationshipTypes.fullSibling },
        { value: 'step-sibling', label: t.relationshipTypes.stepSibling },
        { value: 'twin', label: t.relationshipTypes.twin },
        { value: 'fraternal-twin', label: t.relationshipTypes.fraternalTwin },
        { value: 'identical-twin', label: t.relationshipTypes.identicalTwin },
        { value: 'step-parent', label: t.relationshipTypes.stepParent },
        { value: 'step-child', label: t.relationshipTypes.stepChild },
        { value: 'grandparent-grandchild', label: t.relationshipTypes.grandparentGrandchild },
        { value: 'uncle-aunt-niece-nephew', label: t.relationshipTypes.uncleAuntNieceNephew },
        { value: 'cousin', label: t.relationshipTypes.cousin },
      ],
    },
    partnership: {
      label: 'Partnership',
      icon: '💑',
      types: [
        { value: 'married-couple', label: t.relationshipTypes.marriedCouple },
        { value: 'domestic-partnership', label: t.relationshipTypes.domesticPartnership },
        { value: 'partner', label: t.relationshipTypes.partner },
        { value: 'engaged', label: t.relationshipTypes.engaged },
        { value: 'ex-partner', label: t.relationshipTypes.exPartner },
        { value: 'ex-spouse', label: t.relationshipTypes.exSpouse },
      ],
    },
    other: {
      label: 'Other Relations',
      icon: '🤝',
      types: [
        { value: 'adoptive-parent', label: t.relationshipTypes.adoptiveParent },
        { value: 'adoptive-child', label: t.relationshipTypes.adoptiveChild },
        { value: 'foster-parent', label: t.relationshipTypes.fosterParent },
        { value: 'foster-child', label: t.relationshipTypes.fosterChild },
        { value: 'close', label: t.relationshipTypes.close },
        { value: 'supportive', label: t.relationshipTypes.supportive },
        { value: 'moderate', label: t.relationshipTypes.moderate },
        { value: 'distant', label: t.relationshipTypes.distant },
        { value: 'conflict', label: t.relationshipTypes.conflict },
        { value: 'estranged', label: t.relationshipTypes.estranged },
        { value: 'fused', label: t.relationshipTypes.fused },
        { value: 'dependent', label: t.relationshipTypes.dependent },
      ],
    },
    trauma: {
      label: 'Trauma/Abuse',
      icon: '⚠️',
      types: [
        { value: 'physical-abuse', label: 'Physical Abuse' },
        { value: 'emotional-abuse', label: 'Emotional Abuse' },
        { value: 'sexual-abuse', label: 'Sexual Abuse' },
        { value: 'neglect', label: 'Neglect' },
        { value: 'violence', label: 'Violence' },
      ],
    },
  };

  const currentCategory = relationshipCategories[activeTab];
  const currentType = currentCategory.types.find(t => t.value === value);

  return (
    <div className="space-y-3">
      <label className="block text-sm text-ocean-300 font-semibold">Relationship Type</label>

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-deep border border-ocean-800 rounded-lg p-1">
        {(['family', 'partnership', 'other', 'trauma'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            disabled={disabled}
            className={`flex-1 py-2 px-3 rounded transition-all text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === tab
                ? 'bg-ocean-700 text-ocean-100 border border-ocean-600'
                : 'text-ocean-400 hover:text-ocean-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span>{relationshipCategories[tab].icon}</span>
            <span className="hidden sm:inline">{relationshipCategories[tab].label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Relation Type Cards Grid */}
      <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto bg-deep/50 border border-ocean-800/50 rounded-lg p-3">
        {currentCategory.types.map((type) => (
          <button
            key={type.value}
            onClick={() => onChange(type.value)}
            disabled={disabled}
            className={`py-2 px-3 rounded text-sm font-medium transition-all border ${
              value === type.value
                ? 'bg-ocean-700 border-ocean-600 text-ocean-100'
                : 'bg-ocean-900/30 border-ocean-700/50 text-ocean-300 hover:border-ocean-600 hover:bg-ocean-800/30'
            } disabled:opacity-50 disabled:cursor-not-allowed text-left`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Current Selection Display */}
      {currentType && (
        <div className="text-xs text-ocean-400 italic px-2 py-1 bg-ocean-900/30 rounded border border-ocean-800/30">
          Selected: <span className="text-ocean-200 font-semibold">{currentType.label}</span>
        </div>
      )}
    </div>
  );
};
