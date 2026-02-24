'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SocialOverviewPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/modules/social/messages');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-white">Redirecting...</div>
    </div>
  );
}
