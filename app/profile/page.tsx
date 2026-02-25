'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User,
  Award,
  Heart,
  MapPin,
  Plane,
  Bell,
  Shield,
  Globe,
  Database,
  Settings,
  Save,
  Download,
  Trash2,
  Key,
  Clock,
  Edit,
  Plus,
  X,
  ChevronRight,
  LayoutDashboard,
  AlertCircle,
  CheckCircle2
} from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(true) // Mock admin status
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  
  // Modal states
  const [licenseModalOpen, setLicenseModalOpen] = useState(false)
  const [aircraftModalOpen, setAircraftModalOpen] = useState(false)
  const [editingLicense, setEditingLicense] = useState<typeof licenses[0] | null>(null)
  const [editingAircraft, setEditingAircraft] = useState<typeof aircraft[0] | null>(null)

  // Mock user data
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Aviation Way, Boston, MA 02101"
  })

  const [licenses, setLicenses] = useState([
    { id: 1, type: "Private Pilot", number: "PPL-123456", issueDate: "2020-03-15", ratings: ["Single-Engine Land", "Instrument Rating"] },
    { id: 2, type: "Commercial Pilot", number: "CPL-789012", issueDate: "2022-06-20", ratings: ["Multi-Engine Land"] },
  ])

  const [medical, setMedical] = useState({
    class: "Class 2",
    certificateNumber: "MED-456789",
    examinerName: "Dr. Sarah Johnson",
    issueDate: "2023-06-15",
    expirationDate: "2024-12-15"
  })

  const [homeAirport, setHomeAirport] = useState({
    icao: "KBOS",
    name: "Boston Logan International",
    fbo: "Signature Flight Support",
    fuelType: "100LL"
  })

  const [aircraft, setAircraft] = useState([
    { id: 1, registration: "N12345", type: "Cessna 172", ownership: "Rental", notes: "Preferred training aircraft" },
    { id: 2, registration: "N67890", type: "Piper PA-28", ownership: "Club", notes: "Available on weekends" },
  ])

  const [notifications, setNotifications] = useState({
    maintenanceAlerts: true,
    currencyReminders: true,
    weatherAlerts: false,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true
  })

  const [units, setUnits] = useState({
    distance: "nautical",
    temperature: "fahrenheit",
    timeFormat: "24h",
    dateFormat: "MM/DD/YYYY"
  })

  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    loginAlerts: true
  })
  
  // Handler functions
  const handleSavePersonalInfo = async () => {
    // TODO: API call to save personal info
    // await fetch('/api/profile', { method: 'PUT', body: JSON.stringify(personalInfo) })
    console.log('Saving personal info:', personalInfo)
    setUnsavedChanges(false)
    alert('Personal information saved successfully!')
  }
  
  const handleSaveMedical = async () => {
    // TODO: API call to save medical info
    console.log('Saving medical info:', medical)
    setUnsavedChanges(false)
    alert('Medical certificate saved successfully!')
  }
  
  const handleSaveAirport = async () => {
    // TODO: API call to save airport info
    console.log('Saving airport info:', homeAirport)
    setUnsavedChanges(false)
    alert('Home airport saved successfully!')
  }
  
  const handleAddLicense = () => {
    setEditingLicense(null)
    setLicenseModalOpen(true)
  }
  
  const handleEditLicense = (license: typeof licenses[0]) => {
    setEditingLicense(license)
    setLicenseModalOpen(true)
  }
  
  const handleDeleteLicense = async (id: number) => {
    if (confirm('Are you sure you want to delete this license?')) {
      // TODO: API call to delete license
      setLicenses(licenses.filter(l => l.id !== id))
      alert('License deleted successfully!')
    }
  }
  
  const handleSaveLicense = (licenseData: typeof licenses[0]) => {
    if (editingLicense) {
      // Update existing
      setLicenses(licenses.map(l => l.id === licenseData.id ? licenseData : l))
    } else {
      // Add new
      const newLicense = { ...licenseData, id: Math.max(...licenses.map(l => l.id)) + 1 }
      setLicenses([...licenses, newLicense])
    }
    setLicenseModalOpen(false)
    setEditingLicense(null)
    alert('License saved successfully!')
  }
  
  const handleAddAircraft = () => {
    setEditingAircraft(null)
    setAircraftModalOpen(true)
  }
  
  const handleEditAircraft = (ac: typeof aircraft[0]) => {
    setEditingAircraft(ac)
    setAircraftModalOpen(true)
  }
  
  const handleDeleteAircraft = async (id: number) => {
    if (confirm('Are you sure you want to remove this aircraft?')) {
      // TODO: API call to delete aircraft
      setAircraft(aircraft.filter(a => a.id !== id))
      alert('Aircraft removed successfully!')
    }
  }
  
  const handleSaveAircraft = (aircraftData: typeof aircraft[0]) => {
    if (editingAircraft) {
      // Update existing
      setAircraft(aircraft.map(a => a.id === aircraftData.id ? aircraftData : a))
    } else {
      // Add new
      const newAircraft = { ...aircraftData, id: Math.max(...aircraft.map(a => a.id)) + 1 }
      setAircraft([...aircraft, newAircraft])
    }
    setAircraftModalOpen(false)
    setEditingAircraft(null)
    alert('Aircraft saved successfully!')
  }

  return (
    <div className="min-h-screen bg-background pt-[44px]">
      {/* Header */}
      <header className="sticky top-[44px] z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex h-16 items-center gap-4 px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <User className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">Profile & Settings</span>
          </div>
          
          <div className="ml-auto flex items-center gap-4">
            {unsavedChanges && (
              <Badge variant="secondary" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                Unsaved changes
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="mx-auto max-w-[1200px] space-y-6">
          {/* Profile Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Profile & Settings</h1>
              <p className="text-muted-foreground">
                Manage your pilot information, preferences, and account settings
              </p>
            </div>
            {isAdmin && (
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => router.push('/admin')}
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin Dashboard
              </Button>
            )}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
              <TabsTrigger value="personal" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden md:inline">Personal</span>
              </TabsTrigger>
              <TabsTrigger value="licenses" className="gap-2">
                <Award className="h-4 w-4" />
                <span className="hidden md:inline">Licenses</span>
              </TabsTrigger>
              <TabsTrigger value="medical" className="gap-2">
                <Heart className="h-4 w-4" />
                <span className="hidden md:inline">Medical</span>
              </TabsTrigger>
              <TabsTrigger value="airport" className="gap-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden md:inline">Airport</span>
              </TabsTrigger>
              <TabsTrigger value="aircraft" className="gap-2">
                <Plane className="h-4 w-4" />
                <span className="hidden md:inline">Aircraft</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden md:inline">Settings</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden md:inline">Security</span>
              </TabsTrigger>
            </TabsList>

            {/* Personal Information */}
            <TabsContent value="personal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details and contact information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        value={personalInfo.firstName}
                        onChange={(e) => {
                          setPersonalInfo({...personalInfo, firstName: e.target.value})
                          setUnsavedChanges(true)
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        value={personalInfo.lastName}
                        onChange={(e) => {
                          setPersonalInfo({...personalInfo, lastName: e.target.value})
                          setUnsavedChanges(true)
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={personalInfo.email}
                      onChange={(e) => {
                        setPersonalInfo({...personalInfo, email: e.target.value})
                        setUnsavedChanges(true)
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      value={personalInfo.phone}
                      onChange={(e) => {
                        setPersonalInfo({...personalInfo, phone: e.target.value})
                        setUnsavedChanges(true)
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input 
                      id="address" 
                      value={personalInfo.address}
                      onChange={(e) => {
                        setPersonalInfo({...personalInfo, address: e.target.value})
                        setUnsavedChanges(true)
                      }}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => window.location.reload()}>Cancel</Button>
                    <Button className="gap-2" onClick={handleSavePersonalInfo}>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Licenses & Certificates */}
            <TabsContent value="licenses" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>Licenses & Certificates</CardTitle>
                      <CardDescription>Manage your pilot certificates, ratings, and endorsements</CardDescription>
                    </div>
                    <Button size="sm" className="gap-2" onClick={handleAddLicense}>
                      <Plus className="h-4 w-4" />
                      Add License
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {licenses.map((license) => (
                    <div key={license.id} className="rounded-lg border border-border p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{license.type}</h3>
                            <Badge variant="secondary">{license.number}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">Issued: {license.issueDate}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEditLicense(license)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteLicense(license.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium mb-2">Ratings & Endorsements:</p>
                        <div className="flex flex-wrap gap-2">
                          {license.ratings.map((rating, idx) => (
                            <Badge key={idx} variant="outline">{rating}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Medical Certificate */}
            <TabsContent value="medical" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Medical Certificate</CardTitle>
                  <CardDescription>Keep your medical certificate information up to date</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="medicalClass">Medical Class</Label>
                      <Input 
                        id="medicalClass" 
                        value={medical.class}
                        onChange={(e) => {
                          setMedical({...medical, class: e.target.value})
                          setUnsavedChanges(true)
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="medicalNumber">Certificate Number</Label>
                      <Input 
                        id="medicalNumber" 
                        value={medical.certificateNumber}
                        onChange={(e) => {
                          setMedical({...medical, certificateNumber: e.target.value})
                          setUnsavedChanges(true)
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="examiner">Aviation Medical Examiner</Label>
                    <Input 
                      id="examiner" 
                      value={medical.examinerName}
                      onChange={(e) => {
                        setMedical({...medical, examinerName: e.target.value})
                        setUnsavedChanges(true)
                      }}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="issueDate">Issue Date</Label>
                      <Input 
                        id="issueDate" 
                        type="date" 
                        value={medical.issueDate}
                        onChange={(e) => {
                          setMedical({...medical, issueDate: e.target.value})
                          setUnsavedChanges(true)
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expirationDate">Expiration Date</Label>
                      <Input 
                        id="expirationDate" 
                        type="date" 
                        value={medical.expirationDate}
                        onChange={(e) => {
                          setMedical({...medical, expirationDate: e.target.value})
                          setUnsavedChanges(true)
                        }}
                      />
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted/50 p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-chart-3 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Expiration Reminder</p>
                      <p className="text-xs text-muted-foreground">
                        Your medical certificate expires in 297 days. You'll receive reminders 90, 60, and 30 days before expiration.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => window.location.reload()}>Cancel</Button>
                    <Button className="gap-2" onClick={handleSaveMedical}>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Home Airport & Preferences */}
            <TabsContent value="airport" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Home Airport & Preferences</CardTitle>
                  <CardDescription>Set your default airport and aviation preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="icao">ICAO Code</Label>
                      <Input 
                        id="icao" 
                        placeholder="KBOS"
                        value={homeAirport.icao}
                        onChange={(e) => {
                          setHomeAirport({...homeAirport, icao: e.target.value})
                          setUnsavedChanges(true)
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="airportName">Airport Name</Label>
                      <Input 
                        id="airportName" 
                        value={homeAirport.name}
                        onChange={(e) => {
                          setHomeAirport({...homeAirport, name: e.target.value})
                          setUnsavedChanges(true)
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fbo">Preferred FBO</Label>
                    <Input 
                      id="fbo" 
                      value={homeAirport.fbo}
                      onChange={(e) => {
                        setHomeAirport({...homeAirport, fbo: e.target.value})
                        setUnsavedChanges(true)
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fuelType">Preferred Fuel Type</Label>
                    <Input 
                      id="fuelType" 
                      value={homeAirport.fuelType}
                      onChange={(e) => {
                        setHomeAirport({...homeAirport, fuelType: e.target.value})
                        setUnsavedChanges(true)
                      }}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => window.location.reload()}>Cancel</Button>
                    <Button className="gap-2" onClick={handleSaveAirport}>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aircraft */}
            <TabsContent value="aircraft" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>Aircraft Assignments</CardTitle>
                      <CardDescription>Manage aircraft you fly regularly</CardDescription>
                    </div>
                    <Button size="sm" className="gap-2" onClick={handleAddAircraft}>
                      <Plus className="h-4 w-4" />
                      Add Aircraft
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aircraft.map((ac) => (
                    <div key={ac.id} className="rounded-lg border border-border p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{ac.registration}</h3>
                            <Badge variant="secondary">{ac.ownership}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{ac.type}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEditAircraft(ac)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteAircraft(ac.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {ac.notes && (
                        <>
                          <Separator />
                          <p className="text-sm text-muted-foreground">{ac.notes}</p>
                        </>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences & Settings */}
            <TabsContent value="preferences" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Control when and how you receive alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="maintenance">Maintenance Alerts</Label>
                      <p className="text-xs text-muted-foreground">Get notified about upcoming maintenance items</p>
                    </div>
                    <Switch 
                      id="maintenance"
                      checked={notifications.maintenanceAlerts}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, maintenanceAlerts: checked})
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="currency">Currency Reminders</Label>
                      <p className="text-xs text-muted-foreground">Reminders for expiring licenses and currency</p>
                    </div>
                    <Switch 
                      id="currency"
                      checked={notifications.currencyReminders}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, currencyReminders: checked})
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="weather">Weather Alerts</Label>
                      <p className="text-xs text-muted-foreground">Get notified about weather changes at your home airport</p>
                    </div>
                    <Switch 
                      id="weather"
                      checked={notifications.weatherAlerts}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, weatherAlerts: checked})
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email">Email Notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch 
                      id="email"
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, emailNotifications: checked})
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sms">SMS Notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive notifications via text message</p>
                    </div>
                    <Switch 
                      id="sms"
                      checked={notifications.smsNotifications}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, smsNotifications: checked})
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push">Push Notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive browser push notifications</p>
                    </div>
                    <Switch 
                      id="push"
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, pushNotifications: checked})
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Units & Display</CardTitle>
                  <CardDescription>Customize measurement units and display formats</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="distance">Distance Units</Label>
                    <select 
                      id="distance"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={units.distance}
                      onChange={(e) => setUnits({...units, distance: e.target.value})}
                    >
                      <option value="nautical">Nautical Miles</option>
                      <option value="statute">Statute Miles</option>
                      <option value="kilometers">Kilometers</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature Units</Label>
                    <select 
                      id="temperature"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={units.temperature}
                      onChange={(e) => setUnits({...units, temperature: e.target.value})}
                    >
                      <option value="fahrenheit">Fahrenheit (°F)</option>
                      <option value="celsius">Celsius (°C)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeFormat">Time Format</Label>
                    <select 
                      id="timeFormat"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={units.timeFormat}
                      onChange={(e) => setUnits({...units, timeFormat: e.target.value})}
                    >
                      <option value="12h">12-hour (3:45 PM)</option>
                      <option value="24h">24-hour (15:45)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <select 
                      id="dateFormat"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={units.dateFormat}
                      onChange={(e) => setUnits({...units, dateFormat: e.target.value})}
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => window.location.reload()}>Cancel</Button>
                    <Button className="gap-2" onClick={handleSavePersonalInfo}>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dashboard Customization</CardTitle>
                  <CardDescription>Manage your dashboard widgets and layout</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-between">
                    <span>Customize Dashboard Widgets</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Your current widget preferences are saved automatically when you customize your dashboard
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security & Privacy */}
            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Security</CardTitle>
                  <CardDescription>Manage your password and security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justify-between">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        <span>Change Password</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="2fa">Two-Factor Authentication</Label>
                      <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <Switch 
                      id="2fa"
                      checked={security.twoFactorEnabled}
                      onCheckedChange={(checked) => 
                        setSecurity({...security, twoFactorEnabled: checked})
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="loginAlerts">Login Alerts</Label>
                      <p className="text-xs text-muted-foreground">Get notified of new logins to your account</p>
                    </div>
                    <Switch 
                      id="loginAlerts"
                      checked={security.loginAlerts}
                      onCheckedChange={(checked) => 
                        setSecurity({...security, loginAlerts: checked})
                      }
                    />
                  </div>

                  <Separator />

                  <div>
                    <Button variant="outline" className="w-full justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>View Login History</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data & Privacy</CardTitle>
                  <CardDescription>Manage your data and privacy settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      <span>Export Your Data</span>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      <span>Privacy Settings</span>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <Separator />

                  <div className="rounded-lg bg-destructive/10 border border-destructive/50 p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-destructive">Danger Zone</p>
                        <p className="text-xs text-muted-foreground">
                          Once you delete your account, there is no going back. Please be certain.
                        </p>
                      </div>
                    </div>
                    <Button variant="destructive" size="sm" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete Account
                    </Button>
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
