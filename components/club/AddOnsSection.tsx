'use client'

import { useState } from 'react'
import Link from 'next/link'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CalendarCheck, Landmark, ShieldCheck, Zap } from 'lucide-react'

type IntegrationStatus = 'connected' | 'disconnected' | 'coming-soon'

interface Integration {
  id: string
  name: string
  description: string
  status: IntegrationStatus
  icon: React.ReactNode
  features: string[]
  helpUrl?: string
}

const INITIAL_INTEGRATIONS: Integration[] = [
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sync club bookings to shared Google Calendars so members always have the latest schedule.',
    status: 'disconnected',
    icon: <CalendarCheck className="h-5 w-5 text-primary" />, 
    features: [
      'Push new and updated reservations automatically',
      'Create per-aircraft calendars to avoid conflicts',
      'Respect booking window and block-out rules',
    ],
    helpUrl: 'https://support.google.com/calendar/answer/2465776?hl=en',
  },
  {
    id: 'quickbooks',
    name: 'Intuit QuickBooks',
    description: 'Keep your ledger in sync by exporting charges and payments directly into QuickBooks Online.',
    status: 'disconnected',
    icon: <Landmark className="h-5 w-5 text-primary" />, 
    features: [
      'Create invoices and journal entries automatically',
      'Map aircraft rates to QuickBooks products',
      'Reconcile Stripe payments with member balances',
    ],
    helpUrl: 'https://quickbooks.intuit.com/learn-support/en-us',
  },
  {
    id: 'zapier',
    name: 'Zapier (Beta)',
    description: 'Trigger automations in your favorite tools when bookings or maintenance events change.',
    status: 'coming-soon',
    icon: <Zap className="h-5 w-5 text-primary" />, 
    features: [
      'Send maintenance squawks to Slack or Teams',
      'Create custom SMS alerts for dispatch events',
      'Update CRM or club portals with flight activity',
    ],
  },
]

export default function AddOnsSection() {
  const [integrations, setIntegrations] = useState(INITIAL_INTEGRATIONS)

  const toggleIntegration = (id: string) => {
    setIntegrations((current) =>
      current.map((integration) => {
        if (integration.id !== id || integration.status === 'coming-soon') {
          return integration
        }

        return {
          ...integration,
          status: integration.status === 'connected' ? 'disconnected' : 'connected',
        }
      }),
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Add-ons &amp; Integrations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect AviationHub with the tools your club already uses. Manage OAuth connections, review sync settings, and access documentation from one place.
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Need something else?</CardTitle>
          <CardDescription>
            We&apos;re expanding add-on support throughout 2026. Let us know which integrations would save your club the most time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Link href="mailto:hello@aviationhub.com" className="text-primary hover:text-primary/80">
              Request an integration ↗
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {integrations.map((integration) => (
          <Card key={integration.id} className="h-full">
            <CardHeader className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {integration.icon}
                  <div>
                    <CardTitle className="text-lg leading-tight">{integration.name}</CardTitle>
                    <CardDescription>{integration.description}</CardDescription>
                  </div>
                </div>
                <Badge variant={integration.status === 'connected' ? 'secondary' : 'outline'}>
                  {integration.status === 'connected'
                    ? 'Connected'
                    : integration.status === 'coming-soon'
                      ? 'Coming Soon'
                      : 'Not Connected'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                {integration.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  size="sm"
                  onClick={() => toggleIntegration(integration.id)}
                  disabled={integration.status === 'coming-soon'}
                  variant={integration.status === 'connected' ? 'destructive' : 'default'}
                >
                  {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                </Button>
                {integration.helpUrl && (
                  <Link
                    href={integration.helpUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                  >
                    View documentation
                  </Link>
                )}
                {integration.status === 'connected' && (
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">
                    Syncs every 10 minutes
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
