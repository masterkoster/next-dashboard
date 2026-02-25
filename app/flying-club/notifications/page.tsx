'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { RefreshCw, Bell, Mail, MessageSquare, Phone, Save, Check, AlertTriangle } from 'lucide-react'

interface NotificationSettings {
  email: { bookingConfirm: boolean; bookingReminder: boolean; maintenanceAlert: boolean; billingRun: boolean; currencyExpiry: boolean }
  sms: { bookingConfirm: boolean; bookingReminder: boolean; maintenanceAlert: boolean; urgent: boolean }
  phone: string
}

export default function NotificationsPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState<NotificationSettings>({
    email: { bookingConfirm: true, bookingReminder: true, maintenanceAlert: true, billingRun: true, currencyExpiry: true },
    sms: { bookingConfirm: false, bookingReminder: false, maintenanceAlert: false, urgent: true },
    phone: '',
  })

  useEffect(() => { setLoading(false) }, [session])

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 1000))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (status === 'loading' || loading) return <div className="min-h-screen bg-background flex items-center justify-center"><RefreshCw className="h-8 w-8 animate-spin text-primary" /></div>
  if (!session) return <div className="min-h-screen bg-background flex items-center justify-center p-4"><Card className="max-w-md w-full"><CardContent className="pt-6 text-center"><Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /><h2 className="text-xl font-bold mb-2">Notification Settings</h2><p className="text-muted-foreground mb-4">Sign in to manage notifications</p><Button asChild><a href="/login">Sign In</a></Button></CardContent></Card></div>

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 pt-16">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-3xl font-bold flex items-center gap-2"><Bell className="h-8 w-8" />Notifications</h1><p className="text-muted-foreground">Manage your email and SMS notification preferences</p></div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">{saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}{saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}</Button>
        </div>

        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" />Email Notifications</CardTitle>
            <CardDescription>Receive updates via email</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div><p className="font-medium">Booking Confirmations</p><p className="text-sm text-muted-foreground">Get emailed when a booking is confirmed</p></div>
              <Switch checked={settings.email.bookingConfirm} onCheckedChange={(c) => setSettings({ ...settings, email: { ...settings.email, bookingConfirm: c } })} />
            </div>
            <div className="flex items-center justify-between">
              <div><p className="font-medium">Booking Reminders</p><p className="text-sm text-muted-foreground">Reminder before your scheduled flight</p></div>
              <Switch checked={settings.email.bookingReminder} onCheckedChange={(c) => setSettings({ ...settings, email: { ...settings.email, bookingReminder: c } })} />
            </div>
            <div className="flex items-center justify-between">
              <div><p className="font-medium">Maintenance Alerts</p><p className="text-sm text-muted-foreground">Notify when aircraft issues are reported</p></div>
              <Switch checked={settings.email.maintenanceAlert} onCheckedChange={(c) => setSettings({ ...settings, email: { ...settings.email, maintenanceAlert: c } })} />
            </div>
            <div className="flex items-center justify-between">
              <div><p className="font-medium">Billing Notifications</p><p className="text-sm text-muted-foreground">Monthly invoice and payment updates</p></div>
              <Switch checked={settings.email.billingRun} onCheckedChange={(c) => setSettings({ ...settings, email: { ...settings.email, billingRun: c } })} />
            </div>
            <div className="flex items-center justify-between">
              <div><p className="font-medium">Currency Expiry</p><p className="text-sm text-muted-foreground">Warning when your currency is about to expire</p></div>
              <Switch checked={settings.email.currencyExpiry} onCheckedChange={(c) => setSettings({ ...settings, email: { ...settings.email, currencyExpiry: c } })} />
            </div>
          </CardContent>
        </Card>

        {/* SMS Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" />SMS Notifications</CardTitle>
            <CardDescription>Receive text messages (requires phone number)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Phone Number</Label>
              <div className="flex gap-2 mt-1">
                <Phone className="h-4 w-4 mt-3 text-muted-foreground" />
                <Input placeholder="+1 (555) 123-4567" value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div><p className="font-medium">Booking Confirmations</p><p className="text-sm text-muted-foreground">Text when booking is confirmed</p></div>
              <Switch checked={settings.sms.bookingConfirm} onCheckedChange={(c) => setSettings({ ...settings, sms: { ...settings.sms, bookingConfirm: c } })} disabled={!settings.phone} />
            </div>
            <div className="flex items-center justify-between">
              <div><p className="font-medium">Booking Reminders</p><p className="text-sm text-muted-foreground">Text reminder before flight</p></div>
              <Switch checked={settings.sms.bookingReminder} onCheckedChange={(c) => setSettings({ ...settings, sms: { ...settings.sms, bookingReminder: c } })} disabled={!settings.phone} />
            </div>
            <div className="flex items-center justify-between">
              <div><p className="font-medium">Maintenance Alerts</p><p className="text-sm text-muted-foreground">Text when issues reported</p></div>
              <Switch checked={settings.sms.maintenanceAlert} onCheckedChange={(c) => setSettings({ ...settings, sms: { ...settings.sms, maintenanceAlert: c } })} disabled={!settings.phone} />
            </div>
            <div className="flex items-center justify-between">
              <div><p className="font-medium">Urgent Notifications</p><p className="text-sm text-muted-foreground">Critical alerts (aircraft grounded, etc.)</p></div>
              <Switch checked={settings.sms.urgent} onCheckedChange={(c) => setSettings({ ...settings, sms: { ...settings.sms, urgent: c } })} disabled={!settings.phone} />
            </div>
            {!settings.phone && <div className="flex items-center gap-2 text-amber-600 text-sm"><AlertTriangle className="h-4 w-4" />Add a phone number to enable SMS notifications</div>}
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardContent className="pt-4">
            <h3 className="font-medium mb-2">Notification Summary</h3>
            <div className="flex gap-4 text-sm">
              <Badge variant="outline" className="gap-1"><Mail className="h-3 w-3" />{Object.values(settings.email).filter(Boolean).length} email</Badge>
              <Badge variant="outline" className="gap-1"><MessageSquare className="h-3 w-3" />{settings.phone ? Object.values(settings.sms).filter(Boolean).length : 0} SMS</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
