import React from 'react';
import { ChevronDown, ChevronRight, Users } from 'lucide-react';
import type { SiblingGroup } from '../utils/siblingCollapse';

interface CollapsibleSiblingGroupProps {
  group: SiblingGroup;
  onToggle: () => void;
  memberNames: string[]; // Numele tuturor membrilor din grup
  hiddenNames: string[]; // Numele membrilor ascunși
}

/**
 * Componenta care afișează un grup de frați colapsabil
 * Arată: [Icon] Ioan > (see 6 more siblings)
 */
export const CollapsibleSiblingGroup: React.FC<CollapsibleSiblingGroupProps> = ({
  group,
  onToggle,
  memberNames,
  hiddenNames,
}) => {
  if (group.siblingIds.length <= 2) {
    return null; // Nu afișa dacă sunt doar 2 frați
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1 bg-ocean-50 border border-ocean-200 rounded-md hover:bg-ocean-100 cursor-pointer transition-colors"
      onClick={onToggle}>
      
      {/* Icon chevron */}
      <div className="flex-shrink-0">
        {group.isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-ocean-600" />
        ) : (
          <ChevronDown className="w-4 h-4 text-ocean-600" />
        )}
      </div>

      {/* Icon grupă */}
      <Users className="w-4 h-4 text-ocean-600 flex-shrink-0" />

      {/* Informații grup */}
      <div className="flex-1 min-w-0">
        {group.isCollapsed ? (
          <div className="text-xs text-ocean-700 font-medium truncate">
            <span className="font-semibold">{memberNames[1]}</span>
            <span className="text-ocean-500 ml-1">+ {hiddenNames.length} more</span>
          </div>
        ) : (
          <div className="text-xs text-ocean-700">
            <span className="font-semibold">{memberNames.join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Label component pentru a afișa status-ul collapse pe nod
 */
export const SiblingGroupBadge: React.FC<{
  hiddenCount: number;
  isCollapsed: boolean;
  onClick?: (e: React.MouseEvent) => void;
}> = ({ hiddenCount, isCollapsed, onClick }) => {
  if (hiddenCount === 0 || !isCollapsed) {
    return null;
  }

  return (
    <div
      onClick={onClick}
      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold cursor-pointer hover:bg-red-600 transition-colors shadow-md"
      title={`${hiddenCount} sibling${hiddenCount !== 1 ? 's' : ''} hidden - click to expand`}
    >
      +{hiddenCount}
    </div>
  );
};
