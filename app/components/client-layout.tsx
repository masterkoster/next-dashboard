'use client';

import { usePathname } from 'next/navigation';
import Navigation from './navigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <>
      {!isHomePage && <Navigation />}
      <main className={isHomePage ? '' : 'pt-20'}>
        {children}
      </main>
    </>
  );
}
