import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support - Help & FAQ',
  description: 'Get help with using AviationHub. Find answers to frequently asked questions, troubleshooting tips, and contact information for support.',
  keywords: ['aviation support', 'help', 'FAQ', 'frequently asked questions', 'pilot tools help', 'contact support'],
  openGraph: {
    title: 'Support - Help & FAQ',
    description: 'Get help with using AviationHub.',
  },
};

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
