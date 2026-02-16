import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tail History - Aircraft Registration & History Search',
  description: 'Look up aircraft registration history, ownership records, and accident information by tail number (N-number). Research any US registered aircraft.',
  keywords: ['tail number search', 'aircraft history', 'N-number lookup', 'plane registration history', 'aircraft accident search', 'FAA aircraft registration'],
  openGraph: {
    title: 'Tail History - Aircraft Registration & History Search',
    description: 'Look up aircraft registration history, ownership records, and accident information by tail number.',
  },
};

export default function TailHistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
