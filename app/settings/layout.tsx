import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings - Manage Your Account',
  description: 'Manage your AviationHub account settings, preferences, and data cache. Control your profile, notifications, and data sharing options.',
  keywords: ['account settings', 'profile settings', 'aviation preferences', 'user account'],
  openGraph: {
    title: 'Settings - Manage Your Account',
    description: 'Manage your AviationHub account settings and preferences.',
  },
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
