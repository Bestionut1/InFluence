import React from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CollapsibleMetadataProps {
  isExpanded: boolean;
  onToggle: () => void;
  hasData?: boolean;
  children: React.ReactNode;
}

export const CollapsibleMetadata = ({
  isExpanded,
  onToggle,
  hasData = false,
  children,
}: CollapsibleMetadataProps) => {
  return (
    <div className="space-y-2">
      {/* Header with Toggle */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 bg-ocean-900/40 border border-ocean-800/50 rounded-lg hover:bg-ocean-900/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          {hasData && (
            <span className="inline-block w-2 h-2 bg-teal-400 rounded-full"></span>
          )}
          <span className="text-sm font-semibold text-ocean-300">Additional Details</span>
          <span className="text-xs text-ocean-400">(optional)</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-ocean-400 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Collapsible Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-deep border border-ocean-800 rounded-lg space-y-4 border-t-0 rounded-t-none">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
