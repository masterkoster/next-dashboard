'use client';

import { useSyncStatus } from '@/hooks/useOfflineData';

interface OfflineBannerProps {
  onSyncNow?: () => void;
}

export default function OfflineBanner({ onSyncNow }: OfflineBannerProps) {
  const { isOffline, pendingCount, conflictsCount, isSyncing } = useSyncStatus();

  if (!isOffline && pendingCount === 0 && conflictsCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-md mx-auto">
        {isOffline ? (
          // Offline state
          <div className="bg-amber-900/90 backdrop-blur text-white rounded-xl p-4 shadow-lg border border-amber-700">
            <div className="flex items-center gap-3">
              <div className="text-2xl">📴</div>
              <div className="flex-1">
                <div className="font-semibold">You&apos;re offline</div>
                <div className="text-sm text-amber-200">
                  Changes will sync when you&apos;re back online
                </div>
              </div>
            </div>
          </div>
        ) : pendingCount > 0 ? (
          // Online but pending syncs
          <div className="bg-sky-900/90 backdrop-blur text-white rounded-xl p-4 shadow-lg border border-sky-700">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🔄</div>
              <div className="flex-1">
                <div className="font-semibold">
                  {pendingCount} change{pendingCount !== 1 ? 's' : ''} pending sync
                </div>
                <div className="text-sm text-sky-200">
                  {conflictsCount > 0 && (
                    <span className="text-amber-300">
                      {conflictsCount} conflict{conflictsCount !== 1 ? 's' : ''} need{conflictsCount === 1 ? 's' : ''} attention
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onSyncNow}
                disabled={isSyncing}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 rounded-lg font-medium text-sm transition-colors"
              >
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>
          </div>
        ) : conflictsCount > 0 ? (
          // Has conflicts
          <div className="bg-red-900/90 backdrop-blur text-white rounded-xl p-4 shadow-lg border border-red-700">
            <div className="flex items-center gap-3">
              <div className="text-2xl">⚠️</div>
              <div className="flex-1">
                <div className="font-semibold">
                  {conflictsCount} conflict{conflictsCount !== 1 ? 's' : ''} need{conflictsCount === 1 ? 's' : ''} attention
                </div>
                <div className="text-sm text-red-200">
                  Review and resolve to keep your data accurate
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
