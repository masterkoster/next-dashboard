'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function MechanicProfilePage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    businessName: '',
    phone: '',
    city: '',
    state: '',
    locationIcao: '',
    locationPrivacy: 'CITY',
    serviceRadiusNm: '',
    certifications: '',
    specialties: '',
    bio: '',
    yearsExperience: '',
    certificateNumber: '',
    iaNumber: '',
    a_pLicense: '',
    expiryDate: '',
    hourlyRate: '',
    travelFee: '',
    locationLat: '',
    locationLng: '',
  })

  useEffect(() => {
    let active = true
    async function loadProfile() {
      setLoading(true)
      const res = await fetch('/api/mechanics/profile')
      if (res.ok) {
        const data = await res.json()
        if (active) {
          setForm({
            businessName: data.businessName || '',
            phone: data.phone || '',
            city: data.city || '',
            state: data.state || '',
            locationIcao: data.locationIcao || '',
            locationPrivacy: data.locationPrivacy || 'CITY',
            serviceRadiusNm: data.serviceRadiusNm ? String(data.serviceRadiusNm) : '',
            certifications: data.certifications || '',
            specialties: data.specialties || '',
            bio: data.bio || '',
            yearsExperience: data.yearsExperience ? String(data.yearsExperience) : '',
            certificateNumber: data.certificateNumber || '',
            iaNumber: data.iaNumber || '',
            a_pLicense: data.a_pLicense || '',
            expiryDate: data.expiryDate ? new Date(data.expiryDate).toISOString().slice(0, 10) : '',
            hourlyRate: data.hourlyRate ? String(data.hourlyRate) : '',
            travelFee: data.travelFee ? String(data.travelFee) : '',
            locationLat: data.locationLat ? String(data.locationLat) : '',
            locationLng: data.locationLng ? String(data.locationLng) : '',
          })
        }
      }
      setLoading(false)
    }

    if (session?.user?.role === 'mechanic' || session?.user?.role === 'admin') {
      loadProfile()
    }
    return () => {
      active = false
    }
  }, [session?.user?.role])

  useEffect(() => {
    if (!form.locationIcao || form.locationPrivacy !== 'ICAO') return
    const handle = setTimeout(async () => {
      const res = await fetch(`/api/airports/${form.locationIcao}`)
      if (!res.ok) return
      const data = await res.json()
      if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        setForm((prev) => ({
          ...prev,
          locationLat: String(data.latitude),
          locationLng: String(data.longitude),
          city: prev.city || data.city || '',
          state: prev.state || data.state || '',
        }))
      }
    }, 400)

    return () => clearTimeout(handle)
  }, [form.locationIcao, form.locationPrivacy])

  const saveProfile = async () => {
    setSaving(true)
      await fetch('/api/mechanics/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          serviceRadiusNm: form.serviceRadiusNm ? Number(form.serviceRadiusNm) : null,
          yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : 0,
          hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : null,
          travelFee: form.travelFee ? Number(form.travelFee) : null,
          expiryDate: form.expiryDate || null,
          locationLat: form.locationLat ? Number(form.locationLat) : null,
          locationLng: form.locationLng ? Number(form.locationLng) : null,
        }),
      })
    setSaving(false)
  }

  if (status === 'loading' || loading) {
    return <div className="min-h-screen bg-background p-6">Loading…</div>
  }

  if (!session?.user) {
    return <div className="min-h-screen bg-background p-6">Please sign in.</div>
  }

  if (session.user.role !== 'mechanic' && session.user.role !== 'admin') {
    return <div className="min-h-screen bg-background p-6">Mechanic access only.</div>
  }

  return (
    <div className="min-h-screen bg-background p-6 pt-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Mechanic Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your certifications and location settings.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Business Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Business name</Label>
              <Input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
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
            {form.locationPrivacy === 'ICAO' && (
              <div>
                <Label>Coordinates (auto)</Label>
                <Input
                  value={form.locationLat && form.locationLng ? `${form.locationLat}, ${form.locationLng}` : 'Auto-filled from ICAO'}
                  disabled
                />
              </div>
            )}
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
            <div>
              <Label>Service radius (nm)</Label>
              <Input value={form.serviceRadiusNm} onChange={(e) => setForm({ ...form, serviceRadiusNm: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Certifications</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Certifications (comma‑separated)</Label>
              <Input value={form.certifications} onChange={(e) => setForm({ ...form, certifications: e.target.value })} />
            </div>
            <div>
              <Label>Specialties (comma‑separated)</Label>
              <Input value={form.specialties} onChange={(e) => setForm({ ...form, specialties: e.target.value })} />
            </div>
            <div>
              <Label>A&amp;P License</Label>
              <Input value={form.a_pLicense} onChange={(e) => setForm({ ...form, a_pLicense: e.target.value })} />
            </div>
            <div>
              <Label>IA Number</Label>
              <Input value={form.iaNumber} onChange={(e) => setForm({ ...form, iaNumber: e.target.value })} />
            </div>
            <div>
              <Label>Certificate Number</Label>
              <Input value={form.certificateNumber} onChange={(e) => setForm({ ...form, certificateNumber: e.target.value })} />
            </div>
            <div>
              <Label>Certificate Expiry</Label>
              <Input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Bio</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={saveProfile} disabled={saving}>{saving ? 'Saving…' : 'Save Profile'}</Button>
        </div>
      </div>
    </div>
  )
}
