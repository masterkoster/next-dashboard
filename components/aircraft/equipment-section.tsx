import { Monitor, Wrench, Sparkles } from "lucide-react"

interface EquipmentSectionProps {
  avionics?: string[] | null;
  features?: string[] | null;
  upgrades?: string[] | null;
}

const defaultAvionics = [
  "Garmin Perspective+",
  "GFC 700 Autopilot",
  "GDL 69A XM Weather",
  "GTX 345 ADS-B In/Out",
]

const defaultFeatures = [
  "Air Conditioning",
  "Heated Seats",
  "Premium Leather Interior",
  "USB Charging Ports",
]

const defaultUpgrades = [
  "LED Landing Lights",
  "Premium Paint Scheme",
  "Bose A20 Headsets",
]

function TagGroup({
  title,
  icon: Icon,
  items,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  items: string[]
}) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

export function EquipmentSection({ avionics, features, upgrades }: EquipmentSectionProps) {
  const displayAvionics = avionics && avionics.length > 0 ? avionics : defaultAvionics;
  const displayFeatures = features && features.length > 0 ? features : defaultFeatures;
  const displayUpgrades = upgrades && upgrades.length > 0 ? upgrades : defaultUpgrades;

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-foreground">Equipment</h2>
      <div className="mt-5 space-y-6">
        <TagGroup title="Avionics" icon={Monitor} items={displayAvionics} />
        <TagGroup title="Features" icon={Sparkles} items={displayFeatures} />
        <TagGroup title="Upgrades" icon={Wrench} items={displayUpgrades} />
      </div>
    </section>
  )
}
