/**
 * Hook to monitor storage usage
 */

import { useEffect, useState } from 'react';
import { getStorageInfo } from '@/utils/indexedDBStorage';

export interface StorageInfo {
  usage: number;
  quota: number;
  available: number;
  usagePercent: number;
}

export function useStorageInfo() {
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);

  useEffect(() => {
    const loadStorageInfo = async () => {
      try {
        const info = await getStorageInfo();
        setStorageInfo(info);
      } catch (error) {
        console.error('Failed to get storage info:', error);
      }
    };

    loadStorageInfo();
  }, []);

  return {
    storageInfo,
  };
}

