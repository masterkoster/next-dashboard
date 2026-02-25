'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CalendarCheck, Landmark, ShieldCheck, Zap, Loader2 } from 'lucide-react'

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
  const params = useParams()
  const groupId = params?.groupId as string || 'demo-group-id' // Get from URL or context
  
  const [integrations, setIntegrations] = useState(INITIAL_INTEGRATIONS)
  const [loading, setLoading] = useState<string | null>(null)
  const [qbStatus, setQbStatus] = useState<any>(null)

  // Load QuickBooks status on mount
  useEffect(() => {
    loadQuickBooksStatus()
  }, [groupId])

  const loadQuickBooksStatus = async () => {
    try {
      const response = await fetch(`/api/integrations/quickbooks/status?groupId=${groupId}`)
      if (response.ok) {
        const data = await response.json()
        setQbStatus(data)
        
        // Update QuickBooks integration status in UI
        setIntegrations((current) =>
          current.map((integration) => {
            if (integration.id === 'quickbooks') {
              return {
                ...integration,
                status: data.connected ? 'connected' : 'disconnected',
              }
            }
            return integration
          }),
        )
      }
    } catch (error) {
      console.error('Failed to load QuickBooks status:', error)
    }
  }

  const handleQuickBooksConnect = async () => {
    setLoading('quickbooks')
    try {
      // Get OAuth URL from API
      const response = await fetch(`/api/integrations/quickbooks/connect?groupId=${groupId}`)
      const data = await response.json()
      
      if (data.success && data.authUrl) {
        // Redirect to QuickBooks OAuth page
        window.location.href = data.authUrl
      } else {
        alert('Failed to connect to QuickBooks. Please try again.')
        setLoading(null)
      }
    } catch (error) {
      console.error('QuickBooks connect error:', error)
      alert('Failed to connect to QuickBooks. Please try again.')
      setLoading(null)
    }
  }

  const handleQuickBooksDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect QuickBooks? This will stop all syncing.')) {
      return
    }

    setLoading('quickbooks')
    try {
      const response = await fetch('/api/integrations/quickbooks/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId }),
      })

      const data = await response.json()
      
      if (data.success) {
        // Update UI
        setIntegrations((current) =>
          current.map((integration) => {
            if (integration.id === 'quickbooks') {
              return { ...integration, status: 'disconnected' }
            }
            return integration
          }),
        )
        setQbStatus(null)
        alert('QuickBooks disconnected successfully')
      } else {
        alert('Failed to disconnect QuickBooks. Please try again.')
      }
    } catch (error) {
      console.error('QuickBooks disconnect error:', error)
      alert('Failed to disconnect QuickBooks. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const handleQuickBooksSync = async () => {
    setLoading('quickbooks-sync')
    try {
      const response = await fetch('/api/integrations/quickbooks/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, syncType: 'all' }),
      })

      const data = await response.json()
      
      if (data.success) {
        alert(`Sync completed!\n\nTotal: ${data.syncLog.recordsTotal}\nSuccess: ${data.syncLog.recordsSuccess}\nFailed: ${data.syncLog.recordsFailed}`)
        await loadQuickBooksStatus() // Reload status
      } else {
        alert('Sync failed. Please try again.')
      }
    } catch (error) {
      console.error('QuickBooks sync error:', error)
      alert('Sync failed. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const toggleIntegration = (id: string) => {
    if (id === 'quickbooks') {
      const qbIntegration = integrations.find(i => i.id === 'quickbooks')
      if (qbIntegration?.status === 'connected') {
        handleQuickBooksDisconnect()
      } else {
        handleQuickBooksConnect()
      }
      return
    }

    // For other integrations, keep the mock behavior
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
                  disabled={integration.status === 'coming-soon' || loading === integration.id}
                  variant={integration.status === 'connected' ? 'destructive' : 'default'}
                >
                  {loading === integration.id && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                  {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                </Button>
                
                {/* QuickBooks-specific: Sync button */}
                {integration.id === 'quickbooks' && integration.status === 'connected' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleQuickBooksSync}
                    disabled={loading === 'quickbooks-sync'}
                  >
                    {loading === 'quickbooks-sync' && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                    Sync Now
                  </Button>
                )}
                
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
                    {integration.id === 'quickbooks' && qbStatus?.lastSync 
                      ? `Last synced: ${new Date(qbStatus.lastSync).toLocaleTimeString()}`
                      : 'Syncs every 10 minutes'
                    }
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
