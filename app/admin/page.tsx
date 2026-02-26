'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Users,
  Plane,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  Activity,
  Server,
  Database,
  Globe,
  Mail,
  Download,
  Trash2,
  Edit,
  Eye,
  UserPlus,
  Ban,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  FileText,
  Bell,
  Wrench,
  type LucideIcon,
} from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

// ── Mock data ──────────────────────────────────────────────────────────────────

const signupData: { month: string; users: number }[] = []
const revenueData: { month: string; revenue: number }[] = []
const activityData: { day: string; flights: number; plans: number }[] = []


const billingTransactions: {
  id: string
  user: string
  plan: string
  amount: number
  date: string
  status: string
}[] = []

// ── Types ──────────────────────────────────────────────────────────────────────

type AdminStats = {
  totalUsers?: number
  totalAircraft?: number
  estimatedMRR?: number
  estimatedAnnualRevenue?: number
  listingFlagged?: number
  listingActive?: number
  listingPending?: number
  listingSold?: number
  proUsers?: number
  freeUsers?: number
}

type AdminUser = {
  id: string
  name?: string | null
  email?: string | null
  role?: string | null
  tier?: string | null
  plan?: string | null
  status?: string | null
  hours?: number | null
  club?: string | null
  joined?: string | null
}

type AdminAircraft = {
  id: string
  nNumber?: string | null
  make?: string | null
  model?: string | null
  groupName?: string | null
  status?: string | null
  hobbs?: number | null
  nextMx?: string | null
}

type AdminClub = {
  id: string
  name?: string | null
  createdAt?: string | Date | null
  members?: number | null
  aircraft?: number | null
  revenue?: number | null
  plan?: string | null
  status?: string | null
}

type MarketplaceListingSummary = {
  id: string
  flagged?: boolean | null
  title?: string | null
  price?: number | null
  status?: string | null
  createdAt?: string | Date | null
  seller?: string | null
  views?: number | null
  listed?: string | Date | null
}

type BillingTransaction = {
  id: string
  user: string
  plan: string
  amount: number
  date: string
  status: string
}

type FlightSummary = {
  scheduledFlights?: number
  activeFlights?: number
  completedFlights?: number
}

type SystemService = {
  name: string
  status: string
  uptime: string
  latency: string
}

type PipelineModule = 'totals' | 'logbook' | 'training' | 'currency' | 'plan' | 'marketplace' | 'mechanic' | 'club'

type PipelineStage = {
  stage: string
  value?: number
  total?: number
  breakdown?: Record<string, number>
}

type PipelineModuleSummary = {
  name: string
  key: string
  ingestion: number
  validation: number
  storage: number
  analytics: number
  outputs: number
}

type PipelineResponse = {
  module: PipelineModule
  stages: PipelineStage[]
  usedBy?: string[]
  modules?: PipelineModuleSummary[]
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, trend, icon: Icon, accent }: {
  label: string
  value: string
  sub: string
  trend: "up" | "down" | "neutral"
  icon: LucideIcon
  accent: string
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <div className="flex items-center gap-1">
              {trend === "up" && <ArrowUpRight className="h-3 w-3 text-chart-2" />}
              {trend === "down" && <ArrowDownRight className="h-3 w-3 text-destructive" />}
              <span className={`text-xs ${trend === "up" ? "text-chart-2" : trend === "down" ? "text-destructive" : "text-muted-foreground"}`}>{sub}</span>
            </div>
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === "operational" ? "bg-chart-2"
    : status === "degraded" ? "bg-chart-3"
    : "bg-destructive"
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
}

function UserStatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    active: "bg-chart-2/10 text-chart-2 border-chart-2/20",
    suspended: "bg-destructive/10 text-destructive border-destructive/20",
    pending: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${variants[status] ?? ""}`}>
      {status}
    </span>
  )
}

function TxnStatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    paid: "bg-chart-2/10 text-chart-2 border-chart-2/20",
    failed: "bg-destructive/10 text-destructive border-destructive/20",
    refunded: "bg-muted text-muted-foreground border-border",
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${variants[status] ?? ""}`}>
      {status}
    </span>
  )
}

function PipelineStageCard({
  label,
  value,
  usedBy,
}: {
  label: string
  value: number
  usedBy?: string[]
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <Badge variant="secondary">{value}</Badge>
      </div>
      {usedBy && (
        <p className="mt-2 text-[11px] text-muted-foreground">Used by: {usedBy.join(', ')}</p>
      )}
      <div className="mt-3">
        <Progress value={Math.min(100, value % 100)} className="h-1.5" />
      </div>
    </div>
  )
}

const pipelineModuleColors: Record<string, string> = {
  logbook: "bg-sky-500",
  training: "bg-emerald-500",
  currency: "bg-amber-500",
  plan: "bg-violet-500",
  marketplace: "bg-blue-500",
  mechanic: "bg-orange-500",
  club: "bg-teal-500",
}

function StackedStage({
  label,
  breakdown,
}: {
  label: string
  breakdown: Record<string, number>
}) {
  const total = Object.values(breakdown).reduce((sum, v) => sum + v, 0) || 1
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <Badge variant="secondary">{total}</Badge>
      </div>
      <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-muted">
        {Object.entries(breakdown).map(([key, value]) => (
          <div
            key={key}
            className={`h-full ${pipelineModuleColors[key] ?? "bg-muted-foreground/40"}`}
            style={{ width: `${(value / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
        {Object.entries(breakdown).map(([key, value]) => (
          <span key={key} className="inline-flex items-center gap-1">
            <span className={`h-2 w-2 rounded-full ${pipelineModuleColors[key] ?? "bg-muted-foreground/40"}`} />
            {key}: {value}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Sidebar nav data ───────────────────────────────────────────────────────────

type Tab =
  | "overview"
  | "awaiting-dispatch" | "currently-dispatched" | "past-flights"
  | "users" | "administrators" | "instructors" | "groups"
  | "aircraft" | "items" | "adjustments" | "forms"
  | "general-settings" | "general-settings2" | "users-settings" | "schedule-settings"
  | "notification-settings" | "add-ons"
  | "clubs" | "marketplace" | "billing" | "system"
  | "pipeline" | "data-warehouse"

type NavItem = { id: Tab; label: string; href?: string }
type NavGroup = { label: string; items: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Management",
    items: [
      { id: "overview", label: "Overview" },
      { id: "users", label: "Users", href: "/admin/users" },
      { id: "administrators", label: "Outreach", href: "/admin/outreach" },
    ],
  },
  {
    label: "Flights",
    items: [
      { id: "awaiting-dispatch", label: "Awaiting Dispatch" },
      { id: "currently-dispatched", label: "Currently Dispatched" },
      { id: "past-flights", label: "Past Flights" },
    ],
  },
  {
    label: "Resources",
    items: [
      { id: "aircraft", label: "Aircraft" },
      { id: "items", label: "Items" },
      { id: "adjustments", label: "Adjustments" },
      { id: "forms", label: "Forms" },
    ],
  },
  {
    label: "Data",
    items: [
      { id: "pipeline", label: "Data Pipeline" },
      { id: "data-warehouse", label: "Data Warehouse" },
    ],
  },
  {
    label: "Settings",
    items: [
      { id: "general-settings", label: "General Settings" },
      { id: "users-settings", label: "Users Settings" },
      { id: "schedule-settings", label: "Schedule Settings" },
      { id: "notification-settings", label: "Notification Settings" },
      { id: "add-ons", label: "Add-ons" },
    ],
  },
]

// placeholder panels for new sections
function PlaceholderPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-24 text-center">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-muted-foreground">{description}</p>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const [userSearch, setUserSearch] = useState("")

  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [aircraft, setAircraft] = useState<AdminAircraft[]>([])
  const [clubs, setClubs] = useState<AdminClub[]>([])
  const [listings, setListings] = useState<MarketplaceListingSummary[]>([])
  const [billingTransactions, setBillingTransactions] = useState<BillingTransaction[]>([])
  const [flightSummary, setFlightSummary] = useState<FlightSummary | null>(null)
  const [systemServices, setSystemServices] = useState<SystemService[]>([])
  const [pipelineModule, setPipelineModule] = useState<PipelineModule>('totals')
  const [pipelineData, setPipelineData] = useState<PipelineResponse | null>(null)

  const [isOverviewLoading, setIsOverviewLoading] = useState(false)
  const [overviewError, setOverviewError] = useState<string | null>(null)

  const [isUsersLoading, setIsUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)

  const [isAircraftLoading, setIsAircraftLoading] = useState(false)
  const [aircraftError, setAircraftError] = useState<string | null>(null)

  const [isClubsLoading, setIsClubsLoading] = useState(false)
  const [clubsError, setClubsError] = useState<string | null>(null)

  const [isMarketplaceLoading, setIsMarketplaceLoading] = useState(false)
  const [marketplaceError, setMarketplaceError] = useState<string | null>(null)

  const [isBillingLoading, setIsBillingLoading] = useState(false)
  const [billingError, setBillingError] = useState<string | null>(null)

  const [isFlightsLoading, setIsFlightsLoading] = useState(false)
  const [flightsError, setFlightsError] = useState<string | null>(null)

  const [isSystemLoading, setIsSystemLoading] = useState(false)
  const [systemError, setSystemError] = useState<string | null>(null)
  
  // Modal states
  const [viewUserModal, setViewUserModal] = useState<AdminUser | null>(null)
  const [editUserModal, setEditUserModal] = useState<AdminUser | null>(null)
  const [viewAircraftModal, setViewAircraftModal] = useState<AdminAircraft | null>(null)
  const [editAircraftModal, setEditAircraftModal] = useState<AdminAircraft | null>(null)
  const [viewClubModal, setViewClubModal] = useState<AdminClub | null>(null)
  const [editClubModal, setEditClubModal] = useState<AdminClub | null>(null)
  const [viewListingModal, setViewListingModal] = useState<MarketplaceListingSummary | null>(null)
  const [viewTransactionModal, setViewTransactionModal] = useState<BillingTransaction | null>(null)
  const [inviteUserModal, setInviteUserModal] = useState(false)
  const [addClubModal, setAddClubModal] = useState(false)
  
  // Settings state
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "AviationHub",
    supportEmail: "support@aviationhub.com",
    maintenanceMode: false,
  })
  
  const [userSettings, setUserSettings] = useState({
    allowSelfSignup: true,
    requireEmailVerification: true,
    defaultPlan: "Free",
  })
  
  const [scheduleSettings, setScheduleSettings] = useState({
    advanceBookingDays: 30,
    minBookingNotice: 2,
    maxBookingDuration: 8,
  })

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  )

  useEffect(() => {
    let cancelled = false

    async function loadOverview() {
      setIsOverviewLoading(true)
      setOverviewError(null)
      try {
        const [statsRes, flightsRes, usersRes, aircraftRes, listingsRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/flights/summary'),
          fetch('/api/admin/users?limit=4'),
          fetch('/api/admin/aircraft'),
          fetch('/api/admin/marketplace/listings?take=50'),
        ])

        if (!statsRes.ok) throw new Error('Failed to load stats')
        if (!flightsRes.ok) throw new Error('Failed to load flight summary')
        if (!usersRes.ok) throw new Error('Failed to load users')
        if (!aircraftRes.ok) throw new Error('Failed to load aircraft')
        if (!listingsRes.ok) throw new Error('Failed to load listings')

        const statsData = await statsRes.json()
        const flightsData = await flightsRes.json()
        const usersData = await usersRes.json()
        const aircraftData = await aircraftRes.json()
        const listingsData = await listingsRes.json()

        if (!cancelled) {
          setStats(statsData)
          setFlightSummary(flightsData)
          setUsers(usersData.users || [])
          setAircraft(aircraftData.aircraft || [])
          setListings(listingsData.listings || [])
        }
      } catch (error) {
        console.error('Failed to load overview data', error)
        if (!cancelled) setOverviewError('Failed to load overview data')
      } finally {
        if (!cancelled) setIsOverviewLoading(false)
      }
    }

    loadOverview()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadPipeline() {
      try {
        const res = await fetch(`/api/admin/pipeline?module=${pipelineModule}`)
        if (!res.ok) throw new Error('Failed to load pipeline')
        const data = await res.json()
        if (!cancelled) setPipelineData(data)
      } catch (error) {
        console.error('Failed to load pipeline', error)
      }
    }

    loadPipeline()
    const interval = setInterval(loadPipeline, 10000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [pipelineModule])

  useEffect(() => {
    let cancelled = false
    setIsSystemLoading(true)
    setSystemError(null)

    if (!cancelled) {
      setSystemServices([])
      setIsSystemLoading(false)
    }

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (activeTab !== 'users') return
    let cancelled = false

    async function loadUsers() {
      setIsUsersLoading(true)
      setUsersError(null)
      try {
        const res = await fetch(`/api/admin/users?limit=50&search=${encodeURIComponent(userSearch)}`)
        if (!res.ok) throw new Error('Failed to load users')
        const data = await res.json()
        if (!cancelled) setUsers(data.users || [])
      } catch (error) {
        console.error('Failed to load users', error)
        if (!cancelled) setUsersError('Failed to load users')
      } finally {
        if (!cancelled) setIsUsersLoading(false)
      }
    }

    loadUsers()
    return () => {
      cancelled = true
    }
  }, [activeTab, userSearch])

  useEffect(() => {
    if (activeTab !== 'aircraft') return
    let cancelled = false

    async function loadAircraft() {
      setIsAircraftLoading(true)
      setAircraftError(null)
      try {
        const res = await fetch('/api/admin/aircraft')
        if (!res.ok) throw new Error('Failed to load aircraft')
        const data = await res.json()
        if (!cancelled) setAircraft(data.aircraft || [])
      } catch (error) {
        console.error('Failed to load aircraft', error)
        if (!cancelled) setAircraftError('Failed to load aircraft')
      } finally {
        if (!cancelled) setIsAircraftLoading(false)
      }
    }

    loadAircraft()
    return () => {
      cancelled = true
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab !== 'clubs') return
    let cancelled = false

    async function loadClubs() {
      setIsClubsLoading(true)
      setClubsError(null)
      try {
        const res = await fetch('/api/admin/clubs')
        if (!res.ok) throw new Error('Failed to load clubs')
        const data = await res.json()
        if (!cancelled) setClubs(data.clubs || [])
      } catch (error) {
        console.error('Failed to load clubs', error)
        if (!cancelled) setClubsError('Failed to load clubs')
      } finally {
        if (!cancelled) setIsClubsLoading(false)
      }
    }

    loadClubs()
    return () => {
      cancelled = true
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab !== 'marketplace') return
    let cancelled = false

    async function loadListings() {
      setIsMarketplaceLoading(true)
      setMarketplaceError(null)
      try {
        const res = await fetch('/api/admin/marketplace/listings?take=50')
        if (!res.ok) throw new Error('Failed to load listings')
        const data = await res.json()
        if (!cancelled) setListings(data.listings || [])
      } catch (error) {
        console.error('Failed to load listings', error)
        if (!cancelled) setMarketplaceError('Failed to load listings')
      } finally {
        if (!cancelled) setIsMarketplaceLoading(false)
      }
    }

    loadListings()
    return () => {
      cancelled = true
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab !== 'billing') return
    let cancelled = false

    async function loadBilling() {
      setIsBillingLoading(true)
      setBillingError(null)
      try {
        const res = await fetch('/api/admin/billing/transactions?take=50')
        if (!res.ok) throw new Error('Failed to load transactions')
        const data = await res.json()
        if (!cancelled) setBillingTransactions(data.transactions || [])
      } catch (error) {
        console.error('Failed to load billing', error)
        if (!cancelled) setBillingError('Failed to load billing')
      } finally {
        if (!cancelled) setIsBillingLoading(false)
      }
    }

    loadBilling()
    return () => {
      cancelled = true
    }
  }, [activeTab])

  useEffect(() => {
    if (!['awaiting-dispatch', 'currently-dispatched', 'past-flights'].includes(activeTab)) return
    let cancelled = false

    async function loadFlightSummary() {
      setIsFlightsLoading(true)
      setFlightsError(null)
      try {
        const res = await fetch('/api/admin/flights/summary')
        if (!res.ok) throw new Error('Failed to load flight summary')
        const data = await res.json()
        if (!cancelled) setFlightSummary(data)
      } catch (error) {
        console.error('Failed to load flight summary', error)
        if (!cancelled) setFlightsError('Failed to load flight summary')
      } finally {
        if (!cancelled) setIsFlightsLoading(false)
      }
    }

    loadFlightSummary()
    return () => {
      cancelled = true
    }
  }, [activeTab])
  
  // Handler functions
  const handleExport = () => {
  const dataMap: Record<Tab, unknown[]> = {
      overview: [],
      users,
      aircraft,
      clubs,
      marketplace: listings,
      billing: billingTransactions,
      "general-settings": [],
      "awaiting-dispatch": [],
      "currently-dispatched": [],
      "past-flights": [],
      administrators: [],
      instructors: [],
      groups: [],
      items: [],
      adjustments: [],
      forms: [],
      "general-settings2": [],
      "users-settings": [],
      "schedule-settings": [],
      "notification-settings": [],
      "add-ons": [],
      system: systemServices,
      pipeline: [],
      "data-warehouse": [],
    }
    
    const data = dataMap[activeTab] || []
    const csv = JSON.stringify(data, null, 2)
    const blob = new Blob([csv], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeTab}-export-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    alert('Data exported successfully!')
  }
  
  const handleRefresh = () => {
    // In production, this would refetch data from API
    window.location.reload()
  }
  
  // User actions
  const handleViewUser = (user: AdminUser) => {
    setViewUserModal(user)
  }
  
  const handleEditUser = (user: AdminUser) => {
    setEditUserModal(user)
  }
  
  const handleBanUser = (userId: string | number) => {
    if (confirm('Are you sure you want to suspend this user?')) {
      alert(`User ${userId} suspended. In production, this would call API.`)
    }
  }
  
  const handleInviteUser = () => {
    setInviteUserModal(true)
  }
  
  // Aircraft actions
  const handleViewAircraft = (ac: AdminAircraft) => {
    setViewAircraftModal(ac)
  }
  
  const handleEditAircraft = (ac: AdminAircraft) => {
    setEditAircraftModal(ac)
  }
  
  const handleDeleteAircraft = (id: string | number) => {
    if (confirm('Are you sure you want to delete this aircraft?')) {
      alert(`Aircraft ${id} deleted. In production, this would call API.`)
    }
  }
  
  // Club actions
  const handleViewClub = (club: AdminClub) => {
    setViewClubModal(club)
  }
  
  const handleEditClub = (club: AdminClub) => {
    setEditClubModal(club)
  }
  
  const handleDeleteClub = (id: string | number) => {
    if (confirm('Are you sure you want to delete this club?')) {
      alert(`Club ${id} deleted. In production, this would call API.`)
    }
  }
  
  const handleAddClub = () => {
    setAddClubModal(true)
  }
  
  // Marketplace actions
  const handleViewListing = (listing: MarketplaceListingSummary) => {
    setViewListingModal(listing)
  }
  
  const handleApproveListing = (id: string | number) => {
    alert(`Listing ${id} approved. In production, this would call API.`)
  }
  
  const handleDeleteListing = (id: string | number) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      alert(`Listing ${id} deleted. In production, this would call API.`)
    }
  }
  
  // Billing actions
  const handleViewTransaction = (txn: BillingTransaction) => {
    setViewTransactionModal(txn)
  }
  
  const handleDownloadInvoice = (txnId: string) => {
    alert(`Downloading invoice ${txnId}. In production, this would generate PDF.`)
  }
  
  // Settings actions
  const handleSaveGeneralSettings = () => {
    console.log('Saving general settings:', generalSettings)
    alert('General settings saved successfully!')
  }
  
  const handleSaveUserSettings = () => {
    console.log('Saving user settings:', userSettings)
    alert('User settings saved successfully!')
  }
  
  const handleSaveScheduleSettings = () => {
    console.log('Saving schedule settings:', scheduleSettings)
    alert('Schedule settings saved successfully!')
  }

  return (
    <div className="flex min-h-screen bg-background pt-[44px]">

      {/* ── SIDEBAR ──────────────────────────────────────────────────────────── */}
      <aside className="fixed top-[44px] left-0 h-[calc(100vh-44px)] w-56 shrink-0 overflow-y-auto border-r border-border bg-card">
        {/* Sidebar header */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-destructive/90">
            <ShieldCheck className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-xs font-semibold">Admin</span>
          <Badge variant="destructive" className="ml-auto text-[9px] px-1 py-0">ADMIN</Badge>
        </div>

        {/* Nav groups */}
        <nav className="py-2">
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.label} className={gi > 0 ? "mt-1 border-t border-border pt-1" : ""}>
              <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {group.label}
              </p>
              {group.items.map((item) => {
                const isActive = activeTab === item.id
                
                // If item has href, render as Link
                if (item.href) {
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-medium transition-colors text-foreground hover:bg-muted"
                    >
                      {item.label}
                      <ArrowUpRight className="h-3 w-3 shrink-0 rotate-45 text-muted-foreground" />
                    </Link>
                  )
                }
                
                // Otherwise, render as button with state
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex w-full items-center justify-between px-4 py-2.5 text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {item.label}
                    <ArrowUpRight className={`h-3 w-3 shrink-0 rotate-45 ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`} />
                  </button>
                )
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto ml-[224px]">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-11 items-center justify-between border-b border-border bg-card/95 px-6 backdrop-blur">
          <h1 className="text-sm font-semibold capitalize">
            {NAV_GROUPS.flatMap(g => g.items).find(i => i.id === activeTab)?.label ?? "Overview"}
          </h1>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs" onClick={handleExport}>
              <Download className="h-3 w-3" /> Export
            </Button>
            <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs" onClick={handleRefresh}>
              <RefreshCw className="h-3 w-3" /> Refresh
            </Button>
          </div>
        </div>

      <div className="p-6 space-y-6">

        {/* ── FLIGHTS ─────────────────────────────────────────────────────────── */}
        {activeTab === "awaiting-dispatch" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Scheduled Flights</CardTitle>
              <CardDescription className="text-xs">
                Upcoming bookings waiting to start
                {flightsError && <span className="ml-2 text-destructive">{flightsError}</span>}
                {isFlightsLoading && !flightsError && <span className="ml-2 text-muted-foreground">Loading…</span>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Scheduled" value={String(flightSummary?.scheduledFlights ?? 0)} sub="Upcoming" trend="neutral" icon={Clock} accent="bg-muted text-muted-foreground" />
                <StatCard label="Active" value={String(flightSummary?.activeFlights ?? 0)} sub="In progress" trend="neutral" icon={Plane} accent="bg-chart-2/10 text-chart-2" />
                <StatCard label="Completed" value={String(flightSummary?.completedFlights ?? 0)} sub="Logged" trend="neutral" icon={CheckCircle2} accent="bg-primary/10 text-primary" />
              </div>
            </CardContent>
          </Card>
        )}
        {activeTab === "currently-dispatched" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Active Flights</CardTitle>
              <CardDescription className="text-xs">
                Flights currently in progress
                {flightsError && <span className="ml-2 text-destructive">{flightsError}</span>}
                {isFlightsLoading && !flightsError && <span className="ml-2 text-muted-foreground">Loading…</span>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Active" value={String(flightSummary?.activeFlights ?? 0)} sub="In progress" trend="neutral" icon={Plane} accent="bg-chart-2/10 text-chart-2" />
                <StatCard label="Scheduled" value={String(flightSummary?.scheduledFlights ?? 0)} sub="Upcoming" trend="neutral" icon={Clock} accent="bg-muted text-muted-foreground" />
                <StatCard label="Completed" value={String(flightSummary?.completedFlights ?? 0)} sub="Logged" trend="neutral" icon={CheckCircle2} accent="bg-primary/10 text-primary" />
              </div>
            </CardContent>
          </Card>
        )}
        {activeTab === "past-flights" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Completed Flights</CardTitle>
              <CardDescription className="text-xs">
                Historical flight count across the platform
                {flightsError && <span className="ml-2 text-destructive">{flightsError}</span>}
                {isFlightsLoading && !flightsError && <span className="ml-2 text-muted-foreground">Loading…</span>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Completed" value={String(flightSummary?.completedFlights ?? 0)} sub="Logged" trend="neutral" icon={CheckCircle2} accent="bg-primary/10 text-primary" />
                <StatCard label="Active" value={String(flightSummary?.activeFlights ?? 0)} sub="In progress" trend="neutral" icon={Plane} accent="bg-chart-2/10 text-chart-2" />
                <StatCard label="Scheduled" value={String(flightSummary?.scheduledFlights ?? 0)} sub="Upcoming" trend="neutral" icon={Clock} accent="bg-muted text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── PEOPLE ──────────────────────────────────────────────────────────── */}
        {activeTab === "administrators" && (
          <PlaceholderPanel title="Administrators" description="Platform admins with elevated privileges. Manage roles and access levels here." />
        )}
        {activeTab === "instructors" && (
          <PlaceholderPanel title="Instructors" description="Certified flight instructors registered on the platform. Manage endorsements and schedules." />
        )}
        {activeTab === "groups" && (
          <PlaceholderPanel title="Groups" description="Custom user groups for permissions, scheduling, and billing segmentation." />
        )}

        {/* ── RESOURCES ────────────────────────────────────────────────────────── */}
        {activeTab === "items" && (
          <PlaceholderPanel title="Items" description="Billable items such as fuel, instruction, or add-on charges attached to flights." />
        )}
        {activeTab === "adjustments" && (
          <PlaceholderPanel title="Adjustments" description="Manual billing adjustments, credits, and debits applied to member accounts." />
        )}
        {activeTab === "forms" && (
          <PlaceholderPanel title="Forms" description="Custom pre-flight, post-flight, and maintenance forms assigned to aircraft or members." />
        )}

        {/* ── SETTINGS ────────────────────────────────────────────────────────── */}
        {activeTab === "users-settings" && (
          <PlaceholderPanel title="Users Settings" description="Configure user registration, roles, self-sign-up, and profile requirements." />
        )}
        {activeTab === "schedule-settings" && (
          <PlaceholderPanel title="Schedule Settings" description="Configure booking windows, advance notice rules, and scheduling constraints." />
        )}
        {activeTab === "notification-settings" && (
          <PlaceholderPanel title="Notification Settings" description="Set up email, SMS, and push notification triggers for all platform events." />
        )}
        {activeTab === "add-ons" && (
          <PlaceholderPanel title="Add-ons" description="Manage third-party integrations, plugins, and premium feature modules." />
        )}

        {/* ── PLATFORM OVERVIEW ───────────────────────────────────────────────── */}
        {(activeTab === "overview" || activeTab === "general-settings") && (
          <>
            {overviewError && <div className="text-xs text-destructive">{overviewError}</div>}
            {isOverviewLoading && !overviewError && <div className="text-xs text-muted-foreground">Loading…</div>}
            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Users" value={String(stats?.totalUsers ?? 0)} sub="All users" trend="neutral" icon={Users} accent="bg-primary/10 text-primary" />
              <StatCard label="Active Aircraft" value={String(stats?.totalAircraft ?? aircraft.length)} sub="Registered" trend="neutral" icon={Plane} accent="bg-chart-2/10 text-chart-2" />
              <StatCard label="MRR" value={`$${Number(stats?.estimatedMRR ?? 0).toFixed(2)}`} sub="Estimated" trend="neutral" icon={DollarSign} accent="bg-chart-3/10 text-chart-3" />
              <StatCard label="Flagged Items" value={String(stats?.listingFlagged ?? listings.filter(l => l.flagged).length)} sub="Needs review" trend="neutral" icon={AlertTriangle} accent="bg-destructive/10 text-destructive" />
            </div>

            {/* Charts row */}
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">User Signups</CardTitle>
                  <CardDescription className="text-xs">New registrations per month</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    {signupData.length === 0 ? (
                      <div className="flex h-[180px] items-center justify-center text-xs text-muted-foreground">
                        No signup data yet
                      </div>
                    ) : (
                      <AreaChart data={signupData}>
                        <defs>
                          <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                        <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 11, color: "#f1f5f9" }} />
                        <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} fill="url(#gUsers)" />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Revenue (MRR)</CardTitle>
                  <CardDescription className="text-xs">Monthly recurring revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    {revenueData.length === 0 ? (
                      <div className="flex h-[180px] items-center justify-center text-xs text-muted-foreground">
                        No revenue data yet
                      </div>
                    ) : (
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                        <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                        <Tooltip
                          contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 11, color: "#f1f5f9" }}
                          formatter={(v) => [`$${(v as number)?.toLocaleString() ?? 0}`, "Revenue"]}
                        />
                        <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 3 }} />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Platform Activity</CardTitle>
                  <CardDescription className="text-xs">Flights logged vs plans created (7d)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    {activityData.length === 0 ? (
                      <div className="flex h-[180px] items-center justify-center text-xs text-muted-foreground">
                        No activity data yet
                      </div>
                    ) : (
                      <BarChart data={activityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                        <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 11, color: "#f1f5f9" }} />
                        <Bar dataKey="plans" fill="#a855f7" opacity={0.4} radius={[2, 2, 0, 0]} />
                        <Bar dataKey="flights" fill="#a855f7" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Plan distribution + recent users */}
            <div className="grid gap-4 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Plan Distribution</CardTitle>
                </CardHeader>
                  <CardContent className="space-y-3">
                  {[
                    { plan: "Pro", count: Number(stats?.proUsers ?? 0), total: Number(stats?.totalUsers ?? 0) || 1, color: "bg-chart-2" },
                    { plan: "Free", count: Number(stats?.freeUsers ?? 0), total: Number(stats?.totalUsers ?? 0) || 1, color: "bg-muted-foreground" },
                  ].map((p) => (
                    <div key={p.plan} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{p.plan}</span>
                        <span className="text-muted-foreground">{p.count.toLocaleString()} users</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div className={`h-full rounded-full ${p.color}`} style={{ width: `${(p.count / p.total) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Total users</span><span className="font-semibold text-foreground">{Number(stats?.totalUsers ?? 0).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Recent Registrations</CardTitle>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setActiveTab("users")}>View all</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {users.slice(0, 4).map((user) => (
                      <div key={user.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {user.name?.split(" ").map((n: string) => n[0]).join("")}
                          </div>
                          <div>
                            <p className="text-xs font-medium">{user.name}</p>
                            <p className="text-[11px] text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-[10px]">{user.tier || 'free'}</Badge>
                          <UserStatusBadge status={user.status || 'active'} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Data pipeline visualization */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Data Pipeline</CardTitle>
                  <Tabs value={pipelineModule} onValueChange={(v) => setPipelineModule(v as PipelineModule)}>
                    <TabsList className="h-7">
                      {['totals','logbook','training','currency','plan','marketplace','mechanic','club'].map((key) => (
                        <TabsTrigger key={key} value={key} className="text-[10px] px-2">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
                <CardDescription className="text-xs">Ingestion → Validation → Storage → Analytics → Outputs</CardDescription>
              </CardHeader>
              <CardContent>
                {!pipelineData && (
                  <div className="text-xs text-muted-foreground">Loading pipeline…</div>
                )}

                {pipelineData?.module === 'totals' && (
                  <div className="grid gap-4 lg:grid-cols-5">
                    {pipelineData.stages?.map((stage) => (
                      <StackedStage key={stage.stage} label={stage.stage} breakdown={stage.breakdown || {}} />
                    ))}
                  </div>
                )}

                {pipelineData?.module !== 'totals' && pipelineData?.stages && (
                  <div className="grid gap-4 lg:grid-cols-5">
                    {pipelineData.stages.map((stage) => (
                      <PipelineStageCard
                        key={stage.stage}
                        label={stage.stage}
                        value={stage.value || 0}
                        usedBy={pipelineData.usedBy}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System health quick view */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">System Health</CardTitle>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setActiveTab("system")}>View all</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {systemServices.slice(0, 4).map((svc) => (
                    <div key={svc.name} className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <StatusDot status={svc.status} />
                      <div>
                        <p className="text-xs font-medium">{svc.name}</p>
                        <p className="text-[11px] text-muted-foreground">{svc.uptime} uptime · {svc.latency}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* ── USERS ────────────────────────────────────────────────────────────── */}
        {activeTab === "users" && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Users</h2>
                <p className="text-xs text-muted-foreground">Manage all registered pilots and administrators</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={handleExport}>
                  <Download className="h-3 w-3" /> Export
                </Button>
                <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={handleInviteUser}>
                  <UserPlus className="h-3 w-3" /> Invite User
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Total Users" value={String(stats?.totalUsers ?? users.length ?? 0)} sub="All users" trend="neutral" icon={Users} accent="bg-primary/10 text-primary" />
              <StatCard label="Active" value={String(users.filter(u => u.status === 'active').length)} sub="Active users" trend="neutral" icon={CheckCircle2} accent="bg-chart-2/10 text-chart-2" />
              <StatCard label="Suspended" value={String(users.filter(u => u.status === 'suspended').length)} sub="Suspended" trend="neutral" icon={Ban} accent="bg-destructive/10 text-destructive" />
            </div>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="h-8 pl-8 text-xs"
                    />
                  </div>
                  <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
                    <Filter className="h-3 w-3" /> Filter
                  </Button>
                  {usersError && <span className="text-xs text-destructive">{usersError}</span>}
                  {isUsersLoading && !usersError && <span className="text-xs text-muted-foreground">Loading…</span>}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plan</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Flight Hours</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Club</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Joined</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary shrink-0">
                                {user.name?.split(" ").map((n: string) => n[0]).join("")}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{user.name}</p>
                              <p className="text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 capitalize text-muted-foreground">{user.role}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-[10px]">{user.tier || 'free'}</Badge>
                        </td>
                        <td className="px-4 py-3"><UserStatusBadge status={user.status || 'active'} /></td>
                        <td className="px-4 py-3 text-muted-foreground">{Number(user.hours || 0).toFixed(1)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{user.club || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{user.joined || "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleViewUser(user)}><Eye className="h-3 w-3" /></Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleEditUser(user)}><Edit className="h-3 w-3" /></Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive hover:text-destructive" onClick={() => handleBanUser(user.id)}><Ban className="h-3 w-3" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </>
        )}

        {/* ── AIRCRAFT ─────────────────────────────────────────────────────────── */}
        {activeTab === "aircraft" && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Aircraft Registry</h2>
                <p className="text-xs text-muted-foreground">All aircraft registered across the platform</p>
              </div>
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={handleExport}>
                <Download className="h-3 w-3" /> Export
              </Button>
            </div>
            {aircraftError && <div className="text-xs text-destructive">{aircraftError}</div>}
            {isAircraftLoading && !aircraftError && <div className="text-xs text-muted-foreground">Loading…</div>}

            <div className="grid gap-4 sm:grid-cols-4">
              <StatCard label="Total Aircraft" value={String(aircraft.length)} sub="Registered" trend="neutral" icon={Plane} accent="bg-primary/10 text-primary" />
              <StatCard label="Active" value={String(aircraft.filter(a => a.status === 'Available').length)} sub="Available" trend="neutral" icon={CheckCircle2} accent="bg-chart-2/10 text-chart-2" />
              <StatCard label="In Maintenance" value={String(aircraft.filter(a => a.status === 'Maintenance').length)} sub="Needs service" trend="neutral" icon={Wrench} accent="bg-chart-3/10 text-chart-3" />
              <StatCard label="Grounded" value={String(aircraft.filter(a => a.status === 'Grounded').length)} sub="Not airworthy" trend="neutral" icon={AlertTriangle} accent="bg-destructive/10 text-destructive" />
            </div>

            <Card>
              <CardContent className="p-0">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Registration</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Owner</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Hobbs Time</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Next MX</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Airworthiness</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {aircraft.map((a) => (
                      <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono font-semibold text-foreground">{a.nNumber || 'N/A'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{[a.make, a.model].filter(Boolean).join(' ') || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{a.groupName || '—'}</td>
                        <td className="px-4 py-3">
                          <UserStatusBadge status={a.status === "Available" ? "active" : a.status === "Maintenance" ? "pending" : "suspended"} />
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{Number(a.hobbs || 0).toFixed(1)}</td>
                        <td className={`px-4 py-3 font-medium ${a.nextMx === "Overdue" ? "text-destructive" : "text-muted-foreground"}`}>{a.nextMx || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${a.status === "Available" ? "text-chart-2" : "text-destructive"}`}>
                            {a.status === "Available" ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                            {a.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleViewAircraft(a)}><Eye className="h-3 w-3" /></Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleEditAircraft(a)}><Edit className="h-3 w-3" /></Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive hover:text-destructive" onClick={() => handleDeleteAircraft(a.id)}><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </>
        )}

        {/* ── CLUBS ────────────────────────────────────────────────────────────── */}
        {activeTab === "clubs" && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Flying Clubs</h2>
                <p className="text-xs text-muted-foreground">Manage all registered clubs and organisations</p>
              </div>
              <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={handleAddClub}>
                <Building2 className="h-3 w-3" /> Add Club
              </Button>
            </div>
            {clubsError && <div className="text-xs text-destructive">{clubsError}</div>}
            {isClubsLoading && !clubsError && <div className="text-xs text-muted-foreground">Loading…</div>}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Clubs" value={String(clubs.length)} sub="Registered" trend="neutral" icon={Building2} accent="bg-primary/10 text-primary" />
              <StatCard label="Total Members" value={String(clubs.reduce((sum, c) => sum + (c.members || 0), 0))} sub="Across clubs" trend="neutral" icon={Users} accent="bg-chart-2/10 text-chart-2" />
              <StatCard label="Club Revenue" value={`$${clubs.reduce((sum, c) => sum + (c.revenue || 0), 0).toLocaleString()}`} sub="This month" trend="neutral" icon={DollarSign} accent="bg-chart-3/10 text-chart-3" />
              <StatCard label="On Trial" value={String(clubs.filter(c => c.status === 'trial').length)} sub="Trial groups" trend="neutral" icon={Clock} accent="bg-muted text-muted-foreground" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {clubs.map((club) => (
                  <Card key={club.id} className="hover:border-primary/40 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                          {club.name?.split(" ").map((w: string) => w[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{club.name}</p>
                          <p className="text-xs text-muted-foreground">Since {club.createdAt ? new Date(club.createdAt).toLocaleDateString() : '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{club.plan || 'Free'}</Badge>
                        <UserStatusBadge status={club.status === "trial" ? "pending" : "active"} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="rounded-lg bg-muted/50 p-2">
                        <p className="text-sm font-bold">{club.members ?? 0}</p>
                        <p className="text-[11px] text-muted-foreground">Members</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-2">
                        <p className="text-sm font-bold">{club.aircraft ?? 0}</p>
                        <p className="text-[11px] text-muted-foreground">Aircraft</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-2">
                        <p className="text-sm font-bold">${Number(club.revenue || 0).toLocaleString()}</p>
                        <p className="text-[11px] text-muted-foreground">Revenue/mo</p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => handleViewClub(club)}>View</Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleEditClub(club)}><Edit className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleDeleteClub(club.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* ── MARKETPLACE ──────────────────────────────────────────────────────── */}
        {activeTab === "marketplace" && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Marketplace</h2>
                <p className="text-xs text-muted-foreground">Review, approve, and moderate aircraft listings</p>
              </div>
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={handleExport}>
                <Download className="h-3 w-3" /> Export
              </Button>
            </div>
            {marketplaceError && <div className="text-xs text-destructive">{marketplaceError}</div>}
            {isMarketplaceLoading && !marketplaceError && <div className="text-xs text-muted-foreground">Loading…</div>}

            <div className="grid gap-4 sm:grid-cols-4">
              <StatCard label="Active Listings" value={String(stats?.listingActive ?? listings.filter(l => l.status === 'active').length)} sub="Active" trend="neutral" icon={Globe} accent="bg-primary/10 text-primary" />
              <StatCard label="Pending Review" value={String(stats?.listingPending ?? listings.filter(l => l.status === 'pending').length)} sub="Awaiting" trend="neutral" icon={Clock} accent="bg-chart-3/10 text-chart-3" />
              <StatCard label="Flagged" value={String(stats?.listingFlagged ?? listings.filter(l => l.flagged).length)} sub="Require action" trend="neutral" icon={ShieldAlert} accent="bg-destructive/10 text-destructive" />
              <StatCard label="Sold (30d)" value={String(stats?.listingSold ?? listings.filter(l => l.status === 'sold').length)} sub="Sold" trend="neutral" icon={DollarSign} accent="bg-chart-2/10 text-chart-2" />
            </div>

            <Card>
              <CardContent className="p-0">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Listing</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Seller</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Price</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Views</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Listed</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {listings.map((l) => (
                      <tr key={l.id} className={`hover:bg-muted/30 transition-colors ${l.flagged ? "bg-destructive/5" : ""}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {l.flagged && <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />}
                            <span className="font-medium text-foreground">{l.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{l.seller}</td>
                        <td className="px-4 py-3 font-medium text-foreground">${Number(l.price || 0).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <UserStatusBadge status={l.status === "active" ? "active" : l.status === "flagged" ? "suspended" : l.status === "sold" ? "active" : "pending"} />
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{l.views ?? 0}</td>
                        <td className="px-4 py-3 text-muted-foreground">{l.listed ? new Date(l.listed).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleViewListing(l)}><Eye className="h-3 w-3" /></Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-chart-2 hover:text-chart-2" onClick={() => handleApproveListing(l.id)}><CheckCircle2 className="h-3 w-3" /></Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive hover:text-destructive" onClick={() => handleDeleteListing(l.id)}><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </>
        )}

        {/* ── BILLING ──────────────────────────────────────────────────────────── */}
        {activeTab === "billing" && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Billing & Revenue</h2>
                <p className="text-xs text-muted-foreground">Transaction history, subscriptions, and revenue tracking</p>
              </div>
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={handleExport}>
                <Download className="h-3 w-3" /> Export CSV
              </Button>
            </div>
            {billingError && <div className="text-xs text-destructive">{billingError}</div>}
            {isBillingLoading && !billingError && <div className="text-xs text-muted-foreground">Loading…</div>}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="MRR" value={`$${Number(stats?.estimatedMRR ?? 0).toFixed(2)}`} sub="Estimated" trend="neutral" icon={TrendingUp} accent="bg-chart-2/10 text-chart-2" />
              <StatCard label="ARR" value={`$${Number(stats?.estimatedAnnualRevenue ?? 0).toFixed(2)}`} sub="Estimated" trend="neutral" icon={DollarSign} accent="bg-primary/10 text-primary" />
              <StatCard label="Failed Payments" value={String(billingTransactions.filter((t) => t.status === 'failed').length)} sub="Failed" trend="neutral" icon={AlertTriangle} accent="bg-destructive/10 text-destructive" />
              <StatCard label="Refunds (30d)" value={String(billingTransactions.filter((t) => t.status === 'refunded').length)} sub="Refunded" trend="neutral" icon={TrendingDown} accent="bg-muted text-muted-foreground" />
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Transaction ID</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">User / Club</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plan</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Amount</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {billingTransactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-muted-foreground">{txn.id}</td>
                        <td className="px-4 py-3 font-medium text-foreground">{txn.user}</td>
                        <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{txn.plan}</Badge></td>
                        <td className="px-4 py-3 font-semibold">${Number(txn.amount || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{txn.date || '—'}</td>
                        <td className="px-4 py-3"><TxnStatusBadge status={txn.status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleViewTransaction(txn)}><Eye className="h-3 w-3" /></Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleDownloadInvoice(txn.id)}><FileText className="h-3 w-3" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </>
        )}

        {/* ── PIPELINE ───────────────────────────────────────────────────────────── */}
        {activeTab === "pipeline" && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Data Pipeline</h2>
                <p className="text-xs text-muted-foreground">Monitor data ingestion, validation, storage, and analytics pipelines</p>
              </div>
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => {
                setPipelineModule('totals')
              }}>
                <RefreshCw className="h-3 w-3" /> Refresh
              </Button>
            </div>

            {/* Pipeline stats summary */}
            <div className="grid gap-4 sm:grid-cols-4">
              <StatCard 
                label="Total Records" 
                value={pipelineData?.stages?.reduce((sum, s) => sum + (s.total || s.value || 0), 0).toLocaleString() || "—"} 
                sub="Across all modules" 
                trend="neutral" 
                icon={Database} 
                accent="bg-chart-1/10 text-chart-1" 
              />
              <StatCard 
                label="Ingestion Rate" 
                value="~2.4k/hr" 
                sub="Last 24 hours" 
                trend="up" 
                icon={TrendingUp} 
                accent="bg-chart-2/10 text-chart-2" 
              />
              <StatCard 
                label="Validation Rate" 
                value="98.7%" 
                sub="Auto-validated" 
                trend="up" 
                icon={CheckCircle2} 
                accent="bg-green-500/10 text-green-500" 
              />
              <StatCard 
                label="Pending" 
                value="23" 
                sub="Needs review" 
                trend="down" 
                icon={Clock} 
                accent="bg-amber-500/10 text-amber-500" 
              />
            </div>

            {/* Pipeline visualization */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Pipeline Flow</CardTitle>
                  <Tabs value={pipelineModule} onValueChange={(v) => setPipelineModule(v as PipelineModule)}>
                    <TabsList className="h-7">
                      {['totals','logbook','training','currency','plan','marketplace','mechanic','club'].map((key) => (
                        <TabsTrigger key={key} value={key} className="text-[10px] px-2">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
                <CardDescription className="text-xs">Ingestion → Validation → Storage → Analytics → Outputs</CardDescription>
              </CardHeader>
              <CardContent>
                {!pipelineData && (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}

                {pipelineData?.module === 'totals' && (
                  <div className="grid gap-4 lg:grid-cols-5">
                    {pipelineData.stages?.map((stage) => (
                      <StackedStage key={stage.stage} label={stage.stage} breakdown={stage.breakdown || {}} />
                    ))}
                  </div>
                )}

                {pipelineData?.module !== 'totals' && pipelineData?.stages && (
                  <div className="grid gap-4 lg:grid-cols-5">
                    {pipelineData.stages.map((stage) => (
                      <PipelineStageCard
                        key={stage.stage}
                        label={stage.stage}
                        value={stage.value || 0}
                        usedBy={pipelineData.usedBy}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Module details table */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Module Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 font-medium">Module</th>
                        <th className="text-right py-2 px-3 font-medium">Ingestion</th>
                        <th className="text-right py-2 px-3 font-medium">Validation</th>
                        <th className="text-right py-2 px-3 font-medium">Storage</th>
                        <th className="text-right py-2 px-3 font-medium">Analytics</th>
                        <th className="text-right py-2 px-3 font-medium">Outputs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(pipelineData?.modules || []).map((mod) => {
                        return (
                          <tr key={mod.key} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-3 font-medium">{mod.name}</td>
                            <td className="text-right py-2 px-3">{mod.ingestion.toLocaleString()}</td>
                            <td className="text-right py-2 px-3">{mod.validation.toLocaleString()}</td>
                            <td className="text-right py-2 px-3">{mod.storage.toLocaleString()}</td>
                            <td className="text-right py-2 px-3">{mod.analytics.toLocaleString()}</td>
                            <td className="text-right py-2 px-3">{mod.outputs.toLocaleString()}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* ── SYSTEM ───────────────────────────────────────────────────────────── */}
        {activeTab === "system" && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">System Status</h2>
                <p className="text-xs text-muted-foreground">Monitor all platform services and infrastructure</p>
              </div>
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={handleRefresh}>
                <RefreshCw className="h-3 w-3" /> Refresh
              </Button>
            </div>
            {systemError && <div className="text-xs text-destructive">{systemError}</div>}
            {isSystemLoading && !systemError && <div className="text-xs text-muted-foreground">Loading…</div>}

            <div className="grid gap-4 sm:grid-cols-4">
              <StatCard label="Services Online" value="6/7" sub="1 degraded" trend="neutral" icon={Server} accent="bg-chart-3/10 text-chart-3" />
              <StatCard label="Avg Response" value="94ms" sub="-12ms vs yesterday" trend="up" icon={Activity} accent="bg-chart-2/10 text-chart-2" />
              <StatCard label="DB Storage" value="68%" sub="34.2 GB used" trend="neutral" icon={Database} accent="bg-primary/10 text-primary" />
              <StatCard label="Error Rate" value="0.04%" sub="Last 24 hours" trend="up" icon={AlertTriangle} accent="bg-muted text-muted-foreground" />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Services</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {systemServices.map((svc) => (
                    <div key={svc.name} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div className="flex items-center gap-3">
                        <StatusDot status={svc.status} />
                        <div>
                          <p className="text-xs font-medium">{svc.name}</p>
                          <p className="text-[11px] text-muted-foreground">{svc.latency} avg</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-medium ${svc.status === "operational" ? "text-chart-2" : "text-chart-3"}`}>
                          {svc.uptime}
                        </span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full capitalize ${
                          svc.status === "operational"
                            ? "bg-chart-2/10 text-chart-2"
                            : "bg-chart-3/10 text-chart-3"
                        }`}>
                          {svc.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Resource Usage</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { label: "CPU", value: 34 },
                      { label: "Memory", value: 58 },
                      { label: "Storage", value: 68 },
                      { label: "Bandwidth", value: 22 },
                    ].map((r) => (
                      <div key={r.label} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium">{r.label}</span>
                          <span className="text-muted-foreground">{r.value}%</span>
                        </div>
                        <Progress value={r.value} className="h-1.5" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Recent Errors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[
                        { code: "503", msg: "File Storage timeout", time: "12 min ago" },
                        { code: "429", msg: "Weather API rate limit", time: "2h ago" },
                        { code: "500", msg: "PDF export failure (1 user)", time: "5h ago" },
                      ].map((err, i) => (
                        <div key={i} className="flex items-center gap-3 rounded border border-destructive/20 bg-destructive/5 p-2.5">
                          <Badge variant="destructive" className="text-[10px] shrink-0">{err.code}</Badge>
                          <p className="flex-1 text-xs">{err.msg}</p>
                          <span className="text-[11px] text-muted-foreground shrink-0">{err.time}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}

        {/* ── SETTINGS (platform config) ───────────────────────────────────────── */}
        {activeTab === "general-settings2" && (
          <>
            <div>
              <h2 className="text-lg font-semibold">Platform Settings</h2>
              <p className="text-xs text-muted-foreground">Global configuration for the AviationHub platform</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> General</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Platform Name", value: "AviationHub" },
                    { label: "Support Email", value: "support@aviationhub.com" },
                    { label: "Max Aircraft per Club (Free)", value: "2" },
                    { label: "Max Members per Club (Free)", value: "10" },
                  ].map((f) => (
                    <div key={f.label} className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
                      <Input defaultValue={f.value} className="h-8 text-xs" />
                    </div>
                  ))}
                  <Button size="sm" className="h-8 text-xs gap-1.5 w-full" onClick={handleSaveGeneralSettings}>Save Changes</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2"><Bell className="h-4 w-4 text-primary" /> Notifications & Alerts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Email new user signups to admin", enabled: true },
                    { label: "Alert on flagged marketplace listing", enabled: true },
                    { label: "Daily revenue digest email", enabled: true },
                    { label: "System health alerts (Slack)", enabled: false },
                    { label: "Failed payment alerts", enabled: true },
                    { label: "Weekly analytics report", enabled: false },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center justify-between">
                      <label className="text-xs text-foreground">{s.label}</label>
                      <Switch defaultChecked={s.enabled} />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Security & Access</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Require 2FA for admin accounts", enabled: true },
                    { label: "Auto-suspend users after 5 failed logins", enabled: true },
                    { label: "Allow self-registration", enabled: true },
                    { label: "Require email verification", enabled: true },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center justify-between">
                      <label className="text-xs text-foreground">{s.label}</label>
                      <Switch defaultChecked={s.enabled} />
                    </div>
                  ))}
                  <Separator />
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Session Timeout (minutes)</label>
                    <Input defaultValue="60" className="h-8 text-xs" />
                  </div>
                  <Button size="sm" className="h-8 text-xs gap-1.5 w-full" onClick={handleSaveUserSettings}>Save Changes</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> Email & Integrations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "SMTP Host", value: "smtp.sendgrid.net" },
                    { label: "SMTP Port", value: "587" },
                    { label: "Stripe Publishable Key", value: "pk_live_••••••••••••" },
                    { label: "Google Maps API Key", value: "AIza••••••••••••" },
                    { label: "Slack Webhook URL", value: "https://hooks.slack.com/••••" },
                  ].map((f) => (
                    <div key={f.label} className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
                      <Input defaultValue={f.value} className="h-8 text-xs" />
                    </div>
                  ))}
                  <Button size="sm" className="h-8 text-xs gap-1.5 w-full" onClick={handleSaveScheduleSettings}>Save Changes</Button>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      {/* ── MODALS ───────────────────────────────────────────────────────────── */}
      
      {/* View User Modal */}
      <Dialog open={!!viewUserModal} onOpenChange={() => setViewUserModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>View complete user information</DialogDescription>
          </DialogHeader>
          {viewUserModal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{viewUserModal.name}</span></div>
                <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{viewUserModal.email}</span></div>
                <div><span className="text-muted-foreground">Role:</span> <span className="font-medium capitalize">{viewUserModal.role}</span></div>
                <div><span className="text-muted-foreground">Plan:</span> <Badge variant="outline">{viewUserModal.plan || 'free'}</Badge></div>
                <div><span className="text-muted-foreground">Status:</span> <UserStatusBadge status={viewUserModal.status || 'pending'} /></div>
                <div><span className="text-muted-foreground">Hours:</span> <span className="font-medium">{(viewUserModal.hours || 0).toFixed(1)}</span></div>
                <div><span className="text-muted-foreground">Club:</span> <span className="font-medium">{viewUserModal.club || "—"}</span></div>
                <div><span className="text-muted-foreground">Joined:</span> <span className="font-medium">{viewUserModal.joined}</span></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewUserModal(null)}>Close</Button>
            <Button onClick={() => { setEditUserModal(viewUserModal); setViewUserModal(null); }}>Edit User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={!!editUserModal} onOpenChange={() => setEditUserModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and settings</DialogDescription>
          </DialogHeader>
          {editUserModal && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input defaultValue={editUserModal.name} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" defaultValue={editUserModal.email} />
              </div>
              <div className="space-y-2">
                <Label>Plan</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" defaultValue={editUserModal.plan}>
                  <option value="Free">Free</option>
                  <option value="Pro">Pro</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" defaultValue={editUserModal.status}>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUserModal(null)}>Cancel</Button>
            <Button onClick={() => { alert('User updated!'); setEditUserModal(null); }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Aircraft Modal */}
      <Dialog open={!!viewAircraftModal} onOpenChange={() => setViewAircraftModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Aircraft Details</DialogTitle>
          </DialogHeader>
          {viewAircraftModal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Registration:</span> <span className="font-mono font-bold">{viewAircraftModal.reg}</span></div>
                <div><span className="text-muted-foreground">Type:</span> <span className="font-medium">{viewAircraftModal.type}</span></div>
                <div><span className="text-muted-foreground">Owner:</span> <span className="font-medium">{viewAircraftModal.owner}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <UserStatusBadge status={viewAircraftModal.status === "active" ? "active" : "suspended"} /></div>
                <div><span className="text-muted-foreground">Hobbs:</span> <span className="font-medium">{viewAircraftModal.hobbs.toFixed(1)} hrs</span></div>
                <div><span className="text-muted-foreground">Next MX:</span> <span className={viewAircraftModal.nextMx === "Overdue" ? "text-destructive font-medium" : "font-medium"}>{viewAircraftModal.nextMx}</span></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewAircraftModal(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Aircraft Modal */}
      <Dialog open={!!editAircraftModal} onOpenChange={() => setEditAircraftModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Aircraft</DialogTitle>
          </DialogHeader>
          {editAircraftModal && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Registration</Label>
                <Input defaultValue={editAircraftModal.reg} />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Input defaultValue={editAircraftModal.type} />
              </div>
              <div className="space-y-2">
                <Label>Owner</Label>
                <Input defaultValue={editAircraftModal.owner} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" defaultValue={editAircraftModal.status}>
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="grounded">Grounded</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditAircraftModal(null)}>Cancel</Button>
            <Button onClick={() => { alert('Aircraft updated!'); setEditAircraftModal(null); }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Club Modal */}
      <Dialog open={!!viewClubModal} onOpenChange={() => setViewClubModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Club Details</DialogTitle>
          </DialogHeader>
          {viewClubModal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{viewClubModal.name}</span></div>
                <div><span className="text-muted-foreground">Plan:</span> <Badge variant="outline">{viewClubModal.plan}</Badge></div>
                <div><span className="text-muted-foreground">Members:</span> <span className="font-medium">{viewClubModal.members}</span></div>
                <div><span className="text-muted-foreground">Aircraft:</span> <span className="font-medium">{viewClubModal.aircraft}</span></div>
                <div><span className="text-muted-foreground">Revenue:</span> <span className="font-medium">${viewClubModal.revenue}/mo</span></div>
                <div><span className="text-muted-foreground">Joined:</span> <span className="font-medium">{viewClubModal.joined}</span></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewClubModal(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Club Modal */}
      <Dialog open={!!editClubModal} onOpenChange={() => setEditClubModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Club</DialogTitle>
          </DialogHeader>
          {editClubModal && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Club Name</Label>
                <Input defaultValue={editClubModal.name} />
              </div>
              <div className="space-y-2">
                <Label>Plan</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" defaultValue={editClubModal.plan}>
                  <option value="Free">Free</option>
                  <option value="Pro">Pro</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditClubModal(null)}>Cancel</Button>
            <Button onClick={() => { alert('Club updated!'); setEditClubModal(null); }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Listing Modal */}
      <Dialog open={!!viewListingModal} onOpenChange={() => setViewListingModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Listing Details</DialogTitle>
          </DialogHeader>
          {viewListingModal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="col-span-2"><span className="text-muted-foreground">Title:</span> <span className="font-medium">{viewListingModal.title}</span></div>
                <div><span className="text-muted-foreground">Price:</span> <span className="font-bold">${viewListingModal.price.toLocaleString()}</span></div>
                <div><span className="text-muted-foreground">Seller:</span> <span className="font-medium">{viewListingModal.seller}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <UserStatusBadge status={viewListingModal.status === "active" ? "active" : "pending"} /></div>
                <div><span className="text-muted-foreground">Views:</span> <span className="font-medium">{viewListingModal.views}</span></div>
                <div className="col-span-2"><span className="text-muted-foreground">Listed:</span> <span className="font-medium">{viewListingModal.listed}</span></div>
              </div>
              {viewListingModal.flagged && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  ⚠️ This listing has been flagged and requires review.
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewListingModal(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Transaction Modal */}
      <Dialog open={!!viewTransactionModal} onOpenChange={() => setViewTransactionModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {viewTransactionModal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="col-span-2"><span className="text-muted-foreground">ID:</span> <span className="font-mono">{viewTransactionModal.id}</span></div>
                <div><span className="text-muted-foreground">User:</span> <span className="font-medium">{viewTransactionModal.user}</span></div>
                <div><span className="text-muted-foreground">Plan:</span> <Badge variant="outline">{viewTransactionModal.plan}</Badge></div>
                <div><span className="text-muted-foreground">Amount:</span> <span className="font-bold">${viewTransactionModal.amount}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <TxnStatusBadge status={viewTransactionModal.status} /></div>
                <div className="col-span-2"><span className="text-muted-foreground">Date:</span> <span className="font-medium">{viewTransactionModal.date}</span></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewTransactionModal(null)}>Close</Button>
            <Button onClick={() => { handleDownloadInvoice(viewTransactionModal!.id); setViewTransactionModal(null); }}>
              <Download className="h-3 w-3 mr-2" /> Download Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite User Modal */}
      <Dialog open={inviteUserModal} onOpenChange={setInviteUserModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite New User</DialogTitle>
            <DialogDescription>Send an invitation to join the platform</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input type="email" placeholder="pilot@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Name (optional)</Label>
              <Input placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label>Default Plan</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="Free">Free</option>
                <option value="Pro">Pro</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Personal Message (optional)</Label>
              <Textarea placeholder="Welcome to AviationHub..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteUserModal(false)}>Cancel</Button>
            <Button onClick={() => { alert('Invitation sent!'); setInviteUserModal(false); }}>
              <Mail className="h-3 w-3 mr-2" /> Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Club Modal */}
      <Dialog open={addClubModal} onOpenChange={setAddClubModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Club</DialogTitle>
            <DialogDescription>Register a new flying club or organization</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Club Name</Label>
              <Input placeholder="Boston Flying Club" />
            </div>
            <div className="space-y-2">
              <Label>Admin Email</Label>
              <Input type="email" placeholder="admin@flyingclub.com" />
            </div>
            <div className="space-y-2">
              <Label>Initial Plan</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="Free">Free (Trial)</option>
                <option value="Pro">Pro</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea placeholder="Any special requirements..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddClubModal(false)}>Cancel</Button>
            <Button onClick={() => { alert('Club created!'); setAddClubModal(false); }}>
              <Building2 className="h-3 w-3 mr-2" /> Create Club
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      </div>
    </div>
  )
}
