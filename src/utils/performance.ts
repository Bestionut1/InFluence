/**
 * Performance utilities for PsychoGenealogy
 * Includes debounce, throttle, and autosave helpers
 */

/**
 * Debounce a function to prevent rapid repeated calls
 * @param func Function to debounce
 * @param wait Milliseconds to wait before calling
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle a function to limit how often it can be called
 * @param func Function to throttle
 * @param limit Milliseconds to wait between calls
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Local autosave backup for genograms
 * Stores to localStorage with automatic cleanup
 */
export class AutosaveBackup {
  private static readonly BACKUP_PREFIX = 'autosave-backup-';
  private static readonly MAX_BACKUPS = 5;

  /**
   * Save a backup of genogram data
   */
  static saveBackup(genogramId: string, data: any): void {
    try {
      const backupKey = `${this.BACKUP_PREFIX}${genogramId}-${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify(data));

      // Cleanup old backups
      this.cleanupOldBackups(genogramId);
    } catch (error) {
      console.error('Failed to save autosave backup:', error);
    }
  }

  /**
   * Get the most recent backup for a genogram
   */
  static getLatestBackup(genogramId: string): any | null {
    try {
      let latestKey: string | null = null;
      let latestTime = 0;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${this.BACKUP_PREFIX}${genogramId}`)) {
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
        const data = localStorage.getItem(latestKey);
        return data ? JSON.parse(data) : null;
      }
      return null;
    } catch (error) {
      console.error('Failed to get autosave backup:', error);
      return null;
    }
  }

  /**
   * Delete all backups for a genogram
   */
  static deleteBackups(genogramId: string): void {
    try {
      const keysToDelete: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${this.BACKUP_PREFIX}${genogramId}`)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to delete autosave backups:', error);
    }
  }

  /**
   * Cleanup old backups keeping only the most recent N backups
   */
  private static cleanupOldBackups(genogramId: string): void {
    try {
      const backups: { key: string; time: number }[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${this.BACKUP_PREFIX}${genogramId}`)) {
          const match = key.match(/-(\d+)$/);
          if (match) {
            backups.push({
              key,
              time: parseInt(match[1], 10),
            });
          }
        }
      }

      // Sort by time descending and remove old ones
      backups.sort((a, b) => b.time - a.time);
      backups.slice(this.MAX_BACKUPS).forEach(backup => {
        localStorage.removeItem(backup.key);
      });
    } catch (error) {
      console.error('Failed to cleanup old autosave backups:', error);
    }
  }
}

/**
 * Development logging utility
 * Disabled in production builds
 */
export class DevLog {
  private static isDev = import.meta.env.DEV;

  static log(section: string, message: string, data?: any) {
    if (this.isDev) {
      console.log(`[${section}] ${message}`, data || '');
    }
  }

  static warn(section: string, message: string, data?: any) {
    if (this.isDev) {
      console.warn(`[${section}] ⚠️  ${message}`, data || '');
    }
  }

  static error(section: string, message: string, error?: any) {
    if (this.isDev) {
      console.error(`[${section}] ❌ ${message}`, error || '');
    }
  }

  static group(section: string, label: string) {
    if (this.isDev) {
      console.group(`[${section}] ${label}`);
    }
  }

  static groupEnd() {
    if (this.isDev) {
      console.groupEnd();
    }
  }
}

/**
 * Performance monitoring utility
 */
export class PerfMonitor {
  private static marks = new Map<string, number>();

  static mark(label: string) {
    this.marks.set(label, performance.now());
  }

  static measure(label: string, startMark: string) {
    const startTime = this.marks.get(startMark);
    if (!startTime) {
      console.warn(`Start mark "${startMark}" not found`);
      return;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    if (import.meta.env.DEV) {
      console.log(`⏱️  ${label}: ${duration.toFixed(2)}ms`);
    }

    this.marks.delete(startMark);
    return duration;
  }
}
