'use client';

import Navigation from './navigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      <main className="pt-20">
        {children}
      </main>
    </>
  );
}
