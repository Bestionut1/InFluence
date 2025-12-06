import { useState } from 'react';
import { useGenogramStore } from '../store/genogramStore';
import { AnimatedModal } from '../components/ui/AnimatedModal';
import { AnimatedButton } from '../components/ui/AnimatedButton';
import { useTranslation } from '../hooks/useTranslation';
import { generateShortId } from '../utils/uuid';
import type { Person, Gender, PersonStatus } from '../types/genogram';

export const AddPersonModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const t = useTranslation();
  const addPerson = useGenogramStore((state) => state.addPerson);
  const [formData, setFormData] = useState<Partial<Person>>({
    name: '',
    age: undefined,
    gender: 'unknown',
    status: 'living',
    attributes: [],
    isPrincipal: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;
    
    setIsSubmitting(true);
    try {
      addPerson({
        id: generateShortId(),
        name: formData.name,
        age: formData.age,
        gender: (formData.gender || 'unknown') as Gender,
        status: (formData.status || 'living') as PersonStatus,
        attributes: formData.attributes || [],
        isPrincipal: formData.isPrincipal || false,
      });
      
      setFormData({ name: '', age: undefined, gender: 'unknown', status: 'living', attributes: [], isPrincipal: false });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      title={t.editor.addPersonModal}
    >
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* BASIC INFORMATION SECTION */}
        <div>
          <h3 className="text-sm font-semibold text-ocean-200 mb-4 flex items-center gap-2">
            <div className="w-1 h-4 bg-ocean-400 rounded-sm"></div>
            Basic Information
          </h3>
          
          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-ocean-300 mb-2">{t.editor.name} *</label>
            <input 
              type="text" 
              className="w-full bg-deep border border-ocean-800 rounded-lg p-3 text-white placeholder-ocean-400 focus:border-ocean-500 outline-none input-focus-glow transition-colors"
              placeholder={t.editor.name}
              value={formData.name || ''}
              onChange={e => setFormData({...formData, name: e.target.value})}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Age & Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ocean-300 mb-2">{t.editor.age}</label>
              <input 
                type="number" 
                className="w-full bg-deep border border-ocean-800 rounded-lg p-3 text-white placeholder-ocean-400 focus:border-ocean-500 outline-none input-focus-glow transition-colors"
                placeholder={t.editor.age}
                value={formData.age || ''}
                onChange={e => setFormData({...formData, age: e.target.value ? parseInt(e.target.value) : undefined})}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="gender-select" className="block text-sm font-semibold text-ocean-300 mb-2">{t.editor.gender}</label>
              <select 
                id="gender-select"
                className="w-full bg-deep border border-ocean-800 rounded-lg p-3 text-white focus:border-ocean-500 outline-none input-focus-glow transition-colors"
                value={formData.gender || 'unknown'}
                onChange={e => setFormData({...formData, gender: e.target.value as Gender})}
                disabled={isSubmitting}
              >
                <option value="male">{t.editor.male}</option>
                <option value="female">{t.editor.female}</option>
                <option value="non-binary">{t.editor.nonBinary}</option>
                <option value="unknown">{t.editor.unknown}</option>
              </select>
            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="border-t border-ocean-800"></div>

        {/* HEALTH & BACKGROUND SECTION */}
        <div>
          <h3 className="text-sm font-semibold text-ocean-200 mb-4 flex items-center gap-2">
            <div className="w-1 h-4 bg-ocean-400 rounded-sm"></div>
            Health & Status
          </h3>

          {/* Status & Principal */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="status-select" className="block text-sm font-semibold text-ocean-300 mb-2">{t.editor.status}</label>
              <select 
                id="status-select"
                className="w-full bg-deep border border-ocean-800 rounded-lg p-3 text-white focus:border-ocean-500 outline-none input-focus-glow transition-colors"
                value={formData.status || 'living'}
                onChange={e => setFormData({...formData, status: e.target.value as PersonStatus})}
                disabled={isSubmitting}
              >
                <option value="living">Living</option>
                <option value="deceased">Deceased</option>
                <option value="pregnant">Pregnant (current)</option>
                <option value="miscarriage">Miscarriage</option>
                <option value="stillbirth">Stillbirth</option>
                <option value="abortion">Abortion</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer w-full bg-ocean-900/30 border border-ocean-800 rounded-lg p-3 hover:bg-ocean-900/50 transition-colors disabled:opacity-50"
                title={isSubmitting ? 'Submitting...' : 'Mark as principal/focus person'}>
                <input 
                  type="checkbox" 
                  className="w-4 h-4 accent-ocean-500"
                  checked={formData.isPrincipal || false}
                  onChange={e => setFormData({...formData, isPrincipal: e.target.checked})}
                  disabled={isSubmitting}
                />
                <span className="text-sm text-ocean-200 font-medium">Principal (Focus)</span>
              </label>
            </div>
          </div>
          
          {formData.isPrincipal && (
            <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg">
              <p className="text-xs text-yellow-200">⭐ This person will be the main focus of the genogram. Only one person can be principal.</p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-8 pt-4 border-t border-ocean-800">
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
            disabled={isSubmitting || !formData.name?.trim()}
            className="flex-1"
          >
            {isSubmitting ? t.common.loading : t.editor.addPerson}
          </AnimatedButton>
        </div>
      </form>
    </AnimatedModal>
  );
};
