/**
 * NewGenogramModal - Create blank genogram
 * Allows user to enter title and create new document
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardBody } from '../ui/Card';

interface NewGenogramModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
  error?: string | null;
  onCreateGenogram: (title: string) => Promise<void>;
}

export const NewGenogramModal = React.memo<NewGenogramModalProps>(
  ({ isOpen, onClose, isLoading = false, error = null, onCreateGenogram }) => {
    const [title, setTitle] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    console.log('🎬 [NewGenogramModal] Rendering, isOpen:', isOpen, 'title:', title);

    // Focus input when modal opens
    useEffect(() => {
      if (isOpen && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isOpen]);

    // Clear errors when modal closes - moved to separate effect to avoid cascading
    useEffect(() => {
      if (!isOpen) {
        // Reset state after modal animation completes
        const timer = setTimeout(() => {
          setTitle('');
          setLocalError(null);
        }, 300);
        return () => clearTimeout(timer);
      }
    }, [isOpen]);

    const handleCreateClick = async () => {
      console.log('🎯 [NewGenogramModal] handleCreateClick - title:', title);

      // Validation
      if (!title.trim()) {
        console.warn('⚠️ [NewGenogramModal] Title is empty');
        setLocalError('Please enter a title');
        return;
      }

      if (title.trim().length > 100) {
        console.warn('⚠️ [NewGenogramModal] Title too long');
        setLocalError('Title must be less than 100 characters');
        return;
      }

      setLocalError(null);

      try {
        console.log('⏳ [NewGenogramModal] Calling onCreateGenogram...');
        await onCreateGenogram(title.trim());
        console.log('✅ [NewGenogramModal] onCreateGenogram completed');
      } catch (err) {
        console.error('❌ [NewGenogramModal] Error:', err);
        const message = err instanceof Error ? err.message : 'Failed to create genogram';
        setLocalError(message);
      }
    };

    const handleCancel = () => {
      console.log('❌ [NewGenogramModal] Cancelled');
      setTitle('');
      setLocalError(null);
      onClose();
    };

    const displayError = localError || error;

    return (
      <Modal isOpen={isOpen} onClose={handleCancel}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md"
        >
          <Card className="border border-slate-700 shadow-2xl">
            <CardBody className="p-8">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-ocean-900 rounded-lg">
                  <Plus className="w-5 h-5 text-ocean-100" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-100">New Genogram</h2>
                  <p className="text-sm text-slate-400">Create a blank family tree</p>
                </div>
              </div>

              {/* Title Input */}
              <div className="space-y-4 mb-6">
                <div>
                  <label
                    htmlFor="genogram-title"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Title
                  </label>
                  <Input
                    ref={inputRef}
                    id="genogram-title"
                    type="text"
                    placeholder="e.g., The Smith Family"
                    value={title}
                    onChange={e => {
                      setTitle(e.target.value);
                      setLocalError(null);
                    }}
                    disabled={isLoading}
                    maxLength={100}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {title.length}/100 characters
                  </p>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {displayError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-950 border border-red-700 rounded-lg p-3 flex gap-2"
                    >
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-200">{displayError}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateClick}
                  disabled={isLoading || !title.trim()}
                  isLoading={isLoading}
                  className="flex-1"
                >
                  Create
                </Button>
              </div>

              {/* Info */}
              <div className="mt-6 pt-6 border-t border-slate-700">
                <p className="text-xs text-slate-500">
                  💡 You'll open the editor immediately after creation. You can add family
                  members, relationships, and psychological profiles.
                </p>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </Modal>
    );
  }
);

NewGenogramModal.displayName = 'NewGenogramModal';
