import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGenogramStore } from '../store/genogramStore';
import { useTranslation } from '../hooks/useTranslation';
import { X, Trash2, ExternalLink, Copy, Star, Unlink2, Plus, Trash } from 'lucide-react';
import type { Person, Gender, Status, HealthRecord } from '../types/genogram';
import { motion, AnimatePresence } from 'framer-motion';
import { COMMON_CONDITIONS, SEVERITY_LEVELS, CONDITION_COLORS } from '../constants/conditionColors';

interface PersonEditModalProps {
  person: Person | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PersonEditModal = ({ person, isOpen, onClose }: PersonEditModalProps) => {
  const t = useTranslation();
  const navigate = useNavigate();
  const { updatePerson, removePerson, relations, removeRelation, people, addHealthRecord, removeHealthRecord } = useGenogramStore();
  const [formData, setFormData] = useState<Partial<Person>>(person || {});
  const [copiedId, setCopiedId] = useState(false);
  const [showHealthForm, setShowHealthForm] = useState(false);
  const [healthFormData, setHealthFormData] = useState({ condition: '', severity: 'mild' });

  useEffect(() => {
    if (person && isOpen) {
      setFormData({ ...person });
    }
  }, [person, isOpen]);

  if (!isOpen || !person) return null;

  const handleSave = () => {
    if (!formData.name?.trim()) {
      alert('Please enter a name');
      return;
    }
    updatePerson(person.id, formData);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this person?')) {
      removePerson(person.id);
      onClose();
    }
  };

  const handleDeleteRelation = (relationId: string) => {
    if (window.confirm('Delete this relationship?')) {
      removeRelation(relationId);
    }
  };

  const copyIdToClipboard = () => {
    navigator.clipboard.writeText(person.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleAddHealth = () => {
    if (!healthFormData.condition) return;
    const record: HealthRecord = {
      id: Math.random().toString(36).substr(2, 9),
      personId: person.id,
      condition: healthFormData.condition,
      severity: healthFormData.severity as any,
      status: 'active',
    };
    addHealthRecord(person.id, record);
    setHealthFormData({ condition: '', severity: 'mild' });
    setShowHealthForm(false);
  };

  const handleRemoveHealth = (recordId: string) => {
    removeHealthRecord(person.id, recordId);
  };

  const handleTogglePrincipal = () => {
    setFormData({
      ...formData,
      isPrincipal: !formData.isPrincipal,
    });
  };

  const personRelations = relations.filter(
    (rel) => rel.sourceId === person.id || rel.targetId === person.id
  );

  const getRelationDetails = (rel: any) => {
    const isSource = rel.sourceId === person.id;
    const otherPersonId = isSource ? rel.targetId : rel.sourceId;
    const direction = isSource ? '→' : '←';
    const otherPerson = people.find(p => p.id === otherPersonId);
    const otherName = otherPerson?.name || 'Unknown';
    return { otherPersonId, otherName, direction, isSource };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />

          {/* Modal - Compact & Beautiful */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-96 bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/50 flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white">{person.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">Edit Profile</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content - Compact Grid */}
            <div className="px-6 py-4 space-y-3.5">
              {/* Row 1: Name & Age */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="col-span-2">
                  <label htmlFor="edit-name" className="block text-xs font-semibold text-slate-400 mb-1">Name</label>
                  <input
                    id="edit-name"
                    name="edit-name"
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-2.5 py-2 bg-slate-750 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="edit-age" className="block text-xs font-semibold text-slate-400 mb-1">Age</label>
                  <input
                    id="edit-age"
                    name="edit-age"
                    type="number"
                    value={formData.age || ''}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || undefined })}
                    className="w-full px-2.5 py-2 bg-slate-750 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Row 2: Gender & Status */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="edit-gender-select" className="block text-xs font-semibold text-slate-400 mb-1">Gender</label>
                  <select
                    id="edit-gender-select"
                    value={formData.gender || ''}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-full px-2.5 py-2 bg-slate-750 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="edit-status-select" className="block text-xs font-semibold text-slate-400 mb-1">Status</label>
                  <select
                    id="edit-status-select"
                    value={formData.status || ''}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}
                    className="w-full px-2.5 py-2 bg-slate-750 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="living">Living</option>
                    <option value="deceased">Deceased</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Occupation & Principal */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Occupation</label>
                  <input
                    type="text"
                    value={formData.occupation || ''}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    placeholder="e.g. Doctor"
                    className="w-full px-2.5 py-2 bg-slate-750 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleTogglePrincipal}
                    className={`w-full py-2 px-2.5 rounded-lg border transition-all text-xs font-semibold flex items-center justify-center gap-1.5 ${
                      formData.isPrincipal
                        ? 'bg-yellow-900/30 border-yellow-600 text-yellow-300'
                        : 'bg-slate-750 border-slate-600 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5" />
                    {formData.isPrincipal ? 'Principal' : 'Set Principal'}
                  </button>
                </div>
              </div>

              {/* Row 4: Quick Actions */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={copyIdToClipboard}
                  className={`py-1.5 px-2 rounded-lg border transition-all text-xs font-semibold flex items-center justify-center gap-1 ${
                    copiedId
                      ? 'bg-green-900/30 border-green-600 text-green-300'
                      : 'bg-slate-750 border-slate-600 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="Copy member ID"
                >
                  <Copy className="w-3.5 h-3.5" />
                  ID
                </button>
                <button
                  onClick={() => {
                    navigate(`/person/${person.id}`);
                    onClose();
                  }}
                  className="py-1.5 px-2 bg-ocean-600/30 hover:bg-ocean-600/50 border border-ocean-600 text-ocean-300 rounded-lg transition-all text-xs font-semibold flex items-center justify-center gap-1"
                  title="Go to profile hub"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Hub
                </button>
                <button
                  onClick={handleDelete}
                  className="py-1.5 px-2 bg-red-900/30 hover:bg-red-900/50 border border-red-600 text-red-300 rounded-lg transition-all text-xs font-semibold flex items-center justify-center gap-1"
                  title="Delete member"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Del
                </button>
              </div>

              {/* Row 5: Relations List */}
              {personRelations.length > 0 && (
                <div className="bg-slate-750/50 border border-slate-600/50 rounded-lg p-2.5 space-y-2">
                  <p className="text-xs font-semibold text-slate-400">Relations ({personRelations.length})</p>
                  <div className="space-y-1.5 max-h-24 overflow-y-auto">
                    {personRelations.map((rel) => {
                      const { otherName, direction, isSource } = getRelationDetails(rel);
                      const fromName = isSource ? person.name : otherName;
                      const toName = isSource ? otherName : person.name;
                      return (
                        <div
                          key={rel.id}
                          className="flex items-center justify-between p-2 bg-slate-700/30 hover:bg-slate-700/50 rounded border border-slate-600/40 transition-colors group"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-xs font-semibold text-slate-200 truncate">{fromName}</span>
                            <span className="text-slate-400 text-xs font-bold">{direction}</span>
                            <span className="text-xs font-semibold text-slate-200 truncate">{toName}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteRelation(rel.id)}
                            className="p-1 rounded hover:bg-red-900/50 text-red-400 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 ml-2"
                            title="Delete this relationship"
                          >
                            <Unlink2 className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Row 6: Relations Count & Status */}
              <div className="bg-slate-750/50 border border-slate-600/50 rounded-lg p-2.5 flex items-center justify-between text-xs">
                <div className="flex gap-3">
                  <div>
                    <p className="text-slate-400">Relations</p>
                    <p className="text-slate-200 font-semibold">{personRelations.length}</p>
                  </div>
                  <div className="border-l border-slate-600"></div>
                  <div>
                    <p className="text-slate-400">Gender</p>
                    <p className="text-slate-200 font-semibold capitalize">{formData.gender || '—'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-400">Status</p>
                  <p className="text-slate-200 font-semibold">{formData.status === 'deceased' ? '🪦' : '✅'}</p>
                </div>
              </div>

              {/* Row 7: Health Management */}
              {formData.status === 'living' && (
                <div className="bg-slate-750/50 border border-slate-600/50 rounded-lg p-2.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">Health Conditions</label>
                    <button
                      onClick={() => setShowHealthForm(!showHealthForm)}
                      className="text-xs bg-ocean-600/50 hover:bg-ocean-600 text-ocean-100 px-2.5 py-1 rounded transition flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      {showHealthForm ? 'Close' : 'Add'}
                    </button>
                  </div>

                  {/* Health conditions list */}
                  {person.healthHistory && person.healthHistory.length > 0 && (
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {person.healthHistory.map((record) => (
                        <div
                          key={record.id}
                          className="flex items-center justify-between p-2 bg-slate-700/40 hover:bg-slate-700/60 rounded border border-slate-600/40 transition-colors group"
                          style={{
                            borderLeftWidth: '3px',
                            borderLeftColor: CONDITION_COLORS[record.condition as keyof typeof CONDITION_COLORS]?.light || '#9ca3af',
                          }}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-xs font-semibold text-slate-200 capitalize truncate">{record.condition}</span>
                            <span
                              className="text-xs px-1.5 py-0.5 rounded bg-opacity-30 text-xs font-medium"
                              style={{
                                backgroundColor: CONDITION_COLORS[record.condition as keyof typeof CONDITION_COLORS]?.light || '#9ca3af',
                                color: CONDITION_COLORS[record.condition as keyof typeof CONDITION_COLORS]?.dark || '#1f2937',
                              }}
                            >
                              {record.severity}
                            </span>
                            <span className="text-slate-400 text-xs">({record.status})</span>
                          </div>
                          <button
                            onClick={() => handleRemoveHealth(record.id)}
                            className="p-1 rounded hover:bg-red-900/50 text-red-400 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                            title="Delete this condition"
                          >
                            <Trash className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add health form */}
                  {showHealthForm && (
                    <div className="mt-2 p-2.5 bg-slate-700/40 border border-slate-600/50 rounded space-y-2">
                      <div className="space-y-1.5">
                        <label htmlFor="health-condition-select" className="text-xs font-medium text-slate-300">Condition</label>
                        <select
                          id="health-condition-select"
                          value={healthFormData.condition}
                          onChange={(e) => setHealthFormData({ ...healthFormData, condition: e.target.value })}
                          className="w-full px-2 py-1.5 text-xs bg-slate-700 border border-slate-600 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-ocean-500"
                        >
                          <option value="">Select a condition...</option>
                          {COMMON_CONDITIONS.map((condition) => (
                            <option key={condition.value} value={condition.value}>
                              {condition.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="health-severity-select" className="text-xs font-medium text-slate-300">Severity</label>
                        <select
                          id="health-severity-select"
                          value={healthFormData.severity}
                          onChange={(e) => setHealthFormData({ ...healthFormData, severity: e.target.value })}
                          className="w-full px-2 py-1.5 text-xs bg-slate-700 border border-slate-600 rounded text-slate-100 focus:outline-none focus:border-ocean-500"
                        >
                          {SEVERITY_LEVELS.map((level) => (
                            <option key={level.value} value={level.value}>
                              {level.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={handleAddHealth}
                        disabled={!healthFormData.condition}
                        className="w-full px-2 py-1.5 text-xs bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded transition"
                      >
                        Add Condition
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer - Action Buttons */}
            <div className="px-6 py-3 border-t border-slate-700/50 bg-slate-800/30 flex gap-2 justify-end">
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition"
              >
                {t.personEditModal.cancel}
              </button>
              <button
                onClick={handleSave}
                className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition"
              >
                {t.personEditModal.save}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
