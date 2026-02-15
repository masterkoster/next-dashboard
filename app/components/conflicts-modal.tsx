'use client';

import { useState, useEffect } from 'react';
import { useConflicts } from '@/hooks/useOfflineData';
import type { ConflictItem } from '@/lib/offline-db';

interface ConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResolved: () => void;
}

export default function ConflictModal({ isOpen, onClose, onResolved }: ConflictModalProps) {
  const { conflicts, isLoading, refresh } = useConflicts();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isResolving, setIsResolving] = useState(false);

  const currentConflict = conflicts[currentIndex];

  if (!isOpen) return null;

  const handleResolve = async (resolution: 'mine' | 'server' | 'both') => {
    if (!currentConflict?.id) return;
    
    setIsResolving(true);
    
    try {
      const { resolveConflict: resolveInDB } = await import('@/lib/offline-db');
      
      if (resolution === 'server') {
        // Just mark as resolved, server data wins
        await resolveInDB(currentConflict.id);
      } else if (resolution === 'mine') {
        // Re-queue local data
        const { queueChange } = await import('@/lib/offline-db');
        await queueChange({
          type: currentConflict.type,
          action: 'create',
          data: currentConflict.localData,
          userId: (currentConflict.localData as any).userId || '',
          localCreatedAt: new Date().toISOString(),
        });
        await resolveInDB(currentConflict.id);
      } else if (resolution === 'both') {
        // Create new entry with local data
        const { queueChange } = await import('@/lib/offline-db');
        await queueChange({
          type: currentConflict.type,
          action: 'create',
          data: { ...currentConflict.localData, id: undefined },
          userId: (currentConflict.localData as any).userId || '',
          localCreatedAt: new Date().toISOString(),
        });
        await resolveInDB(currentConflict.id);
      }

      // Move to next conflict or close
      if (currentIndex < conflicts.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        onResolved();
        onClose();
      }
    } catch (err) {
      console.error('Error resolving conflict:', err);
    } finally {
      setIsResolving(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'flight_log': return 'Flight Log';
      case 'maintenance': return 'Maintenance';
      case 'aircraft_status': return 'Aircraft Status';
      case 'booking': return 'Booking';
      default: return type;
    }
  };

  const formatData = (data: Record<string, unknown>) => {
    if (!data) return 'No data';
    
    const importantFields: string[] = [];
    
    if (data.date) importantFields.push(`Date: ${data.date}`);
    if (data.tachTime) importantFields.push(`Tach: ${data.tachTime}`);
    if (data.hobbsTime) importantFields.push(`Hobbs: ${data.hobbsTime}`);
    if (data.nNumber) importantFields.push(`Aircraft: ${data.nNumber}`);
    if (data.description) importantFields.push(`Description: ${data.description}`);
    if (data.status) importantFields.push(`Status: ${data.status}`);
    
    return importantFields.length > 0 ? importantFields.join(', ') : JSON.stringify(data, null, 2);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-xl p-8 text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500 mx-auto"></div>
          <div className="mt-4 text-center">Loading conflicts...</div>
        </div>
      </div>
    );
  }

  if (conflicts.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-slate-700">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>⚠️</span>
                Sync Conflict
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Conflict {currentIndex + 1} of {conflicts.length}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <span className="text-2xl text-slate-400">&times;</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {currentConflict && (
            <>
              <div className="mb-6">
                <div className="text-sm text-slate-400 uppercase tracking-wide mb-2">
                  Type
                </div>
                <div className="text-white font-medium">
                  {getTypeLabel(currentConflict.type)}
                  {currentConflict.conflictType === 'deleted' && (
                    <span className="ml-2 text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">
                      Deleted on server
                    </span>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Your Entry */}
                <div className="bg-sky-900/30 rounded-lg p-4 border border-sky-700/50">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">📱</span>
                    <h3 className="font-semibold text-sky-400">Your Entry (Offline)</h3>
                  </div>
                  <div className="text-sm text-slate-300 whitespace-pre-wrap">
                    {formatData(currentConflict.localData)}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    Created: {new Date(currentConflict.detectedAt).toLocaleString()}
                  </div>
                </div>

                {/* Server Version */}
                <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">☁️</span>
                    <h3 className="font-semibold text-slate-300">Server Version</h3>
                  </div>
                  {currentConflict.conflictType === 'deleted' ? (
                    <div className="text-sm text-red-400">
                      This record was deleted from the server.
                    </div>
                  ) : (
                    <div className="text-sm text-slate-300 whitespace-pre-wrap">
                      {formatData(currentConflict.serverData)}
                    </div>
                  )}
                  {currentConflict.serverData && (
                    <div className="text-xs text-slate-500 mt-2">
                      Last modified: {((currentConflict.serverData as any).updatedAt 
                        ? new Date((currentConflict.serverData as any).updatedAt).toLocaleString() 
                        : 'Unknown')}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-slate-700 bg-slate-800/50">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => handleResolve('mine')}
              disabled={isResolving}
              className="flex-1 px-4 py-3 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 rounded-lg font-medium transition-colors"
            >
              Keep Mine
            </button>
            <button
              onClick={() => handleResolve('server')}
              disabled={isResolving}
              className="flex-1 px-4 py-3 bg-slate-600 hover:bg-slate-500 disabled:opacity-50 rounded-lg font-medium transition-colors"
            >
              Keep Server
            </button>
            <button
              onClick={() => handleResolve('both')}
              disabled={isResolving}
              className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 rounded-lg font-medium transition-colors"
            >
              Keep Both
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
