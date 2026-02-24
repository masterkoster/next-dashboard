'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
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
  MoreHorizontal,
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
  CreditCard,
  FileText,
  Settings,
  Bell,
  Wrench,
  BarChart3,
} from "lucide-react"
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

const signupData = [
  { month: "Sep", users: 42 },
  { month: "Oct", users: 67 },
  { month: "Nov", users: 53 },
  { month: "Dec", users: 89 },
  { month: "Jan", users: 114 },
  { month: "Feb", users: 138 },
]

const revenueData = [
  { month: "Sep", revenue: 8200 },
  { month: "Oct", revenue: 11400 },
  { month: "Nov", revenue: 9800 },
  { month: "Dec", revenue: 15200 },
  { month: "Jan", revenue: 18700 },
  { month: "Feb", revenue: 21400 },
]

const activityData = [
  { day: "Mon", flights: 34, plans: 89 },
  { day: "Tue", flights: 28, plans: 64 },
  { day: "Wed", flights: 51, plans: 120 },
  { day: "Thu", flights: 43, plans: 97 },
  { day: "Fri", flights: 67, plans: 145 },
  { day: "Sat", flights: 92, plans: 188 },
  { day: "Sun", flights: 78, plans: 162 },
]

const users = [
  { id: 1, name: "James Carter", email: "james@example.com", role: "pilot", plan: "Pro", status: "active", joined: "Jan 12, 2024", hours: 312.4, club: "Boston Flying Club" },
  { id: 2, name: "Sarah Chen", email: "sarah@example.com", role: "admin", plan: "Enterprise", status: "active", joined: "Feb 3, 2024", hours: 1204.8, club: "New England Aero" },
  { id: 3, name: "Mike Torres", email: "mike@example.com", role: "pilot", plan: "Free", status: "suspended", joined: "Dec 5, 2023", hours: 48.2, club: "" },
  { id: 4, name: "Lisa Park", email: "lisa@example.com", role: "pilot", plan: "Pro", status: "active", joined: "Jan 28, 2024", hours: 567.1, club: "Cape Cod Flyers" },
  { id: 5, name: "David Ruiz", email: "david@example.com", role: "instructor", plan: "Pro", status: "active", joined: "Nov 14, 2023", hours: 2341.6, club: "Boston Flying Club" },
  { id: 6, name: "Emma Walsh", email: "emma@example.com", role: "pilot", plan: "Free", status: "pending", joined: "Feb 18, 2024", hours: 12.0, club: "" },
]

const aircraft = [
  { id: 1, reg: "N12345", type: "Cessna 172S", owner: "Boston Flying Club", status: "active", hobbs: 4213.4, nextMx: "Mar 15, 2024", airworthiness: "valid" },
  { id: 2, reg: "N67890", type: "Piper PA-28", owner: "Cape Cod Flyers", status: "maintenance", hobbs: 2891.2, nextMx: "Overdue", airworthiness: "valid" },
  { id: 3, reg: "N24601", type: "Beechcraft Bonanza", owner: "David Ruiz", status: "active", hobbs: 1102.7, nextMx: "Jun 4, 2024", airworthiness: "valid" },
  { id: 4, reg: "N55522", type: "Cirrus SR22", owner: "New England Aero", status: "grounded", hobbs: 788.3, nextMx: "Mar 2, 2024", airworthiness: "expired" },
]

const clubs = [
  { id: 1, name: "Boston Flying Club", members: 48, aircraft: 6, plan: "Enterprise", revenue: 4200, status: "active", joined: "Mar 2023" },
  { id: 2, name: "New England Aero", members: 31, aircraft: 4, plan: "Pro", revenue: 2800, status: "active", joined: "Jul 2023" },
  { id: 3, name: "Cape Cod Flyers", members: 17, aircraft: 2, plan: "Pro", revenue: 1400, status: "active", joined: "Jan 2024" },
  { id: 4, name: "Harbor Air Group", members: 9, aircraft: 1, plan: "Free", revenue: 0, status: "trial", joined: "Feb 2024" },
]

const listings = [
  { id: 1, title: "2019 Cessna 172S", price: 289000, seller: "James Carter", status: "active", views: 312, listed: "Feb 1, 2024", flagged: false },
  { id: 2, title: "2015 Piper PA-28-181", price: 178000, seller: "David Ruiz", status: "pending", views: 54, listed: "Feb 16, 2024", flagged: false },
  { id: 3, title: "2008 Cirrus SR20", price: 195000, seller: "Emma Walsh", status: "flagged", views: 89, listed: "Feb 10, 2024", flagged: true },
  { id: 4, title: "2022 Diamond DA40", price: 410000, seller: "Lisa Park", status: "sold", views: 741, listed: "Jan 5, 2024", flagged: false },
]

const systemServices = [
  { name: "API Gateway", status: "operational", latency: "42ms", uptime: "99.98%" },
  { name: "Auth Service", status: "operational", latency: "18ms", uptime: "100%" },
  { name: "Database (Primary)", status: "operational", latency: "8ms", uptime: "99.99%" },
  { name: "File Storage", status: "degraded", latency: "320ms", uptime: "98.12%" },
  { name: "Email Service", status: "operational", latency: "95ms", uptime: "99.95%" },
  { name: "Map Tiles CDN", status: "operational", latency: "65ms", uptime: "99.97%" },
  { name: "Weather API", status: "operational", latency: "112ms", uptime: "99.84%" },
]

const billingTransactions = [
  { id: "TXN-001", user: "Boston Flying Club", plan: "Enterprise", amount: 499, date: "Feb 1, 2024", status: "paid" },
  { id: "TXN-002", user: "New England Aero", plan: "Pro", amount: 79, date: "Feb 3, 2024", status: "paid" },
  { id: "TXN-003", user: "Mike Torres", plan: "Pro", amount: 29, date: "Feb 5, 2024", status: "failed" },
  { id: "TXN-004", user: "Cape Cod Flyers", plan: "Pro", amount: 79, date: "Feb 10, 2024", status: "paid" },
  { id: "TXN-005", user: "Lisa Park", plan: "Pro", amount: 29, date: "Feb 14, 2024", status: "refunded" },
  { id: "TXN-006", user: "Sarah Chen", plan: "Enterprise", amount: 499, date: "Feb 18, 2024", status: "paid" },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, trend, icon: Icon, accent }: {
  label: string
  value: string
  sub: string
  trend: "up" | "down" | "neutral"
  icon: any
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

// ── Sidebar nav data ───────────────────────────────────────────────────────────

type Tab =
  | "overview"
  | "awaiting-dispatch" | "currently-dispatched" | "past-flights"
  | "users" | "administrators" | "instructors" | "groups"
  | "aircraft" | "items" | "adjustments" | "forms"
  | "general-settings" | "general-settings2" | "users-settings" | "schedule-settings"
  | "notification-settings" | "add-ons"
  | "clubs" | "marketplace" | "billing" | "system"

type NavItem = { id: Tab; label: string }
type NavGroup = { label: string; items: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Flights",
    items: [
      { id: "awaiting-dispatch", label: "Awaiting Dispatch" },
      { id: "currently-dispatched", label: "Currently Dispatched" },
      { id: "past-flights", label: "Past Flights" },
    ],
  },
  {
    label: "People",
    items: [
      { id: "users", label: "Users" },
      { id: "administrators", label: "Administrators" },
      { id: "instructors", label: "Instructors" },
      { id: "groups", label: "Groups" },
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
  const [activeTab, setActiveTab] = useState<Tab>("awaiting-dispatch")
  const [userSearch, setUserSearch] = useState("")

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  )

  return (
    <div className="flex min-h-screen bg-background">

      {/* ── SIDEBAR ──────────────────────────────────────────────────────────── */}
      <aside className="sticky top-0 h-screen w-56 shrink-0 overflow-y-auto border-r border-border bg-card">
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
      <div className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-11 items-center justify-between border-b border-border bg-card/95 px-6 backdrop-blur">
          <h1 className="text-sm font-semibold capitalize">
            {NAV_GROUPS.flatMap(g => g.items).find(i => i.id === activeTab)?.label ?? "Overview"}
          </h1>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
              <Download className="h-3 w-3" /> Export
            </Button>
            <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
              <RefreshCw className="h-3 w-3" /> Refresh
            </Button>
          </div>
        </div>

      <div className="p-6 space-y-6">

        {/* ── FLIGHTS ─────────────────────────────────────────────────────────── */}
        {activeTab === "awaiting-dispatch" && (
          <PlaceholderPanel title="Awaiting Dispatch" description="Flights that have been filed and are waiting for dispatcher approval before departure." />
        )}
        {activeTab === "currently-dispatched" && (
          <PlaceholderPanel title="Currently Dispatched" description="Flights currently in the air or on the ground with an active dispatch release." />
        )}
        {activeTab === "past-flights" && (
          <PlaceholderPanel title="Past Flights" description="Historical flight records including hobbs times, pilot, and route information." />
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
        {activeTab === "general-settings" && (
          <>
            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Users" value="1,842" sub="+138 this month" trend="up" icon={Users} accent="bg-primary/10 text-primary" />
              <StatCard label="Active Aircraft" value="247" sub="+12 this month" trend="up" icon={Plane} accent="bg-chart-2/10 text-chart-2" />
              <StatCard label="MRR" value="$21,400" sub="+14.4% vs last month" trend="up" icon={DollarSign} accent="bg-chart-3/10 text-chart-3" />
              <StatCard label="Flagged Items" value="3" sub="Needs review" trend="down" icon={AlertTriangle} accent="bg-destructive/10 text-destructive" />
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
                    <AreaChart data={signupData}>
                      <defs>
                        <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                      <Area type="monotone" dataKey="users" stroke="hsl(var(--chart-1))" strokeWidth={2} fill="url(#gUsers)" />
                    </AreaChart>
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
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} formatter={(v: any) => [`$${v.toLocaleString()}`, "Revenue"]} />
                      <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ fill: "hsl(var(--chart-2))", r: 3 }} />
                    </LineChart>
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
                    <BarChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                      <Bar dataKey="plans" fill="hsl(var(--chart-1))" opacity={0.4} radius={[2, 2, 0, 0]} />
                      <Bar dataKey="flights" fill="hsl(var(--chart-1))" radius={[2, 2, 0, 0]} />
                    </BarChart>
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
                    { plan: "Enterprise", count: 12, total: 1842, color: "bg-primary" },
                    { plan: "Pro", count: 438, total: 1842, color: "bg-chart-2" },
                    { plan: "Free", count: 1392, total: 1842, color: "bg-muted-foreground" },
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
                    <span>Total users</span><span className="font-semibold text-foreground">1,842</span>
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
                            {user.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <p className="text-xs font-medium">{user.name}</p>
                            <p className="text-[11px] text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-[10px]">{user.plan}</Badge>
                          <UserStatusBadge status={user.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

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
                <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
                  <Download className="h-3 w-3" /> Export
                </Button>
                <Button size="sm" className="h-8 gap-1.5 text-xs">
                  <UserPlus className="h-3 w-3" /> Invite User
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Total Users" value="1,842" sub="+138 this month" trend="up" icon={Users} accent="bg-primary/10 text-primary" />
              <StatCard label="Active" value="1,698" sub="92.2% of total" trend="up" icon={CheckCircle2} accent="bg-chart-2/10 text-chart-2" />
              <StatCard label="Suspended" value="18" sub="-3 from last month" trend="up" icon={Ban} accent="bg-destructive/10 text-destructive" />
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
                              {user.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{user.name}</p>
                              <p className="text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 capitalize text-muted-foreground">{user.role}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-[10px]">{user.plan}</Badge>
                        </td>
                        <td className="px-4 py-3"><UserStatusBadge status={user.status} /></td>
                        <td className="px-4 py-3 text-muted-foreground">{user.hours.toFixed(1)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{user.club || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{user.joined}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0"><Eye className="h-3 w-3" /></Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0"><Edit className="h-3 w-3" /></Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive hover:text-destructive"><Ban className="h-3 w-3" /></Button>
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
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
                <Download className="h-3 w-3" /> Export
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <StatCard label="Total Aircraft" value="247" sub="+12 this month" trend="up" icon={Plane} accent="bg-primary/10 text-primary" />
              <StatCard label="Active" value="231" sub="93.5% operational" trend="up" icon={CheckCircle2} accent="bg-chart-2/10 text-chart-2" />
              <StatCard label="In Maintenance" value="12" sub="4.9% of fleet" trend="neutral" icon={Wrench} accent="bg-chart-3/10 text-chart-3" />
              <StatCard label="Grounded" value="4" sub="Airworthiness issue" trend="down" icon={AlertTriangle} accent="bg-destructive/10 text-destructive" />
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
                        <td className="px-4 py-3 font-mono font-semibold text-foreground">{a.reg}</td>
                        <td className="px-4 py-3 text-muted-foreground">{a.type}</td>
                        <td className="px-4 py-3 text-muted-foreground">{a.owner}</td>
                        <td className="px-4 py-3">
                          <UserStatusBadge status={a.status === "active" ? "active" : a.status === "maintenance" ? "pending" : "suspended"} />
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{a.hobbs.toFixed(1)}</td>
                        <td className={`px-4 py-3 font-medium ${a.nextMx === "Overdue" ? "text-destructive" : "text-muted-foreground"}`}>{a.nextMx}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${a.airworthiness === "valid" ? "text-chart-2" : "text-destructive"}`}>
                            {a.airworthiness === "valid" ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                            {a.airworthiness}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0"><Eye className="h-3 w-3" /></Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0"><Edit className="h-3 w-3" /></Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
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
              <Button size="sm" className="h-8 gap-1.5 text-xs">
                <Building2 className="h-3 w-3" /> Add Club
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Clubs" value="24" sub="+4 this month" trend="up" icon={Building2} accent="bg-primary/10 text-primary" />
              <StatCard label="Total Members" value="612" sub="Across all clubs" trend="up" icon={Users} accent="bg-chart-2/10 text-chart-2" />
              <StatCard label="Club Revenue" value="$8,400" sub="This month" trend="up" icon={DollarSign} accent="bg-chart-3/10 text-chart-3" />
              <StatCard label="On Trial" value="3" sub="Expire within 30d" trend="neutral" icon={Clock} accent="bg-muted text-muted-foreground" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {clubs.map((club) => (
                <Card key={club.id} className="hover:border-primary/40 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                          {club.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{club.name}</p>
                          <p className="text-xs text-muted-foreground">Since {club.joined}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{club.plan}</Badge>
                        <UserStatusBadge status={club.status === "trial" ? "pending" : "active"} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="rounded-lg bg-muted/50 p-2">
                        <p className="text-sm font-bold">{club.members}</p>
                        <p className="text-[11px] text-muted-foreground">Members</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-2">
                        <p className="text-sm font-bold">{club.aircraft}</p>
                        <p className="text-[11px] text-muted-foreground">Aircraft</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-2">
                        <p className="text-sm font-bold">${club.revenue.toLocaleString()}</p>
                        <p className="text-[11px] text-muted-foreground">Revenue/mo</p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 h-7 text-xs">View</Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Edit className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
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
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
                <Download className="h-3 w-3" /> Export
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <StatCard label="Active Listings" value="142" sub="+18 this week" trend="up" icon={Globe} accent="bg-primary/10 text-primary" />
              <StatCard label="Pending Review" value="7" sub="Awaiting approval" trend="neutral" icon={Clock} accent="bg-chart-3/10 text-chart-3" />
              <StatCard label="Flagged" value="3" sub="Require action" trend="down" icon={ShieldAlert} accent="bg-destructive/10 text-destructive" />
              <StatCard label="Sold (30d)" value="24" sub="$4.2M total value" trend="up" icon={DollarSign} accent="bg-chart-2/10 text-chart-2" />
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
                        <td className="px-4 py-3 font-medium text-foreground">${l.price.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <UserStatusBadge status={l.status === "active" ? "active" : l.status === "flagged" ? "suspended" : l.status === "sold" ? "active" : "pending"} />
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{l.views}</td>
                        <td className="px-4 py-3 text-muted-foreground">{l.listed}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0"><Eye className="h-3 w-3" /></Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-chart-2 hover:text-chart-2"><CheckCircle2 className="h-3 w-3" /></Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
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
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
                <Download className="h-3 w-3" /> Export CSV
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="MRR" value="$21,400" sub="+14.4% vs last month" trend="up" icon={TrendingUp} accent="bg-chart-2/10 text-chart-2" />
              <StatCard label="ARR" value="$256,800" sub="Annualised" trend="up" icon={DollarSign} accent="bg-primary/10 text-primary" />
              <StatCard label="Failed Payments" value="3" sub="$87 at risk" trend="down" icon={AlertTriangle} accent="bg-destructive/10 text-destructive" />
              <StatCard label="Refunds (30d)" value="$29" sub="1 refund issued" trend="neutral" icon={TrendingDown} accent="bg-muted text-muted-foreground" />
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
                        <td className="px-4 py-3 font-semibold">${txn.amount}</td>
                        <td className="px-4 py-3 text-muted-foreground">{txn.date}</td>
                        <td className="px-4 py-3"><TxnStatusBadge status={txn.status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0"><Eye className="h-3 w-3" /></Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0"><FileText className="h-3 w-3" /></Button>
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

        {/* ── SYSTEM ───────────────────────────────────────────────────────────── */}
        {activeTab === "system" && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">System Status</h2>
                <p className="text-xs text-muted-foreground">Monitor all platform services and infrastructure</p>
              </div>
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
                <RefreshCw className="h-3 w-3" /> Refresh
              </Button>
            </div>

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
                  <Button size="sm" className="h-8 text-xs gap-1.5 w-full">Save Changes</Button>
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
                  <Button size="sm" className="h-8 text-xs gap-1.5 w-full">Save Changes</Button>
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
                  <Button size="sm" className="h-8 text-xs gap-1.5 w-full">Save Changes</Button>
                </CardContent>
              </Card>
            </div>
          </>
        )}

      </div>
      </div>
    </div>
  )
}
