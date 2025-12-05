import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, AlertTriangle, ChevronDown } from 'lucide-react';
import type { ValidationResult } from '../utils/genogramValidation';
import { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface ValidationPanelProps {
  result: ValidationResult | null;
}

export const ValidationPanel = ({ result }: ValidationPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const t = useTranslation();
  
  if (!result || (result.errors.length === 0 && result.warnings.length === 0)) {
    return null;
  }

  const errorCount = result.errors.length;
  const warningCount = result.warnings.length;
  const hasErrors = errorCount > 0;
  const hasWarnings = warningCount > 0;

  const getSeverityColor = (severity: 'low' | 'medium' | 'high'): string => {
    switch (severity) {
      case 'high':
        return 'bg-red-500/20 border-red-500/50 text-red-300';
      case 'medium':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
      case 'low':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
      default:
        return 'bg-slate-500/20 border-slate-500/50 text-slate-300';
    }
  };

  const getSeverityIcon = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return <AlertCircle className="w-4 h-4 flex-shrink-0" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 flex-shrink-0" />;
      case 'low':
        return <AlertTriangle className="w-4 h-4 flex-shrink-0 opacity-60" />;
      default:
        return <AlertTriangle className="w-4 h-4 flex-shrink-0" />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-0 left-0 right-0 bg-slate-900/30 backdrop-blur border-t border-slate-700/40 shadow-lg z-10"
      >
        {/* Header */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="cursor-pointer px-4 py-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            {hasErrors ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-sm font-medium">
                  <AlertCircle className="w-4 h-4" />
                  {errorCount} {errorCount !== 1 ? t.validation.errors : t.validation.error}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/50 rounded text-green-300 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                {t.validation.valid}
              </div>
            )}
            
            {hasWarnings && (
              <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded text-yellow-300 text-sm font-medium">
                <AlertTriangle className="w-4 h-4" />
                {warningCount} {warningCount !== 1 ? t.validation.warnings : t.validation.warning}
              </div>
            )}
          </div>
          
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-slate-400" />
          </motion.div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-slate-700 max-h-96 overflow-y-auto"
            >
              {/* Errors Section */}
              {hasErrors && (
                <div className="p-4 space-y-3 border-b border-slate-700">
                  <h3 className="text-sm font-bold text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {t.validation.errors} ({errorCount})
                  </h3>
                  <div className="space-y-2">
                    {result.errors.map((error, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`p-3 rounded border flex items-start gap-3 ${getSeverityColor(error.severity)}`}
                      >
                        {getSeverityIcon(error.severity)}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{error.message}</div>
                          {error.personId && (
                            <div className="text-xs opacity-75 mt-1">
                              {t.validation.personId}: {error.personId}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings Section */}
              {hasWarnings && (
                <div className="p-4 space-y-3">
                  <h3 className="text-sm font-bold text-yellow-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {t.validation.warnings} ({warningCount})
                  </h3>
                  <div className="space-y-2">
                    {result.warnings.map((warning, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`p-3 rounded border flex items-start gap-3 ${getSeverityColor(warning.severity)}`}
                      >
                        {getSeverityIcon(warning.severity)}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{warning.message}</div>
                          {warning.personId && (
                            <div className="text-xs opacity-75 mt-1">
                              {t.validation.personId}: {warning.personId}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};
