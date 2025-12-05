import React, { useState } from 'react';
import { useGenogramStore } from '../store/genogramStore';
import { AnimatedModal } from '../components/ui/AnimatedModal';
import { AnimatedButton } from '../components/ui/AnimatedButton';
import { useTranslation } from '../hooks/useTranslation';
import { generateShortId } from '../utils/uuid';
import type { RelationType, RelationQuality } from '../types/genogram';

export const AddRelationModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const t = useTranslation();
  const { people, addRelation, lastRelationSourceId } = useGenogramStore();
  const [sourceId, setSourceId] = useState(() => lastRelationSourceId || '');
  const [targetId, setTargetId] = useState('');
  const [type, setType] = useState('parent-child');
  const [quality, setQuality] = useState<'strong' | 'moderate' | 'weak' | 'conflicted' | 'neutral'>('neutral');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Organized relationship groups with translations
  const relationshipGroups = {
    [t.common.search]: [
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
    [t.common.save]: [
      { value: 'married-couple', label: t.relationshipTypes.marriedCouple },
      { value: 'domestic-partnership', label: t.relationshipTypes.domesticPartnership },
      { value: 'partner', label: t.relationshipTypes.partner },
      { value: 'engaged', label: t.relationshipTypes.engaged },
      { value: 'ex-partner', label: t.relationshipTypes.exPartner },
      { value: 'ex-spouse', label: t.relationshipTypes.exSpouse },
    ],
    [t.common.add]: [
      { value: 'adoptive-parent', label: t.relationshipTypes.adoptiveParent },
      { value: 'adoptive-child', label: t.relationshipTypes.adoptiveChild },
      { value: 'foster-parent', label: t.relationshipTypes.fosterParent },
      { value: 'foster-child', label: t.relationshipTypes.fosterChild },
    ],
    [t.common.confirm]: [
      { value: 'close', label: t.relationshipTypes.close },
      { value: 'supportive', label: t.relationshipTypes.supportive },
      { value: 'moderate', label: t.relationshipTypes.moderate },
      { value: 'distant', label: t.relationshipTypes.distant },
      { value: 'conflict', label: t.relationshipTypes.conflict },
      { value: 'estranged', label: t.relationshipTypes.estranged },
      { value: 'fused', label: t.relationshipTypes.fused },
      { value: 'dependent', label: t.relationshipTypes.dependent },
    ],
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !targetId || sourceId === targetId) return;
    
    setIsSubmitting(true);
    try {
      addRelation({
        id: generateShortId(),
        sourceId,
        targetId,
        type: type as RelationType,
        quality: quality as RelationQuality,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        notes: notes || undefined,
      });
      
      setSourceId(lastRelationSourceId || '');
      setTargetId('');
      setType('parent-child');
      setQuality('neutral');
      setStartDate('');
      setEndDate('');
      setNotes('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      title={t.editor.addRelationModal}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="source-person-select" className="block text-sm text-ocean-300 mb-1">{t.editor.addRelation}</label>
          <select 
            id="source-person-select"
            className="w-full bg-deep border border-ocean-800 rounded p-2 text-white focus:border-ocean-500 outline-none transition-colors"
            value={sourceId}
            onChange={e => setSourceId(e.target.value)}
            disabled={isSubmitting}
            required
          >
            <option value="">{t.editor.selectPeople}</option>
            {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="relation-type-select" className="block text-sm text-ocean-300 mb-1">Relationship Type</label>
          <select 
            id="relation-type-select"
            className="w-full bg-deep border border-ocean-800 rounded p-2 text-white focus:border-ocean-500 outline-none transition-colors"
            value={type}
            onChange={e => setType(e.target.value)}
            disabled={isSubmitting}
          >
            {Object.entries(relationshipGroups).map(([group, options]) => (
              <optgroup key={group} label={group}>
                {options.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="target-person-select" className="block text-sm text-ocean-300 mb-1">{t.editor.addRelation}</label>
          <select 
            id="target-person-select"
            className="w-full bg-deep border border-ocean-800 rounded p-2 text-white focus:border-ocean-500 outline-none transition-colors"
            value={targetId}
            onChange={e => setTargetId(e.target.value)}
            disabled={isSubmitting}
            required
          >
            <option value="">{t.editor.selectPeople}</option>
            {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {/* Metadata fields */}
        <div className="border-t border-ocean-700 pt-4">
          <h4 className="text-sm font-semibold text-ocean-200 mb-3">Relationship Details (Optional)</h4>
          
          <div>
            <label htmlFor="quality-select" className="block text-sm text-ocean-300 mb-1">Quality</label>
            <select 
              id="quality-select"
              className="w-full bg-deep border border-ocean-800 rounded p-2 text-white focus:border-ocean-500 outline-none transition-colors"
              value={quality}
              onChange={e => setQuality(e.target.value as RelationQuality)}
              disabled={isSubmitting}
            >
              <option value="neutral">Neutral</option>
              <option value="strong">Strong</option>
              <option value="moderate">Moderate</option>
              <option value="weak">Weak</option>
              <option value="conflicted">Conflicted</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <div>
              <label className="block text-xs text-ocean-300 mb-1">Start Date</label>
              <input 
                type="date"
                className="w-full bg-deep border border-ocean-800 rounded p-2 text-white focus:border-ocean-500 outline-none text-sm transition-colors"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-xs text-ocean-300 mb-1">End Date</label>
              <input 
                type="date"
                className="w-full bg-deep border border-ocean-800 rounded p-2 text-white focus:border-ocean-500 outline-none text-sm transition-colors"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-sm text-ocean-300 mb-1">Notes</label>
            <textarea 
              className="w-full bg-deep border border-ocean-800 rounded p-2 text-white focus:border-ocean-500 outline-none text-sm transition-colors"
              rows={2}
              placeholder="Add notes about this relationship..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>
      
        <div className="flex gap-3 mt-6 pt-4 border-t border-ocean-700">
          <AnimatedButton
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            {t.common.cancel}
          </AnimatedButton>
          <AnimatedButton
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting || !sourceId || !targetId || sourceId === targetId}
            className="flex-1"
          >
            {isSubmitting ? t.common.loading : t.editor.addRelation}
          </AnimatedButton>
        </div>
      </form>
    </AnimatedModal>
  );
};
