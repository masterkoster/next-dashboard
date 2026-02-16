import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Plane Search - Search Aircraft by Make, Model, or Registration',
  description: 'Search and find aircraft information by make, model, or registration number. Access detailed aircraft specs, history, and registration details.',
  keywords: ['aircraft search', 'plane search', 'N-number search', 'aircraft registration', 'tail number search', 'aircraft specs', 'make model search'],
  openGraph: {
    title: 'Plane Search - Search Aircraft by Make, Model, or Registration',
    description: 'Search and find aircraft information by make, model, or registration number.',
  },
};

export default function PlaneSearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
