import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fuel Saver - Find Cheap Fuel & Plan Flight Routes',
  description: 'Plan your flight route with the cheapest fuel stops. Calculate total flight costs including fuel, landing fees, and reserves. Find the most cost-effective way to fly with our free fuel price calculator.',
  keywords: ['fuel saver', 'flight fuel calculator', 'cheap fuel stops', 'flight cost calculator', 'aviation fuel planning', 'pilot fuel planning', 'flight route optimizer', '100LL fuel prices', 'jet fuel prices'],
  openGraph: {
    title: 'Fuel Saver - Find Cheap Fuel & Plan Flight Routes',
    description: 'Plan your flight route with the cheapest fuel stops. Calculate total flight costs including fuel, landing fees, and reserves.',
  },
};

export default function FuelSaverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
