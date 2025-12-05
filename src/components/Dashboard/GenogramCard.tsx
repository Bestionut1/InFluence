/**
 * GenogramCard - Memoized display card for a single genogram
 * Shows title, member count, last modified, and action menu
 */

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, GitBranch, MoreVertical } from 'lucide-react';
import { Card, CardBody } from '../ui/Card';
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

    const formatDate = (date: any) => {
      try {
        const d = typeof date.toDate === 'function' ? date.toDate() : new Date(date);
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          isHoverable
          className="group cursor-pointer h-full flex flex-col relative"
          onClick={() => onOpen(genogram.id)}
        >
          <CardBody className="flex-1 p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <GitBranch className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-full bg-primary-500/20 text-primary-200 text-xs font-medium">
                  {genogram.people?.length || 0} members
                </span>
                <button
                  onClick={handleMenuClick}
                  className="p-1 hover:bg-slate-700 rounded transition-colors opacity-0 group-hover:opacity-100"
                  title="More options"
                >
                  <MoreVertical className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-base font-semibold text-white mb-1 line-clamp-1 group-hover:text-primary-200 transition-colors">
              {genogram.title}
            </h3>

            {/* Description */}
            {genogram.description && (
              <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                {genogram.description}
              </p>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {genogram.people?.length || 0}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(genogram.updatedAt || genogram.createdAt)}
              </div>
            </div>
          </CardBody>

          {/* Action Menu - Dropdown */}
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute top-full right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 min-w-[160px]"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={handleActionClick(() => onOpen(genogram.id))}
                className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors first:rounded-t-lg"
              >
                Open
              </button>
              {onShare && (
                <button
                  onClick={handleActionClick(() => onShare(genogram.id))}
                  className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Share
                </button>
              )}
              <button
                onClick={handleActionClick(() => onDelete(genogram.id))}
                disabled={isDeleting}
                className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors last:rounded-b-lg disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </motion.div>
          )}
        </Card>
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
