'use client'

import { useEffect, useMemo, useState, type ElementType } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Search,
  MapPin,
  Star,
  CheckCircle2,
  Clock,
  Wrench,
  ChevronRight,
  Filter,
  Plus,
  FileText,
  AlertTriangle,
  MessageSquare,
  Plane,
  ShieldCheck,
  X,
  Calendar,
  DollarSign,
} from "lucide-react"

type View = "browse" | "post-squawk" | "my-requests"

type Mechanic = {
  id: string
  name: string
  businessName?: string | null
  city?: string | null
  state?: string | null
  locationIcao?: string | null
  certifications?: string | null
  rating?: number | null
  reviewCount?: number | null
  specialties?: string | null
}

type Listing = {
  id: string
  title: string
  description: string
  category: string
  jobSize?: string | null
  neededBy?: string | null
  aircraftType?: string | null
  airportIcao?: string | null
  city?: string | null
  state?: string | null
  status?: string
}

type Quote = {
  id: string
  amount?: number | null
  description: string
  status: string
  maintenanceRequest: { id: string; title: string }
  mechanic: { name: string; businessName?: string | null; rating?: number | null }
}

const URGENCY_CONFIG: Record<string, { label: string; className: string }> = {
  urgent: { label: "This Week", className: "bg-red-500/15 text-red-400 border-red-500/30" },
  flexible: { label: "Flexible", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
}

function MechanicCard({ mechanic, onSelect }: { mechanic: Mechanic; onSelect: (m: Mechanic) => void }) {
  return (
    <Card className="group transition-all hover:shadow-md hover:border-primary/40">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {(mechanic.name || "M").split(" ").map((n) => n[0]).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{mechanic.name}</span>
              <div className="flex items-center gap-1 ml-auto">
                <span className="text-[11px] text-muted-foreground">Verified</span>
                <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{mechanic.businessName || "Independent"}</p>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{[mechanic.city, mechanic.state, mechanic.locationIcao].filter(Boolean).join(" • ")}</span>
              <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />{mechanic.rating ?? 0} ({mechanic.reviewCount ?? 0})</span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {(mechanic.specialties || "").split(',').filter(Boolean).slice(0, 3).map((s) => (
            <Badge key={s} variant="secondary" className="text-[11px]">{s.trim()}</Badge>
          ))}
        </div>

        <Separator className="my-3" />

        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{mechanic.certifications || "A&P"}</span>
          </div>
          <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs" onClick={() => onSelect(mechanic)}>
            View Profile <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function SquawkCard({ squawk, onQuote }: { squawk: Listing; onQuote: (id: string) => void }) {
  return (
    <Card className="transition-all hover:shadow-md hover:border-primary/40">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{squawk.title}</span>
              {squawk.jobSize && (
                <Badge variant="outline" className="text-[11px] border">{squawk.jobSize}</Badge>
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1.5">
              <Plane className="h-3 w-3" />{squawk.aircraftType || "Aircraft"}
              <span className="mx-1">·</span>
              <MapPin className="h-3 w-3" />{[squawk.city, squawk.state, squawk.airportIcao].filter(Boolean).join(" • ") || "Location hidden"}
              <span className="mx-1">·</span>
              <Clock className="h-3 w-3" />{squawk.neededBy ? new Date(squawk.neededBy).toLocaleDateString() : "Flexible"}
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0 text-xs">{squawk.category}</Badge>
        </div>

        <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{squawk.description}</p>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Status: {squawk.status || "Open"}</span>
          </div>
          <Button size="sm" className="h-7 gap-1.5 text-xs" onClick={() => onQuote(squawk.id)}>
            Send Quote <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function PostSquawkForm({ onBack, onSubmit }: { onBack: () => void; onSubmit: (payload: any) => void }) {
  const [urgency, setUrgency] = useState<"flexible" | "urgent">("flexible")
  const [form, setForm] = useState({
    aircraftModel: "",
    airportIcao: "",
    title: "",
    description: "",
    category: "Other",
    neededBy: "",
    jobSize: "MEDIUM",
  })

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold">Post a Squawk</h2>
        <p className="mt-1 text-sm text-muted-foreground">Describe the issue on your aircraft and receive quotes from verified local mechanics.</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2"><Plane className="h-4 w-4 text-primary" />Aircraft</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Aircraft Model</label>
              <Input value={form.aircraftModel} onChange={(e) => setForm({ ...form, aircraftModel: e.target.value })} placeholder="e.g. Cessna 172S" className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Airport (ICAO)</label>
              <Input value={form.airportIcao} onChange={(e) => setForm({ ...form, airportIcao: e.target.value.toUpperCase() })} placeholder="e.g. KBOS" className="h-9 text-sm" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2"><Wrench className="h-4 w-4 text-primary" />Squawk Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Title</label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Mag drop on right magneto" className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the squawk in detail..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option>Powerplant</option>
                <option>Airframe</option>
                <option>Avionics</option>
                <option>Landing Gear</option>
                <option>Electrical</option>
                <option>Fuel System</option>
                <option>Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Urgency</label>
              <div className="flex gap-2">
                {(["flexible", "urgent"] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => setUrgency(u)}
                    className={`flex-1 rounded-md border py-1.5 text-xs font-medium capitalize transition-all ${
                      urgency === u
                        ? u === "urgent"
                          ? "border-red-500 bg-red-500/10 text-red-400"
                          : "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {u === "urgent" ? "This week" : "Flexible"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" />Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Needed By</label>
              <Input type="date" value={form.neededBy} onChange={(e) => setForm({ ...form, neededBy: e.target.value })} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Job Size</label>
              <select
                value={form.jobSize}
                onChange={(e) => setForm({ ...form, jobSize: e.target.value })}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="SMALL">Small</option>
                <option value="MEDIUM">Medium</option>
                <option value="LARGE">Large</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="gap-2"><X className="h-4 w-4" />Cancel</Button>
        <Button className="flex-1 gap-2" onClick={() => onSubmit({ ...form, urgency })}><FileText className="h-4 w-4" />Post Squawk</Button>
      </div>
    </div>
  )
}

export default function MechanicMarketplacePage() {
  const { data: session } = useSession()
  const [view, setView] = useState<View>("browse")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic | null>(null)
  const [mechanics, setMechanics] = useState<Mechanic[]>([])
  const [openSquawks, setOpenSquawks] = useState<Listing[]>([])
  const [myRequests, setMyRequests] = useState<Listing[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [quoteModalId, setQuoteModalId] = useState<string | null>(null)
  const [quoteMessage, setQuoteMessage] = useState("")
  const [quoteAmount, setQuoteAmount] = useState("")

  useEffect(() => {
    async function loadMechanics() {
      const res = await fetch(`/api/mechanics/search?q=${encodeURIComponent(searchQuery)}`)
      if (res.ok) {
        const data = await res.json()
        setMechanics(Array.isArray(data.mechanics) ? data.mechanics : [])
      }
    }
    loadMechanics()
  }, [searchQuery])

  useEffect(() => {
    async function loadSquawks() {
      const res = await fetch('/api/mechanics/listings')
      if (res.ok) {
        const data = await res.json()
        setOpenSquawks(Array.isArray(data.listings) ? data.listings : [])
      }
    }
    loadSquawks()
  }, [])

  useEffect(() => {
    if (!session?.user) return
    async function loadMine() {
      const res = await fetch('/api/mechanics/listings/mine')
      if (res.ok) {
        const data = await res.json()
        setMyRequests(Array.isArray(data.listings) ? data.listings : [])
      }

      const quotesRes = await fetch('/api/mechanics/quotes')
      if (quotesRes.ok) {
        const data = await quotesRes.json()
        setQuotes(Array.isArray(data.quotes) ? data.quotes : [])
      }
    }
    loadMine()
  }, [session?.user])

  const filteredMechanics = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return mechanics.filter(m =>
      m.name.toLowerCase().includes(q) ||
      (m.businessName || '').toLowerCase().includes(q) ||
      (m.locationIcao || '').toLowerCase().includes(q) ||
      (m.specialties || '').toLowerCase().includes(q)
    )
  }, [mechanics, searchQuery])

  const VIEWS: { id: View; label: string; icon: ElementType }[] = [
    { id: "browse", label: "Browse Mechanics", icon: Search },
    { id: "post-squawk", label: "Post a Squawk", icon: Plus },
    { id: "my-requests", label: "My Requests", icon: FileText },
  ]

  const handlePost = async (payload: any) => {
    await fetch('/api/mechanics/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: payload.title,
        description: payload.description,
        category: payload.category,
        urgency: payload.urgency === 'urgent' ? 'HIGH' : 'NORMAL',
        neededBy: payload.neededBy || null,
        jobSize: payload.jobSize,
        aircraftType: payload.aircraftModel,
        airportIcao: payload.airportIcao,
        source: 'manual',
        anonymous: true,
      }),
    })
    setView('my-requests')
  }

  const submitQuote = async () => {
    if (!quoteModalId) return
    await fetch(`/api/mechanics/listings/${quoteModalId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: quoteMessage,
        quoteAmount: quoteAmount ? Number(quoteAmount) : undefined,
      }),
    })
    setQuoteModalId(null)
    setQuoteMessage('')
    setQuoteAmount('')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 pt-6 pb-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Wrench className="h-6 w-6 text-primary" />
                Mechanic Marketplace
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Connect with verified A&Ps. Post squawks, compare quotes, get flying again.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-center">
              {[
                { value: `${mechanics.length}+`, label: "Verified A&Ps" },
                { value: "98%", label: "Response Rate" },
                { value: "4.8", label: "Avg Rating" },
              ].map(stat => (
                <div key={stat.label} className="border-l border-border pl-4 first:border-0 first:pl-0">
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex gap-0">
            {VIEWS.map(v => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={`flex items-center gap-2 border-b-2 px-5 py-2.5 text-xs font-medium transition-colors ${
                  view === v.id
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <v.icon className="h-3.5 w-3.5" />
                {v.label}
                {v.id === "my-requests" && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{myRequests.length}</Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {view === "browse" && (
          <div className="space-y-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, airport, specialisation..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <Button variant="outline" size="sm" className="gap-2 h-9">
                <Filter className="h-4 w-4" />Filters
              </Button>
            </div>

            <Card className="border-primary/40 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-primary" />
                      {openSquawks.length} Open Squawks Near You
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Pilots are looking for quotes right now.</p>
                  </div>
                  <Button size="sm" variant="outline" className="shrink-0" onClick={() => setView("post-squawk")}>View All</Button>
                </div>
                <div className="mt-3 space-y-2">
                  {openSquawks.slice(0, 2).map(sq => (
                    <div key={sq.id} className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Badge variant="outline" className={`shrink-0 text-[10px] border ${URGENCY_CONFIG.flexible.className}`}>Open</Badge>
                        <span className="text-xs font-medium truncate">{sq.title}</span>
                        <span className="text-xs text-muted-foreground shrink-0">{sq.airportIcao || sq.city || ''}</span>
                      </div>
                      <Button size="sm" className="h-6 shrink-0 text-[11px]" onClick={() => setQuoteModalId(sq.id)}>Quote</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{filteredMechanics.length} mechanics found</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredMechanics.map(m => (
                  <MechanicCard key={m.id} mechanic={m} onSelect={setSelectedMechanic} />
                ))}
              </div>
            </div>
          </div>
        )}

        {view === "post-squawk" && (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <PostSquawkForm onBack={() => setView("browse")} onSubmit={handlePost} />
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Open Requests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {openSquawks.slice(0, 3).map(sq => (
                    <SquawkCard key={sq.id} squawk={sq} onQuote={setQuoteModalId} />
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {view === "my-requests" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">My Squawk Requests</h2>
              <Badge variant="secondary">{myRequests.length} active</Badge>
            </div>
            {myRequests.map(req => (
              <Card key={req.id} className="overflow-hidden">
                <CardHeader className="pb-3 bg-muted/30 border-b border-border">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm">{req.title}</CardTitle>
                        <Badge variant="outline" className={`text-[11px] border ${URGENCY_CONFIG.flexible.className}`}>Open</Badge>
                        <Badge variant="secondary" className="text-[11px] capitalize">{req.status || 'open'}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
                        <Plane className="h-3 w-3" />{req.aircraftType || "Aircraft"} · <Clock className="h-3 w-3" />{req.neededBy ? new Date(req.neededBy).toLocaleDateString() : "Flexible"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold">{quotes.filter(q => q.maintenanceRequest.id === req.id).length} Quotes</p>
                      <p className="text-[11px] text-muted-foreground">Received</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {quotes.filter(q => q.maintenanceRequest.id === req.id).map((quote) => (
                    <div key={quote.id} className="p-4 border-t border-border">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {quote.mechanic.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium">{quote.mechanic.businessName || quote.mechanic.name}</span>
                              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <p className="text-xs text-muted-foreground">{quote.mechanic.name}</p>
                            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />{quote.mechanic.rating ?? 0}</span>
                              <span>·</span>
                              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />ETA: TBD</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold">${quote.amount ?? 0}</p>
                          <p className="text-[11px] text-muted-foreground">est. total</p>
                        </div>
                      </div>
                      <p className="mt-2 rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground leading-relaxed">
                        {quote.description}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 flex-1">
                          <MessageSquare className="h-3.5 w-3.5" />Message
                        </Button>
                        <Button size="sm" className="h-7 text-xs gap-1.5 flex-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />Accept Quote
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!quoteModalId} onOpenChange={() => setQuoteModalId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Quote</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea placeholder="Message" value={quoteMessage} onChange={(e) => setQuoteMessage(e.target.value)} />
            <Input type="number" placeholder="Total estimate" value={quoteAmount} onChange={(e) => setQuoteAmount(e.target.value)} />
            <Button onClick={submitQuote}>Send Quote</Button>
          </div>
        </DialogContent>
      </Dialog>

      {selectedMechanic && (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedMechanic(null)} />
          <div className="relative z-10 h-full w-full max-w-md overflow-y-auto bg-card shadow-2xl border-l border-border">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 px-5 py-3 backdrop-blur">
              <span className="text-sm font-semibold">Mechanic Profile</span>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setSelectedMechanic(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-5 space-y-5">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  {selectedMechanic.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold">{selectedMechanic.name}</h2>
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedMechanic.businessName || "Independent"}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{[selectedMechanic.city, selectedMechanic.state, selectedMechanic.locationIcao].filter(Boolean).join(" • ")}</span>
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Specialisations</h3>
                <div className="flex flex-wrap gap-2">
                  {(selectedMechanic.specialties || '').split(',').filter(Boolean).map((s) => (
                    <Badge key={s} variant="secondary">{s.trim()}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <Button className="w-full gap-2"><MessageSquare className="h-4 w-4" />Send Message</Button>
                <Button variant="outline" className="w-full gap-2"><FileText className="h-4 w-4" />Request Quote</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
