'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SessionProvider } from 'next-auth/react';

import OfflineBanner from './offline-banner';
import ConflictModal from './conflicts-modal';
import { AuthModalProvider } from './AuthModalContext';
import LoginModal from './LoginModal';
import ChatWidget from './chat-widget';
import { GlobalHeader } from './global-header';
import { ModuleNav } from './module-nav';
import { getModuleByPath } from '@/lib/modules';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const currentModule = pathname ? getModuleByPath(pathname) : undefined;
  const [showConflicts, setShowConflicts] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch((err) => {
        console.log('SW registration failed:', err);
      });
    }
  }, []);

  const mainPadding = isHomePage
    ? ''
    : '';

  return (
    <SessionProvider>
      <AuthModalProvider>
        <>
          {!isHomePage && (
            <>
              <GlobalHeader />
              {currentModule && currentModule.menu && currentModule.menu.length > 0 && (
                <ModuleNav module={currentModule} />
              )}
            </>
          )}
          <main className={mainPadding}>{children}</main>
          <OfflineBanner onSyncNow={() => setShowConflicts(true)} />
          <ConflictModal
            isOpen={showConflicts}
            onClose={() => setShowConflicts(false)}
            onResolved={() => {}}
          />
          <LoginModal />
          <ChatWidget />
        </>
      </AuthModalProvider>
    </SessionProvider>
  );
}
