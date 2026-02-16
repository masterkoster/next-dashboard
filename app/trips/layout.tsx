import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Trips - Flight Log & Trip History',
  description: 'Track your flight trips, view flight history, and manage your personal flight log. Keep a record of all your flights.',
  keywords: ['flight log', 'trip history', 'my flights', 'pilot logbook', 'flight tracking', 'flight history'],
  openGraph: {
    title: 'My Trips - Flight Log & Trip History',
    description: 'Track your flight trips and view your flight history.',
  },
};

export default function TripsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
