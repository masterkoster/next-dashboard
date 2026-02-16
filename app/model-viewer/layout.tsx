import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Model Viewer - Explore Aircraft Models & Specs',
  description: 'View detailed specifications and information about various aircraft models. Compare specs, performance data, and characteristics of different airplanes.',
  keywords: ['aircraft models', 'airplane specs', 'aircraft specifications', 'plane specifications', 'aircraft comparison', 'model viewer'],
  openGraph: {
    title: 'Model Viewer - Explore Aircraft Models & Specs',
    description: 'View detailed specifications and information about various aircraft models.',
  },
};

export default function ModelViewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
