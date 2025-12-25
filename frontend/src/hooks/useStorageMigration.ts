/**
 * Hook to automatically migrate data from localStorage to IndexedDB
 * and monitor storage usage
 */

import { useEffect, useState } from 'react';
import { migrateFromLocalStorage, getStorageInfo } from '@/utils/indexedDBStorage';

export interface StorageInfo {
  usage: number;
  quota: number;
  available: number;
  usagePercent: number;
}

export function useStorageMigration() {
  const [migrationStatus, setMigrationStatus] = useState<'pending' | 'migrating' | 'completed' | 'error'>('pending');
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);

  useEffect(() => {
    const performMigration = async () => {
      try {
        setMigrationStatus('migrating');
        
        // Check if migration has already been done
        const migrationFlag = localStorage.getItem('indexeddb-migration-completed');
        
        if (!migrationFlag) {
          console.log('🔄 Starting migration from localStorage to IndexedDB...');
          const migrated = await migrateFromLocalStorage();
          
          if (migrated) {
            localStorage.setItem('indexeddb-migration-completed', 'true');
            console.log('✅ Migration completed and flagged');
          }
        } else {
          console.log('ℹ️ Migration already completed');
        }

        // Get storage information
        const info = await getStorageInfo();
        setStorageInfo(info);
        
        setMigrationStatus('completed');
      } catch (error) {
        console.error('Migration error:', error);
        setMigrationStatus('error');
      }
    };

    performMigration();
  }, []);

  return {
    migrationStatus,
    storageInfo,
  };
}

