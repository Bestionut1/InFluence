/**
 * GenogramCard - Memoized display card for a single genogram
 * Shows title, member count, last modified, and action menu
 */

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, GitBranch, MoreVertical } from 'lucide-react';
import type { GenogramDocument } from '../../services/firestore';

interface GenogramCardProps {
  genogram: GenogramDocument;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onShare?: (id: string) => void;
  isDeleting?: boolean;
}

/**
 * Memoized card component to prevent unnecessary re-renders
 */
export const GenogramCard = memo<GenogramCardProps>(
  ({ genogram, onOpen, onDelete, onShare, isDeleting }) => {
    const [showMenu, setShowMenu] = React.useState(false);

    React.useEffect(() => {
      console.log('🎨 GenogramCard rendered:', {
        id: genogram.id,
        title: genogram.title,
        people: genogram.people?.length || 0,
        people_data: genogram.people || []
      });
    }, [genogram]);

    const formatDate = (date: unknown): string => {
      try {
        if (date instanceof Date) {
          return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        }
        if (typeof date === 'string') {
          return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        }
        if (typeof date === 'number') {
          return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        }
        if (date && typeof date === 'object' && 'toDate' in date) {
          return (date as { toDate(): Date }).toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        }
        return 'Unknown';
      } catch {
        return 'Unknown';
      }
    };

    const handleMenuClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowMenu(!showMenu);
    };

    const handleActionClick = (action: () => void) => {
      return (e: React.MouseEvent) => {
        e.stopPropagation();
        action();
        setShowMenu(false);
      };
    };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ duration: 0.3, type: 'spring', bounce: 0.3 }}
        className="h-full"
      >
        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="h-full relative"
        >
          <div
            className="h-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-2xl p-6 cursor-pointer group overflow-hidden relative border border-slate-700/50 shadow-lg hover:shadow-2xl transition-shadow"
            onClick={() => onOpen(genogram.id)}
          >
            {/* Animated background gradient overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-secondary-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={false}
            />

            {/* Corner accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl group-hover:bg-primary-500/20 transition-colors" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary-500/10 rounded-full blur-3xl group-hover:bg-secondary-500/20 transition-colors" />

            <div className="relative z-10 flex flex-col h-full">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <motion.div
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg"
                  whileHover={{ rotate: 10, scale: 1.15 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <GitBranch className="w-6 h-6 text-white" />
                </motion.div>
                <div className="flex items-center gap-2">
                  <motion.span
                    className="px-3 py-1 rounded-full bg-primary-500/30 text-primary-100 text-xs font-semibold backdrop-blur-sm border border-primary-400/30"
                    whileHover={{ scale: 1.1 }}
                  >
                    {genogram.people?.length || 0} members
                  </motion.span>
                  <motion.button
                    onClick={handleMenuClick}
                    className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title="More options"
                  >
                    <MoreVertical className="w-5 h-5 text-slate-400" />
                  </motion.button>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-white mb-1 line-clamp-2 group-hover:text-primary-200 transition-colors">
                {genogram.title}
              </h3>

              {/* Description */}
              {genogram.description && (
                <p className="text-sm text-slate-400 mb-4 line-clamp-2 flex-grow">
                  {genogram.description}
                </p>
              )}

              {/* Metadata Footer */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/50">
                    <Users className="w-4 h-4" />
                    <span>{genogram.people?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/50">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(genogram.updatedAt || genogram.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Menu - Floating Dropdown */}
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="absolute top-16 right-2 bg-slate-800/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl z-50 min-w-[180px] overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <motion.button
                  onClick={handleActionClick(() => onOpen(genogram.id))}
                  className="w-full text-left px-4 py-3 text-sm text-slate-200 hover:bg-primary-500/20 hover:text-primary-100 transition-all font-medium"
                  whileHover={{ x: 4 }}
                >
                  Open
                </motion.button>
                {onShare && (
                  <motion.button
                    onClick={handleActionClick(() => onShare(genogram.id))}
                    className="w-full text-left px-4 py-3 text-sm text-slate-200 hover:bg-secondary-500/20 hover:text-secondary-100 transition-all font-medium border-t border-slate-700/50"
                    whileHover={{ x: 4 }}
                  >
                    Share
                  </motion.button>
                )}
                <motion.button
                  onClick={handleActionClick(() => onDelete(genogram.id))}
                  disabled={isDeleting}
                  className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all font-medium border-t border-slate-700/50 disabled:opacity-50"
                  whileHover={{ x: 4 }}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison: only re-render if essential props change
    return (
      prevProps.genogram.id === nextProps.genogram.id &&
      prevProps.genogram.title === nextProps.genogram.title &&
      prevProps.genogram.people?.length === nextProps.genogram.people?.length &&
      prevProps.isDeleting === nextProps.isDeleting
    );
  }
);

GenogramCard.displayName = 'GenogramCard';
