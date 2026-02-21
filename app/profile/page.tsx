'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  User,
  Award,
  Heart,
  MapPin,
  Plane,
  Settings,
  Shield,
  Save,
  Plus,
  Loader2,
  CheckCircle2,
  Bell,
  Mail
} from "lucide-react"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState('personal')

  // Form state
  const [personalInfo, setPersonalInfo] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567'
  })

  const [licenses, setLicenses] = useState([
    { id: 1, type: 'Private Pilot', number: 'PPL-123456', ratings: ['Single-Engine Land', 'Instrument Rating'] },
    { id: 2, type: 'Commercial Pilot', number: 'CPL-789012', ratings: ['Multi-Engine Land'] }
  ])

  const [medical, setMedical] = useState({
    class: 'Class 2',
    certificateNumber: 'MED-456789',
    examinerName: 'Dr. Sarah Johnson',
    expirationDate: '2026-12-15'
  })

  const [homeAirport, setHomeAirport] = useState({
    icao: 'KBOS',
    name: 'Boston Logan International',
    fbo: 'Signature Flight Support'
  })

  const [aircraft, setAircraft] = useState([
    { id: 1, registration: 'N12345', type: 'Cessna 172S', ownership: 'Rental' },
    { id: 2, registration: 'N67890', type: 'Piper PA-28-181', ownership: 'Club' }
  ])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to view your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild><Link href="/api/auth/signin">Sign In</Link></Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="flex h-16 items-center gap-4 px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <User className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">Profile</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="mx-auto max-w-[1200px] space-y-6">
          {/* Page Title */}
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground">Manage your pilot information, credentials, and preferences</p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
              <TabsTrigger value="personal" className="gap-2">
                <User className="h-4 w-4" /><span className="hidden md:inline">Personal</span>
              </TabsTrigger>
              <TabsTrigger value="licenses" className="gap-2">
                <Award className="h-4 w-4" /><span className="hidden md:inline">Licenses</span>
              </TabsTrigger>
              <TabsTrigger value="medical" className="gap-2">
                <Heart className="h-4 w-4" /><span className="hidden md:inline">Medical</span>
              </TabsTrigger>
              <TabsTrigger value="airport" className="gap-2">
                <MapPin className="h-4 w-4" /><span className="hidden md:inline">Airport</span>
              </TabsTrigger>
              <TabsTrigger value="aircraft" className="gap-2">
                <Plane className="h-4 w-4" /><span className="hidden md:inline">Aircraft</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" /><span className="hidden md:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Personal Tab */}
            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details and contact information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" value={personalInfo.firstName} onChange={(e) => setPersonalInfo({...personalInfo, firstName: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" value={personalInfo.lastName} onChange={(e) => setPersonalInfo({...personalInfo, lastName: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={personalInfo.email} onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={personalInfo.phone} onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})} />
                  </div>
                  <Button><Save className="mr-2 h-4 w-4" />Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Licenses Tab */}
            <TabsContent value="licenses">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Certificates & Ratings</CardTitle>
                      <CardDescription>Manage your pilot certificates and ratings</CardDescription>
                    </div>
                    <Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Certificate</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {licenses.map((license) => (
                      <div key={license.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{license.type}</p>
                            <Badge variant="secondary">{license.number}</Badge>
                          </div>
                          <div className="flex gap-2">
                            {license.ratings.map((rating, idx) => (<Badge key={idx} variant="outline">{rating}</Badge>))}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Medical Tab */}
            <TabsContent value="medical">
              <Card>
                <CardHeader>
                  <CardTitle>Medical Certificate</CardTitle>
                  <CardDescription>Track your medical certificate status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Medical Class</Label>
                      <Input value={medical.class} onChange={(e) => setMedical({...medical, class: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Certificate Number</Label>
                      <Input value={medical.certificateNumber} onChange={(e) => setMedical({...medical, certificateNumber: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>AME Name</Label>
                      <Input value={medical.examinerName} onChange={(e) => setMedical({...medical, examinerName: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Expiration Date</Label>
                      <Input type="date" value={medical.expirationDate} onChange={(e) => setMedical({...medical, expirationDate: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-green-600">Medical is valid</span>
                  </div>
                  <Button><Save className="mr-2 h-4 w-4" />Save Medical</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Airport Tab */}
            <TabsContent value="airport">
              <Card>
                <CardHeader>
                  <CardTitle>Home Airport</CardTitle>
                  <CardDescription>Set your default airport</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>ICAO Code</Label>
                      <Input value={homeAirport.icao} onChange={(e) => setHomeAirport({...homeAirport, icao: e.target.value.toUpperCase()})} maxLength={4} placeholder="KBOS" />
                    </div>
                    <div className="space-y-2">
                      <Label>Airport Name</Label>
                      <Input value={homeAirport.name} onChange={(e) => setHomeAirport({...homeAirport, name: e.target.value})} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Preferred FBO</Label>
                      <Input value={homeAirport.fbo} onChange={(e) => setHomeAirport({...homeAirport, fbo: e.target.value})} />
                    </div>
                  </div>
                  <Button><Save className="mr-2 h-4 w-4" />Save Airport</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aircraft Tab */}
            <TabsContent value="aircraft">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>My Aircraft</CardTitle>
                      <CardDescription>Aircraft you own or have access to</CardDescription>
                    </div>
                    <Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Aircraft</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {aircraft.map((ac) => (
                      <div key={ac.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                        <div className="flex items-center gap-4">
                          <div className="rounded-lg bg-primary/10 p-3"><Plane className="h-5 w-5 text-primary" /></div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{ac.registration}</p>
                              <Badge variant="secondary">{ac.ownership}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{ac.type}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Customize your experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive updates via email</p>
                      </div>
                    </div>
                    <Button variant="outline">Enable</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Currency Reminders</p>
                        <p className="text-sm text-muted-foreground">Get notified before credentials expire</p>
                      </div>
                    </div>
                    <Button variant="outline">Enable</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                      </div>
                    </div>
                    <Button variant="outline">Enable</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
