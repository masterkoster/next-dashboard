"use client"

import { Check, Minus, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with basic tools",
    cta: "Start Free",
    featured: false,
  },
  {
    name: "Pro",
    price: "$3.99",
    period: "/mo",
    description: "For serious weekend pilots",
    cta: "Go Pro",
    featured: true,
  },
  {
    name: "Pro+",
    price: "$6.99",
    period: "/mo",
    description: "Full toolkit, nothing held back",
    cta: "Go Pro+",
    featured: false,
  },
]

const features = [
  { name: "Fuel prices", free: "Home state", pro: "All 50 states", proPlus: "All 50 states" },
  { name: "E6B Flight Computer", free: true, pro: true, proPlus: true },
  { name: "Training Tracker", free: true, pro: true, proPlus: true },
  { name: "Weight & Balance", free: true, pro: true, proPlus: true },
  { name: "NOTAMs & Weather", free: true, pro: true, proPlus: true },
  { name: "Export to ForeFlight", free: true, pro: true, proPlus: true },
  { name: "Export to PDF", free: true, pro: true, proPlus: true },
  { name: "Digital Logbook", free: false, pro: false, proPlus: true },
  { name: "Currency Tracking", free: false, pro: false, proPlus: true },
  { name: "Flight Playback", free: false, pro: false, proPlus: true },
]

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="text-xs font-medium text-foreground">{value}</span>
  }
  return value ? (
    <Check className="h-4 w-4 text-primary" />
  ) : (
    <Minus className="h-4 w-4 text-muted-foreground/40" />
  )
}

export function CategoriesSection() {
  return (
    <section id="pricing" className="border-y border-border bg-card/30 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Pricing
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground lg:text-4xl text-balance">
            Most of it is free. Seriously.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground leading-relaxed">
            No credit card needed to start. Upgrade when you want fuel prices nationwide or advanced tracking features.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-7 transition-all duration-300 ${
                plan.featured
                  ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/5"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                    Most Popular
                  </span>
                </div>
              )}
              <p className="text-sm font-semibold text-foreground">{plan.name}</p>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-mono text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              <Button
                className={`mt-6 gap-2 ${
                  plan.featured
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {plan.cta}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="mt-14 overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Feature
                  </th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Free
                  </th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-primary">
                    Pro
                  </th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Pro+
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map((feat, i) => (
                  <tr
                    key={feat.name}
                    className={`border-b border-border/50 ${i % 2 === 0 ? "" : "bg-secondary/10"}`}
                  >
                    <td className="px-5 py-3 text-sm text-foreground">{feat.name}</td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex justify-center">
                        <CellValue value={feat.free} />
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex justify-center">
                        <CellValue value={feat.pro} />
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex justify-center">
                        <CellValue value={feat.proPlus} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
