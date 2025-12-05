/**
 * Autosave hook for local backup of genogram data
 * Prevents data loss on crash or connection interruption
 */

import { useEffect, useCallback, useRef } from 'react';
import type { GenogramDocument } from '../types/models';

interface AutosaveConfig {
  enabled?: boolean;
  intervalMs?: number;
  maxBackups?: number;
}

const DEFAULT_CONFIG: Required<AutosaveConfig> = {
  enabled: true,
  intervalMs: 30000, // 30 seconds
  maxBackups: 5,
};

const BACKUP_PREFIX = 'genogram-autosave-';

/**
 * Hook for managing local autosave backups
 */
export function useAutosave(
  genogramId: string | null | undefined,
  data: Partial<GenogramDocument> | null,
  config?: AutosaveConfig
) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const lastSaveTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Save backup to localStorage
  const saveBackup = useCallback(() => {
    if (!mergedConfig.enabled || !genogramId || !data) return;

    try {
      const backupKey = `${BACKUP_PREFIX}${genogramId}-${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify({
        id: genogramId,
        data,
        timestamp: Date.now(),
      }));

      lastSaveTimeRef.current = Date.now();

      // Cleanup old backups
      cleanupOldBackups(genogramId, mergedConfig.maxBackups);

      console.debug(`[Autosave] Backed up genogram ${genogramId}`);
    } catch (error) {
      console.warn('[Autosave] Failed to save backup:', error);
    }
  }, [genogramId, data, mergedConfig]);

  // Get latest backup for a genogram
  const getLatestBackup = useCallback(
    (): Partial<GenogramDocument> | null => {
      if (!genogramId) return null;

      try {
        let latestKey: string | null = null;
        let latestTime = 0;

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith(`${BACKUP_PREFIX}${genogramId}`)) {
            const match = key.match(/-(\d+)$/);
            if (match) {
              const time = parseInt(match[1], 10);
              if (time > latestTime) {
                latestTime = time;
                latestKey = key;
              }
            }
          }
        }

        if (latestKey) {
          const backup = localStorage.getItem(latestKey);
          if (backup) {
            const parsed = JSON.parse(backup);
            return parsed.data;
          }
        }
      } catch (error) {
        console.warn('[Autosave] Failed to get backup:', error);
      }

      return null;
    },
    [genogramId]
  );

  // Clear all backups for a genogram
  const clearBackups = useCallback(() => {
    if (!genogramId) return;

    try {
      const keysToDelete: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(`${BACKUP_PREFIX}${genogramId}`)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => localStorage.removeItem(key));
      console.debug(`[Autosave] Cleared ${keysToDelete.length} backups for ${genogramId}`);
    } catch (error) {
      console.warn('[Autosave] Failed to clear backups:', error);
    }
  }, [genogramId]);

  // Setup interval for periodic saves
  useEffect(() => {
    if (!mergedConfig.enabled || !genogramId || !data) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Save immediately on data change
    saveBackup();

    // Then setup interval for periodic saves
    intervalRef.current = setInterval(saveBackup, mergedConfig.intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [genogramId, data, mergedConfig, saveBackup]);

  return {
    saveBackup,
    getLatestBackup,
    clearBackups,
    lastSaveTime: lastSaveTimeRef.current,
  };
}

/**
 * Helper: cleanup old backups keeping only recent N
 */
function cleanupOldBackups(genogramId: string, maxBackups: number) {
  try {
    const backups: { key: string; time: number }[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${BACKUP_PREFIX}${genogramId}`)) {
        const match = key.match(/-(\d+)$/);
        if (match) {
          backups.push({
            key,
            time: parseInt(match[1], 10),
          });
        }
      }
    }

    backups.sort((a, b) => b.time - a.time);
    backups.slice(maxBackups).forEach(backup => {
      localStorage.removeItem(backup.key);
    });
  } catch (error) {
    console.warn('[Autosave] Failed to cleanup backups:', error);
  }
}
