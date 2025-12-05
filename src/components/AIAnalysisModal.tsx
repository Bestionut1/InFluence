import { useState } from 'react';
import { useGenogramStore } from '../store/genogramStore';
import { analyzeGenogram } from '../services/ai';
import { X, Sparkles, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import ReactMarkdown from 'react-markdown';

export const AIAnalysisModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { people, relations } = useGenogramStore();
  const t = useTranslation();
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    // Pass empty string if user wants to use Mock mode (or just leave blank)
    // In a real app, we might check if they have a saved key or use a backend proxy.
    const analysis = await analyzeGenogram({ people, relations }, apiKey);
    setResult(analysis);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="bg-deep-surface border border-ocean-700 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        <div className="p-6 border-b border-ocean-800 flex justify-between items-center bg-ocean-900/20">
          <h3 className="text-2xl font-light text-white flex items-center gap-2">
            <Sparkles className="text-purple-400" />
            {t.aiAnalysis.title}
          </h3>
          <button onClick={onClose} className="text-ocean-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {!result ? (
            <div className="space-y-6">
               <p className="text-ocean-100">
                 {t.aiAnalysis.analysisDescription}
               </p>
               
               <div className="bg-blue-900/20 p-4 rounded border border-blue-500/30 text-sm text-blue-200">
                 <p className="font-bold mb-1 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> {t.aiAnalysis.privacyNote}</p>
                 {t.aiAnalysis.privacyMessage}
               </div>

               <div>
                 <label className="block text-sm text-ocean-300 mb-2">{t.aiAnalysis.apiKeyLabel}</label>
                 <input 
                   type="password" 
                   value={apiKey}
                   onChange={(e) => setApiKey(e.target.value)}
                   placeholder={t.aiAnalysis.apiKeyPlaceholder}
                   className="w-full bg-deep border border-ocean-800 rounded p-3 text-white focus:border-purple-500 outline-none transition-all"
                 />
               </div>

               <button 
                 onClick={handleAnalyze} 
                 disabled={loading}
                 className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50"
               >
                 {loading ? t.aiAnalysis.analyzing : t.aiAnalysis.analyzeButton}
               </button>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none">
                <ReactMarkdown>{result}</ReactMarkdown>
                
                <div className="mt-8 pt-4 border-t border-ocean-800">
                    <button 
                        onClick={() => setResult(null)}
                        className="text-ocean-400 hover:text-white underline text-sm"
                    >
                        {t.aiAnalysis.runNewAnalysis}
                    </button>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
