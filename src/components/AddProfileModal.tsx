import { useState } from 'react';
import { useGenogramStore } from '../store/genogramStore';
import { useTranslation } from '../hooks/useTranslation';
import { X, ChevronRight, Sparkles, Lightbulb, Brain, Zap } from 'lucide-react';
import { PROFILE_TEMPLATES, getAllTemplateCategories } from '../services/profileTemplates';
import { generateShortId } from '../utils/uuid';
import { motion, AnimatePresence } from 'framer-motion';
import type { TemplateCategory, PersonProfile } from '../types/genogram';

type Step = 'select-person' | 'select-method' | 'templates' | 'custom';

export const AddProfileModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const t = useTranslation();
  const { people, addProfile, updatePerson } = useGenogramStore();
  const [step, setStep] = useState<Step>('select-person');
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [customDescription, setCustomDescription] = useState('');

  const handleSelectPerson = (personId: string) => {
    setSelectedPersonId(personId);
    setStep('select-method');
  };

  const handleSelectTemplate = (category: TemplateCategory) => {
    const template = PROFILE_TEMPLATES[category];
    const profile: PersonProfile = {
      id: generateShortId(),
      personId: selectedPersonId,
      profileType: 'template',
      templateCategory: category,
      psychologicalTraits: template.psychologicalTraits,
      coreWounds: template.coreWounds,
      copingMechanisms: template.copingMechanisms,
      strengthsAndResources: template.strengthsAndResources,
      therapeuticRecommendations: template.therapeuticRecommendations,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    addProfile(profile);
    updatePerson(selectedPersonId, { templateCategory: category });
    resetModal();
  };

  const handleSaveCustom = () => {
    if (!customDescription.trim()) return;
    
    const profile: PersonProfile = {
      id: generateShortId(),
      personId: selectedPersonId,
      profileType: 'custom',
      description: customDescription,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    addProfile(profile);
    resetModal();
  };

  const resetModal = () => {
    setStep('select-person');
    setSelectedPersonId('');
    setCustomDescription('');
    onClose();
  };

  if (!isOpen) return null;

  const selectedPerson = people.find(p => p.id === selectedPersonId);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-lg"
          onClick={resetModal}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
            className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-700/50 rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background accent gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-transparent to-secondary-500/10 pointer-events-none rounded-3xl" />

            {/* Floating blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-500/10 rounded-full blur-3xl -ml-32 -mb-32" />

            {/* Close button */}
            <motion.button
              onClick={resetModal}
              className="absolute top-6 right-6 z-50 p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-6 h-6" />
            </motion.button>

            {/* Content */}
            <div className="relative z-10 p-8">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <div className="flex items-center gap-3 mb-2">
                  <motion.div
                    className="p-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl"
                    whileHover={{ rotate: 12, scale: 1.1 }}
                  >
                    <Sparkles className="w-6 h-6 text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white">
                    {step === 'select-person' && t.addProfileModal.title}
                    {step === 'select-method' && `Profile for ${selectedPerson?.name}`}
                    {step === 'templates' && 'Choose Template'}
                    {step === 'custom' && 'Custom Profile'}
                  </h2>
                </div>
                <p className="text-slate-400">
                  {step === 'select-person' && 'Select a family member to create a psychological profile'}
                  {step === 'select-method' && 'Choose between predefined templates or create a custom profile'}
                  {step === 'templates' && 'Pick a template that resonates with this person'}
                  {step === 'custom' && 'Describe this person in your own words'}
                </p>
              </motion.div>

              {/* Step 1: Select Person */}
              <AnimatePresence mode="wait">
                {step === 'select-person' && (
                  <motion.div
                    key="select-person"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-3"
                  >
                    {people.length === 0 ? (
                      <motion.div
                        className="text-center py-12 px-6 bg-slate-800/30 rounded-2xl border border-slate-700/50"
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                      >
                        <Brain className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
                        <p className="text-slate-400">{t.addProfileModal.noMembers}</p>
                      </motion.div>
                    ) : (
                      people.map((person, idx) => (
                        <motion.button
                          key={person.id}
                          onClick={() => handleSelectPerson(person.id)}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="w-full bg-gradient-to-r from-slate-800/50 to-slate-900/50 hover:from-primary-500/20 hover:to-secondary-500/20 border border-slate-700/50 hover:border-primary-500/50 py-4 px-6 rounded-2xl text-left flex items-center justify-between group transition-all shadow-lg hover:shadow-xl"
                        >
                          <span className="font-semibold text-white group-hover:text-primary-100">{person.name}</span>
                          <motion.div whileHover={{ x: 4 }} className="text-slate-400 group-hover:text-primary-300">
                            <ChevronRight className="w-5 h-5" />
                          </motion.div>
                        </motion.button>
                      ))
                    )}
                  </motion.div>
                )}

                {/* Step 2: Select Method */}
                {step === 'select-method' && (
                  <motion.div
                    key="select-method"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <motion.button
                      onClick={() => setStep('templates')}
                      className="w-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border border-blue-500/50 p-6 rounded-2xl text-left group hover:shadow-lg hover:shadow-blue-500/20 transition-all"
                      whileHover={{ y: -4 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="w-5 h-5 text-blue-300" />
                            <h3 className="font-bold text-lg text-white">{t.addProfileModal.templates}</h3>
                          </div>
                          <p className="text-sm text-slate-300">{t.addProfileModal.templatesDesc}</p>
                        </div>
                        <motion.div whileHover={{ x: 4 }} className="text-blue-300">
                          <ChevronRight className="w-6 h-6" />
                        </motion.div>
                      </div>
                    </motion.button>

                    <motion.button
                      onClick={() => setStep('custom')}
                      className="w-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-500/50 p-6 rounded-2xl text-left group hover:shadow-lg hover:shadow-green-500/20 transition-all"
                      whileHover={{ y: -4 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-5 h-5 text-green-300" />
                            <h3 className="font-bold text-lg text-white">{t.addProfileModal.custom}</h3>
                          </div>
                          <p className="text-sm text-slate-300">{t.addProfileModal.customDesc}</p>
                        </div>
                        <motion.div whileHover={{ x: 4 }} className="text-green-300">
                          <ChevronRight className="w-6 h-6" />
                        </motion.div>
                      </div>
                    </motion.button>

                    <motion.button
                      onClick={() => setStep('select-person')}
                      className="btn-gradient-secondary w-full py-3 rounded-xl mt-6 font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      ← {t.addProfileModal.back}
                    </motion.button>
                  </motion.div>
                )}

                {/* Step 3: Templates */}
                {step === 'templates' && (
                  <motion.div
                    key="templates"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {getAllTemplateCategories().map((category, idx) => {
                        const template = PROFILE_TEMPLATES[category];
                        const translatedTemplate = t.profileTemplateCategories?.[category] || { name: template.name, description: template.description };
                        return (
                          <motion.button
                            key={category}
                            onClick={() => handleSelectTemplate(category)}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="p-4 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 hover:border-primary-500/50 rounded-xl hover:shadow-lg transition-all text-left group"
                            whileHover={{ y: -2, scale: 1.02 }}
                          >
                            <h3 className="font-semibold text-slate-100 group-hover:text-primary-200 transition-colors">{translatedTemplate.name}</h3>
                            <p className="text-xs text-slate-400 mt-1">{translatedTemplate.description}</p>
                          </motion.button>
                        );
                      })}
                    </div>

                    <motion.button
                      onClick={() => setStep('select-method')}
                      className="btn-gradient-secondary w-full py-3 rounded-xl font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      ← {t.addProfileModal.back}
                    </motion.button>
                  </motion.div>
                )}

                {/* Step 4: Custom Description */}
                {step === 'custom' && (
                  <motion.div
                    key="custom"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-3">
                        {t.addProfileModal.describeLabel.replace('{name}', selectedPerson?.name || 'Member')}
                      </label>
                      <motion.textarea
                        value={customDescription}
                        onChange={(e) => setCustomDescription(e.target.value)}
                        placeholder={t.addProfileModal.descPlaceholder}
                        className="w-full bg-slate-800/50 border border-slate-700/50 focus:border-primary-500/50 rounded-xl p-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 min-h-[180px] resize-none transition-all"
                        whileFocus={{ scale: 1.01 }}
                      />
                    </div>

                    <div className="flex gap-3">
                      <motion.button
                        onClick={() => setStep('select-method')}
                        className="btn-gradient-secondary flex-1 py-3 rounded-xl font-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        ← {t.addProfileModal.back}
                      </motion.button>
                      <motion.button
                        onClick={handleSaveCustom}
                        disabled={!customDescription.trim()}
                        className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Save Profile ✓
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
