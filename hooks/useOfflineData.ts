'use client';

import { useState, useEffect } from 'react';

type ConflictType = 'maintenance' | 'booking' | 'flight_log' | 'aircraft_status';

interface ConflictItem {
  id: number;
  type: ConflictType;
  localData: any;
  serverData: any;
  timestamp: number;
  conflictType?: 'modified' | 'deleted';
  detectedAt: number;
}

interface UseOfflineDataReturn {
  conflicts: ConflictItem[];
  isLoading: boolean;
  refresh: () => void;
}

export function useConflicts(): UseOfflineDataReturn {
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = () => {
    setIsLoading(true);
    // Reset conflicts - offline sync not implemented
    setConflicts([]);
    setIsLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  return { conflicts, isLoading, refresh };
}

export function useSyncStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [conflictsCount, setConflictsCount] = useState(0);

  useEffect(() => {
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { 
    isOffline: !isOnline, 
    isOnline, 
    lastSynced, 
    isSyncing, 
    setLastSynced, 
    setIsSyncing,
    pendingCount,
    conflictsCount
  };
}
