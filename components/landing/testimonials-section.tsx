import { Star } from "lucide-react"

const testimonials = [
  {
    name: "James W.",
    role: "PPL, Cessna 172 owner",
    initials: "JW",
    text: "The fuel saver alone paid for Pro in one fill-up. Found 100LL $1.40 cheaper at an airport 12nm away I never would have checked.",
    rating: 5,
  },
  {
    name: "Sarah M.",
    role: "Student pilot, 42 hours",
    initials: "SM",
    text: "Training tracker keeps me motivated. I can see exactly how close I am to checkride requirements and my instructor loves the shared notes.",
    rating: 5,
  },
  {
    name: "David C.",
    role: "Flying club president",
    initials: "DC",
    text: "We switched from a shared Google Calendar to Flying Club. Night and day difference. Billing disputes dropped to zero and scheduling conflicts are gone.",
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            From the Community
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground lg:text-4xl text-balance">
            What pilots are saying
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="group flex flex-col rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-primary text-primary"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="mt-4 flex-1 text-sm text-muted-foreground leading-relaxed">
                {`"${t.text}"`}
              </p>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
