import { memo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Users, Heart, BarChart3 } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import type { GenogramReport } from '../services/reportGenerator';

interface ReportPanelProps {
  report: GenogramReport | null;
  isLoading?: boolean;
}

export const ReportPanel = memo(({ report, isLoading = false }: ReportPanelProps) => {
  const t = useTranslation();
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mb-4" />
          <p className="text-slate-300">{t.report.generatingReport}</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{t.report.noGenogramData}</p>
          <p className="text-sm mt-2">{t.report.addFamilyMembers}</p>
        </div>
      </div>
    );
  }

  const { personStats, healthStats, relationshipStats, patterns } = report;

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-950 p-3 sm:p-4">
      <div className="w-full max-w-7xl mx-auto space-y-3 sm:space-y-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pb-2 border-b border-slate-700/50"
        >
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary-400" />
            {t.report.title}
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            {t.report.generatedAt} {report.generatedAt.toLocaleString()}
          </p>
        </motion.div>

        {/* Demographics Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/30 border border-slate-700/50 rounded p-4"
        >
          <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2 uppercase tracking-wide">
            <Users className="w-4 h-4 text-blue-400" />
            {t.report.familyDemographics}
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-slate-700/30 rounded p-2">
              <p className="text-slate-400 text-xs">{t.report.totalMembers}</p>
              <p className="text-lg font-bold text-white">{personStats.totalPeople}</p>
            </div>
            <div className="bg-slate-700/30 rounded p-2">
              <p className="text-slate-400 text-xs">{t.report.living}</p>
              <p className="text-lg font-bold text-green-400">{personStats.livingCount}</p>
            </div>
            <div className="bg-slate-700/30 rounded p-2">
              <p className="text-slate-400 text-xs">{t.report.deceased}</p>
              <p className="text-lg font-bold text-slate-300">{personStats.deceasedCount}</p>
            </div>
            <div className="bg-slate-700/30 rounded p-2">
              <p className="text-slate-400 text-xs">{t.report.averageAge}</p>
              <p className="text-lg font-bold text-yellow-400">{personStats.averageAge}</p>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
              <span className="text-slate-300">{personStats.maleCount} {t.report.male}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-pink-400 rounded-full" />
              <span className="text-slate-300">{personStats.femaleCount} {t.report.female}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full" />
              <span className="text-slate-300">{personStats.nonBinaryCount} {t.report.nonBinary}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-slate-400 rounded-full" />
              <span className="text-slate-300">{personStats.unknownGenderCount} {t.report.unknown}</span>
            </div>
          </div>
        </motion.section>

        {/* Health Profile Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/30 border border-slate-700/50 rounded p-4"
        >
          <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2 uppercase tracking-wide">
            <Heart className="w-4 h-4 text-red-400" />
            {t.report.healthProfile}
          </h2>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-slate-700/30 rounded p-2">
              <p className="text-slate-400 text-xs">{t.report.healthConditions}</p>
              <p className="text-lg font-bold text-red-400">{healthStats.totalHealthRecords}</p>
            </div>
            <div className="bg-slate-700/30 rounded p-2">
              <p className="text-slate-400 text-xs">{t.report.medications}</p>
              <p className="text-lg font-bold text-orange-400">{healthStats.totalMedicationRecords}</p>
            </div>
            <div className="bg-slate-700/30 rounded p-2">
              <p className="text-slate-400 text-xs">{t.report.uniqueConditions}</p>
              <p className="text-lg font-bold text-indigo-400">
                {Object.keys(healthStats.conditionFrequency).length}
              </p>
            </div>
          </div>

          {healthStats.topConditions.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wide">{t.report.mostCommonConditions}</h3>
              <div className="space-y-1">
                {healthStats.topConditions.slice(0, 5).map((item, idx) => (
                  <motion.div
                    key={item.condition}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.05 }}
                    className="flex items-center justify-between p-2 bg-slate-700/20 rounded text-xs"
                  >
                    <span className="text-slate-300">{item.condition}</span>
                    <span className="text-red-400 font-semibold">{item.count}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.section>

        {/* Relationships Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/30 border border-slate-700/50 rounded p-4"
        >
          <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2 uppercase tracking-wide">
            <Users className="w-4 h-4 text-teal-400" />
            {t.report.relationshipNetwork}
          </h2>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-700/30 rounded p-2">
              <p className="text-slate-400 text-xs">{t.report.totalRelationships}</p>
              <p className="text-lg font-bold text-teal-400">{relationshipStats.totalRelations}</p>
            </div>
            <div className="bg-slate-700/30 rounded p-2">
              <p className="text-slate-400 text-xs">{t.report.avgConnections}</p>
              <p className="text-lg font-bold text-cyan-400">{relationshipStats.averageConnectionsPerPerson}</p>
            </div>
            {relationshipStats.mostConnectedPerson && (
              <div className="bg-slate-700/30 rounded p-2">
                <p className="text-slate-400 text-xs">{t.report.mostConnected}</p>
                <p className="text-xs font-semibold text-purple-400 truncate">
                  {relationshipStats.mostConnectedPerson.personName}
                </p>
                <p className="text-lg font-bold text-purple-300">
                  {relationshipStats.mostConnectedPerson.connectionCount}
                </p>
              </div>
            )}
          </div>
        </motion.section>

        {/* Patterns Section */}
        {patterns.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-800/30 border border-slate-700/50 rounded p-4"
          >
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2 uppercase tracking-wide">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              {t.report.identifiedPatterns} ({patterns.length})
            </h2>

            <div className="space-y-2">
              {patterns.map((pattern, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className="p-2 bg-slate-700/20 border border-slate-600/30 rounded text-xs"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white">{pattern.title}</h3>
                      <p className="text-slate-300 mt-0.5">{pattern.description}</p>
                      {pattern.clinicalNote && (
                        <p className="text-amber-300 mt-1 p-1 bg-amber-950/20 rounded">
                          💡 {pattern.clinicalNote}
                        </p>
                      )}
                      <div className="mt-1 flex gap-2 text-slate-400 text-xs">
                        <span>{(pattern.prevalence * 100).toFixed(0)}%</span>
                        <span>•</span>
                        <span>{pattern.affectedPeople.length} affected</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Empty State */}
        {patterns.length === 0 && healthStats.totalHealthRecords === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-slate-400 py-4 text-sm"
          >
            <p>{t.report.noPatterns}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
});
