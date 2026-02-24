'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Plane, Users, Wrench, DollarSign, Clock, AlertTriangle, CheckCircle2,
  ChevronRight, Search, Download, Plus, Settings, Bell, Shield,
  Calendar, FileText, BarChart3, BookOpen, Fuel, MapPin, CreditCard,
  UserCheck, UserX, ToggleLeft, Megaphone, Lock, Sliders, Mail,
  RefreshCw, MoreHorizontal, TrendingUp, TrendingDown, Activity
} from "lucide-react"
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

// ── Mock data ──────────────────────────────────────────────────────────────────

const club = {
  name: "Sky High Flying Club",
  icao: "KBOS",
  founded: "2018",
  members: 24,
  aircraft: 4,
  plan: "Pro",
}

const members = [
  { id: 1, name: "James Carter",    email: "james@example.com",  role: "Owner",   status: "Active",    hours: 412.3, balance: 0,     joined: "Jan 2020", medical: "May 2025" },
  { id: 2, name: "Sarah Johnson",   email: "sarah@example.com",  role: "Instructor", status: "Active", hours: 890.1, balance: -120,  joined: "Mar 2020", medical: "Aug 2025" },
  { id: 3, name: "Mike Wilson",     email: "mike@example.com",   role: "Member",  status: "Active",    hours: 67.4,  balance: 240,   joined: "Jun 2021", medical: "Oct 2024" },
  { id: 4, name: "Emily Davis",     email: "emily@example.com",  role: "Member",  status: "Active",    hours: 134.8, balance: 0,     joined: "Sep 2021", medical: "Dec 2024" },
  { id: 5, name: "Tom Reynolds",    email: "tom@example.com",    role: "Member",  status: "Suspended", hours: 22.1,  balance: -480,  joined: "Feb 2022", medical: "Mar 2025" },
  { id: 6, name: "Lisa Park",       email: "lisa@example.com",   role: "Admin",   status: "Active",    hours: 203.5, balance: 60,    joined: "Apr 2022", medical: "Jun 2025" },
  { id: 7, name: "Dan Ortega",      email: "dan@example.com",    role: "Member",  status: "Pending",   hours: 0,     balance: 0,     joined: "Feb 2024", medical: "—" },
]

const aircraft = [
  { id: "a1", nNumber: "N172SP", nickname: "Skyhawk",  make: "Cessna",  model: "172S",       year: 2021, status: "Available",   rate: 165, hobbs: 98.2,   nextMx: "Mar 15, 2024", mxHours: 8.5 },
  { id: "a2", nNumber: "N9876P", nickname: "Warrior",  make: "Piper",   model: "PA-28-161",  year: 2019, status: "Maintenance", rate: 145, hobbs: 1842.3, nextMx: "Now",          mxHours: 0 },
  { id: "a3", nNumber: "N345AB", nickname: "Cherokee", make: "Piper",   model: "PA-32-300",  year: 1978, status: "Available",   rate: 135, hobbs: 4890.5, nextMx: "Jun 20, 2024", mxHours: 98.2 },
  { id: "a4", nNumber: "N5501X", nickname: "Arrow",    make: "Piper",   model: "PA-28R-201", year: 2003, status: "Reserved",    rate: 175, hobbs: 2201.7, nextMx: "Aug 10, 2024", mxHours: 156 },
]

const dispatched = [
  { id: "d1", pilot: "Sarah Johnson", aircraft: "N172SP", departed: "14:02",  eta: "16:30", route: "KBOS → KALB → KBOS", fuel: 28, status: "Airborne" },
  { id: "d2", pilot: "Emily Davis",   aircraft: "N5501X", departed: "13:45",  eta: "15:45", route: "KBOS → KMVY",         fuel: 18, status: "Airborne" },
]

const awaitingDispatch = [
  { id: "w1", pilot: "Mike Wilson",  aircraft: "N345AB", plannedDep: "17:30", route: "KBOS → KACK",  filed: "10:22 AM" },
  { id: "w2", pilot: "Dan Ortega",   aircraft: "N172SP", plannedDep: "18:00", route: "KBOS Local",   filed: "12:55 PM" },
]

const pastFlights = [
  { id: "f1", pilot: "James Carter",  aircraft: "N172SP", date: "Feb 22", hobbs: 1.8,  route: "KBOS → KEDU → KBOS",  cost: 297 },
  { id: "f2", pilot: "Sarah Johnson", aircraft: "N345AB", date: "Feb 21", hobbs: 2.5,  route: "KBOS → KALB → KBOS",  cost: 338 },
  { id: "f3", pilot: "Lisa Park",     aircraft: "N172SP", date: "Feb 20", hobbs: 1.2,  route: "KBOS Local",           cost: 198 },
  { id: "f4", pilot: "Emily Davis",   aircraft: "N5501X", date: "Feb 19", hobbs: 3.1,  route: "KBOS → KPVD → KBOS",  cost: 543 },
  { id: "f5", pilot: "Mike Wilson",   aircraft: "N172SP", date: "Feb 18", hobbs: 1.0,  route: "KBOS Local",           cost: 165 },
]

const maintenance = [
  { id: "m1", aircraft: "N9876P", item: "Annual Inspection",   status: "In Progress", due: "Mar 15", priority: "high",   shop: "Boston Avionics" },
  { id: "m2", aircraft: "N172SP", item: "Oil Change",          status: "Due",         due: "Mar 1",  priority: "urgent", shop: "—" },
  { id: "m3", aircraft: "N345AB", item: "100-Hour Inspection", status: "Scheduled",   due: "Jun 20", priority: "medium", shop: "Logan FBO" },
  { id: "m4", aircraft: "N5501X", item: "ELT Battery",         status: "OK",          due: "Aug 10", priority: "low",    shop: "—" },
]

const billing = [
  { id: "b1", member: "Mike Wilson",   type: "Flight",          aircraft: "N172SP", date: "Feb 22", amount: 297,  status: "Paid" },
  { id: "b2", member: "Tom Reynolds",  type: "Monthly Dues",    aircraft: "—",      date: "Feb 1",  amount: 120,  status: "Overdue" },
  { id: "b3", member: "Emily Davis",   type: "Flight",          aircraft: "N5501X", date: "Feb 19", amount: 543,  status: "Paid" },
  { id: "b4", member: "Dan Ortega",    type: "Joining Fee",     aircraft: "—",      date: "Feb 10", amount: 500,  status: "Paid" },
  { id: "b5", member: "Tom Reynolds",  type: "Flight",          aircraft: "N172SP", date: "Jan 28", amount: 198,  status: "Overdue" },
]

const flightHoursData = [
  { month: "Sep", hours: 42 }, { month: "Oct", hours: 56 }, { month: "Nov", hours: 38 },
  { month: "Dec", hours: 61 }, { month: "Jan", hours: 49 }, { month: "Feb", hours: 58 },
]

const revenueData = [
  { month: "Sep", revenue: 6800 }, { month: "Oct", revenue: 8900 }, { month: "Nov", revenue: 6100 },
  { month: "Dec", revenue: 9600 }, { month: "Jan", revenue: 7400 }, { month: "Feb", revenue: 9200 },
]

// ── Types ──────────────────────────────────────────────────────────────────────

type Tab =
  | "overview"
  | "awaiting-dispatch" | "currently-dispatched" | "past-flights"
  | "members" | "instructors" | "administrators" | "groups"
  | "aircraft" | "items" | "adjustments" | "forms"
  | "billing" | "invoices"
  | "general-settings" | "member-settings" | "schedule-settings"
  | "notification-settings" | "add-ons"

type NavItem  = { id: Tab; label: string }
type NavGroup = { label: string; items: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Flights",
    items: [
      { id: "overview",              label: "Overview" },
      { id: "awaiting-dispatch",     label: "Awaiting Dispatch" },
      { id: "currently-dispatched",  label: "Currently Dispatched" },
      { id: "past-flights",          label: "Past Flights" },
    ],
  },
  {
    label: "People",
    items: [
      { id: "members",        label: "Members" },
      { id: "instructors",    label: "Instructors" },
      { id: "administrators", label: "Administrators" },
      { id: "groups",         label: "Groups" },
    ],
  },
  {
    label: "Resources",
    items: [
      { id: "aircraft",    label: "Aircraft" },
      { id: "items",       label: "Items" },
      { id: "adjustments", label: "Adjustments" },
      { id: "forms",       label: "Forms" },
    ],
  },
  {
    label: "Billing",
    items: [
      { id: "billing",  label: "Transactions" },
      { id: "invoices", label: "Invoices" },
    ],
  },
  {
    label: "Settings",
    items: [
      { id: "general-settings",      label: "General Settings" },
      { id: "member-settings",       label: "Member Settings" },
      { id: "schedule-settings",     label: "Schedule Settings" },
      { id: "notification-settings", label: "Notification Settings" },
      { id: "add-ons",               label: "Add-ons" },
    ],
  },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Active:      "bg-chart-2/10 text-chart-2 border-chart-2/30",
    Available:   "bg-chart-2/10 text-chart-2 border-chart-2/30",
    Airborne:    "bg-primary/10  text-primary  border-primary/30",
    Paid:        "bg-chart-2/10 text-chart-2 border-chart-2/30",
    Maintenance: "bg-chart-3/10 text-chart-3 border-chart-3/30",
    "In Progress":"bg-chart-3/10 text-chart-3 border-chart-3/30",
    Reserved:    "bg-chart-4/10 text-chart-4 border-chart-4/30",
    Scheduled:   "bg-chart-4/10 text-chart-4 border-chart-4/30",
    Suspended:   "bg-destructive/10 text-destructive border-destructive/30",
    Overdue:     "bg-destructive/10 text-destructive border-destructive/30",
    Due:         "bg-destructive/10 text-destructive border-destructive/30",
    urgent:      "bg-destructive/10 text-destructive border-destructive/30",
    Pending:     "bg-muted text-muted-foreground border-border",
    OK:          "bg-chart-2/10 text-chart-2 border-chart-2/30",
    low:         "bg-muted text-muted-foreground border-border",
    medium:      "bg-chart-3/10 text-chart-3 border-chart-3/30",
    high:        "bg-destructive/10 text-destructive border-destructive/30",
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${map[status] ?? "bg-muted text-muted-foreground border-border"}`}>
      {status}
    </span>
  )
}

function PlaceholderPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-24 text-center">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-muted-foreground">{description}</p>
    </div>
  )
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function ClubAdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const [memberSearch, setMemberSearch] = useState("")

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.email.toLowerCase().includes(memberSearch.toLowerCase())
  )

  const activeLabel = NAV_GROUPS.flatMap(g => g.items).find(i => i.id === activeTab)?.label ?? ""

  return (
    <div className="flex min-h-screen bg-background pt-[44px]">

      {/* ── SIDEBAR ────────────────────────────────────────────────────────────── */}
      <aside className="fixed top-[44px] left-0 h-[calc(100vh-44px)] w-56 shrink-0 overflow-y-auto border-r border-border bg-card">
        {/* Club identity */}
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-primary">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold leading-tight">{club.name}</p>
              <p className="text-[10px] text-muted-foreground">Club Admin</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="py-1">
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.label} className={gi > 0 ? "mt-0.5 border-t border-border pt-0.5" : ""}>
              <p className="px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
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
                    <ChevronRight className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-primary-foreground/60" : "text-muted-foreground/40"}`} />
                  </button>
                )
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* ── MAIN ───────────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto ml-[224px]">

        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-11 items-center justify-between border-b border-border bg-card/95 px-6 backdrop-blur">
          <h1 className="text-sm font-semibold">{activeLabel}</h1>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
              <Download className="h-3 w-3" /> Export
            </Button>
            <Button size="sm" className="h-7 gap-1.5 text-xs">
              <Plus className="h-3 w-3" /> Add New
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* ── OVERVIEW ─────────────────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <>
              {/* KPI row */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Total Members", value: "24", sub: "+2 this month",   icon: Users,       trend: "up" },
                  { label: "Aircraft",      value: "4",  sub: "1 in maintenance", icon: Plane,       trend: "neutral" },
                  { label: "Hours Flown",   value: "58", sub: "this month",       icon: Clock,       trend: "up" },
                  { label: "Revenue",       value: "$9,200", sub: "+12% vs last month", icon: DollarSign, trend: "up" },
                ].map((kpi) => (
                  <Card key={kpi.label}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-xs font-medium text-muted-foreground">{kpi.label}</CardTitle>
                      <kpi.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{kpi.value}</p>
                      <p className={`mt-0.5 flex items-center gap-1 text-xs ${kpi.trend === "up" ? "text-chart-2" : "text-muted-foreground"}`}>
                        {kpi.trend === "up" && <TrendingUp className="h-3 w-3" />}
                        {kpi.sub}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Charts */}
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Flight Hours — Last 6 Months</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={flightHoursData}>
                        <defs>
                          <linearGradient id="gh" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                        <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                        <Area type="monotone" dataKey="hours" stroke="hsl(var(--chart-1))" strokeWidth={2} fill="url(#gh)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Club Revenue — Last 6 Months</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                        <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                        <Bar dataKey="revenue" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Attention Required</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { icon: AlertTriangle, color: "text-destructive", msg: "N172SP oil change overdue — 2.3 hrs remaining" },
                    { icon: AlertTriangle, color: "text-chart-3",     msg: "Tom Reynolds account suspended — $480 overdue balance" },
                    { icon: Bell,          color: "text-primary",     msg: "2 flights awaiting dispatch approval" },
                    { icon: UserCheck,     color: "text-chart-2",     msg: "Dan Ortega membership pending approval" },
                  ].map((a, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <a.icon className={`h-4 w-4 shrink-0 ${a.color}`} />
                      <p className="text-xs">{a.msg}</p>
                      <Button size="sm" variant="ghost" className="ml-auto h-6 text-xs">Review</Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}

          {/* ── AWAITING DISPATCH ─────────────────────────────────────────────── */}
          {activeTab === "awaiting-dispatch" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Awaiting Dispatch ({awaitingDispatch.length})</CardTitle>
                <CardDescription className="text-xs">Flights filed and pending release by a dispatcher</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {awaitingDispatch.map((f) => (
                    <div key={f.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{f.pilot}</p>
                          <Badge variant="outline" className="text-xs">{f.aircraft}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{f.route}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Dep: {f.plannedDep}</span>
                          <span>Filed: {f.filed}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="h-7 text-xs">Deny</Button>
                        <Button size="sm" className="h-7 text-xs">Dispatch</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── CURRENTLY DISPATCHED ─────────────────────────────────────────── */}
          {activeTab === "currently-dispatched" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Currently Dispatched ({dispatched.length})</CardTitle>
                <CardDescription className="text-xs">Flights currently airborne with an active dispatch release</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dispatched.map((f) => (
                    <div key={f.id} className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 animate-pulse rounded-full bg-chart-2" />
                          <p className="text-sm font-medium">{f.pilot}</p>
                          <Badge variant="outline" className="text-xs">{f.aircraft}</Badge>
                          <StatusBadge status={f.status} />
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{f.route}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Dep: {f.departed}</span>
                          <span>ETA: {f.eta}</span>
                          <span className="flex items-center gap-1"><Fuel className="h-3 w-3" />{f.fuel} gal planned</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="h-7 text-xs">Close Out</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── PAST FLIGHTS ─────────────────────────────────────────────────── */}
          {activeTab === "past-flights" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm">Past Flights</CardTitle>
                    <CardDescription className="text-xs">Complete flight history for the club</CardDescription>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
                    <Download className="h-3 w-3" /> Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        {["Pilot", "Aircraft", "Date", "Hobbs", "Route", "Cost", ""].map(h => (
                          <th key={h} className="pb-2 pr-4 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pastFlights.map((f) => (
                        <tr key={f.id} className="border-b border-border/50 last:border-0">
                          <td className="py-2.5 pr-4 font-medium">{f.pilot}</td>
                          <td className="py-2.5 pr-4"><Badge variant="outline" className="text-xs">{f.aircraft}</Badge></td>
                          <td className="py-2.5 pr-4 text-muted-foreground">{f.date}</td>
                          <td className="py-2.5 pr-4">{f.hobbs} hrs</td>
                          <td className="py-2.5 pr-4 text-muted-foreground">{f.route}</td>
                          <td className="py-2.5 pr-4 font-medium">${f.cost}</td>
                          <td className="py-2.5">
                            <Button size="sm" variant="ghost" className="h-6 text-xs">View</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── MEMBERS ──────────────────────────────────────────────────────── */}
          {activeTab === "members" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm">Members ({members.length})</CardTitle>
                    <CardDescription className="text-xs">All club members and their standing</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <input
                        value={memberSearch}
                        onChange={e => setMemberSearch(e.target.value)}
                        placeholder="Search members..."
                        className="h-7 w-48 rounded-md border border-input bg-background pl-8 pr-3 text-xs outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <Button size="sm" className="h-7 gap-1.5 text-xs">
                      <Plus className="h-3 w-3" /> Invite
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        {["Name", "Role", "Status", "Hours", "Balance", "Medical", "Joined", ""].map(h => (
                          <th key={h} className="pb-2 pr-4 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMembers.map((m) => (
                        <tr key={m.id} className="border-b border-border/50 last:border-0">
                          <td className="py-2.5 pr-4">
                            <div>
                              <p className="font-medium">{m.name}</p>
                              <p className="text-muted-foreground">{m.email}</p>
                            </div>
                          </td>
                          <td className="py-2.5 pr-4"><StatusBadge status={m.role} /></td>
                          <td className="py-2.5 pr-4"><StatusBadge status={m.status} /></td>
                          <td className="py-2.5 pr-4">{m.hours} hrs</td>
                          <td className={`py-2.5 pr-4 font-medium ${m.balance < 0 ? "text-destructive" : m.balance > 0 ? "text-chart-2" : ""}`}>
                            {m.balance < 0 ? `-$${Math.abs(m.balance)}` : m.balance > 0 ? `+$${m.balance}` : "$0"}
                          </td>
                          <td className="py-2.5 pr-4 text-muted-foreground">{m.medical}</td>
                          <td className="py-2.5 pr-4 text-muted-foreground">{m.joined}</td>
                          <td className="py-2.5">
                            <Button size="sm" variant="ghost" className="h-6 text-xs">Manage</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── AIRCRAFT ─────────────────────────────────────────────────────── */}
          {activeTab === "aircraft" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm">Club Aircraft ({aircraft.length})</CardTitle>
                    <CardDescription className="text-xs">Fleet management and status overview</CardDescription>
                  </div>
                  <Button size="sm" className="h-7 gap-1.5 text-xs">
                    <Plus className="h-3 w-3" /> Add Aircraft
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {aircraft.map((ac) => (
                    <div key={ac.id} className="rounded-lg border border-border p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold">{ac.nNumber}</p>
                            <p className="text-sm text-muted-foreground">"{ac.nickname}"</p>
                          </div>
                          <p className="text-xs text-muted-foreground">{ac.year} {ac.make} {ac.model}</p>
                        </div>
                        <StatusBadge status={ac.status} />
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="rounded-md bg-muted/50 p-2">
                          <p className="text-muted-foreground">Rate</p>
                          <p className="font-semibold">${ac.rate}/hr</p>
                        </div>
                        <div className="rounded-md bg-muted/50 p-2">
                          <p className="text-muted-foreground">Hobbs</p>
                          <p className="font-semibold">{ac.hobbs} hrs</p>
                        </div>
                        <div className={`rounded-md p-2 ${ac.mxHours < 10 ? "bg-destructive/10" : "bg-muted/50"}`}>
                          <p className="text-muted-foreground">Next MX</p>
                          <p className={`font-semibold ${ac.mxHours < 10 ? "text-destructive" : ""}`}>{ac.nextMx}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-7 flex-1 text-xs">Edit</Button>
                        <Button size="sm" variant="outline" className="h-7 flex-1 text-xs">Maintenance</Button>
                        <Button size="sm" variant="outline" className="h-7 flex-1 text-xs">Logbook</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── BILLING / TRANSACTIONS ────────────────────────────────────────── */}
          {activeTab === "billing" && (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Outstanding Balance", value: "-$600", sub: "2 members overdue", color: "text-destructive" },
                  { label: "Collected This Month", value: "$9,200", sub: "from flights & dues", color: "text-chart-2" },
                  { label: "Pending Invoices", value: "3", sub: "awaiting payment", color: "text-chart-3" },
                ].map((s) => (
                  <Card key={s.label}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs text-muted-foreground">{s.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.sub}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          {["Member", "Type", "Aircraft", "Date", "Amount", "Status", ""].map(h => (
                            <th key={h} className="pb-2 pr-4 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {billing.map((t) => (
                          <tr key={t.id} className="border-b border-border/50 last:border-0">
                            <td className="py-2.5 pr-4 font-medium">{t.member}</td>
                            <td className="py-2.5 pr-4 text-muted-foreground">{t.type}</td>
                            <td className="py-2.5 pr-4">{t.aircraft !== "—" ? <Badge variant="outline" className="text-xs">{t.aircraft}</Badge> : "—"}</td>
                            <td className="py-2.5 pr-4 text-muted-foreground">{t.date}</td>
                            <td className="py-2.5 pr-4 font-medium">${t.amount}</td>
                            <td className="py-2.5 pr-4"><StatusBadge status={t.status} /></td>
                            <td className="py-2.5">
                              <Button size="sm" variant="ghost" className="h-6 text-xs">View</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* ── GENERAL SETTINGS ────────────────────────────────────────────── */}
          {activeTab === "general-settings" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Club Information</CardTitle>
                  <CardDescription className="text-xs">Basic details visible to all members</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Club Name",        value: club.name,   type: "text" },
                    { label: "Home Airport ICAO", value: club.icao,   type: "text" },
                    { label: "Founded",           value: club.founded, type: "text" },
                  ].map((f) => (
                    <div key={f.label} className="grid grid-cols-3 items-center gap-4">
                      <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
                      <input defaultValue={f.value} className="col-span-2 h-8 rounded-md border border-input bg-background px-3 text-xs outline-none focus:ring-1 focus:ring-ring" />
                    </div>
                  ))}
                  <div className="flex justify-end pt-2">
                    <Button size="sm" className="h-7 text-xs">Save Changes</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Booking Rules</CardTitle>
                  <CardDescription className="text-xs">Control how members can schedule aircraft</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "Max advance booking (days)", value: "30" },
                    { label: "Min notice required (hours)", value: "2" },
                    { label: "Max booking duration (hours)", value: "8" },
                    { label: "Max bookings per member per week", value: "5" },
                  ].map((r) => (
                    <div key={r.label} className="grid grid-cols-3 items-center gap-4">
                      <label className="col-span-2 text-xs font-medium text-muted-foreground">{r.label}</label>
                      <input defaultValue={r.value} type="number" className="h-8 rounded-md border border-input bg-background px-3 text-xs outline-none focus:ring-1 focus:ring-ring" />
                    </div>
                  ))}
                  <div className="flex justify-end pt-2">
                    <Button size="sm" className="h-7 text-xs">Save Changes</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── PLACEHOLDER SECTIONS ────────────────────────────────────────── */}
          {activeTab === "instructors" && <PlaceholderPanel title="Instructors" description="Manage CFIs and CFIIs who can log dual instruction in club aircraft." />}
          {activeTab === "administrators" && <PlaceholderPanel title="Administrators" description="Manage club admins, owners, and dispatch roles." />}
          {activeTab === "groups" && <PlaceholderPanel title="Groups" description="Segment members into groups for permissions, rates, and access rules." />}
          {activeTab === "items" && <PlaceholderPanel title="Items" description="Billable line items such as fuel, instruction charges, and add-ons." />}
          {activeTab === "adjustments" && <PlaceholderPanel title="Adjustments" description="Manual credits and debits applied to member account balances." />}
          {activeTab === "forms" && <PlaceholderPanel title="Forms" description="Pre-flight and post-flight forms required for dispatch and closeout." />}
          {activeTab === "invoices" && <PlaceholderPanel title="Invoices" description="Generate and send invoices to members for dues, flights, and fees." />}
          {activeTab === "member-settings" && <PlaceholderPanel title="Member Settings" description="Configure self-registration, required documents, and profile fields." />}
          {activeTab === "schedule-settings" && <PlaceholderPanel title="Schedule Settings" description="Set operating hours, blackout dates, and scheduling constraints." />}
          {activeTab === "notification-settings" && <PlaceholderPanel title="Notification Settings" description="Configure email and SMS alerts for bookings, maintenance, and dues." />}
          {activeTab === "add-ons" && <PlaceholderPanel title="Add-ons" description="Enable premium features: weather briefings, ATIS, fuel ordering, and more." />}

        </div>
      </div>
    </div>
  )
}
