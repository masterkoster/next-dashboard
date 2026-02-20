import { Lock, Eye, Shield, Database } from "lucide-react"

const trustItems = [
  {
    icon: Lock,
    title: "End-to-End Encrypted",
    description: "Messages and sensitive data are encrypted. We store only encrypted blobs -- even we can't read them.",
  },
  {
    icon: Eye,
    title: "Your Plans Stay Private",
    description: "Flight plans, routes, and personal data are never shared, sold, or used for advertising. Period.",
  },
  {
    icon: Shield,
    title: "Community Fuel Prices",
    description: "Fuel prices you share are public to help the community. Everything else is yours and yours alone.",
  },
  {
    icon: Database,
    title: "You Own Your Data",
    description: "Export everything at any time. Delete your account and all data is permanently removed within 48 hours.",
  },
]

export function WhySection() {
  return (
    <section id="privacy" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          {/* Left: Message */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Privacy & Trust
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground lg:text-4xl text-balance">
              Your data is yours. Full stop.
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              We built AviationHub the way we{"'"}d want it as pilots ourselves:
              private by default, transparent about what{"'"}s shared, and always in your control.
            </p>

            {/* Inline code-style trust badge */}
            <div className="mt-8 inline-flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-5 py-3">
              <Lock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Zero-knowledge architecture</p>
                <p className="text-xs text-muted-foreground">
                  We can{"'"}t read your data even if we wanted to
                </p>
              </div>
            </div>
          </div>

          {/* Right: Trust Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {trustItems.map((item, i) => (
              <div
                key={item.title}
                className="group rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/30"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
