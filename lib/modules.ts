export type ModuleDefinition = {
  id: string;
  label: string;
  href: string;
  description?: string;
};

export const moduleCatalog: ModuleDefinition[] = [
  {
    id: "overview",
    label: "Overview",
    href: "/modules/overview",
    description: "High-level summary of your workspace.",
  },
  {
    id: "analytics",
    label: "Analytics",
    href: "/modules/analytics",
    description: "Engagement and traffic trends.",
  },
  {
    id: "billing",
    label: "Billing",
    href: "/modules/billing",
    description: "Invoices, payment methods, and credits.",
  },
  {
    id: "settings",
    label: "Settings",
    href: "/modules/settings",
    description: "Account, notifications, and team controls.",
  },
];
