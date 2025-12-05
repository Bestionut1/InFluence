import { useState, useEffect } from 'react';
import { useGenogramStore } from '../store/genogramStore';
import { useTranslation } from '../hooks/useTranslation';
import { X, Plus, Trash2, ChevronDown } from 'lucide-react';
import type { Person } from '../types/genogram';
import { motion, AnimatePresence } from 'framer-motion';

interface PersonDetailsModalProps {
  person: Person | null;
  isOpen: boolean;
  onClose: () => void;
}

type SectionType = 'basic' | 'relationships' | 'attributes' | 'profile' | 'actions';

export const PersonDetailsModal = ({ person, isOpen, onClose }: PersonDetailsModalProps) => {
  const t = useTranslation();
  const { removePerson, relations, removeRelation, updatePerson, getProfileByPersonId } = useGenogramStore();
  
  const [formData, setFormData] = useState<Partial<Person>>(person || {});
  const [isEditing, setIsEditing] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<SectionType, boolean>>({
    basic: true,
    relationships: false,
    attributes: false,
    profile: false,
    actions: false,
  });
  const [newAttribute, setNewAttribute] = useState('');

  useEffect(() => {
    if (person && isOpen) {
      setFormData({ ...person });
      setIsEditing(false);
    }
  }, [person, isOpen]);

  if (!isOpen || !person) return null;

  const profile = getProfileByPersonId(person.id);
  const personRelations = relations.filter(
    (rel) => rel.sourceId === person.id || rel.targetId === person.id
  );

  const handleSave = () => {
    if (!formData.name?.trim()) return;
    updatePerson(person.id, formData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(t.personDetailsModal.deleteMemberConfirm)) {
      removePerson(person.id);
      onClose();
    }
  };

  const handleDeleteRelation = (relationId: string) => {
    if (window.confirm(t.personDetailsModal.deleteRelationship)) {
      removeRelation(relationId);
    }
  };

  const addAttribute = () => {
    if (newAttribute.trim()) {
      setFormData({
        ...formData,
        attributes: [...(formData.attributes || []), newAttribute],
      });
      setNewAttribute('');
    }
  };

  const removeAttribute = (index: number) => {
    setFormData({
      ...formData,
      attributes: formData.attributes?.filter((_, i) => i !== index),
    });
  };

  const toggleSection = (section: SectionType) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const SectionHeader = ({ section, label, icon }: { section: SectionType; label: string; icon: string }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-ocean-900/50 to-ocean-800/30 hover:from-ocean-900/70 hover:to-ocean-800/50 border border-ocean-700 rounded-lg transition-all"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-lg font-bold text-ocean-100">{label}</h3>
      </div>
      <ChevronDown 
        className={`w-5 h-5 text-ocean-400 transition-transform ${expandedSections[section] ? 'rotate-180' : ''}`}
      />
    </button>
  );

  const genderDisplay = {
    male: t.common.male,
    female: t.common.female,
    'non-binary': t.common.nonBinary,
    unknown: t.common.unknown
  }[formData.gender as string] || t.common.unknown;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-deep-surface border-2 border-ocean-500 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-ocean-900 via-ocean-800 to-ocean-900 border-b-2 border-ocean-500 px-8 py-6 flex justify-between items-center sticky top-0 z-10">
          <div className="flex-1">
            {isEditing ? (
              <input 
                type="text"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="text-3xl font-bold bg-ocean-800/50 border border-ocean-600 rounded-lg px-4 py-2 text-ocean-100 focus:border-ocean-400 outline-none w-full"
                autoFocus
              />
            ) : (
              <h2 className="text-3xl font-bold text-ocean-100">{formData.name}</h2>
            )}
            <p className="text-ocean-400 text-sm mt-1">{genderDisplay} • {formData.status === 'deceased' ? '🪦 ' + t.personDetailsModal.deceased : '✅ ' + t.personDetailsModal.living}</p>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <button 
                onClick={handleSave}
                className="p-2 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded-lg transition-colors"
                title={t.personDetailsModal.save}
              >
                ✅
              </button>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="p-2 hover:bg-ocean-800 text-ocean-400 hover:text-ocean-200 rounded-lg transition-colors"
                title={t.personDetailsModal.edit}
              >
                ✏️
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-ocean-800 text-ocean-400 hover:text-white rounded-lg transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content - Accordion Sections */}
        <div className="overflow-y-auto flex-1 p-8 space-y-4">
          {/* BASIC INFO SECTION */}
          <div className="space-y-3">
            <SectionHeader section="basic" label={t.personDetailsModal.basicInfo} icon="👤" />
            <AnimatePresence>
              {expandedSections.basic && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-ocean-900/30 border border-ocean-800 rounded-lg p-6 space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-ocean-400 text-xs font-semibold mb-2">{t.personDetailsModal.gender}</p>
                      {isEditing ? (
                        <select 
                          id="details-gender-select"
                          value={formData.gender || 'unknown'}
                          onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                          className="w-full bg-ocean-900/50 border border-ocean-700 rounded-lg p-2 text-white focus:border-ocean-500 outline-none"
                        >
                          <option value="male">{t.common.male}</option>
                          <option value="female">{t.common.female}</option>
                          <option value="non-binary">{t.common.nonBinary}</option>
                          <option value="unknown">{t.common.unknown}</option>
                        </select>
                      ) : (
                        <p className="text-ocean-100 font-semibold">{genderDisplay}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-ocean-400 text-xs font-semibold mb-2">{t.personDetailsModal.age}</p>
                      {isEditing ? (
                        <input 
                          type="number"
                          value={formData.age || ''}
                          onChange={e => setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value) : undefined })}
                          className="w-full bg-ocean-900/50 border border-ocean-700 rounded-lg p-2 text-white focus:border-ocean-500 outline-none"
                        />
                      ) : (
                        <p className="text-ocean-100 font-semibold">{formData.age || '—'}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-ocean-400 text-xs font-semibold mb-2">{t.personDetailsModal.status}</p>
                      {isEditing ? (
                        <select 
                          id="details-status-select"
                          value={formData.status || 'living'}
                          onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                          className="w-full bg-ocean-900/50 border border-ocean-700 rounded-lg p-2 text-white focus:border-ocean-500 outline-none"
                        >
                          <option value="living">{t.personDetailsModal.living}</option>
                          <option value="deceased">{t.personDetailsModal.deceased}</option>
                        </select>
                      ) : (
                        <p className="text-ocean-100 font-semibold">{formData.status === 'deceased' ? t.personDetailsModal.deceased : t.personDetailsModal.living}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-ocean-400 text-xs font-semibold mb-2">{t.personDetailsModal.relations}</p>
                      <p className="text-ocean-100 font-semibold">{personRelations.length}</p>
                    </div>
                  </div>

                  {(formData.dateOfBirth || formData.dateOfDeath || isEditing) && (
                    <div className="border-t border-ocean-700 pt-4">
                      <p className="text-ocean-300 font-semibold mb-3">{t.personDetailsModal.dates}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-ocean-400 text-xs font-semibold mb-2">{t.personDetailsModal.birthDate}</p>
                          {isEditing ? (
                            <input 
                              type="date"
                              value={formData.dateOfBirth || ''}
                              onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                              className="w-full bg-ocean-900/50 border border-ocean-700 rounded-lg p-2 text-white focus:border-ocean-500 outline-none"
                            />
                          ) : (
                            <p className="text-ocean-100">{formData.dateOfBirth || '—'}</p>
                          )}
                        </div>
                        {(formData.dateOfDeath || formData.status === 'deceased' || isEditing) && (
                          <div>
                            <p className="text-ocean-400 text-xs font-semibold mb-2">{t.personDetailsModal.deathDate}</p>
                            {isEditing ? (
                              <input 
                                type="date"
                                value={formData.dateOfDeath || ''}
                                onChange={e => setFormData({ ...formData, dateOfDeath: e.target.value })}
                                className="w-full bg-ocean-900/50 border border-ocean-700 rounded-lg p-2 text-white focus:border-ocean-500 outline-none"
                                disabled={formData.status !== 'deceased'}
                              />
                            ) : (
                              <p className="text-ocean-100">{formData.dateOfDeath || '—'}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RELATIONSHIPS SECTION */}
          <div className="space-y-3">
            <SectionHeader section="relationships" label={t.personDetailsModal.familyRelationships} icon="👨‍👩‍👧‍👦" />
            <AnimatePresence>
              {expandedSections.relationships && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-ocean-900/30 border border-ocean-800 rounded-lg p-6"
                >
                  {personRelations.length === 0 ? (
                    <p className="text-ocean-400 text-sm italic">{t.personDetailsModal.noRelationships}</p>
                  ) : (
                    <div className="space-y-2">
                      {personRelations.map((rel) => (
                        <motion.div
                          key={rel.id}
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          className="flex items-center justify-between p-3 bg-ocean-800/50 rounded-lg border border-ocean-700"
                        >
                          <div>
                            <p className="text-ocean-100 font-semibold">{rel.type}</p>
                            <p className="text-ocean-400 text-xs">
                              {rel.sourceId === person.id ? '→ to' : '← from'} (ID: {rel.sourceId === person.id ? rel.targetId : rel.sourceId})
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteRelation(rel.id)}
                            className="p-2 hover:bg-red-900/50 text-red-400 hover:text-red-300 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ATTRIBUTES SECTION */}
          <div className="space-y-3">
            <SectionHeader section="attributes" label={t.personDetailsModal.psychologicalAttributes} icon="🧠" />
            <AnimatePresence>
              {expandedSections.attributes && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-ocean-900/30 border border-ocean-800 rounded-lg p-6 space-y-3"
                >
                  {isEditing && (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder={t.personDetailsModal.addAttribute}
                        className="flex-1 bg-ocean-900/50 border border-ocean-700 rounded-lg p-2 text-white focus:border-ocean-500 outline-none"
                        value={newAttribute}
                        onChange={e => setNewAttribute(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && addAttribute()}
                      />
                      <button 
                        onClick={addAttribute} 
                        className="bg-ocean-700 hover:bg-ocean-600 text-white px-3 py-2 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {formData.attributes?.map((attr, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-2 bg-ocean-700/50 px-3 py-1 rounded-full border border-ocean-600"
                      >
                        <span className="text-ocean-100 text-sm">{attr}</span>
                        {isEditing && (
                          <button 
                            onClick={() => removeAttribute(idx)} 
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* PROFILE SECTION */}
          {profile && (
            <div className="space-y-3">
              <SectionHeader section="profile" label={t.personDetailsModal.psychologicalProfile} icon="📊" />
              <AnimatePresence>
                {expandedSections.profile && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-ocean-900/30 border border-ocean-800 rounded-lg p-6 space-y-4"
                  >
                    {profile.profileType === 'template' && (
                      <>
                        <div>
                          <p className="text-ocean-300 font-semibold mb-2">{t.personDetailsModal.psychologicalTraits}</p>
                          <p className="text-ocean-200 text-sm">{profile.psychologicalTraits || '—'}</p>
                        </div>
                        <div>
                          <p className="text-ocean-300 font-semibold mb-2">{t.personDetailsModal.coreWounds}</p>
                          <p className="text-ocean-200 text-sm">{profile.coreWounds || '—'}</p>
                        </div>
                        <div>
                          <p className="text-ocean-300 font-semibold mb-2">{t.personDetailsModal.copingMechanisms}</p>
                          <p className="text-ocean-200 text-sm">{profile.copingMechanisms || '—'}</p>
                        </div>
                      </>
                    )}
                    {profile.profileType === 'custom' && (
                      <div>
                        <p className="text-ocean-300 font-semibold mb-2">{t.personDetailsModal.description}</p>
                        <p className="text-ocean-200 text-sm whitespace-pre-wrap">{profile.description || '—'}</p>
                      </div>
                    )}
                    <p className="text-ocean-500 text-xs border-t border-ocean-700 pt-3">
                      {t.personDetailsModal.created} {new Date(profile.createdAt).toLocaleDateString()}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ACTIONS SECTION */}
          <div className="space-y-3">
            <SectionHeader section="actions" label={t.personDetailsModal.actions} icon="⚙️" />
            <AnimatePresence>
              {expandedSections.actions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-ocean-900/30 border border-ocean-800 rounded-lg p-6"
                >
                  <button
                    onClick={handleDelete}
                    className="w-full py-3 px-4 bg-red-900/50 hover:bg-red-900/70 border border-red-700 text-red-300 hover:text-red-200 rounded-lg transition-colors font-semibold flex items-center gap-2 justify-center"
                  >
                    <Trash2 className="w-5 h-5" />
                    {t.personDetailsModal.deleteMember}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-ocean-900/50 border-t border-ocean-700 px-8 py-4 flex gap-3 justify-end sticky bottom-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
          >
            {t.personDetailsModal.close}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
