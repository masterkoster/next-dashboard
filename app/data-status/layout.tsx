import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Cache Status - View Fuel Price Data',
  description: 'View the status of cached aviation data including fuel prices, last update times, and data sources. See how current our airport fuel price data is.',
  keywords: ['fuel price data', 'cached data', 'data status', 'fuel prices cache', 'airport data'],
  openGraph: {
    title: 'Data Cache Status - View Fuel Price Data',
    description: 'View the status of cached aviation data including fuel prices.',
  },
};

export default function DataStatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
