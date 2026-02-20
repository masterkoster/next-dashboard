'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Filter, MapPin, Clock, Gauge, User, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ListingType = 'FOR_SALE' | 'SHARE_SELL' | 'SHARE_WANTED' | 'AIRCRAFT_SALE';

interface MarketplaceListing {
  id: string;
  userId: string;
  type: ListingType;
  title: string;
  description?: string | null;
  aircraftType: string;
  airportIcao: string;
  airportName?: string | null;
  airportCity?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  price?: number | null;
  sharePercent?: number | null;
  hours?: number | null;
  contactMethod?: string | null;
  contactValue?: string | null;
  status: string;
  createdAt: string;
  nNumber?: string | null;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  totalTime?: number | null;
  engineTime?: number | null;
  propTime?: number | null;
  registrationType?: string | null;
  airworthiness?: string | null;
  fuelType?: string | null;
  sellerType?: string | null;
  isVerified?: boolean | null;
  images?: string[] | null;
  user: {
    id: string;
    name?: string | null;
    username?: string | null;
  };
}

const LISTING_TYPE_OPTIONS = [
  { value: 'ALL', label: 'All Listings' },
  { value: 'AIRCRAFT_SALE', label: 'Aircraft For Sale' },
  { value: 'FOR_SALE', label: 'Full Sale' },
  { value: 'SHARE_SELL', label: 'Selling Share' },
  { value: 'SHARE_WANTED', label: 'Looking to Join' },
];

// Demo data - Using free Unsplash images
const DEMO_LISTINGS: MarketplaceListing[] = [
  {
    id: '1',
    userId: 'user1',
    type: 'AIRCRAFT_SALE',
    title: '2018 Cirrus SR22T GTS',
    description: 'Exceptional SR22T with GTS package, CAPS, Airbag, FIKI, and full de-ice.',
    aircraftType: 'SR22T',
    airportIcao: 'KDVT',
    airportName: 'Phoenix Deer Valley',
    airportCity: 'Phoenix, AZ',
    price: 725000,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    nNumber: 'N412CT',
    make: 'Cirrus',
    model: 'SR22T',
    year: 2018,
    totalTime: 1247,
    engineTime: 423,
    propTime: 423,
    registrationType: 'Standard',
    airworthiness: 'Current',
    fuelType: '100LL',
    sellerType: 'DEALER',
    isVerified: true,
    images: ['https://images.unsplash.com/photo-1559627755-0b42f3014507?w=800&q=80'],
    user: { id: 'user1', name: 'Cirrus Aviation Partners', username: 'cirrusav' },
  },
  {
    id: '2',
    userId: 'user2',
    type: 'FOR_SALE',
    title: '1978 Piper Archer II',
    description: 'Well maintained, fresh annual, hangared. Always hangared, no damage history.',
    aircraftType: 'PA-28-181',
    airportIcao: 'KAPA',
    airportName: 'Centennial Airport',
    airportCity: 'Denver, CO',
    price: 165000,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    nNumber: 'N5432P',
    make: 'Piper',
    model: 'Archer II',
    year: 1978,
    totalTime: 4120,
    engineTime: 850,
    propTime: 120,
    registrationType: 'Standard',
    airworthiness: 'Current',
    fuelType: '100LL',
    sellerType: 'OWNER',
    isVerified: true,
    images: ['https://images.unsplash.com/photo-1540962351504-03099e0a778a?w=800&q=80'],
    user: { id: 'user2', name: 'Denver Aviation', username: 'denav' },
  },
  {
    id: '3',
    userId: 'user3',
    type: 'SHARE_SELL',
    title: 'C172 Partnership - 25% Share',
    description: 'Great opportunity to join a well-maintained C172 at KSDL. Perfect for students and cross-country training.',
    aircraftType: 'Cessna 172S',
    airportIcao: 'KSDL',
    airportName: 'Scottsdale Airport',
    airportCity: 'Scottsdale, AZ',
    price: 45000,
    sharePercent: 25,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    make: 'Cessna',
    model: '172S',
    year: 2015,
    totalTime: 2150,
    engineTime: 450,
    propTime: 450,
    registrationType: 'Standard',
    airworthiness: 'Current',
    fuelType: '100LL',
    sellerType: 'OWNER',
    isVerified: false,
    images: ['https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=800&q=80'],
    user: { id: 'user3', name: 'Desert Flyers Club', username: 'desertflyers' },
  },
  {
    id: '4',
    userId: 'user4',
    type: 'AIRCRAFT_SALE',
    title: '2020 Diamond DA40 NG',
    description: 'Brand new Diamond DA40 NG with G1000 NXi, FIKI, and full de-ice. Low hours, excellent condition.',
    aircraftType: 'DA40',
    airportIcao: 'KORD',
    airportName: "Chicago O'Hare International",
    airportCity: 'Chicago, IL',
    price: 485000,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    nNumber: 'N888DG',
    make: 'Diamond',
    model: 'DA40 NG',
    year: 2020,
    totalTime: 380,
    engineTime: 380,
    propTime: 380,
    registrationType: 'Standard',
    airworthiness: 'Current',
    fuelType: 'Jet-A',
    sellerType: 'DEALER',
    isVerified: true,
    images: ['https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=800&q=80'],
    user: { id: 'user4', name: 'Midwest Aviation', username: 'mwav' },
  },
  {
    id: '5',
    userId: 'user5',
    type: 'FOR_SALE',
    title: '1967 Beechcraft Bonanza V35',
    description: 'Classic V-tail Bonanza with recent renovation. New paint, interior, and avionics upgrade.',
    aircraftType: 'V35',
    airportIcao: 'KSNA',
    airportName: 'John Wayne Airport',
    airportCity: 'Santa Ana, CA',
    price: 285000,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    nNumber: 'N5678B',
    make: 'Beechcraft',
    model: 'Bonanza V35',
    year: 1967,
    totalTime: 4850,
    engineTime: 450,
    propTime: 125,
    registrationType: 'Standard',
    airworthiness: 'Current',
    fuelType: '100LL',
    sellerType: 'OWNER',
    isVerified: true,
    images: ['https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=80'],
    user: { id: 'user5', name: 'West Coast Aircraft', username: 'wca' },
  },
  {
    id: '6',
    userId: 'user6',
    type: 'SHARE_WANTED',
    title: 'Looking for 20% Share in SR22',
    description: 'IFR-rated pilot seeking 20% share in well-equipped SR22 in the Phoenix area. Willing to pay fair market value.',
    aircraftType: 'SR22',
    airportIcao: 'KPHX',
    airportName: 'Phoenix Sky Harbor',
    airportCity: 'Phoenix, AZ',
    price: 0,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    make: 'Cirrus',
    model: 'SR22',
    year: 2016,
    totalTime: 0,
    sellerType: 'OWNER',
    isVerified: false,
    images: [],
    user: { id: 'user6', name: 'Mike Johnson', username: 'mikej' },
  },
];

export default function MarketplacePage() {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadListings();
  }, []);

  async function loadListings() {
    setLoading(true);
    try {
      const res = await fetch('/api/marketplace/listings');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setListings(data.listings?.length ? data.listings : DEMO_LISTINGS);
    } catch {
      setListings(DEMO_LISTINGS);
    } finally {
      setLoading(false);
    }
  }

  const filteredListings = listings.filter((listing) => {
    if (selectedType !== 'ALL' && listing.type !== selectedType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        listing.title.toLowerCase().includes(q) ||
        listing.aircraftType.toLowerCase().includes(q) ||
        (listing.airportCity || '').toLowerCase().includes(q) ||
        listing.airportIcao.toLowerCase().includes(q) ||
        (listing.make || '').toLowerCase().includes(q) ||
        (listing.model || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getTypeLabel = (type: ListingType) => {
    return LISTING_TYPE_OPTIONS.find((t) => t.value === type)?.label || type;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/5" />
        <div className="relative max-w-7xl mx-auto px-4 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
            Find Your Perfect Aircraft
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse verified listings from trusted dealers and owners. 
            Verified aircraft, secure transactions.
          </p>
          
          {/* Search */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by make, model, N-number, location..."
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className="h-12 w-12"
              >
                <Filter className="h-4 w-4" />
              </Button>
              <Button className="h-12 px-6">
                Search
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-10 flex flex-wrap justify-center gap-8">
            {[
              { value: '2,400+', label: 'Verified Listings' },
              { value: '98%', label: 'Satisfaction Rate' },
              { value: '15K+', label: 'Active Buyers' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-y border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center gap-4 overflow-x-auto">
            {LISTING_TYPE_OPTIONS.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedType === type.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Listings Grid */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading listings...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No listings found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredListings.map((listing) => (
              <Link
                key={listing.id}
                href={`/modules/marketplace/listing/${listing.id}`}
                className="group block"
              >
                <article className="rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                  {/* Image */}
                  <div className="relative aspect-video bg-secondary">
                    {listing.images?.[0] ? (
                      <Image
                        src={listing.images[0]}
                        alt={listing.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Plane className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                    {listing.isVerified && (
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-primary/90 px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                        Verified
                      </span>
                    )}
                    <span className="absolute top-3 right-3 inline-flex items-center rounded-full bg-card/90 px-2.5 py-1 text-xs font-medium">
                      {getTypeLabel(listing.type)}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {listing.nNumber && <span className="text-primary mr-1">{listing.nNumber}</span>}
                          {listing.year} {listing.make} {listing.model}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {listing.aircraftType}
                        </p>
                      </div>
                      {listing.price && (
                        <div className="text-right">
                          <p className="text-lg font-bold text-foreground">
                            ${listing.price.toLocaleString()}
                          </p>
                          {listing.sharePercent && (
                            <p className="text-xs text-muted-foreground">
                              {listing.sharePercent}% share
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Location */}
                    <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{listing.airportIcao}</span>
                      {listing.airportCity && <span>• {listing.airportCity}</span>}
                    </div>

                    {/* Stats */}
                    <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                      {listing.totalTime && (
                        <div className="flex items-center gap-1">
                          <Gauge className="h-3.5 w-3.5" />
                          <span>{listing.totalTime.toLocaleString()} hrs</span>
                        </div>
                      )}
                      {listing.year && (
                        <span>{listing.year}</span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {listing.user.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-primary" />
              <span className="font-semibold">SkyMarket</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 SkyMarket. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
