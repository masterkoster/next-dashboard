/**
 * IndexedDB Layer for Offline-First Aviation Dashboard
 * 
 * Provides caching for Flying Club data and sync queue for offline changes.
 * Uses lazy loading and batched writes for performance on older devices.
 */

const DB_NAME = 'aviation-dashboard';
const DB_VERSION = 1;

// Cache stores - data from server
const CACHE_STORES = [
  'groups',
  'aircraft',
  'bookings',
  'flightLogs',
  'maintenance',
  'members',
] as const;

// All stores
const ALL_STORES = [...CACHE_STORES, 'syncQueue', 'conflicts', 'settings'] as const;

type CacheStore = typeof CACHE_STORES[number];
type AllStore = typeof ALL_STORES[number];

// Sync queue item
interface SyncQueueItem {
  id?: number;
  type: 'flight_log' | 'maintenance' | 'aircraft_status' | 'booking';
  action: 'create' | 'update' | 'delete';
  data: Record<string, unknown>;
  userId: string;
  localCreatedAt: string;
  localLastSyncedAt?: string;
  localId?: string;
  retries?: number;
}

// Conflict item
export interface ConflictItem {
  id?: number;
  type: 'flight_log' | 'maintenance' | 'aircraft_status' | 'booking';
  localData: Record<string, unknown>;
  serverData: Record<string, unknown>;
  conflictType: 'modified' | 'deleted';
  detectedAt: string;
  resolved: boolean;
}

// Settings - use generic key-value
interface SettingItem {
  key: string;
  value: unknown;
}

let dbInstance: IDBDatabase | null = null;

/**
 * Initialize the IndexedDB database
 */
async function initDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB open error:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create cache stores
      CACHE_STORES.forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, { keyPath: 'id' });
          // Create indexes for common queries
          if (storeName === 'flightLogs') {
            store.createIndex('date', 'date', { unique: false });
            store.createIndex('aircraftId', 'aircraftId', { unique: false });
          }
          if (storeName === 'bookings') {
            store.createIndex('startTime', 'startTime', { unique: false });
            store.createIndex('aircraftId', 'aircraftId', { unique: false });
          }
          if (storeName === 'maintenance') {
            store.createIndex('status', 'status', { unique: false });
            store.createIndex('aircraftId', 'aircraftId', { unique: false });
          }
        }
      });

      // Sync queue store
      if (!db.objectStoreNames.contains('syncQueue')) {
        const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        syncStore.createIndex('type', 'type', { unique: false });
        syncStore.createIndex('localCreatedAt', 'localCreatedAt', { unique: false });
      }

      // Conflicts store
      if (!db.objectStoreNames.contains('conflicts')) {
        const conflictStore = db.createObjectStore('conflicts', { keyPath: 'id', autoIncrement: true });
        conflictStore.createIndex('type', 'type', { unique: false });
        conflictStore.createIndex('resolved', 'resolved', { unique: false });
      }

      // Settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };
  });
}

/**
 * Get database instance
 */
export async function getDB(): Promise<IDBDatabase> {
  return initDB();
}

// ============================================
// CACHE OPERATIONS
// ============================================

/**
 * Cache data for a specific store (batched for performance)
 */
export async function cacheData<T>(storeName: CacheStore, data: T[]): Promise<void> {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    // Clear existing data and add new
    store.clear();

    if (data.length === 0) {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      return;
    }

    // Batch add all items
    data.forEach((item) => {
      store.add(item);
    });

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

/**
 * Get cached data for a specific store
 */
export async function getCachedData<T>(storeName: CacheStore): Promise<T[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get a single cached item by ID
 */
export async function getCachedItem<T>(storeName: CacheStore, id: string): Promise<T | undefined> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Update a single cached item
 */
export async function updateCachedItem<T extends { id: string }>(
  storeName: CacheStore,
  item: T
): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete a cached item
 */
export async function deleteCachedItem(storeName: CacheStore, id: string): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear all cached data
 */
export async function clearAllCache(): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(CACHE_STORES, 'readwrite');
    
    CACHE_STORES.forEach((storeName) => {
      transaction.objectStore(storeName).clear();
    });

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

// ============================================
// SYNC QUEUE OPERATIONS
// ============================================

/**
 * Add an item to the sync queue
 */
export async function queueChange(item: Omit<SyncQueueItem, 'id'>): Promise<number> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('syncQueue', 'readwrite');
    const store = transaction.objectStore('syncQueue');
    const request = store.add(item);

    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all pending sync items
 */
export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('syncQueue', 'readonly');
    const store = transaction.objectStore('syncQueue');
    const index = store.index('localCreatedAt');
    const request = index.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get count of pending sync items
 */
export async function getSyncQueueCount(): Promise<number> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('syncQueue', 'readonly');
    const store = transaction.objectStore('syncQueue');
    const request = store.count();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Remove items from sync queue after successful sync
 */
export async function clearSyncedItems(ids: number[]): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('syncQueue', 'readwrite');
    const store = transaction.objectStore('syncQueue');

    ids.forEach((id) => {
      store.delete(id);
    });

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

/**
 * Update a sync queue item (e.g., increment retries)
 */
export async function updateSyncItem(id: number, updates: Partial<SyncQueueItem>): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('syncQueue', 'readwrite');
    const store = transaction.objectStore('syncQueue');
    
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const item = getRequest.result;
      if (item) {
        store.put({ ...item, ...updates });
      }
    };
    getRequest.onerror = () => reject(getRequest.error);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

// ============================================
// CONFLICT OPERATIONS
// ============================================

/**
 * Store a conflict for later resolution
 */
export async function storeConflict(item: Omit<ConflictItem, 'id'>): Promise<number> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('conflicts', 'readwrite');
    const store = transaction.objectStore('conflicts');
    const request = store.add(item);

    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all unresolved conflicts
 */
export async function getConflicts(): Promise<ConflictItem[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('conflicts', 'readonly');
    const store = transaction.objectStore('conflicts');
    const request = store.getAll();

    request.onsuccess = () => {
      // Filter in memory since resolved is boolean and IDBKeyRange doesn't work well with booleans
      const all = request.result || [];
      const unresolved = all.filter((c: ConflictItem) => c.resolved === false);
      resolve(unresolved);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get count of unresolved conflicts
 */
export async function getConflictsCount(): Promise<number> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('conflicts', 'readonly');
    const store = transaction.objectStore('conflicts');
    const request = store.getAll();

    request.onsuccess = () => {
      const all = request.result || [];
      const unresolved = all.filter((c: ConflictItem) => c.resolved === false);
      resolve(unresolved.length);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Mark a conflict as resolved
 */
export async function resolveConflict(id: number): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('conflicts', 'readwrite');
    const store = transaction.objectStore('conflicts');
    
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const item = getRequest.result;
      if (item) {
        item.resolved = true;
        store.put(item);
      }
    };
    getRequest.onerror = () => reject(getRequest.error);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

/**
 * Delete a conflict
 */
export async function deleteConflict(id: number): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('conflicts', 'readwrite');
    const store = transaction.objectStore('conflicts');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ============================================
// SETTINGS OPERATIONS
// ============================================

/**
 * Get a setting value
 */
export async function getSetting<T>(key: string): Promise<T | undefined> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('settings', 'readonly');
    const store = transaction.objectStore('settings');
    const request = store.get(key);

    request.onsuccess = () => {
      const result = request.result as SettingItem | undefined;
      resolve(result?.value as T | undefined);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Set a setting value
 */
export async function setSetting<T>(key: string, value: T): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('settings', 'readwrite');
    const store = transaction.objectStore('settings');
    const request = store.put({ key, value });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get performance mode setting
 */
export async function getPerformanceMode(): Promise<'auto' | 'modern' | 'legacy'> {
  const mode = await getSetting<'auto' | 'modern' | 'legacy'>('performanceMode');
  return mode || 'auto';
}

/**
 * Set performance mode
 */
export async function setPerformanceMode(mode: 'auto' | 'modern' | 'legacy'): Promise<void> {
  await setSetting('performanceMode', mode);
}

/**
 * Get last sync timestamp
 */
export async function getLastSyncAt(): Promise<string | undefined> {
  return getSetting<string>('lastSyncAt');
}

/**
 * Set last sync timestamp
 */
export async function setLastSyncAt(timestamp: string): Promise<void> {
  await setSetting('lastSyncAt', timestamp);
}

// ============================================
// BATCH OPERATIONS (Performance optimized)
// ============================================

/**
 * Cache all flying club data in one transaction
 */
export async function cacheAllFlyingClubData(data: {
  groups?: unknown[];
  aircraft?: unknown[];
  bookings?: unknown[];
  flightLogs?: unknown[];
  maintenance?: unknown[];
  members?: unknown[];
}): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(CACHE_STORES, 'readwrite');

    Object.entries(data).forEach(([key, value]) => {
      if (CACHE_STORES.includes(key as CacheStore) && value) {
        const store = transaction.objectStore(key as CacheStore);
        store.clear();
        (value as unknown[]).forEach((item) => store.add(item));
      }
    });

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

/**
 * Get all cached flying club data
 */
export async function getAllCachedFlyingClubData(): Promise<{
  groups: unknown[];
  aircraft: unknown[];
  bookings: unknown[];
  flightLogs: unknown[];
  maintenance: unknown[];
  members: unknown[];
}> {
  const [groups, aircraft, bookings, flightLogs, maintenance, members] = await Promise.all([
    getCachedData('groups'),
    getCachedData('aircraft'),
    getCachedData('bookings'),
    getCachedData('flightLogs'),
    getCachedData('maintenance'),
    getCachedData('members'),
  ]);

  return { groups, aircraft, bookings, flightLogs, maintenance, members };
}

// ============================================
// UTILITY
// ============================================

/**
 * Check if IndexedDB is available
 */
export function isIndexedDBAvailable(): boolean {
  try {
    return 'indexedDB' in window && window.indexedDB !== null;
  } catch {
    return false;
  }
}

/**
 * Clear all data (for logout or troubleshooting)
 */
export async function clearAllData(): Promise<void> {
  await clearAllCache();
  
  const db = await initDB();
  
  const syncTransaction = db.transaction('syncQueue', 'readwrite');
  syncTransaction.objectStore('syncQueue').clear();
  
  const conflictTransaction = db.transaction('conflicts', 'readwrite');
  conflictTransaction.objectStore('conflicts').clear();
  
  const settingsTransaction = db.transaction('settings', 'readwrite');
  settingsTransaction.objectStore('settings').clear();
}
