export type ModuleDefinition = {
  id: string;
  label: string;
  href: string;
  description?: string;
  requiresPurchase?: boolean;
};

export const moduleCatalog: ModuleDefinition[] = [
  {
    id: "pilot-overview",
    label: "Pilot Overview",
    href: "/modules/pilot-overview",
    description: "Logbook, training progress, currency tracking & analytics",
    requiresPurchase: true,
  },
  {
    id: "flying-club",
    label: "Flying Club",
    href: "/modules/flying-club",
    description: "Manage shared aircraft, bookings, members & billing",
    requiresPurchase: false,
  },
  {
    id: "marketplace",
    label: "Aircraft Marketplace",
    href: "/modules/marketplace",
    description: "Find aircraft partners, co-ownership opportunities, or buyers",
    requiresPurchase: false,
  },
  {
    id: "fuel-saver",
    label: "Fuel Saver",
    href: "/modules/fuel-saver",
    description: "Find cheapest fuel along your route",
    requiresPurchase: false,
  },
  {
    id: "e6b",
    label: "E6B Flight Computer",
    href: "/modules/e6b",
    description: "Full aviation calculator - wind, fuel, conversions",
    requiresPurchase: false,
  },
  {
    id: "weather-radar",
    label: "Weather Radar",
    href: "/modules/weather-radar",
    description: "Real-time precipitation and storm tracking",
    requiresPurchase: false,
  },
  {
    id: "flight-playback",
    label: "Flight Playback",
    href: "/modules/flight-playback",
    description: "Replay your flights on a map with track data",
    requiresPurchase: true,
  },
];
