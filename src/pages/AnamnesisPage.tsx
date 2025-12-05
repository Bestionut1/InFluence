import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGenogramStore } from '../store/genogramStore';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, FileText, Plus, Trash2, Check } from 'lucide-react';
import { AnimatedButton } from '../components/ui/AnimatedButton';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface AnamnesisFormData {
  // Chief Complaint & History
  chiefComplaint: string;
  historyOfPresentIllness: string;
  
  // Past Medical History
  medicalHistory: string[];
  surgicalHistory: string[];
  
  // Medications & Allergies
  currentMedications: string[];
  allergies: string[];
  
  // Family History
  familyHistoryPsychiatric: string;
  familyHistoryMedical: string;
  
  // Social History
  occupationalStatus: string;
  educationLevel: string;
  maritalStatus: string;
  livingEnvironment: string;
  substanceUse: string;
  
  // Psychological History
  mentalHealthHistory: string;
  previousTreatment: string;
  traumaHistory: string;
  
  // Review of Systems
  reviewOfSystems: string;
  
  // Assessment & Plan
  currentAssessment: string;
  treatmentPlan: string;
  goals: string[];
}

const initialFormData: AnamnesisFormData = {
  chiefComplaint: '',
  historyOfPresentIllness: '',
  medicalHistory: [],
  surgicalHistory: [],
  currentMedications: [],
  allergies: [],
  familyHistoryPsychiatric: '',
  familyHistoryMedical: '',
  occupationalStatus: '',
  educationLevel: '',
  maritalStatus: '',
  livingEnvironment: '',
  substanceUse: '',
  mentalHealthHistory: '',
  previousTreatment: '',
  traumaHistory: '',
  reviewOfSystems: '',
  currentAssessment: '',
  treatmentPlan: '',
  goals: [],
};

export const AnamnesisPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { people } = useGenogramStore();
  
  const [formData, setFormData] = useState<AnamnesisFormData>(initialFormData);
  const [newHistoryItem, setNewHistoryItem] = useState('');
  const [newMedicationItem, setNewMedicationItem] = useState('');
  const [newAllergyItem, setNewAllergyItem] = useState('');
  const [newGoalItem, setNewGoalItem] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTab, setCurrentTab] = useState<'form' | 'preview'>('form');

  const person = people.find(p => p.id === id);

  if (!person) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Patient Not Found</h2>
          <AnimatedButton variant="primary" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </AnimatedButton>
        </div>
      </div>
    );
  }

  const handleAddHistoryItem = () => {
    if (newHistoryItem.trim()) {
      setFormData(prev => ({
        ...prev,
        medicalHistory: [...prev.medicalHistory, newHistoryItem]
      }));
      setNewHistoryItem('');
    }
  };

  const handleRemoveHistoryItem = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      medicalHistory: prev.medicalHistory.filter((_, i) => i !== idx)
    }));
  };

  const handleAddMedication = () => {
    if (newMedicationItem.trim()) {
      setFormData(prev => ({
        ...prev,
        currentMedications: [...prev.currentMedications, newMedicationItem]
      }));
      setNewMedicationItem('');
    }
  };

  const handleRemoveMedication = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      currentMedications: prev.currentMedications.filter((_, i) => i !== idx)
    }));
  };

  const handleAddAllergy = () => {
    if (newAllergyItem.trim()) {
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies, newAllergyItem]
      }));
      setNewAllergyItem('');
    }
  };

  const handleRemoveAllergy = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== idx)
    }));
  };

  const handleAddGoal = () => {
    if (newGoalItem.trim()) {
      setFormData(prev => ({
        ...prev,
        goals: [...prev.goals, newGoalItem]
      }));
      setNewGoalItem('');
    }
  };

  const handleRemoveGoal = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== idx)
    }));
  };

  const handleExportPDF = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById('anamnesis-preview');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${person.name}_Anamnesis_${new Date().toLocaleDateString()}.pdf`);
    } finally {
      setIsGenerating(false);
    }
  };

  const tabs = [
    { id: 'form', label: 'Patient Intake Form' },
    { id: 'preview', label: 'Clinical Report Preview' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-800/80 backdrop-blur border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-300" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Patient Anamnesis</h1>
                <p className="text-slate-400 text-sm">{person.name} - Clinical Assessment</p>
              </div>
            </div>
            <AnimatedButton
              variant="primary"
              onClick={handleExportPDF}
              disabled={isGenerating}
            >
              <Download className="w-4 h-4" />
              {isGenerating ? 'Generating...' : 'Export PDF'}
            </AnimatedButton>
          </div>

          {/* Tab Navigation */}
          <div className="mt-4 flex gap-2 border-b border-slate-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as 'form' | 'preview')}
                className={`px-4 py-2 text-sm font-medium transition-all border-b-2 ${
                  currentTab === tab.id
                    ? 'border-primary-500 text-primary-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'form' ? (
          // Form Tab
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Chief Complaint Section */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Chief Complaint & Presenting Problem
              </h2>
              <textarea
                value={formData.chiefComplaint}
                onChange={(e) => setFormData(prev => ({ ...prev, chiefComplaint: e.target.value }))}
                placeholder="Describe the primary reason for visit..."
                className="w-full bg-slate-700/30 border border-slate-600 rounded px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
              />
            </div>

            {/* History of Present Illness */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h2 className="text-lg font-bold text-white mb-4">History of Present Illness</h2>
              <textarea
                value={formData.historyOfPresentIllness}
                onChange={(e) => setFormData(prev => ({ ...prev, historyOfPresentIllness: e.target.value }))}
                placeholder="Detailed timeline and progression of symptoms..."
                className="w-full bg-slate-700/30 border border-slate-600 rounded px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={4}
              />
            </div>

            {/* Medical History */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h2 className="text-lg font-bold text-white mb-4">Past Medical History</h2>
              <div className="flex gap-2 mb-3">
                <input
                  id="new-history-item"
                  name="new-history-item"
                  type="text"
                  value={newHistoryItem}
                  onChange={(e) => setNewHistoryItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddHistoryItem()}
                  placeholder="Add condition..."
                  className="flex-1 bg-slate-700/30 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <AnimatedButton onClick={handleAddHistoryItem} variant="secondary" size="sm">
                  <Plus className="w-4 h-4" />
                </AnimatedButton>
              </div>
              <div className="space-y-2">
                {formData.medicalHistory.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-700/30 p-3 rounded border border-slate-600">
                    <span className="text-slate-300">{item}</span>
                    <button
                      onClick={() => handleRemoveHistoryItem(idx)}
                      className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Medications & Allergies */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Medications */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h2 className="text-lg font-bold text-white mb-4">Current Medications</h2>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newMedicationItem}
                    onChange={(e) => setNewMedicationItem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddMedication()}
                    placeholder="Add medication..."
                    className="flex-1 bg-slate-700/30 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                  <AnimatedButton onClick={handleAddMedication} variant="secondary" size="sm">
                    <Plus className="w-4 h-4" />
                  </AnimatedButton>
                </div>
                <div className="space-y-2">
                  {formData.currentMedications.map((med, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-700/30 p-2 rounded border border-slate-600 text-sm">
                      <span className="text-slate-300">{med}</span>
                      <button
                        onClick={() => handleRemoveMedication(idx)}
                        className="p-1 hover:bg-red-500/20 text-red-400 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Allergies */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h2 className="text-lg font-bold text-white mb-4">Allergies & Reactions</h2>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newAllergyItem}
                    onChange={(e) => setNewAllergyItem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddAllergy()}
                    placeholder="Add allergy..."
                    className="flex-1 bg-slate-700/30 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                  <AnimatedButton onClick={handleAddAllergy} variant="secondary" size="sm">
                    <Plus className="w-4 h-4" />
                  </AnimatedButton>
                </div>
                <div className="space-y-2">
                  {formData.allergies.map((allergy, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-700/30 p-2 rounded border border-slate-600 text-sm">
                      <span className="text-slate-300">{allergy}</span>
                      <button
                        onClick={() => handleRemoveAllergy(idx)}
                        className="p-1 hover:bg-red-500/20 text-red-400 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Family & Social History */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Family History */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h2 className="text-lg font-bold text-white mb-4">Family History - Psychiatric</h2>
                <textarea
                  value={formData.familyHistoryPsychiatric}
                  onChange={(e) => setFormData(prev => ({ ...prev, familyHistoryPsychiatric: e.target.value }))}
                  placeholder="Mental health conditions in family..."
                  className="w-full bg-slate-700/30 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  rows={4}
                />
              </div>

              {/* Social History */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h2 className="text-lg font-bold text-white mb-4">Social & Occupational History</h2>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formData.occupationalStatus}
                    onChange={(e) => setFormData(prev => ({ ...prev, occupationalStatus: e.target.value }))}
                    placeholder="Employment status..."
                    className="w-full bg-slate-700/30 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                  <input
                    type="text"
                    value={formData.educationLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, educationLevel: e.target.value }))}
                    placeholder="Education level..."
                    className="w-full bg-slate-700/30 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                  <input
                    type="text"
                    value={formData.maritalStatus}
                    onChange={(e) => setFormData(prev => ({ ...prev, maritalStatus: e.target.value }))}
                    placeholder="Marital status..."
                    className="w-full bg-slate-700/30 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Psychological History */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h2 className="text-lg font-bold text-white mb-4">Psychological & Trauma History</h2>
              <div className="space-y-3">
                <textarea
                  value={formData.mentalHealthHistory}
                  onChange={(e) => setFormData(prev => ({ ...prev, mentalHealthHistory: e.target.value }))}
                  placeholder="Mental health diagnosis history..."
                  className="w-full bg-slate-700/30 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  rows={3}
                />
                <textarea
                  value={formData.traumaHistory}
                  onChange={(e) => setFormData(prev => ({ ...prev, traumaHistory: e.target.value }))}
                  placeholder="Significant trauma or adverse events..."
                  className="w-full bg-slate-700/30 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  rows={3}
                />
              </div>
            </div>

            {/* Assessment & Treatment Plan */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h2 className="text-lg font-bold text-white mb-4">Clinical Assessment</h2>
                <textarea
                  value={formData.currentAssessment}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentAssessment: e.target.value }))}
                  placeholder="Current psychiatric assessment..."
                  className="w-full bg-slate-700/30 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  rows={5}
                />
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h2 className="text-lg font-bold text-white mb-4">Treatment Plan</h2>
                <textarea
                  value={formData.treatmentPlan}
                  onChange={(e) => setFormData(prev => ({ ...prev, treatmentPlan: e.target.value }))}
                  placeholder="Recommended interventions and treatment approach..."
                  className="w-full bg-slate-700/30 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  rows={5}
                />
              </div>
            </div>

            {/* Treatment Goals */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h2 className="text-lg font-bold text-white mb-4">Treatment Goals</h2>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newGoalItem}
                  onChange={(e) => setNewGoalItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
                  placeholder="Add treatment goal..."
                  className="flex-1 bg-slate-700/30 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <AnimatedButton onClick={handleAddGoal} variant="secondary" size="sm">
                  <Plus className="w-4 h-4" />
                </AnimatedButton>
              </div>
              <div className="space-y-2">
                {formData.goals.map((goal, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-700/30 p-3 rounded border border-slate-600">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-slate-300">{goal}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveGoal(idx)}
                      className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          // Preview Tab
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            id="anamnesis-preview"
            className="bg-white text-gray-900 p-8 rounded-lg shadow-lg max-w-4xl mx-auto"
          >
            <div className="border-b-2 border-gray-300 pb-6 mb-6">
              <h1 className="text-3xl font-bold">Clinical Anamnesis Report</h1>
              <p className="text-gray-600 mt-1">Patient Assessment & History</p>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Patient Name</p>
                  <p className="font-semibold">{person.name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Generated</p>
                  <p className="font-semibold">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {formData.chiefComplaint && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">Chief Complaint</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{formData.chiefComplaint}</p>
              </div>
            )}

            {formData.historyOfPresentIllness && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">History of Present Illness</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{formData.historyOfPresentIllness}</p>
              </div>
            )}

            {formData.medicalHistory.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">Past Medical History</h2>
                <ul className="list-disc list-inside space-y-1">
                  {formData.medicalHistory.map((item, idx) => (
                    <li key={idx} className="text-gray-700">{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {(formData.currentMedications.length > 0 || formData.allergies.length > 0) && (
              <div className="grid grid-cols-2 gap-6 mb-6">
                {formData.currentMedications.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold mb-2">Current Medications</h2>
                    <ul className="list-disc list-inside space-y-1">
                      {formData.currentMedications.map((med, idx) => (
                        <li key={idx} className="text-gray-700 text-sm">{med}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {formData.allergies.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold mb-2">Allergies</h2>
                    <ul className="list-disc list-inside space-y-1">
                      {formData.allergies.map((allergy, idx) => (
                        <li key={idx} className="text-gray-700 text-sm">{allergy}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {formData.currentAssessment && (
              <div className="mb-6 p-4 bg-gray-100 rounded">
                <h2 className="text-lg font-bold mb-2">Clinical Assessment</h2>
                <p className="text-gray-700 whitespace-pre-wrap text-sm">{formData.currentAssessment}</p>
              </div>
            )}

            {formData.treatmentPlan && (
              <div className="mb-6 p-4 bg-gray-100 rounded">
                <h2 className="text-lg font-bold mb-2">Treatment Plan</h2>
                <p className="text-gray-700 whitespace-pre-wrap text-sm">{formData.treatmentPlan}</p>
              </div>
            )}

            {formData.goals.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-bold mb-2">Treatment Goals</h2>
                <ul className="list-disc list-inside space-y-1">
                  {formData.goals.map((goal, idx) => (
                    <li key={idx} className="text-gray-700 text-sm">{goal}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-600">
              <p>This document is confidential medical information prepared for clinical use only.</p>
              <p>Generated by PsychoGenealogy Clinical System</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AnamnesisPage;
