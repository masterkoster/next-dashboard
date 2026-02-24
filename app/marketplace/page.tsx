'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search,
  Plane,
  CheckCircle2,
  Users,
  TrendingUp,
  Filter,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  Heart,
  Share2,
  ChevronRight
} from "lucide-react"

type ListingCategory = 'all' | 'for-sale' | 'full-sale' | 'selling-share' | 'looking-to-join'

const mockListings = [
  { id: 1, title: "Cessna 172S Skyhawk", year: 2018, price: 385000, location: "KBOS", hours: 1250, category: 'for-sale', image: "/placeholder.jpg", verified: true, seller: "Professional Aviation Inc.", rating: 4.9 },
  { id: 2, title: "Piper PA-28 Cherokee", year: 2015, price: 165000, location: "KALB", hours: 2100, category: 'for-sale', image: "/placeholder.jpg", verified: true, seller: "Northeast Flying Club", rating: 4.8 },
  { id: 3, title: "Cirrus SR22T", year: 2020, price: 750000, location: "KMVY", hours: 450, category: 'full-sale', image: "/placeholder.jpg", verified: true, seller: "Cirrus New England", rating: 5.0 },
  { id: 4, title: "Beechcraft Bonanza G36", year: 2019, price: 125000, location: "KBOS", hours: 890, category: 'selling-share', image: "/placeholder.jpg", verified: true, seller: "Boston Bonanza Partnership", rating: 4.7 },
  { id: 5, title: "Diamond DA40 NG", year: 2021, price: 485000, location: "KBED", hours: 320, category: 'for-sale', image: "/placeholder.jpg", verified: true, seller: "Diamond Flight Center", rating: 4.9 },
  { id: 6, title: "Looking for 1/4 Share Partnership", year: 0, price: 0, location: "KBOS", hours: 0, category: 'looking-to-join', image: "/placeholder.jpg", verified: false, seller: "John Smith", rating: 0 },
]

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<ListingCategory>('all')
  const [savedListings, setSavedListings] = useState<number[]>([])

  const categories = [
    { id: 'all' as const, label: 'All Listings', count: 2400 },
    { id: 'for-sale' as const, label: 'Aircraft For Sale', count: 1850 },
    { id: 'full-sale' as const, label: 'Full Sale', count: 1200 },
    { id: 'selling-share' as const, label: 'Selling Share', count: 380 },
    { id: 'looking-to-join' as const, label: 'Looking to Join', count: 170 },
  ]

  const filteredListings = mockListings.filter(listing => {
    const matchesCategory = activeCategory === 'all' || listing.category === activeCategory
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          listing.location.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleSave = (id: number) => {
    setSavedListings(prev => 
      prev.includes(id) ? prev.filter(listingId => listingId !== id) : [...prev, id]
    )
  }

  return (
    <div className="min-h-screen bg-background">

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <div className="border-b border-border bg-gradient-to-b from-card to-background">
          <div className="mx-auto max-w-7xl px-6 py-12">
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl font-bold tracking-tight text-balance">
                Find Your Perfect Aircraft
              </h1>
              <p className="text-lg text-muted-foreground text-balance max-w-2xl">
                Browse verified listings from trusted dealers and owners. Verified aircraft, secure transactions.
              </p>
              
              {/* Search Bar */}
              <div className="mt-4 flex gap-3 max-w-2xl">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search by aircraft model, location, or registration..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-11 pl-9 pr-4"
                  />
                </div>
                <Button size="lg" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-3 gap-6 max-w-2xl">
                <div>
                  <div className="text-3xl font-bold text-foreground">2,400+</div>
                  <div className="text-sm text-muted-foreground">Verified Listings</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground">98%</div>
                  <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground">15K+</div>
                  <div className="text-sm text-muted-foreground">Active Buyers</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Navigation - More Prominent */}
        <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="mx-auto max-w-7xl px-6">
            <nav className="flex gap-1 overflow-x-auto py-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveCategory(category.id)}
                  className="shrink-0 gap-2"
                >
                  {category.label}
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </nav>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="group overflow-hidden transition-all hover:shadow-lg">
                <div className="relative aspect-video bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Plane className="h-16 w-16 text-muted-foreground/20" />
                  </div>
                  {listing.verified && (
                    <Badge className="absolute left-3 top-3 gap-1 bg-primary">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                  <div className="absolute right-3 top-3 flex gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-full"
                      onClick={() => toggleSave(listing.id)}
                    >
                      <Heart className={`h-4 w-4 ${savedListings.includes(listing.id) ? 'fill-current text-destructive' : ''}`} />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-full"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                        {listing.title}
                      </CardTitle>
                      <CardDescription className="mt-1 text-xs">
                        {listing.seller}
                      </CardDescription>
                    </div>
                    {listing.rating > 0 && (
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="h-3 w-3 fill-current text-yellow-500" />
                        <span className="font-medium">{listing.rating}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {listing.category !== 'looking-to-join' ? (
                    <>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span className="text-xs">Year</span>
                          </div>
                          <div className="font-semibold">{listing.year}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <TrendingUp className="h-3.5 w-3.5" />
                            <span className="text-xs">Hours</span>
                          </div>
                          <div className="font-semibold">{listing.hours.toLocaleString()}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="text-xs">Location</span>
                          </div>
                          <div className="font-semibold">{listing.location}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <DollarSign className="h-3.5 w-3.5" />
                            <span className="text-xs">Price</span>
                          </div>
                          <div className="font-semibold">${(listing.price / 1000).toFixed(0)}K</div>
                        </div>
                      </div>

                      <Button className="w-full gap-2" variant="default">
                        View Details
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-sm text-muted-foreground">
                          Pilot seeking partnership or share in {listing.location} area. 
                          Looking for reliable partnership with established group.
                        </p>
                      </div>
                      <Button className="w-full gap-2" variant="outline">
                        Contact
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredListings.length === 0 && (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <div className="rounded-full bg-muted p-6">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">No listings found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try adjusting your search or filters to find what you're looking for.
                  </p>
                </div>
                <Button onClick={() => { setSearchQuery(''); setActiveCategory('all') }}>
                  Clear Filters
                </Button>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
