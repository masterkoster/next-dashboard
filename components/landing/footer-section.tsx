import { Plane, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const footerLinks = {
  Tools: [
    { label: "Fuel Saver", href: "/modules/fuel-saver" },
    { label: "E6B Calculator", href: "/modules/e6b" },
    { label: "Training Tracker", href: "/modules/training" },
    { label: "Flying Club", href: "/modules/flying-club" },
  ],
  Resources: [
    { label: "Getting Started", href: "/welcome" },
    { label: "FAQ", href: "/faq" },
    { label: "Changelog", href: "#" },
    { label: "Blog", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Contact", href: "/support" },
    { label: "Careers", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
}

export function FooterSection() {
  return (
    <footer className="border-t border-border">
      {/* Final CTA */}
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="flex flex-col items-center rounded-2xl border border-primary/20 bg-primary/5 px-6 py-12 text-center lg:px-12">
          <h2 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl text-balance">
            Ready to fly smarter?
          </h2>
          <p className="mt-3 max-w-md text-sm text-muted-foreground leading-relaxed">
            Join 2,400+ pilots already using AviationHub. Free forever plan available -- no credit card required.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              Create Free Account
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" className="border-border text-foreground hover:bg-secondary" asChild>
              <a href="#pricing">Compare Plans</a>
            </Button>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Plane className="h-4.5 w-4.5" />
                </div>
                <span className="text-base font-bold text-foreground">AviationHub</span>
              </Link>
              <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                Built by pilots, for pilots. Quick tools for the real world of general aviation.
              </p>
            </div>

            {/* Link Columns */}
            {Object.entries(footerLinks).map(([heading, links]) => (
              <div key={heading}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  {heading}
                </h3>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row lg:px-8">
          <p className="text-xs text-muted-foreground">
            2026 AviationHub. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Not affiliated with the FAA or ForeFlight.
          </p>
        </div>
      </div>
    </footer>
  )
}
