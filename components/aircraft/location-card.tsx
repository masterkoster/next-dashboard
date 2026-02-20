import { MapPin, Navigation } from "lucide-react"

interface LocationCardProps {
  airportIcao: string;
  airportName?: string | null;
  airportCity?: string | null;
}

export function LocationCard({ airportIcao, airportName, airportCity }: LocationCardProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-foreground">Location</h2>

      <div className="mt-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MapPin className="h-5 w-5" />
        </div>
        <div>
          <p className="font-mono text-sm font-semibold text-foreground">{airportIcao}</p>
          {airportName && <p className="mt-0.5 text-sm text-muted-foreground">{airportName}</p>}
          {airportCity && <p className="text-xs text-muted-foreground/70">{airportCity}</p>}
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="mt-4 relative aspect-[2/1] overflow-hidden rounded-lg border border-border bg-secondary">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <Navigation className="h-8 w-8 text-primary/40" />
          <span className="text-xs">Interactive map</span>
        </div>
        {/* Decorative grid */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
    </section>
  )
}
