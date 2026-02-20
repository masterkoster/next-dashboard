export type AppModule = {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: string;
  badge?: string;
  requiresProPlus?: boolean;
  menu?: Array<{ label: string; href: string }>;
};

export const APP_MODULES: AppModule[] = [
  {
    id: 'marketplace',
    name: 'Marketplace',
    description: 'Browse verified aircraft listings and contact sellers.',
    href: '/modules/marketplace',
    icon: '🛩️',
    menu: [
      { label: 'Browse Listings', href: '/modules/marketplace' },
      { label: 'Sell Aircraft', href: '/modules/marketplace?sell=true' },
      { label: 'Saved Listings', href: '/modules/marketplace/saved' },
    ],
  },
  {
    id: 'fuel-saver',
    name: 'Fuel Saver',
    description: 'Plan efficient fuel stops with real-time pricing.',
    href: '/modules/fuel-saver',
    icon: '⛽',
    menu: [
      { label: 'Fuel Map', href: '/modules/fuel-saver' },
      { label: 'Airport Lookup', href: '/modules/fuel-saver/airport-lookup' },
      { label: 'Favorites', href: '/modules/fuel-saver/favorites' },
    ],
  },
  {
    id: 'flying-club',
    name: 'Flying Club',
    description: 'Manage aircraft scheduling and club members.',
    href: '/modules/flying-club',
    icon: '👥',
    menu: [
      { label: 'Dashboard', href: '/modules/flying-club' },
      { label: 'Groups', href: '/modules/flying-club/groups/new' },
      { label: 'Maintenance', href: '/modules/flying-club/maintenance' },
    ],
  },
  {
    id: 'e6b',
    name: 'E6B',
    description: 'Modern flight computer with real-time calculations.',
    href: '/modules/e6b',
    icon: '🧮',
    menu: [
      { label: 'Calculations', href: '/modules/e6b' },
      { label: 'Conversions', href: '/modules/e6b/conversions' },
    ],
  },
  {
    id: 'weather-radar',
    name: 'Weather Radar',
    description: 'Track live weather radar and aviation forecasts.',
    href: '/modules/weather-radar',
    icon: '🌦️',
    requiresProPlus: true,
    badge: 'Pro+',
    menu: [
      { label: 'Radar Map', href: '/modules/weather-radar' },
      { label: 'Forecasts', href: '/modules/weather-radar/forecasts' },
    ],
  },
  {
    id: 'social',
    name: 'Social',
    description: 'Connect with pilots and share flying experiences.',
    href: '/modules/social',
    icon: '💬',
    menu: [
      { label: 'Overview', href: '/modules/social/overview' },
      { label: 'Pilots', href: '/modules/social/pilots' },
      { label: 'Messages', href: '/modules/social/messages' },
    ],
  },
];

export function getModuleByPath(pathname: string): AppModule | undefined {
  return APP_MODULES.find((module) => pathname === module.href || pathname.startsWith(`${module.href}/`));
}

export type ModuleDefinition = {
  id: string;
  label: string;
  href: string;
  description: string;
  requiresPurchase?: boolean;
};

export const moduleCatalog: ModuleDefinition[] = APP_MODULES.map((module) => ({
  id: module.id,
  label: module.name,
  href: module.href,
  description: module.description,
  requiresPurchase: module.requiresProPlus,
}));
