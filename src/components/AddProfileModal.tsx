import { useState } from 'react';
import { useGenogramStore } from '../store/genogramStore';
import { useTranslation } from '../hooks/useTranslation';
import { X, ChevronRight } from 'lucide-react';
import { PROFILE_TEMPLATES, getAllTemplateCategories } from '../services/profileTemplates';
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
      id: Math.random().toString(36).substr(2, 9),
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
    // Also update person with template category for emoji display
    updatePerson(selectedPersonId, { templateCategory: category });
    resetModal();
  };

  const handleSaveCustom = () => {
    if (!customDescription.trim()) return;
    
    const profile: PersonProfile = {
      id: Math.random().toString(36).substr(2, 9),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-deep-surface border border-ocean-800 rounded-xl p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-ocean-100">
            {step === 'select-person' && t.addProfileModal.title}
            {step === 'select-method' && `${t.addProfileModal.profileFor} ${selectedPerson?.name}`}
            {step === 'templates' && t.addProfileModal.selectTemplate}
            {step === 'custom' && t.addProfileModal.customDescription}
          </h2>
          <button onClick={resetModal} className="text-ocean-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Step 1: Select Person */}
        {step === 'select-person' && (
          <div className="space-y-3">
            <p className="text-ocean-300 mb-4">{t.addProfileModal.selectMember}</p>
            {people.length === 0 ? (
              <p className="text-ocean-400 text-center py-8">{t.addProfileModal.noMembers}</p>
            ) : (
              people.map(person => (
                <button
                  key={person.id}
                  onClick={() => handleSelectPerson(person.id)}
                  className="w-full btn-gradient-primary py-3 px-4 rounded-lg text-left flex items-center justify-between group hover:shadow-lg"
                >
                  <span className="font-semibold">{person.name}</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              ))
            )}
          </div>
        )}

        {/* Step 2: Select Method */}
        {step === 'select-method' && (
          <div className="space-y-4">
            <p className="text-ocean-300 mb-6">{t.addProfileModal.chooseMethod}</p>
            
            <button
              onClick={() => setStep('templates')}
              className="w-full btn-gradient-primary p-6 rounded-lg text-left group hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg mb-2">{t.addProfileModal.templates}</h3>
                  <p className="text-sm opacity-90">{t.addProfileModal.templatesDesc}</p>
                </div>
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </div>
            </button>

            <button
              onClick={() => setStep('custom')}
              className="w-full btn-gradient-success p-6 rounded-lg text-left group hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg mb-2">{t.addProfileModal.custom}</h3>
                  <p className="text-sm opacity-90">{t.addProfileModal.customDesc}</p>
                </div>
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </div>
            </button>

            <button
              onClick={() => setStep('select-person')}
              className="btn-gradient-secondary w-full py-2 rounded-lg mt-4"
            >
              {t.addProfileModal.back}
            </button>
          </div>
        )}

        {/* Step 3: Templates */}
        {step === 'templates' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {getAllTemplateCategories().map(category => {
                const template = PROFILE_TEMPLATES[category];
                const translatedTemplate = t.profileTemplateCategories?.[category] || { name: template.name, description: template.description };
                return (
                  <button
                    key={category}
                    onClick={() => handleSelectTemplate(category)}
                    className="p-4 bg-gradient-to-br from-ocean-700/50 to-ocean-900/50 border border-ocean-700 rounded-lg hover:border-ocean-500 transition-all text-left group hover:shadow-lg"
                  >
                    <h3 className="font-semibold text-ocean-100 group-hover:text-white transition-colors">{translatedTemplate.name}</h3>
                    <p className="text-xs text-ocean-400 mt-1">{translatedTemplate.description}</p>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep('select-method')}
              className="btn-gradient-secondary w-full py-2 rounded-lg"
            >
              {t.addProfileModal.back}
            </button>
          </div>
        )}

        {/* Step 4: Custom Description */}
        {step === 'custom' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-ocean-300 mb-2">
                {t.addProfileModal.describeLabel.replace('{name}', selectedPerson?.name || 'Member')}
              </label>
              <textarea
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder={t.addProfileModal.descPlaceholder}
                className="w-full bg-deep border border-ocean-800 rounded-lg p-4 text-white placeholder-ocean-400 focus:border-ocean-500 outline-none input-focus-glow min-h-[200px] resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('select-method')}
                className="btn-gradient-secondary flex-1 py-2 rounded-lg"
              >
                {t.addProfileModal.back}
              </button>
              <button
                onClick={handleSaveCustom}
                disabled={!customDescription.trim()}
                className="btn-gradient-success flex-1 py-2 rounded-lg disabled:opacity-50"
              >
                {t.addProfileModal.saveProfile}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
