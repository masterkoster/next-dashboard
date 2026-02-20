"use client"

import { useState } from "react"
import { Fuel, Users, Calculator, GraduationCap, ArrowRight, Check, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const modules = [
  {
    icon: Fuel,
    title: "Fuel Saver",
    tagline: "Stop overpaying at the pump",
    description:
      "Compare 100LL and Jet-A prices across airports. Search by ICAO, plan multi-stop routes for the cheapest fuel, and see real-time price data contributed by the community.",
    features: [
      "Search by ICAO identifier",
      "Compare fuel prices across FBOs",
      "Plan multi-stop fuel routes",
      "Free for home state, all 50 with Pro",
    ],
    preview: [
      { airport: "KJFK", fbo: "Atlantic Aviation", price: "$6.45" },
      { airport: "KHPN", fbo: "Million Air", price: "$6.12" },
      { airport: "KFRG", fbo: "Sheltair", price: "$5.98" },
    ],
  },
  {
    icon: Users,
    title: "Flying Club",
    tagline: "One place for your whole club",
    description:
      "Schedule bookings, track hours across shared aircraft, handle billing, and keep every member on the same page. Built for clubs of any size.",
    features: [
      "Online aircraft scheduling",
      "Automatic hour tracking",
      "Member billing & invoices",
      "Maintenance alerts",
    ],
    preview: [
      { airport: "N732SP", fbo: "Today 09:00", price: "J. Wright" },
      { airport: "N732SP", fbo: "Today 14:00", price: "Available" },
      { airport: "N415CD", fbo: "Tomorrow", price: "S. Chen" },
    ],
  },
  {
    icon: Calculator,
    title: "E6B Flight Computer",
    tagline: "All the math, none of the spinning",
    description:
      "Wind correction, fuel burn estimates, density altitude, unit conversions, and more. A modern E6B that lives in your browser and actually makes sense.",
    features: [
      "Wind correction angles",
      "Fuel burn estimates",
      "Density altitude calculator",
      "TAS, ETA & unit conversions",
    ],
    preview: [
      { airport: "CRS", fbo: "True Course", price: "270\u00B0" },
      { airport: "WND", fbo: "Wind", price: "310\u00B0/18kt" },
      { airport: "HDG", fbo: "Heading", price: "262\u00B0" },
    ],
  },
  {
    icon: GraduationCap,
    title: "Training Tracker",
    tagline: "Student pilot to checkride, tracked",
    description:
      "Visual progress bars for every PPL requirement. Log hours, tick off milestones, and see exactly where you stand on the road to your certificate.",
    features: [
      "Visual milestone progress",
      "Flight hour logging",
      "Checkride readiness score",
      "Instructor note sharing",
    ],
    preview: [
      { airport: "XC", fbo: "Solo Cross-Country", price: "Done" },
      { airport: "NHR", fbo: "Night Hours", price: "2.4/3.0" },
      { airport: "CKR", fbo: "Checkride Prep", price: "85%" },
    ],
  },
]

export function FeaturedListings() {
  const [selected, setSelected] = useState(0)
  const mod = modules[selected]

  return (
    <section id="modules" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Platform Modules
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground lg:text-4xl text-balance">
            Four tools. One login.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground leading-relaxed">
            Each module is purpose-built for a specific part of your flying life. Use one or all of them.
          </p>
        </div>

        {/* Interactive Module Selector */}
        <div className="mt-14 grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Left: Module Tabs */}
          <div className="flex flex-row gap-2 overflow-x-auto lg:flex-col lg:gap-1.5 lg:overflow-visible">
            {modules.map((m, i) => (
              <button
                key={m.title}
                onClick={() => setSelected(i)}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-all duration-300 shrink-0 ${
                  selected === i
                    ? "border border-primary/30 bg-primary/10"
                    : "border border-transparent hover:bg-secondary/50"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    selected === i
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  <m.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold ${selected === i ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
                    {m.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">{m.tagline}</p>
                </div>
                <ChevronRight className={`ml-auto hidden h-4 w-4 shrink-0 lg:block transition-colors ${selected === i ? "text-primary" : "text-transparent"}`} />
              </button>
            ))}
          </div>

          {/* Right: Module Detail */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="grid gap-0 lg:grid-cols-2">
              {/* Info */}
              <div className="flex flex-col justify-between p-7 lg:p-9">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <mod.icon className="h-5.5 w-5.5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{mod.title}</h3>
                      <p className="text-sm text-primary">{mod.tagline}</p>
                    </div>
                  </div>
                  <p className="mt-5 text-sm text-muted-foreground leading-relaxed">{mod.description}</p>
                  <ul className="mt-5 flex flex-col gap-2">
                    {mod.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-foreground/80">
                        <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-7">
                  <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                    Try {mod.title}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Live Preview */}
              <div className="border-t border-border bg-secondary/30 p-7 lg:border-t-0 lg:border-l lg:p-9">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Preview
                </p>
                <div className="mt-5 flex flex-col gap-3">
                  {mod.preview.map((row, i) => (
                    <div
                      key={`${selected}-${i}`}
                      className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 animate-in fade-in slide-in-from-bottom-2"
                      style={{ animationDelay: `${i * 100}ms`, animationFillMode: "both" }}
                    >
                      <div>
                        <p className="font-mono text-xs text-primary">{row.airport}</p>
                        <p className="mt-0.5 text-sm text-foreground">{row.fbo}</p>
                      </div>
                      <span className="font-mono text-sm font-semibold text-foreground">{row.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
