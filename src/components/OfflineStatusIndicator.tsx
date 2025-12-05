/**
 * Offline Status Indicator Component
 * Shows user when they're offline and data is stored locally only
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Server } from 'lucide-react';

interface OfflineStatusProps {
  showDetailedInfo?: boolean;
}

export const OfflineStatusIndicator: React.FC<OfflineStatusProps> = ({ showDetailedInfo = true }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-hide success banner after 3 seconds
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between gap-4 shadow-lg ${
            isOnline
              ? 'bg-emerald-900/90 border-b border-emerald-700'
              : 'bg-amber-900/90 border-b border-amber-700'
          }`}
        >
          <div className="flex items-center gap-3 flex-1">
            {isOnline ? (
              <>
                <Wifi className="w-5 h-5 text-emerald-300 animate-pulse" />
                <div className="text-sm">
                  <p className="text-emerald-100 font-semibold">Back Online</p>
                  {showDetailedInfo && (
                    <p className="text-emerald-200 text-xs">All data is stored locally and synced to the server</p>
                  )}
                </div>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-amber-300 animate-pulse" />
                <div className="text-sm flex-1">
                  <p className="text-amber-100 font-semibold">You're Offline</p>
                  {showDetailedInfo && (
                    <p className="text-amber-200 text-xs">Don't worry! All your changes are saved locally</p>
                  )}
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setShowBanner(false)}
            className="text-2xl leading-none opacity-60 hover:opacity-100 transition-opacity"
          >
            ×
          </button>
        </motion.div>
      )}

      {/* Subtle status indicator in bottom-right corner */}
      <motion.div
        className="fixed bottom-4 right-4 z-40"
        animate={{
          opacity: isOnline ? 0 : 1,
          pointerEvents: isOnline ? 'none' : 'auto',
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg px-3 py-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
          <span className={isOnline ? 'text-emerald-300' : 'text-amber-300'}>
            {isOnline ? 'Online' : 'Offline Mode'}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Storage Status Component
 * Shows how much local storage is being used
 */
export const StorageStatusInfo: React.FC = () => {
  const [storageInfo, setStorageInfo] = useState<{
    usedBytes: number;
    quota: number;
    percentage: number;
  } | null>(null);

  useEffect(() => {
    const checkStorage = async () => {
      try {
        if (navigator.storage && navigator.storage.estimate) {
          const estimate = await navigator.storage.estimate();
          setStorageInfo({
            usedBytes: estimate.usage || 0,
            quota: estimate.quota || 0,
            percentage: (estimate.usage || 0) / (estimate.quota || 1) * 100,
          });
        }
      } catch (error) {
        console.warn('Could not get storage estimate:', error);
      }
    };

    checkStorage();
    const interval = setInterval(checkStorage, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  if (!storageInfo) return null;

  const usedMB = (storageInfo.usedBytes / 1024 / 1024).toFixed(2);
  const quotaMB = (storageInfo.quota / 1024 / 1024).toFixed(2);

  return (
    <div className="text-xs text-slate-400 space-y-2">
      <div className="flex items-center justify-between">
        <span>Storage Used:</span>
        <span className={storageInfo.percentage > 80 ? 'text-amber-400' : 'text-slate-300'}>
          {usedMB} MB / {quotaMB} MB
        </span>
      </div>
      {/* Progress bar */}
      <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
        <motion.div
          className={`h-full ${
            storageInfo.percentage > 80
              ? 'bg-gradient-to-r from-amber-500 to-amber-600'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${storageInfo.percentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      {storageInfo.percentage > 90 && (
        <p className="text-amber-400 text-xs">⚠️ Storage almost full. Consider exporting some genograms.</p>
      )}
    </div>
  );
};

/**
 * Data Sync Status Component
 * Shows if data is synced to server or just local
 */
export const DataSyncStatus: React.FC<{ isSynced?: boolean }> = ({ isSynced = true }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-2 text-xs"
    >
      {isSynced ? (
        <>
          <Server className="w-3 h-3 text-emerald-400" />
          <span className="text-emerald-300">Data synced</span>
        </>
      ) : (
        <>
          <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-amber-300">Local only</span>
        </>
      )}
    </motion.div>
  );
};
