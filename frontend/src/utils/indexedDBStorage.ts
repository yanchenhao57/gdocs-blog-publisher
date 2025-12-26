/**
 * IndexedDB Storage Utility for Mermaid Docs Tool
 * 
 * This utility provides a robust storage solution that can handle large amounts of data
 * including base64 images, with much higher capacity than localStorage.
 */

const DB_NAME = 'mermaid-docs-db';
const DB_VERSION = 1;
const STORE_NAME = 'mermaid-data';
const HISTORY_STORE_NAME = 'project-history';

export interface StoredData {
  id: string;
  currentProjectId: string | null;
  mermaidCode: string;
  nodeDocs: Record<string, any>;
  lastSavedAt: number;
}

export interface StoredHistory {
  id: string;
  data: any[];
}

/**
 * Initialize IndexedDB
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(HISTORY_STORE_NAME)) {
        db.createObjectStore(HISTORY_STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Save data to IndexedDB
 */
export async function saveToIndexedDB(data: {
  currentProjectId: string | null;
  mermaidCode: string;
  nodeDocs: Record<string, any>;
}): Promise<boolean> {
  try {
    const db = await openDB();
    
    const storedData: StoredData = {
      id: 'current-project',
      currentProjectId: data.currentProjectId,
      mermaidCode: data.mermaidCode,
      nodeDocs: data.nodeDocs,
      lastSavedAt: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(storedData);

      request.onsuccess = () => {
        console.log('✅ Data saved to IndexedDB successfully');
        resolve(true);
      };

      request.onerror = () => {
        console.error('Failed to save to IndexedDB:', request.error);
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('IndexedDB save error:', error);
    return false;
  }
}

/**
 * Load data from IndexedDB
 */
export async function loadFromIndexedDB(): Promise<Partial<{
  currentProjectId: string | null;
  mermaidCode: string;
  nodeDocs: Record<string, any>;
  lastSavedAt: number;
}> | null> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get('current-project');

      request.onsuccess = () => {
        const result = request.result as StoredData | undefined;
        
        if (result) {
          console.log('✅ Data loaded from IndexedDB');
          resolve({
            currentProjectId: result.currentProjectId,
            mermaidCode: result.mermaidCode,
            nodeDocs: result.nodeDocs,
            lastSavedAt: result.lastSavedAt,
          });
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error('Failed to load from IndexedDB:', request.error);
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('IndexedDB load error:', error);
    return null;
  }
}

/**
 * Save project history to IndexedDB
 */
export async function saveHistoryToIndexedDB(history: any[]): Promise<boolean> {
  try {
    const db = await openDB();

    const storedHistory: StoredHistory = {
      id: 'project-history',
      data: history,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([HISTORY_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(HISTORY_STORE_NAME);
      const request = store.put(storedHistory);

      request.onsuccess = () => {
        console.log('✅ History saved to IndexedDB');
        resolve(true);
      };

      request.onerror = () => {
        console.error('Failed to save history to IndexedDB:', request.error);
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('IndexedDB save history error:', error);
    return false;
  }
}

/**
 * Load project history from IndexedDB
 */
export async function loadHistoryFromIndexedDB(): Promise<any[]> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([HISTORY_STORE_NAME], 'readonly');
      const store = transaction.objectStore(HISTORY_STORE_NAME);
      const request = store.get('project-history');

      request.onsuccess = () => {
        const result = request.result as StoredHistory | undefined;
        
        if (result && result.data) {
          console.log('✅ History loaded from IndexedDB');
          resolve(result.data);
        } else {
          resolve([]);
        }
      };

      request.onerror = () => {
        console.error('Failed to load history from IndexedDB:', request.error);
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('IndexedDB load history error:', error);
    return [];
  }
}


/**
 * Get storage usage information
 */
export async function getStorageInfo(): Promise<{
  usage: number;
  quota: number;
  available: number;
  usagePercent: number;
}> {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const available = quota - usage;
      const usagePercent = quota > 0 ? (usage / quota) * 100 : 0;

      return {
        usage,
        quota,
        available,
        usagePercent,
      };
    }
  } catch (error) {
    console.error('Failed to get storage info:', error);
  }

  return {
    usage: 0,
    quota: 0,
    available: 0,
    usagePercent: 0,
  };
}

/**
 * Clear all data from IndexedDB (useful for debugging)
 */
export async function clearIndexedDB(): Promise<boolean> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME, HISTORY_STORE_NAME], 'readwrite');
      
      transaction.objectStore(STORE_NAME).clear();
      transaction.objectStore(HISTORY_STORE_NAME).clear();

      transaction.oncomplete = () => {
        console.log('✅ IndexedDB cleared');
        db.close();
        resolve(true);
      };

      transaction.onerror = () => {
        console.error('Failed to clear IndexedDB:', transaction.error);
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.error('Clear IndexedDB error:', error);
    return false;
  }
}

