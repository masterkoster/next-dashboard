import Link from 'next/link'

const LOGBOOK_LINKS = [
  { label: 'Add Flights', href: '/logbook?tab=add' },
  { label: 'Search', href: '/logbook?tab=search' },
  { label: 'Totals', href: '/logbook?tab=totals' },
  { label: 'Currency', href: '/logbook?tab=currency' },
  { label: 'Analysis', href: '/logbook?tab=analysis' },
  { label: 'Download', href: '/logbook?tab=download' },
  { label: 'Import', href: '/logbook?tab=import' },
  { label: 'Starting Totals', href: '/logbook?tab=starting-totals' },
  { label: 'Check Flights', href: '/logbook?tab=check-flights' },
  { label: 'Print View', href: '/logbook?tab=print-view' },
  { label: 'Pending Flights', href: '/logbook?tab=pending' },
]

export default function LogbookLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <aside className="space-y-2 rounded-lg border border-border bg-card p-4">
            <div className="text-sm font-semibold text-muted-foreground">Logbook</div>
            <nav className="space-y-1">
              {LOGBOOK_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
          <main>{children}</main>
        </div>
      </div>
    </div>
  )
}
