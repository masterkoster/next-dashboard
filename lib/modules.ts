export type ModuleDefinition = {
  id: string;
  label: string;
  href: string;
  description?: string;
  requiresPurchase?: boolean;
};

export const moduleCatalog: ModuleDefinition[] = [
  {
    id: "plane-carfax",
    label: "Plane Carfax",
    href: "/modules/plane-carfax",
    description: "FAA registration history & ownership details",
    requiresPurchase: true,
  },
  {
    id: "plane-search",
    label: "Plane Search",
    href: "/modules/plane-search",
    description: "Search & filter aircraft by model",
    requiresPurchase: true,
  },
  {
    id: "tailhistory",
    label: "TailHistory",
    href: "/modules/tailhistory",
    description: "3D timeline of aircraft history",
    requiresPurchase: true,
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
    id: "training",
    label: "Training Tracker",
    href: "/modules/training",
    description: "Track your PPL progress and requirements",
    requiresPurchase: false,
  },
  {
    id: "logbook",
    label: "Digital Logbook",
    href: "/modules/logbook",
    description: "Track flight hours with Pro+",
    requiresPurchase: true,
  },
  {
    id: "weather-radar",
    label: "Weather Radar",
    href: "/modules/weather-radar",
    description: "Real-time precipitation and storm tracking",
    requiresPurchase: false,
  },
];
