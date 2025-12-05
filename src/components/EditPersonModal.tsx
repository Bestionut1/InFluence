import { useState, useEffect } from 'react';
import { useGenogramStore } from '../store/genogramStore';
import { X, Plus, Trash2, ChevronDown, Unlink2, Copy, Star, AlertCircle } from 'lucide-react';
import type { Person } from '../types/genogram';
import { motion, AnimatePresence } from 'framer-motion';

interface EditPersonModalProps {
  person: Person | null;
  isOpen: boolean;
  onClose: () => void;
}

type SectionType = 'basic' | 'medical' | 'events' | 'notes' | 'image' | 'other' | 'actions' | 'relationships';

export const EditPersonModal = ({ person, isOpen, onClose }: EditPersonModalProps) => {
  const { updatePerson, removePerson, relations, removeRelation } = useGenogramStore();
  
  const [formData, setFormData] = useState<Partial<Person>>(person || {});
  const [expandedSections, setExpandedSections] = useState<Record<SectionType, boolean>>({
    basic: true,
    medical: false,
    events: false,
    notes: false,
    image: false,
    other: false,
    actions: false,
    relationships: false,
  });
  const [newAttribute, setNewAttribute] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newEvent, setNewEvent] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (person) {
      setFormData(person);
    }
  }, [person, isOpen]);

  if (!isOpen || !person) return null;

  const handleSave = () => {
    updatePerson(person.id, formData);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`Delete ${person.name}? This action cannot be undone.`)) {
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

  const handleTogglePrincipal = () => {
    setFormData({
      ...formData,
      isPrincipal: !formData.isPrincipal,
    });
  };

  // Get all relations for this person
  const personRelations = relations.filter(
    (rel) => rel.sourceId === person.id || rel.targetId === person.id
  );

  const getRelationDetails = (rel: any) => {
    const isSource = rel.sourceId === person.id;
    const otherPersonId = isSource ? rel.targetId : rel.sourceId;
    const direction = isSource ? '→' : '←';
    return { otherPersonId, direction };
  };

  const toggleSection = (section: SectionType) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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

  const addCondition = () => {
    if (newCondition.trim()) {
      setFormData({
        ...formData,
        medicalConditions: [...(formData.medicalConditions || []), newCondition],
      });
      setNewCondition('');
    }
  };

  const removeCondition = (index: number) => {
    setFormData({
      ...formData,
      medicalConditions: formData.medicalConditions?.filter((_, i) => i !== index),
    });
  };

  const addEvent = () => {
    if (newEvent.trim()) {
      setFormData({
        ...formData,
        significantEvents: [...(formData.significantEvents || []), newEvent],
      });
      setNewEvent('');
    }
  };

  const removeEvent = (index: number) => {
    setFormData({
      ...formData,
      significantEvents: formData.significantEvents?.filter((_, i) => i !== index),
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({
          ...formData,
          profileImage: event.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
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
          <div>
            <h2 className="text-3xl font-bold text-ocean-100">✏️ Edit Member</h2>
            <p className="text-ocean-400 text-sm mt-1">{formData.name}</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-ocean-400 hover:text-white hover:bg-ocean-700 p-3 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Accordion Sections */}
        <div className="overflow-y-auto flex-1 p-8 space-y-4">
          {/* BASIC INFO SECTION */}
          <div className="space-y-3">
            <SectionHeader section="basic" label="Basic Information" icon="👤" />
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
                      <label className="block text-sm font-semibold text-ocean-300 mb-2">Full Name</label>
                      <input 
                        type="text" 
                        className="w-full bg-ocean-900/50 border border-ocean-700 rounded-lg p-3 text-white focus:border-ocean-500 outline-none transition-all"
                        value={formData.name || ''}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="Enter name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-ocean-300 mb-2">Age (years)</label>
                      <input 
                        type="number" 
                        className="w-full bg-ocean-900/50 border border-ocean-700 rounded-lg p-3 text-white focus:border-ocean-500 outline-none transition-all"
                        value={formData.age || ''}
                        onChange={e => setFormData({...formData, age: parseInt(e.target.value) || undefined})}
                        placeholder="Age"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="edit-gender-select" className="block text-sm font-semibold text-ocean-300 mb-2">Gender</label>
                      <select 
                        id="edit-gender-select"
                        className="w-full bg-ocean-900/50 border border-ocean-700 rounded-lg p-3 text-white focus:border-ocean-500 outline-none transition-all"
                        value={formData.gender || 'unknown'}
                        onChange={e => setFormData({...formData, gender: e.target.value as any})}
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="non-binary">Non-Binary</option>
                        <option value="unknown">Unknown</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="edit-status-select" className="block text-sm font-semibold text-ocean-300 mb-2">Life Status</label>
                      <select 
                        id="edit-status-select"
                        className="w-full bg-ocean-900/50 border border-ocean-700 rounded-lg p-3 text-white focus:border-ocean-500 outline-none transition-all"
                        value={formData.status || 'living'}
                        onChange={e => setFormData({...formData, status: e.target.value as any})}
                      >
                        <option value="living">Living</option>
                        <option value="deceased">Deceased</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-ocean-300 mb-2">Birth Date</label>
                      <input 
                        type="date" 
                        className="w-full bg-ocean-900/50 border border-ocean-700 rounded-lg p-3 text-white focus:border-ocean-500 outline-none transition-all"
                        value={formData.dateOfBirth || ''}
                        onChange={e => setFormData({...formData, dateOfBirth: e.target.value})}
                      />
                    </div>
                    {formData.status === 'deceased' && (
                      <div>
                        <label className="block text-sm font-semibold text-ocean-300 mb-2">Death Date</label>
                        <input 
                          type="date" 
                          className="w-full bg-ocean-900/50 border border-ocean-700 rounded-lg p-3 text-white focus:border-ocean-500 outline-none transition-all"
                          value={formData.dateOfDeath || ''}
                          onChange={e => setFormData({...formData, dateOfDeath: e.target.value})}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* MEDICAL SECTION */}
          <div className="space-y-3">
            <SectionHeader section="medical" label="Medical & Psychological" icon="⚕️" />
            <AnimatePresence>
              {expandedSections.medical && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-ocean-900/30 border border-ocean-800 rounded-lg p-6 space-y-4"
                >
                  <div>
                    <label className="block text-sm font-semibold text-ocean-300 mb-2">Psychological Attributes</label>
                    <div className="flex gap-2 mb-3">
                      <input 
                        type="text" 
                        placeholder="e.g., anxiety, depression, resilience"
                        className="flex-1 bg-ocean-900/50 border border-ocean-700 rounded-lg p-3 text-white focus:border-ocean-500 outline-none transition-all"
                        value={newAttribute}
                        onChange={e => setNewAttribute(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && addAttribute()}
                      />
                      <button 
                        onClick={addAttribute} 
                        className="bg-ocean-700 hover:bg-ocean-600 text-white px-4 py-3 rounded-lg transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.attributes?.map((attr, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          className="flex items-center gap-2 bg-ocean-700/50 px-3 py-1 rounded-full border border-ocean-600"
                        >
                          <span className="text-ocean-100 text-sm">{attr}</span>
                          <button 
                            onClick={() => removeAttribute(idx)} 
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-ocean-300 mb-2">Medical Conditions</label>
                    <div className="flex gap-2 mb-3">
                      <input 
                        type="text" 
                        placeholder="e.g., diabetes, hypertension"
                        className="flex-1 bg-ocean-900/50 border border-ocean-700 rounded-lg p-3 text-white focus:border-ocean-500 outline-none transition-all"
                        value={newCondition}
                        onChange={e => setNewCondition(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && addCondition()}
                      />
                      <button 
                        onClick={addCondition} 
                        className="bg-red-700/70 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.medicalConditions?.map((condition, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          className="flex items-center gap-2 bg-red-900/50 px-3 py-1 rounded-full border border-red-700"
                        >
                          <span className="text-red-100 text-sm">{condition}</span>
                          <button 
                            onClick={() => removeCondition(idx)} 
                            className="text-red-300 hover:text-red-200"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-ocean-300 mb-2">Occupation</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Engineer, Teacher"
                      className="w-full bg-ocean-900/50 border border-ocean-700 rounded-lg p-3 text-white focus:border-ocean-500 outline-none transition-all"
                      value={formData.occupation || ''}
                      onChange={e => setFormData({...formData, occupation: e.target.value})}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* EVENTS SECTION */}
          <div className="space-y-3">
            <SectionHeader section="events" label="Significant Life Events" icon="📍" />
            <AnimatePresence>
              {expandedSections.events && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-ocean-900/30 border border-ocean-800 rounded-lg p-6 space-y-3"
                >
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g., divorce, migration, achievement"
                      className="flex-1 bg-ocean-900/50 border border-ocean-700 rounded-lg p-3 text-white focus:border-ocean-500 outline-none transition-all"
                      value={newEvent}
                      onChange={e => setNewEvent(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && addEvent()}
                    />
                    <button 
                      onClick={addEvent} 
                      className="bg-yellow-700/70 hover:bg-yellow-700 text-white px-4 py-3 rounded-lg transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.significantEvents?.map((event, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex items-center justify-between gap-2 bg-yellow-900/40 px-4 py-2 rounded-lg border border-yellow-800"
                      >
                        <span className="text-yellow-100">{event}</span>
                        <button 
                          onClick={() => removeEvent(idx)} 
                          className="text-yellow-400 hover:text-yellow-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* NOTES SECTION */}
          <div className="space-y-3">
            <SectionHeader section="notes" label="Clinical Notes" icon="📝" />
            <AnimatePresence>
              {expandedSections.notes && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-ocean-900/30 border border-ocean-800 rounded-lg p-6"
                >
                  <textarea 
                    className="w-full bg-ocean-900/50 border border-ocean-700 rounded-lg p-4 text-white focus:border-ocean-500 outline-none transition-all h-48 resize-none"
                    placeholder="Clinical observations, family dynamics, behavioral patterns, therapist notes..."
                    value={formData.notes || ''}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* IMAGE SECTION */}
          <div className="space-y-3">
            <SectionHeader section="image" label="Profile Image" icon="📷" />
            <AnimatePresence>
              {expandedSections.image && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-ocean-900/30 border border-ocean-800 rounded-lg p-6 space-y-4"
                >
                  <div className="bg-ocean-900/50 border-2 border-dashed border-ocean-700 rounded-lg p-6 text-center">
                    <label className="flex flex-col items-center gap-3 cursor-pointer">
                      <div className="text-4xl">📷</div>
                      <div>
                        <p className="text-ocean-200 font-semibold">Upload Image</p>
                        <p className="text-ocean-400 text-xs">Click to browse</p>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>

                  {formData.profileImage && (
                    <div className="text-center">
                      <img 
                        src={formData.profileImage} 
                        alt="Profile" 
                        className="w-32 h-32 rounded-lg object-cover mx-auto mb-3 border border-ocean-600"
                      />
                      <button 
                        onClick={() => setFormData({...formData, profileImage: undefined})}
                        className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2 mx-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RELATIONSHIPS SECTION */}
          <div className="space-y-3">
            <SectionHeader section="relationships" label="Family Relationships" icon="👨‍👩‍👧‍👦" />
            <AnimatePresence>
              {expandedSections.relationships && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-ocean-900/30 border border-ocean-800 rounded-lg p-6 space-y-3"
                >
                  {personRelations.length === 0 ? (
                    <p className="text-ocean-400 text-sm italic text-center py-4">No relationships yet</p>
                  ) : (
                    <div className="space-y-2">
                      {personRelations.map((rel) => {
                        const { otherPersonId, direction } = getRelationDetails(rel);
                        return (
                          <motion.div
                            key={rel.id}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="flex items-center justify-between p-3 bg-ocean-800/40 hover:bg-ocean-800/60 rounded-lg border border-ocean-700 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-ocean-400 text-sm font-semibold">{rel.type}</span>
                                <span className="text-ocean-500">{direction}</span>
                                <span className="text-ocean-300 text-sm truncate">ID: {otherPersonId}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteRelation(rel.id)}
                              className="p-2 hover:bg-red-900/50 text-red-400 hover:text-red-300 rounded transition-colors flex-shrink-0 ml-2"
                              title="Delete relationship"
                            >
                              <Unlink2 className="w-4 h-4" />
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                  <p className="text-ocean-400 text-xs italic mt-3 pt-3 border-t border-ocean-700">
                    💡 Relationships can be added from the genogram canvas by drawing connections
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ACTIONS SECTION */}
          <div className="space-y-3">
            <SectionHeader section="actions" label="Quick Actions" icon="⚡" />
            <AnimatePresence>
              {expandedSections.actions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-ocean-900/30 border border-ocean-800 rounded-lg p-6 space-y-4"
                >
                  {/* Quick Actions Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Copy ID */}
                    <button
                      onClick={copyIdToClipboard}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                        copiedId
                          ? 'bg-green-900/40 border-green-600 text-green-300'
                          : 'bg-ocean-800/40 border-ocean-700 hover:bg-ocean-800/60 text-ocean-300 hover:text-ocean-100'
                      }`}
                    >
                      <Copy className="w-4 h-4" />
                      <span className="text-sm font-semibold">{copiedId ? 'Copied!' : 'Copy ID'}</span>
                    </button>

                    {/* Toggle Principal Member */}
                    <button
                      onClick={handleTogglePrincipal}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                        formData.isPrincipal
                          ? 'bg-yellow-900/40 border-yellow-600 text-yellow-300'
                          : 'bg-ocean-800/40 border-ocean-700 hover:bg-ocean-800/60 text-ocean-300 hover:text-ocean-100'
                      }`}
                    >
                      <Star className="w-4 h-4" />
                      <span className="text-sm font-semibold">{formData.isPrincipal ? 'Principal ✓' : 'Set Principal'}</span>
                    </button>
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-300">
                        <p className="font-semibold mb-1">Member Statistics</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Total Relationships: <span className="font-semibold text-blue-200">{personRelations.length}</span></li>
                          <li>• Gender: <span className="font-semibold text-blue-200">{formData.gender}</span></li>
                          <li>• Status: <span className="font-semibold text-blue-200">{formData.status === 'deceased' ? '🪦 Deceased' : '✅ Living'}</span></li>
                          <li>• ID: <span className="font-semibold text-blue-200 text-xs break-all">{person.id}</span></li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="border-t border-ocean-700 pt-4">
                    <p className="text-red-400 text-sm font-semibold mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Danger Zone
                    </p>
                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-3 bg-red-900/40 hover:bg-red-900/60 border border-red-700 hover:border-red-600 text-red-300 hover:text-red-200 rounded-lg transition-all flex items-center justify-center gap-2 font-semibold"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Member
                    </button>
                    <p className="text-xs text-red-400/70 mt-2 text-center">This action cannot be undone</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* OTHER SECTION */}
          <div className="space-y-3">
            <SectionHeader section="other" label="Other Options" icon="⭐" />
            <AnimatePresence>
              {expandedSections.other && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-ocean-900/30 border border-ocean-800 rounded-lg p-6"
                >
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 bg-ocean-900 border border-ocean-600 rounded cursor-pointer accent-ocean-500"
                      checked={formData.isPrincipal || false}
                      onChange={e => setFormData({...formData, isPrincipal: e.target.checked})}
                    />
                    <div>
                      <p className="text-ocean-200 font-semibold">Mark as Principal Member</p>
                      <p className="text-ocean-400 text-xs">Centered on canvas</p>
                    </div>
                  </label>
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
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-ocean-600 hover:bg-ocean-500 text-white rounded-lg font-semibold transition-colors"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
};
