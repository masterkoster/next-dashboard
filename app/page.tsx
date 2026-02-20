import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import LandingPageClient from './components/landing-page-client';

export default async function LandingPage() {
  const session = await auth();
  if (session?.user?.email) {
    redirect('/dashboard');
  }
  return <LandingPageClient />;
}
