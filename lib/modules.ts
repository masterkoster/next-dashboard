export type ModuleDefinition = {
  id: string;
  label: string;
  href: string;
  description?: string;
};

export const moduleCatalog: ModuleDefinition[] = [
  {
    id: "plane-carfax",
    label: "Plane Carfax",
    href: "/modules/plane-carfax",
    description: "FAA registration history & ownership details",
  },
  {
    id: "plane-search",
    label: "Plane Search",
    href: "/modules/plane-search",
    description: "Search & filter aircraft by model",
  },
  {
    id: "tailhistory",
    label: "TailHistory",
    href: "/modules/tailhistory",
    description: "3D timeline of aircraft history",
  },
  {
    id: "fuel-saver",
    label: "Fuel Saver",
    href: "/modules/fuel-saver",
    description: "Find cheapest fuel along your route",
  },
  {
    id: "e6b",
    label: "E6B Flight Computer",
    href: "/modules/e6b",
    description: "Full aviation calculator - wind, fuel, conversions",
  },
  {
    id: "training",
    label: "Training Tracker",
    href: "/modules/training",
    description: "Track your PPL progress and requirements",
  },
];
