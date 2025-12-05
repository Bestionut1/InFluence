/**
 * ReportPage - Dedicated page for genogram analysis reports
 * Shows psychological insights, family patterns, and statistics
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { useGenogramStore } from '../store/genogramStore';
import { generateStatistics } from '../services/reportGenerator';
import { ReportPanel } from '../components/ReportPanel';
import { AppHeader } from '../components/layout/AppHeader';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import type { GenogramReport } from '../services/reportGenerator';

export const ReportPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const t = useTranslation();
  
  const { loadGenogram, people, relations } = useGenogramStore();
  const [report, setReport] = useState<GenogramReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initReport = async () => {
      try {
        setIsLoading(true);
        
        // Load genogram if needed
        if (id && id !== 'new') {
          await loadGenogram(id);
        }

        // Generate statistics
        const stats = generateStatistics(people, relations);
        setReport(stats);
      } catch (error) {
        console.error('Failed to load report:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initReport();
  }, [id, loadGenogram, people, relations]);

  return (
    <div className="min-h-screen bg-slate-950 page-enter">
      <AppHeader showLogo showUserMenu sticky />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">
                {t.report.title}
              </h1>
              <p className="text-slate-400 mt-1">
                Psychological insights and family patterns analysis
              </p>
            </div>
          </div>
        </motion.div>

        {/* Report Panel - Full Page with Scroll */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl"
        >
          <ReportPanel report={report} isLoading={isLoading} />
        </motion.div>
      </main>
    </div>
  );
};
