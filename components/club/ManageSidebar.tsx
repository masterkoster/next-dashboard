'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Awaiting Dispatch', href: '/modules/flying-club/manage/awaiting-dispatch' },
  { label: 'Currently Dispatched', href: '/modules/flying-club/manage/currently-dispatched' },
  { label: 'Past Flights', href: '/modules/flying-club/manage/past-flights' },
  { label: 'Users', href: '/modules/flying-club/manage/users' },
  { label: 'Administrators', href: '/modules/flying-club/manage/administrators' },
  { label: 'Instructors', href: '/modules/flying-club/manage/instructors' },
  { label: 'Groups', href: '/modules/flying-club/manage/groups' },
  { label: 'Aircraft', href: '/modules/flying-club/manage/aircraft' },
  { label: 'Items', href: '/modules/flying-club/manage/items' },
  { label: 'Adjustments', href: '/modules/flying-club/manage/adjustments' },
  { label: 'Forms', href: '/modules/flying-club/manage/forms' },
  { label: 'Billing', href: '/modules/flying-club/manage/billing' },
  { label: 'Automation', href: '/modules/flying-club/manage/automation' },
  { label: 'General Settings', href: '/modules/flying-club/manage/general-settings' },
  { label: 'Users Settings', href: '/modules/flying-club/manage/user-settings' },
  { label: 'Schedule Settings', href: '/modules/flying-club/manage/schedule-settings' },
  { label: 'Notification Settings', href: '/modules/flying-club/manage/notification-settings' },
  { label: 'Add-ons', href: '/modules/flying-club/manage/add-ons' },
]

export default function ManageSidebar() {
  const pathname = usePathname()

  return (
    <aside className="lg:w-64 lg:shrink-0">
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-4 py-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Manage</div>
          <p className="mt-1 text-sm text-muted-foreground">Configure operations, billing, and integrations.</p>
        </div>
        <nav className="flex flex-col">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-muted',
                  active ? 'bg-primary/10 font-medium text-primary hover:bg-primary/10' : 'text-muted-foreground'
                )}
              >
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
