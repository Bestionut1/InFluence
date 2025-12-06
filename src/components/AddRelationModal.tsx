import React, { useState } from 'react';
import { useGenogramStore } from '../store/genogramStore';
import { AnimatedModal } from '../components/ui/AnimatedModal';
import { AnimatedButton } from '../components/ui/AnimatedButton';
import { RelationshipTypeSelector } from '../components/ui/RelationshipTypeSelector';
import { QualityBadgeSelector } from '../components/ui/QualityBadgeSelector';
import { CollapsibleMetadata } from '../components/ui/CollapsibleMetadata';
import { useTranslation } from '../hooks/useTranslation';
import { generateShortId } from '../utils/uuid';
import { validateRelation, hasExistingRelation } from '../utils/relationshipValidation';
import { AlertCircle, CheckCircle, Lightbulb } from 'lucide-react';
import type { RelationType, RelationQuality } from '../types/genogram';

export const AddRelationModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const t = useTranslation();
  const { people, addRelation, lastRelationSourceId } = useGenogramStore();
  const [sourceId, setSourceId] = useState(() => lastRelationSourceId || '');
  const [targetId, setTargetId] = useState('');
  const [type, setType] = useState('parent-child');
  const [quality, setQuality] = useState<RelationQuality>('neutral');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);

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
      setShowMetadata(false);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get current people for validation
  const sourcePerson = people.find((p) => p.id === sourceId);
  const targetPerson = people.find((p) => p.id === targetId);
  const relations = useGenogramStore((state) => state.relations);
  
  // Validate relation if both people are selected
  let validation = null;
  let existingRelation = null;
  if (sourcePerson && targetPerson) {
    validation = validateRelation(sourcePerson, targetPerson, type as RelationType, people);
    existingRelation = hasExistingRelation(sourcePerson, targetPerson, relations);
  }

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      title={t.editor.addRelationModal}
    >
      {/* Validation Alerts */}
      {existingRelation?.exists && (
        <div className="mb-4 p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg flex gap-2">
          <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-blue-200 font-semibold">✓ Already Connected</p>
            <p className="text-blue-300 text-xs mt-1">
              {sourcePerson?.name} {existingRelation.direction} {targetPerson?.name} ({existingRelation.type})
            </p>
          </div>
        </div>
      )}

      {validation && validation.warnings.length > 0 && (
        <div className="mb-4 p-3 bg-amber-900/30 border border-amber-700/50 rounded-lg flex gap-2">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-amber-200 font-semibold">⚠ Warning</p>
            <ul className="text-amber-300 text-xs mt-1 space-y-1">
              {validation.warnings.map((w, i) => (
                <li key={i}>• {w}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {validation && validation.suggestions.length > 0 && (
        <div className="mb-4 p-3 bg-teal-900/30 border border-teal-700/50 rounded-lg flex gap-2">
          <Lightbulb className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-teal-200 font-semibold">💡 Suggestions</p>
            <ul className="text-teal-300 text-xs mt-1 space-y-1">
              {validation.suggestions.map((s, i) => (
                <li key={i}>• {s.reason}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

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

        <RelationshipTypeSelector
          value={type}
          onChange={setType}
          disabled={isSubmitting}
        />

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

        <CollapsibleMetadata
          isExpanded={showMetadata}
          onToggle={() => setShowMetadata(!showMetadata)}
          hasData={!!notes || !!startDate || !!endDate}
        >
          <QualityBadgeSelector
            value={quality as 'strong' | 'supportive' | 'moderate' | 'distant' | 'conflict'}
            onChange={(val) => setQuality(val as RelationQuality)}
            disabled={isSubmitting}
          />

          <div>
            <h4 className="text-sm font-semibold text-ocean-200 mb-3">Dates</h4>
            <div className="grid grid-cols-2 gap-2">
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
          </div>

          <div>
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
        </CollapsibleMetadata>
      
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
