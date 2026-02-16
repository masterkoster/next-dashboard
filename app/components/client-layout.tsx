'use client';

 import { usePathname } from 'next/navigation';
 import { useEffect, useState } from 'react';
 import { SessionProvider } from 'next-auth/react';
 import Navigation from './navigation';
 import OfflineBanner from './offline-banner';
 import ConflictModal from './conflicts-modal';

 export default function ClientLayout({ children }: { children: React.ReactNode }) {
   const pathname = usePathname();
   const isHomePage = pathname === '/';
   const [showConflicts, setShowConflicts] = useState(false);

   // Register service worker for PWA
   useEffect(() => {
     if ('serviceWorker' in navigator) {
       navigator.serviceWorker.register('/service-worker.js').catch((err) => {
         console.log('SW registration failed:', err);
       });
     }
   }, []);

    return (
      <SessionProvider>
        <>
          {!isHomePage && <Navigation />}
           <main>{children}</main>
          <OfflineBanner onSyncNow={() => setShowConflicts(true)} />
          <ConflictModal
           isOpen={showConflicts} 
           onClose={() => setShowConflicts(false)} 
           onResolved={() => {}} 
         />
       </>
     </SessionProvider>
   );
 }
