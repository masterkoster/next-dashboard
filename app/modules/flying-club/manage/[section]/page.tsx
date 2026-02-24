import { notFound } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import AddOnsSection from '@/components/club/AddOnsSection'
import ManageBillingSection from '@/components/club/ManageBillingSection'
import ManageUsersSection from '@/components/club/ManageUsersSection'

const SECTION_META: Record<string, { title: string; description: string }> = {
  'awaiting-dispatch': {
    title: 'Awaiting Dispatch',
    description: 'Flights that are scheduled but not yet checked out. This queue helps dispatch keep the ramp running smoothly.',
  },
  'currently-dispatched': {
    title: 'Currently Dispatched',
    description: 'Active Hobbs checkouts and in-progress flights. Close out entries as aircraft return.',
  },
  'past-flights': {
    title: 'Past Flights',
    description: 'Historical dispatch records for quick balance checks or training reviews.',
  },
  groups: {
    title: 'Groups',
    description: 'Organize members into training cohorts, billing categories, or operating locations.',
  },
  aircraft: {
    title: 'Aircraft',
    description: 'Manage aircraft availability, maintenance grounding, and hourly rates.',
  },
  items: {
    title: 'Items',
    description: 'Define supplemental charges such as instructor fees, headset rentals, or fuel surcharges.',
  },
  adjustments: {
    title: 'Adjustments',
    description: 'Create ledger entries for manual credits and debits outside of normal billing runs.',
  },
  forms: {
    title: 'Forms',
    description: 'Store checkout forms, waivers, and club policies for easy member access.',
  },
  automation: {
    title: 'Automation',
    description: 'Schedule reminders, dispatch alerts, and other workflows to save your admins time.',
  },
  'general-settings': {
    title: 'General Settings',
    description: 'Club-wide preferences including name, logo, billing messages, and contact details.',
  },
  'user-settings': {
    title: 'User Settings',
    description: 'Control onboarding defaults, permissions, and required profile fields.',
  },
  'schedule-settings': {
    title: 'Schedule Settings',
    description: 'Configure booking window limits, cancellation policies, and double-booking rules.',
  },
  'notification-settings': {
    title: 'Notification Settings',
    description: 'Choose which events trigger emails, SMS, or push notifications to members and admins.',
  },
}

const PLACEHOLDER_CALLOUT = {
  title: 'Coming soon',
  body: 'This area is on the roadmap. In the meantime, let us know what data or actions would make this page indispensable for your club.',
  cta: {
    label: 'Share feedback',
    href: 'mailto:hello@aviationhub.com?subject=Flight%20club%20feedback',
  },
}

const USER_SECTION_CONFIG: Record<string, { title: string; description: string; roleFilter?: 'admin' | 'instructor' | 'member' }> = {
  users: {
    title: 'Users',
    description: 'View every member in your club, track balances, and jump into their ledger.',
  },
  administrators: {
    title: 'Administrators',
    description: 'Club owners and admins with permission to edit aircraft, billing, and settings.',
    roleFilter: 'admin',
  },
  instructors: {
    title: 'Instructors',
    description: 'Certified instructors who can be assigned to lessons and sign-off flights.',
    roleFilter: 'instructor',
  },
}

interface ManageSectionPageProps {
  params: {
    section: string
  }
}

export default function ManageSectionPage({ params }: ManageSectionPageProps) {
  const section = params.section

  if (section === 'add-ons') {
    return <AddOnsSection />
  }

  if (section === 'billing') {
    return <ManageBillingSection />
  }

  const userSection = USER_SECTION_CONFIG[section]
  if (userSection) {
    return (
      <ManageUsersSection
        title={userSection.title}
        description={userSection.description}
        roleFilter={userSection.roleFilter}
      />
    )
  }

  const meta = SECTION_META[section]

  if (!meta) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">{meta.title}</h1>
        <p className="text-sm text-muted-foreground">{meta.description}</p>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">{PLACEHOLDER_CALLOUT.title}</CardTitle>
          <CardDescription>{PLACEHOLDER_CALLOUT.body}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button asChild size="sm" variant="secondary">
            <a href={PLACEHOLDER_CALLOUT.cta.href}>{PLACEHOLDER_CALLOUT.cta.label}</a>
          </Button>
          <Separator orientation="vertical" className="hidden h-6 lg:block" />
          <span className="text-xs text-muted-foreground">
            We use your feedback to prioritize dashboards, exports, and the metrics that matter most to dispatch and accounting.
          </span>
        </CardContent>
      </Card>
    </div>
  )
}
