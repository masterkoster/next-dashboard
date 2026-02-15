/**
 * Offline-First Data Hooks for Aviation Dashboard
 * 
 * Provides smart data fetching with:
 * - Instant display from cache
 * - Background refresh from server
 * - Offline queueing for mutations
 * - Auto-sync on reconnect
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  cacheData,
  getCachedData,
  queueChange,
  getSyncQueueCount,
  getConflictsCount,
  getConflicts,
  storeConflict,
  resolveConflict,
  deleteConflict,
  getLastSyncAt,
  setLastSyncAt,
  isIndexedDBAvailable,
  type ConflictItem,
} from '@/lib/offline-db';

export interface UseOfflineDataOptions<T> {
  /** Unique key for caching this data */
  cacheKey: string;
  /** Function to fetch fresh data from server */
  fetchFn: () => Promise<T>;
  /** Whether to auto-fetch on mount */
  immediate?: boolean;
  /** Debounce delay for queuing (ms) */
  debounceMs?: number;
}

export interface OfflineDataState<T> {
  data: T | null;
  isLoading: boolean;
  isOffline: boolean;
  pendingCount: number;
  conflictsCount: number;
  lastSyncedAt: string | null;
  error: string | null;
}

export interface OfflineDataActions<T> {
  refresh: () => Promise<void>;
  queueCreate: (data: Omit<QueueData, 'action' | 'localId'>) => Promise<void>;
  queueUpdate: (data: Omit<QueueData, 'action' | 'localId'>) => Promise<void>;
  queueDelete: (data: Omit<QueueData, 'action' | 'localId'>) => Promise<void>;
  resolveConflict: (conflictId: number, resolution: 'mine' | 'server' | 'both') => Promise<void>;
  syncNow: () => Promise<void>;
}

interface QueueData {
  type: 'flight_log' | 'maintenance' | 'aircraft_status' | 'booking';
  data: Record<string, unknown>;
  userId: string;
  localId?: string;
}

/**
 * Hook for managing offline-first data
 */
export function useOfflineData<T>({
  cacheKey,
  fetchFn,
  immediate = true,
}: UseOfflineDataOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [conflictsCount, setConflictsCount] = useState(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isMounted = useRef(true);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check online status
  useEffect(() => {
    setIsOffline(!navigator.onLine);
    
    const handleOnline = () => {
      setIsOffline(false);
      // Trigger sync when back online
      if (!syncTimeoutRef.current) {
        syncTimeoutRef.current = setTimeout(() => {
          syncNow();
          syncTimeoutRef.current = null;
        }, 2000); // Debounce: wait 2s after reconnect
      }
    };
    
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  // Load initial data and counts
  useEffect(() => {
    isMounted.current = true;
    
    async function loadInitialData() {
      if (!isIndexedDBAvailable()) {
        // No IndexedDB, just use network
        if (immediate) {
          try {
            const result = await fetchFn();
            if (isMounted.current) {
              setData(result);
            }
          } catch (err) {
            if (isMounted.current) {
              setError(String(err));
            }
          }
        }
        if (isMounted.current) setIsLoading(false);
        return;
      }

      // Load cached data first (instant)
      try {
        const cached = await getCachedData<T>(cacheKey as any);
        if (cached && cached.length > 0 && isMounted.current) {
          // For single-item caches, return first item
          setData(cached[0] as unknown as T);
        }
        
        const lastSync = await getLastSyncAt();
        if (lastSync && isMounted.current) {
          setLastSyncedAt(lastSync);
        }
      } catch (err) {
        console.error('Cache read error:', err);
      }

      // Then fetch fresh data in background
      if (immediate) {
        try {
          const fresh = await fetchFn();
          if (isMounted.current) {
            setData(fresh);
            // Cache the fresh data
            if (Array.isArray(fresh)) {
              await cacheData(cacheKey as any, fresh);
            } else if (fresh) {
              await cacheData(cacheKey as any, [fresh]);
            }
            await setLastSyncAt(new Date().toISOString());
            setLastSyncedAt(new Date().toISOString());
          }
        } catch (err) {
          if (isMounted.current) {
            // If fetch fails but we have cached data, that's okay
            if (!data) {
              setError(String(err));
            }
          }
        }
      }

      // Update counts
      updateCounts();
      
      if (isMounted.current) {
        setIsLoading(false);
      }
    }

    loadInitialData();

    return () => {
      isMounted.current = false;
    };
  }, [cacheKey, fetchFn, immediate]);

  // Update pending and conflict counts
  const updateCounts = useCallback(async () => {
    try {
      const [pending, conflicts] = await Promise.all([
        getSyncQueueCount(),
        getConflictsCount(),
      ]);
      if (isMounted.current) {
        setPendingCount(pending);
        setConflictsCount(conflicts);
      }
    } catch (err) {
      console.error('Count update error:', err);
    }
  }, []);

  // Refresh data from server
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fresh = await fetchFn();
      if (isMounted.current) {
        setData(fresh);
        // Cache the fresh data
        if (Array.isArray(fresh)) {
          await cacheData(cacheKey as any, fresh);
        } else if (fresh) {
          await cacheData(cacheKey as any, [fresh]);
        }
        await setLastSyncAt(new Date().toISOString());
        setLastSyncedAt(new Date().toISOString());
      }
    } catch (err) {
      if (isMounted.current) {
        setError(String(err));
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [cacheKey, fetchFn]);

  // Queue a change for later sync
  const queueCreate = useCallback(async (item: Omit<QueueData, 'action' | 'localId'>) => {
    const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await queueChange({
      type: item.type,
      action: 'create',
      data: item.data,
      userId: item.userId,
      localCreatedAt: new Date().toISOString(),
      localId,
    });
    
    updateCounts();
  }, [updateCounts]);

  const queueUpdate = useCallback(async (item: Omit<QueueData, 'action' | 'localId'>) => {
    const localId = item.data.id as string || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await queueChange({
      type: item.type,
      action: 'update',
      data: item.data,
      userId: item.userId,
      localCreatedAt: new Date().toISOString(),
      localLastSyncedAt: lastSyncedAt || undefined,
      localId,
    });
    
    updateCounts();
  }, [lastSyncedAt, updateCounts]);

  const queueDelete = useCallback(async (item: Omit<QueueData, 'action' | 'localId'>) => {
    const localId = item.data.id as string;
    
    await queueChange({
      type: item.type,
      action: 'delete',
      data: item.data,
      userId: item.userId,
      localCreatedAt: new Date().toISOString(),
      localLastSyncedAt: lastSyncedAt || undefined,
      localId,
    });
    
    updateCounts();
  }, [lastSyncedAt, updateCounts]);

  // Sync queued changes with server
  const syncNow = useCallback(async () => {
    if (isOffline) return;
    
    try {
      const { getSyncQueue, clearSyncedItems, storeConflict: storeConflictDB } = await import('@/lib/offline-db');
      const queue = await getSyncQueue();
      
      if (queue.length === 0) return;

      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          changes: queue.map(item => ({
            type: item.type,
            action: item.action,
            data: item.data,
            localCreatedAt: item.localCreatedAt,
            localLastSyncedAt: item.localLastSyncedAt,
            localId: item.localId,
          })),
          userId: queue[0]?.userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Sync failed');
      }

      const result = await response.json();
      
      // Clear successfully synced items
      const appliedIds = queue
        .filter(item => result.applied?.some((a: any) => a.localId === item.localId))
        .map(item => item.id!)
        .filter(Boolean);
      
      if (appliedIds.length > 0) {
        await clearSyncedItems(appliedIds);
      }

      // Store conflicts
      if (result.conflicts && result.conflicts.length > 0) {
        for (const conflict of result.conflicts) {
          // Find the local data
          const localItem = queue.find(item => item.localId === conflict.localId);
          if (localItem) {
            await storeConflictDB({
              type: conflict.type,
              localData: localItem.data,
              serverData: conflict.serverData,
              conflictType: conflict.conflictType,
              detectedAt: new Date().toISOString(),
              resolved: false,
            });
          }
        }
      }

      // Refresh data after sync
      await refresh();
      await updateCounts();
    } catch (err) {
      console.error('Sync error:', err);
    }
  }, [isOffline, refresh, updateCounts]);

  // Resolve a conflict
  const resolveConflictAction = useCallback(async (
    conflictId: number,
    resolution: 'mine' | 'server' | 'both'
  ) => {
    const conflicts = await getConflicts();
    const conflict = conflicts.find(c => c.id === conflictId);
    
    if (!conflict) return;

    if (resolution === 'server') {
      // Just mark as resolved, keep server data
      await resolveConflict(conflictId);
    } else if (resolution === 'mine') {
      // Re-queue with force flag
      await queueChange({
        type: conflict.type,
        action: 'create',
        data: conflict.localData,
        userId: (conflict.localData as any).userId || '',
        localCreatedAt: new Date().toISOString(),
      });
      await resolveConflict(conflictId);
    } else if (resolution === 'both') {
      // Keep both: mark server as modified locally, create new local
      await queueChange({
        type: conflict.type,
        action: 'create',
        data: { ...conflict.localData, id: undefined, _isDuplicate: true },
        userId: (conflict.localData as any).userId || '',
        localCreatedAt: new Date().toISOString(),
      });
      await resolveConflict(conflictId);
    }
    
    updateCounts();
  }, [updateCounts]);

  return {
    data,
    isLoading,
    isOffline,
    pendingCount,
    conflictsCount,
    lastSyncedAt,
    error,
    refresh,
    queueCreate,
    queueUpdate,
    queueDelete,
    resolveConflict: resolveConflictAction,
    syncNow,
  };
}

/**
 * Hook specifically for Flying Club data
 * Caches all club data and provides unified sync
 */
export function useFlyingClubData(userId: string | undefined) {
  const [groupsData, setGroupsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [conflictsCount, setConflictsCount] = useState(0);

  const loadData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsOffline(!navigator.onLine);

    try {
      // Fetch all data in parallel
      const [groupsRes, bookingsRes, maintenanceRes] = await Promise.all([
        fetch('/api/groups').then(r => r.ok ? r.json() : []),
        fetch('/api/groups/all-bookings').then(r => r.ok ? r.json() : []),
        fetch('/api/maintenance').then(r => r.ok ? r.json() : []),
      ]);

      const groups = groupsRes || [];
      const bookings = bookingsRes || [];
      const maintenance = maintenanceRes || [];

      setGroupsData(groups);

      // Cache all the data
      if (isIndexedDBAvailable()) {
        await cacheData('groups', groups);
        await cacheData('bookings', bookings);
        await cacheData('maintenance', maintenance);
      }
    } catch (err) {
      console.error('Error loading flying club data:', err);
      
      // Fall back to cached data
      if (isIndexedDBAvailable()) {
        const [cachedGroups, cachedBookings, cachedMaintenance] = await Promise.all([
          getCachedData('groups'),
          getCachedData('bookings'),
          getCachedData('maintenance'),
        ]);
        
        setGroupsData(cachedGroups);
        setIsOffline(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const updatePendingCounts = useCallback(async () => {
    if (!isIndexedDBAvailable()) return;
    
    const [pending, conflicts] = await Promise.all([
      getSyncQueueCount(),
      getConflictsCount(),
    ]);
    
    setPendingCount(pending);
    setConflictsCount(conflicts);
  }, []);

  useEffect(() => {
    loadData();
    updatePendingCounts();

    const handleOnline = () => {
      setIsOffline(false);
      loadData();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadData, updatePendingCounts]);

  return {
    groups: groupsData,
    isLoading,
    isOffline,
    pendingCount,
    conflictsCount,
    refresh: loadData,
  };
}

/**
 * Hook for getting all conflicts
 */
export function useConflicts() {
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadConflicts = useCallback(async () => {
    if (!isIndexedDBAvailable()) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await getConflicts();
      setConflicts(data);
    } catch (err) {
      console.error('Error loading conflicts:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConflicts();
  }, [loadConflicts]);

  return { conflicts, isLoading, refresh: loadConflicts };
}

/**
 * Hook for sync status across the app
 */
export function useSyncStatus() {
  const [pendingCount, setPendingCount] = useState(0);
  const [conflictsCount, setConflictsCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const updateStatus = useCallback(async () => {
    if (!isIndexedDBAvailable()) return;
    
    const [pending, conflicts] = await Promise.all([
      getSyncQueueCount(),
      getConflictsCount(),
    ]);
    
    setPendingCount(pending);
    setConflictsCount(conflicts);
  }, []);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    updateStatus();

    const handleOnline = () => {
      setIsOffline(false);
      updateStatus();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updateStatus]);

  return {
    pendingCount,
    conflictsCount,
    isSyncing,
    isOffline,
    hasPendingWork: pendingCount > 0 || conflictsCount > 0,
    refresh: updateStatus,
  };
}
