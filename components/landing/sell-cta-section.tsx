import { Fuel, Clock, MapPin, Users } from "lucide-react"

const stats = [
  { icon: Fuel, value: "48,200+", label: "Fuel prices tracked" },
  { icon: MapPin, label: "US airports covered", value: "5,400+" },
  { icon: Users, label: "Pilots on the platform", value: "2,400+" },
  { icon: Clock, label: "Avg. saved per fill-up", value: "$38" },
]

export function SellCtaSection() {
  return (
    <section className="border-y border-border bg-card/30 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            By the Numbers
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground lg:text-4xl text-balance">
            Built by pilots, growing fast
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground leading-relaxed">
            Real numbers from real usage. We{"'"}re in beta and already saving pilots time and money.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="group flex flex-col items-center rounded-2xl border border-border bg-card p-8 text-center transition-all duration-300 hover:border-primary/30"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <s.icon className="h-5.5 w-5.5" />
              </div>
              <p className="mt-5 font-mono text-3xl font-bold text-foreground lg:text-4xl">
                {s.value}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
