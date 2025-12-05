import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGenogramStore } from '../store/genogramStore';
import { Loader, Download, RefreshCw, AlertTriangle, TrendingUp, Lightbulb, Shield, ArrowLeft, BarChart3, Brain } from 'lucide-react';
import { analyzeGenogramWithGemini } from '../services/geminiAi';
import { AppHeader } from '../components/layout/AppHeader';
import { motion } from 'framer-motion';
import { AnimatedButton } from '../components/ui/AnimatedButton';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { AnalysisResult } from '../services/geminiAi';

export const AIAnalysisPage = () => {
  const navigate = useNavigate();
  const { people, relations } = useGenogramStore();
  
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const genogramData = { people, relations };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const result = await analyzeGenogramWithGemini(genogramData, apiKey);
      setAnalysis(result);
    } catch (err) {
      setError('Failed to analyze genogram. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!analysis) return;
    setIsGeneratingPDF(true);
    
    try {
      const element = document.getElementById('analysis-report');
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

      pdf.save(`genogram-analysis-${new Date().toLocaleDateString()}.pdf`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950">
      <AppHeader showLogo showUserMenu sticky={true} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-300" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Brain className="w-8 h-8 text-indigo-400" />
                Genogram AI Analysis
              </h1>
              <p className="text-slate-400 text-sm mt-1">Powered by Generative AI - Family Pattern Recognition & Insights</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Family Members</p>
            <p className="text-2xl font-bold text-white mt-1">{people.length}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Relationships</p>
            <p className="text-2xl font-bold text-white mt-1">{relations.length}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Status</p>
            <p className="text-lg font-bold text-indigo-400 mt-1">{analysis ? 'Analyzed' : 'Ready'}</p>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6 flex items-gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Analyze Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <AnimatedButton
            onClick={handleAnalyze}
            disabled={loading || people.length === 0}
            variant="primary"
            className="w-full py-4 text-lg"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Analyzing Family Patterns...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Analyze Genogram with AI
              </>
            )}
          </AnimatedButton>
          {people.length === 0 && (
            <p className="text-slate-400 text-sm mt-2">Add family members to enable analysis</p>
          )}
        </motion.div>

        {/* Analysis Results */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            id="analysis-report"
            className="space-y-6 bg-white p-8 rounded-lg text-gray-900"
          >
            {/* Report Header */}
            <div className="border-b-2 border-gray-300 pb-6">
              <h2 className="text-2xl font-bold mb-2">Genogram Analysis Report</h2>
              <p className="text-gray-600 text-sm">Generated: {new Date().toLocaleDateString()}</p>
              <p className="text-gray-600 text-sm">Family Members Analyzed: {people.length} | Relationships: {relations.length}</p>
            </div>

            {/* Summary Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded"
            >
              <div className="flex items-start gap-3">
                <Brain className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Executive Summary</h3>
                  <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
                </div>
              </div>
            </motion.div>

            {/* Family Patterns */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded"
            >
              <div className="flex items-start gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <h3 className="text-lg font-bold text-gray-900">Family Patterns Identified</h3>
              </div>
              <div className="space-y-3 ml-9">
                {analysis.patterns.map((pattern, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-sm min-w-6">{i + 1}.</span>
                    <p className="text-gray-700">{pattern}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Trauma & Issues */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-red-50 border-l-4 border-red-500 p-6 rounded"
            >
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <h3 className="text-lg font-bold text-gray-900">Potential Trauma & Cycles</h3>
              </div>
              <div className="space-y-3 ml-9">
                {analysis.traumas.map((trauma, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-red-600 font-bold text-sm min-w-6">{i + 1}.</span>
                    <p className="text-gray-700">{trauma}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-green-50 border-l-4 border-green-500 p-6 rounded"
            >
              <div className="flex items-start gap-3 mb-4">
                <Lightbulb className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <h3 className="text-lg font-bold text-gray-900">Therapeutic Recommendations</h3>
              </div>
              <div className="space-y-3 ml-9">
                {analysis.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-green-600 font-bold text-sm min-w-6">{i + 1}.</span>
                    <p className="text-gray-700">{rec}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Clinical Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded"
            >
              <div className="flex items-start gap-3 mb-4">
                <Shield className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <h3 className="text-lg font-bold text-gray-900">Clinical Insights & Risk Factors</h3>
              </div>
              <p className="text-gray-700 leading-relaxed ml-9">
                Based on the family structure and reported conditions, consider evaluating resilience factors, protective relationships, and intergenerational healing opportunities. Early intervention in identified trauma cycles can significantly improve outcomes.
              </p>
            </motion.div>

            {/* Disclaimer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-yellow-50 border border-yellow-300 p-6 rounded"
            >
              <p className="text-yellow-900 text-sm leading-relaxed">
                <span className="font-bold">⚠️ Important Disclaimer:</span> {analysis.disclaimer}
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* Empty State */}
        {!analysis && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <BarChart3 className="w-16 h-16 text-slate-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No Analysis Yet</h3>
            <p className="text-slate-400">Click "Analyze Genogram with AI" to generate family pattern insights</p>
          </motion.div>
        )}

        {/* Download Button - Only visible when analysis exists and not in print view */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 flex gap-4 print:hidden"
          >
            <AnimatedButton
              onClick={generatePDF}
              disabled={isGeneratingPDF}
              variant="primary"
              className="flex-1"
            >
              <Download className="w-5 h-5" />
              {isGeneratingPDF ? 'Generating PDF...' : 'Download Report as PDF'}
            </AnimatedButton>
            <AnimatedButton
              onClick={() => window.print()}
              variant="secondary"
              className="flex-1"
            >
              <BarChart3 className="w-5 h-5" />
              Print Report
            </AnimatedButton>
          </motion.div>
        )}
      </main>
    </div>
  );
};
