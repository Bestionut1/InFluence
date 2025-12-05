/**
 * GenogramList - Renders memoized list of GenogramCards
 * Handles search, sort, and layout
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, Search } from 'lucide-react';
import { Card, CardBody } from '../ui/Card';
import { GenogramCard } from './GenogramCard';
import type { GenogramDocument } from '../../services/firestore';

type SortOption = 'recent' | 'name' | 'members';

interface GenogramListProps {
  genograms: GenogramDocument[];
  searchQuery: string;
  sortBy: SortOption;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onShare?: (id: string) => void;
  deletingId?: string;
}

export const GenogramList = React.memo<GenogramListProps>(
  ({
    genograms,
    searchQuery,
    sortBy,
    onOpen,
    onDelete,
    onShare,
    deletingId,
  }) => {
    // Filter and sort genograms
    const filtered = useMemo(() => {
      let result = genograms;

      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        result = result.filter(
          g =>
            g.title.toLowerCase().includes(query) ||
            g.description?.toLowerCase().includes(query)
        );
      }

      // Sort
      const sorted = [...result];
      switch (sortBy) {
        case 'name':
          sorted.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'members':
          sorted.sort((a, b) => (b.people?.length || 0) - (a.people?.length || 0));
          break;
        case 'recent':
        default:
          sorted.sort((a, b) => {
            const aTime = (typeof a.updatedAt === 'object' && 'toMillis' in a.updatedAt)
              ? (a.updatedAt as any).toMillis()
              : new Date(a.updatedAt as any).getTime();
            const bTime = (typeof b.updatedAt === 'object' && 'toMillis' in b.updatedAt)
              ? (b.updatedAt as any).toMillis()
              : new Date(b.updatedAt as any).getTime();
            return bTime - aTime;
          });
      }

      return sorted;
    }, [genograms, searchQuery, sortBy]);

    // Empty state
    if (genograms.length === 0) {
      return (
        <Card>
          <CardBody className="text-center py-16">
            <GitBranch className="w-16 h-16 text-slate-600 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              No Genograms Yet
            </h3>
            <p className="text-slate-400">
              Create your first psychogenogram to start exploring family patterns.
            </p>
          </CardBody>
        </Card>
      );
    }

    // Search results empty
    if (filtered.length === 0 && searchQuery.trim()) {
      return (
        <Card>
          <CardBody className="text-center py-12">
            <Search className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-semibold text-slate-300 mb-1">
              No Results
            </h3>
            <p className="text-slate-400 text-sm">
              No genograms match: &quot;{searchQuery}&quot;
            </p>
          </CardBody>
        </Card>
      );
    }

    // Grid of cards
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map(genogram => (
            <GenogramCard
              key={`genogram-${genogram.id}`}
              genogram={genogram}
              onOpen={onOpen}
              onDelete={onDelete}
              onShare={onShare}
              isDeleting={deletingId === genogram.id}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    );
  }
);

GenogramList.displayName = 'GenogramList';
