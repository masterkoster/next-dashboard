import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Plane Carfax - Aircraft History Report',
  description: 'Get comprehensive aircraft history reports including registration info, ownership history, accident records, and more. Like a Carfax for airplanes.',
  keywords: ['aircraft history report', 'plane carfax', 'aircraft accident history', 'aircraft ownership history', 'N-number report', 'pre-buy inspection'],
  openGraph: {
    title: 'Plane Carfax - Aircraft History Report',
    description: 'Get comprehensive aircraft history reports including registration info, ownership history, and accident records.',
  },
};

export default function PlaneCarcassLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
