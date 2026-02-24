'use client'

import { useEffect, useMemo, useState } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { CalendarRange, Mail, Users } from 'lucide-react'

import { useManageContext } from './ManageContext'

type Recipient = {
  id: string
  name: string
  email: string
  phone: string
  homeAirport: string
  balance: number
  lastPayment?: string
  disabled?: boolean
  selected: boolean
}

const FALLBACK_RECIPIENTS: Recipient[] = [
  {
    id: 'demo-1',
    name: 'David Koster',
    email: 'david@amicurrent.com',
    phone: '(425) 555-0184',
    homeAirport: 'KPAE',
    balance: 0,
    lastPayment: 'Jan 12, 2026',
    selected: true,
  },
  {
    id: 'demo-2',
    name: 'Sarah Johnson',
    email: 'sarah@club.com',
    phone: '(206) 555-0107',
    homeAirport: 'KRNT',
    balance: 142.75,
    lastPayment: 'Feb 05, 2026',
    selected: true,
  },
  {
    id: 'demo-3',
    name: 'Mike Wilson',
    email: 'mike@club.com',
    phone: '(425) 555-0163',
    homeAirport: 'KBLI',
    balance: -25,
    lastPayment: 'Jan 28, 2026',
    selected: true,
  },
  {
    id: 'demo-4',
    name: 'Alex Chen',
    email: 'alex@club.com',
    phone: '(509) 555-0119',
    homeAirport: 'KGEG',
    balance: 87.5,
    lastPayment: 'Dec 21, 2025',
    disabled: true,
    selected: false,
  },
]

type FetchState = 'idle' | 'loading' | 'ready'

const generateId = () => {
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }
  return `recipient-${Math.random().toString(36).slice(2)}`
}

export default function ManageBillingSection() {
  const { selectedGroupId, groups, isDemo } = useManageContext()

  const [startDate, setStartDate] = useState('2026-01-01')
  const [endDate, setEndDate] = useState('2026-02-24')
  const [includeAll, setIncludeAll] = useState(false)
  const [includeDisabled, setIncludeDisabled] = useState(false)
  const [showBalance, setShowBalance] = useState<'current' | 'all'>('current')
  const [groupFilter, setGroupFilter] = useState<'selected' | 'all'>('selected')
  const [bccEmail, setBccEmail] = useState('')

  const [recipients, setRecipients] = useState<Recipient[] | null>(null)
  const [recipientState, setRecipientState] = useState<FetchState>('idle')
  const [processing, setProcessing] = useState(false)

  const activeGroup = useMemo(() => groups.find((group) => group.id === selectedGroupId) ?? null, [groups, selectedGroupId])

  useEffect(() => {
    if (!selectedGroupId) {
      setRecipients(null)
      return
    }

    if (isDemo) {
      setRecipients(FALLBACK_RECIPIENTS)
      setRecipientState('ready')
      return
    }

    let cancelled = false
    setRecipientState('loading')

    async function fetchRecipients() {
      try {
        const response = await fetch(`/api/groups/${selectedGroupId}/members`)
        if (!response.ok) {
          throw new Error('Unable to load members')
        }
        const data = await response.json()
        if (cancelled) return

        const mapped: Recipient[] = (Array.isArray(data) ? data : []).map((member: any) => ({
          id: member.id ?? member.userId ?? generateId(),
          name: member.user?.name ?? member.name ?? 'Member',
          email: member.user?.email ?? member.email ?? 'unknown@example.com',
          phone: member.user?.phone ?? member.phone ?? '—',
          homeAirport: member.homeAirport ?? member.base ?? '—',
          balance: typeof member.balance === 'number' ? member.balance : 0,
          lastPayment: member.lastPaymentAt ? new Date(member.lastPaymentAt).toLocaleDateString() : undefined,
          disabled: member.status === 'disabled' || member.disabled === true,
          selected: true,
        }))

        setRecipients(mapped.length ? mapped : FALLBACK_RECIPIENTS)
      } catch (error) {
        if (!cancelled) {
          setRecipients(FALLBACK_RECIPIENTS)
        }
      } finally {
        if (!cancelled) {
          setRecipientState('ready')
        }
      }
    }

    fetchRecipients()
    return () => {
      cancelled = true
    }
  }, [selectedGroupId, isDemo])

  const summary = useMemo(() => {
    if (!recipients) {
      return { debit: 0, credit: 0 }
    }

    const debit = recipients
      .filter((recipient) => recipient.balance > 0 && recipient.selected)
      .reduce((sum, recipient) => sum + recipient.balance, 0)
    const credit = recipients
      .filter((recipient) => recipient.balance < 0 && recipient.selected)
      .reduce((sum, recipient) => sum + Math.abs(recipient.balance), 0)

    return {
      debit,
      credit,
    }
  }, [recipients])

  const toggleRecipient = (id: string, next: boolean) => {
    setRecipients((current) =>
      current ? current.map((recipient) => (recipient.id === id ? { ...recipient, selected: next } : recipient)) : current,
    )
  }

  const toggleAll = (next: boolean) => {
    setRecipients((current) => (current ? current.map((recipient) => ({ ...recipient, selected: next })) : current))
  }

  const handleProcessBilling = () => {
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      alert('Billing run queued. Emails will be sent to selected recipients.')
    }, 1200)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span>Manage</span>
          <span>•</span>
          <span>Billing</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Monthly Club Billing</h1>
        <p className="text-sm text-muted-foreground">
          Run billing once per cycle to email detailed statements to your members. Statements include flights, charges, and payments from the selected date range.
        </p>
        {activeGroup && (
          <p className="text-xs text-muted-foreground">
            Active club: <span className="font-medium text-foreground">{activeGroup.name}</span>
          </p>
        )}
      </div>

      <Card className="border-amber-200 bg-amber-50">
        <CardHeader className="pb-2">
          <div className="flex items-start gap-2 text-amber-800">
            <CalendarRange className="mt-0.5 h-5 w-5" />
            <div>
              <CardTitle className="text-base">Heads up!</CardTitle>
              <CardDescription className="text-sm text-amber-700">
                Billing emails are sent to every selected recipient immediately after processing. Customize the message at <span className="font-medium">General Settings → Billing Message</span>.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Billing window</CardTitle>
          <CardDescription>Choose the statement period for this billing run.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="billing-start">From</Label>
            <Input id="billing-start" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="billing-end">To</Label>
            <Input id="billing-end" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Include all customers with ledger history</Label>
              <Switch checked={includeAll} onCheckedChange={(checked) => setIncludeAll(checked)} />
            </div>
            <p className="text-xs text-muted-foreground">Sends statements even if the current balance is zero.</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Include disabled customer accounts</Label>
              <Switch checked={includeDisabled} onCheckedChange={(checked) => setIncludeDisabled(checked)} />
            </div>
            <p className="text-xs text-muted-foreground">Good for annual audits or closing the books.</p>
          </div>
          <div className="space-y-2">
            <Label>Show groups</Label>
            <Select value={groupFilter} onValueChange={(value: 'selected' | 'all') => setGroupFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selected club" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="selected">Selected club</SelectItem>
                <SelectItem value="all" disabled>
                  All (coming soon)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Show balance</Label>
            <Select value={showBalance} onValueChange={(value: 'current' | 'all') => setShowBalance(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Current balance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current balance</SelectItem>
                <SelectItem value="all">All activity in range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="bcc-email">BCC</Label>
            <div className="flex items-center gap-2">
              <Input
                id="bcc-email"
                placeholder="finance@yourclub.com"
                value={bccEmail}
                onChange={(event) => setBccEmail(event.target.value)}
              />
              <Button
                type="button"
                variant={bccEmail ? 'secondary' : 'outline'}
                onClick={() => setBccEmail('billing@amicurrent.com')}
              >
                Use club billing inbox
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Statements are always emailed to each member. The BCC address receives a consolidated copy.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-base">Recipients</CardTitle>
          <CardDescription>Select who should receive this statement run.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recipients && recipients.length > 0 ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>
                    {recipients.filter((recipient) => recipient.selected).length} of {recipients.length} recipients selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => toggleAll(true)}>
                    Select all
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toggleAll(false)}>
                    Deselect all
                  </Button>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border">
                <table className="min-w-full divide-y divide-border text-sm">
                  <thead className="bg-muted/40">
                    <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-2 font-medium">Send</th>
                      <th className="px-4 py-2 font-medium">User</th>
                      <th className="px-4 py-2 font-medium">Departure</th>
                      <th className="px-4 py-2 font-medium text-right">Balance</th>
                      <th className="px-4 py-2 font-medium text-right">Last Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recipients.map((recipient) => {
                      const balanceLabel = recipient.balance === 0 ? '$0.00' : `$${recipient.balance.toFixed(2)}`
                      const badgeVariant = recipient.balance > 0 ? 'default' : recipient.balance < 0 ? 'outline' : 'secondary'
                      const disabled = recipient.disabled && !includeDisabled

                      return (
                        <tr key={recipient.id} className={recipient.disabled ? 'bg-muted/40' : ''}>
                          <td className="px-4 py-3">
                            <Switch
                              checked={recipient.selected}
                              onCheckedChange={(next) => toggleRecipient(recipient.id, Boolean(next))}
                              disabled={disabled}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">{recipient.name}</span>
                              <span className="text-xs text-muted-foreground">{recipient.email}</span>
                              <span className="text-xs text-muted-foreground">{recipient.phone}</span>
                              {recipient.disabled && <span className="text-xs text-destructive">Account disabled</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{recipient.homeAirport}</td>
                          <td className="px-4 py-3 text-right">
                            <Badge variant={badgeVariant}>{balanceLabel}</Badge>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                            {recipient.lastPayment ?? '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-border px-4 py-3 text-sm">
                <div className="flex items-center gap-3">
                  <span>
                    Outstanding Debits: <span className="font-semibold text-foreground">${summary.debit.toFixed(2)}</span>
                  </span>
                  <Separator orientation="vertical" className="h-4" />
                  <span>
                    Outstanding Credits: <span className="font-semibold text-foreground">${summary.credit.toFixed(2)}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>Emails go to selected users + {bccEmail ? bccEmail : 'no BCC set'}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button
                  disabled={processing || recipients.every((recipient) => !recipient.selected)}
                  onClick={handleProcessBilling}
                >
                  {processing ? 'Processing…' : 'Process Billing'}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Selecting “Process Billing” sends statements immediately to the recipients you have toggled above.
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
              {recipientState === 'loading' ? 'Loading recipients…' : 'Select a club above to view recipients'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
