import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Your Aviation Hub',
  description: 'Your personal aviation dashboard. View your saved flight plans, trips, aircraft, and manage your aviation activities all in one place.',
  keywords: ['aviation dashboard', 'pilot dashboard', 'flight planning dashboard', 'my flights', 'aviation management'],
  openGraph: {
    title: 'Dashboard - Your Aviation Hub',
    description: 'Your personal aviation dashboard.',
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
