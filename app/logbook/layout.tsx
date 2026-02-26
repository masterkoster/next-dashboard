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
  { label: 'Preferences', href: '/logbook?tab=preferences' },
]

export default function LogbookLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background pt-[44px]">
      <aside className="fixed top-[44px] left-0 h-[calc(100vh-44px)] w-56 shrink-0 overflow-y-auto border-r border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Logbook</p>
        </div>
        <nav className="py-1">
          {LOGBOOK_LINKS.map((item, index) => (
            <div key={item.href} className={index === 0 ? "" : "border-t border-border/40"}>
              <Link
                href={item.href}
                className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                {item.label}
              </Link>
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex-1 overflow-auto ml-[224px]">
        <div className="sticky top-0 z-30 flex h-11 items-center justify-between border-b border-border bg-card/95 px-6 backdrop-blur">
          <h1 className="text-sm font-semibold">Logbook</h1>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
