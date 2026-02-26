'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function MechanicOnboardingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    businessName: '',
    city: '',
    state: '',
    locationIcao: '',
    locationPrivacy: 'CITY',
    certifications: '',
    specialties: '',
    bio: '',
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user) {
      router.push('/mechanics/login')
      return
    }
    if (session.user.role !== 'mechanic') {
      router.push('/mechanics')
    }
  }, [session, status, router])

  const save = async () => {
    setSaving(true)
    await fetch('/api/mechanics/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    router.push('/mechanics/profile')
  }

  if (status === 'loading') {
    return <div className="min-h-screen bg-background p-6">Loading…</div>
  }

  return (
    <div className="min-h-screen bg-background p-6 pt-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Mechanic Onboarding</h1>
          <p className="text-sm text-muted-foreground">Tell pilots about your services.</p>
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Business Info</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Business name</Label>
                <Input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
              </div>
              <div>
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div>
                <Label>State</Label>
                <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              </div>
              <div>
                <Label>Airport ICAO (optional)</Label>
                <Input value={form.locationIcao} onChange={(e) => setForm({ ...form, locationIcao: e.target.value.toUpperCase() })} />
              </div>
              <div>
                <Label>Location privacy</Label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={form.locationPrivacy}
                  onChange={(e) => setForm({ ...form, locationPrivacy: e.target.value })}
                >
                  <option value="CITY">City only</option>
                  <option value="ICAO">Exact airport</option>
                </select>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Certifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Certifications (comma‑separated)</Label>
                <Input value={form.certifications} onChange={(e) => setForm({ ...form, certifications: e.target.value })} />
              </div>
              <div>
                <Label>Specialties (comma‑separated)</Label>
                <Input value={form.specialties} onChange={(e) => setForm({ ...form, specialties: e.target.value })} />
              </div>
              <div>
                <Label>Bio</Label>
                <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
            Back
          </Button>
          {step < 2 ? (
            <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
          ) : (
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Finish'}</Button>
          )}
        </div>
      </div>
    </div>
  )
}
