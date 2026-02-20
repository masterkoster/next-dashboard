'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { checkMessageSafety } from '@/lib/message-safety';
import { ensureIdentityKeypair, publishMyPublicKey, encryptForUser } from '@/lib/e2ee';

const MarketplaceMap = dynamic(() => import('./MarketplaceMap'), { ssr: false });

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
  // Aircraft-specific fields
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
  avionics?: string[] | null;
  features?: string[] | null;
  upgrades?: string[] | null;
  sellerType?: string | null;
  isVerified?: boolean | null;
  verifiedAt?: string | null;
  videoUrl?: string | null;
  user: {
    id: string;
    name?: string | null;
    username?: string | null;
    tier?: string | null;
  };
}

const LISTING_TYPE_OPTIONS = [
  { value: 'FOR_SALE', label: 'Full Sale' },
  { value: 'SHARE_SELL', label: 'Selling Share' },
  { value: 'SHARE_WANTED', label: 'Looking to Join' },
  { value: 'AIRCRAFT_SALE', label: 'Aircraft For Sale' },
];

// Aircraft-specific filter options
const AIRCRAFT_MAKE_OPTIONS = [
  'Cessna', 'Piper', 'Beechcraft', 'Cirrus', 'Mooney', 'Grumman', 
  'Robinson', 'Bell', 'Lockheed', 'Boeing', 'Airbus', 'Other'
];

const AIRCRAFT_TYPE_OPTIONS = [
  'Single Engine Land', 'Multi Engine Land', 'Single Engine Sea', 
  'Multi Engine Sea', 'Helicopter', 'Rotorcraft', 'Glider', 'Balloon'
];

const ENGINE_TYPE_OPTIONS = [
  { value: 'Piston', label: 'Piston' },
  { value: 'Turbine', label: 'Turbine' },
  { value: 'Jet', label: 'Jet' },
];

const initialFormState = {
  type: 'FOR_SALE' as ListingType,
  title: '',
  aircraftType: '',
  airportIcao: '',
  price: '',
  sharePercent: '',
  hours: '',
  description: '',
  contactMethod: 'email',
  contactValue: '',
  // Aircraft-specific fields
  nNumber: '',
  make: '',
  model: '',
  year: '',
  totalTime: '',
  engineTime: '',
  propTime: '',
  annualDue: '',
  registrationType: '',
  airworthiness: '',
  fuelType: '',
  sellerType: 'owner',
  videoUrl: '',
};

interface AirportLookup {
  name?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

const DEMO_LISTINGS: MarketplaceListing[] = [
  {
    id: 'demo-1',
    userId: 'demo-user',
    type: 'FOR_SALE',
    title: '1978 Piper Archer - Ready to Fly',
    description: 'Well cared for, new paint, fresh annual, hangared in Denver.',
    aircraftType: 'Piper PA-28-181',
    airportIcao: 'KAPA',
    airportName: 'Centennial Airport',
    airportCity: 'Denver, CO',
    latitude: 39.5701,
    longitude: -104.8492,
    price: 165000,
    sharePercent: null,
    hours: 4120,
    contactMethod: 'email',
    contactValue: 'owner@example.com',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    user: { id: 'demo-user', name: 'Skyline Aviation', username: 'skyline', tier: 'pro' },
  },
  {
    id: 'demo-2',
    userId: 'demo-user',
    type: 'SHARE_SELL',
    title: 'C172 Partnership - 25% Share',
    description: 'Equity partnership at KSDL. Great for weekend flyers.',
    aircraftType: 'Cessna 172S G1000',
    airportIcao: 'KSDL',
    airportName: 'Scottsdale Airport',
    airportCity: 'Scottsdale, AZ',
    latitude: 33.6229,
    longitude: -111.9113,
    price: 45000,
    sharePercent: 25,
    hours: 2150,
    contactMethod: 'sms',
    contactValue: '(480) 555-0199',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    user: { id: 'demo-user', name: 'Desert Flyers', username: 'desertflyers', tier: 'free' },
  },
  {
    id: 'demo-3',
    userId: 'demo-user',
    type: 'SHARE_WANTED',
    title: 'Looking for SR22 Partnership',
    description: 'IFR-rated pilot seeking SR22 share around Tampa/Orlando.',
    aircraftType: 'Cirrus SR22',
    airportIcao: 'KTPA',
    airportName: 'Tampa International',
    airportCity: 'Tampa, FL',
    latitude: 27.9755,
    longitude: -82.5332,
    price: null,
    sharePercent: 20,
    hours: null,
    contactMethod: 'email',
    contactValue: 'pilot@example.com',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    user: { id: 'demo-user', name: 'Alex Rivera', username: 'aviatealex', tier: 'proplus' },
  },
  {
    id: 'demo-4',
    userId: 'demo-user',
    type: 'AIRCRAFT_SALE',
    title: '2018 Cirrus SR22T - G6 - Loaded',
    description: 'Exceptional SR22T with GTS package, CAPS, Airbag, FIKI, and full de-ice. Always hangared, no damage history. Fresh annual and new C3 battery. Ready for immediate delivery.',
    aircraftType: 'SR22T',
    airportIcao: 'KOAK',
    airportName: 'Oakland International',
    airportCity: 'Oakland, CA',
    latitude: 37.7213,
    longitude: -122.2208,
    price: 725000,
    sharePercent: null,
    hours: null,
    contactMethod: 'email',
    contactValue: 'sales@example.com',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    // Aircraft-specific fields
    nNumber: 'N123SR',
    make: 'Cirrus',
    model: 'SR22T',
    year: 2018,
    totalTime: 1250,
    engineTime: 1250,
    propTime: 50,
    registrationType: 'Standard',
    airworthiness: 'Current',
    fuelType: 'AvGas',
    sellerType: 'owner',
    isVerified: true,
    user: { id: 'demo-user', name: 'Bay Area Aviation', username: 'bayaviation', tier: 'pro' },
  },
];

export default function MarketplacePage() {
  const { data: session, status } = useSession();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ 
    query: '', 
    type: 'ALL' as 'ALL' | ListingType,
    // Aircraft-specific filters
    make: '',
    minYear: '',
    maxYear: '',
    minPrice: '',
    maxPrice: '',
    minTime: '',
    maxTime: '',
    engineType: '',
  });
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [formLoading, setFormLoading] = useState(false);
  const [airportLookup, setAirportLookup] = useState<AirportLookup | null>(null);
  const [airportLookupState, setAirportLookupState] = useState<'idle' | 'loading' | 'error'>('idle');

  const [friends, setFriends] = useState<{ id: string }[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);
  const [friendDraftFor, setFriendDraftFor] = useState<string | null>(null);
  const [friendDraftMessage, setFriendDraftMessage] = useState('');
  const [connectNotice, setConnectNotice] = useState<string | null>(null);

  useEffect(() => {
    loadListings();
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;
    ensureIdentityKeypair().catch(() => {});
    publishMyPublicKey().catch(() => {});
    loadFriendState();
  }, [session]);

  function countSentences(text: string) {
    const s = text
      .trim()
      .split(/[.!?]+/)
      .map((p) => p.trim())
      .filter(Boolean);
    return s.length;
  }

  async function loadFriendState() {
    try {
      const [friendsRes, requestsRes] = await Promise.all([fetch('/api/friends'), fetch('/api/friends/requests')]);
      const friendsData = await friendsRes.json();
      const requestsData = await requestsRes.json();
      setFriends(friendsData.friends || []);
      setOutgoingRequests(requestsData.outgoing || []);
    } catch (error) {
      console.error('Failed to load friend status', error);
    }
  }

  async function sendFriendRequest(userId: string, initialMessage?: string) {
    if (!session) {
      signIn();
      return;
    }
    try {
      let initialMessageEnvelope: string | null = null;
      const message = (initialMessage || '').trim();
      if (message) {
        const safety = checkMessageSafety(message);
        if (!safety.ok) {
          setConnectNotice(safety.error);
          return;
        }
        if (countSentences(message) > 3) {
          setConnectNotice('Message too long (max 3 sentences).');
          return;
        }

        const encrypted = await encryptForUser(userId, message);
        if (encrypted.ok) initialMessageEnvelope = encrypted.envelopeString;
      }

      const res = await fetch('/api/friends/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: userId, initialMessageEnvelope }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send request');
      }
      setConnectNotice('Friend request sent');
      setFriendDraftFor(null);
      setFriendDraftMessage('');
      await loadFriendState();
    } catch (error) {
      console.error(error);
      setConnectNotice(error instanceof Error ? error.message : 'Failed to send request');
    }
  }

  async function openChatWithUser(userId: string) {
    if (!session) {
      signIn();
      return;
    }
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to start chat');
      }
      window.dispatchEvent(new CustomEvent('open-chat', { detail: { conversationId: data.conversationId } }));
    } catch (error) {
      console.error(error);
      setConnectNotice(error instanceof Error ? error.message : 'Failed to start chat');
    }
  }

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      if (filters.type !== 'ALL' && listing.type !== filters.type) return false;
      if (!filters.query) return true;
      const q = filters.query.toLowerCase();
      return (
        listing.title.toLowerCase().includes(q) ||
        listing.aircraftType.toLowerCase().includes(q) ||
        (listing.airportCity || '').toLowerCase().includes(q) ||
        listing.airportIcao.toLowerCase().includes(q)
      );
    });
  }, [filters, listings]);

  async function loadListings() {
    setLoading(true);
    setError(null);
    try {
      // Build query params including aircraft filters
      const params = new URLSearchParams();
      if (filters.type && filters.type !== 'ALL') params.set('type', filters.type);
      if (filters.query) params.set('q', filters.query);
      if (filters.make) params.set('make', filters.make);
      if (filters.minYear) params.set('minYear', filters.minYear);
      if (filters.maxYear) params.set('maxYear', filters.maxYear);
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
      if (filters.minTime) params.set('minTime', filters.minTime);
      if (filters.maxTime) params.set('maxTime', filters.maxTime);
      if (filters.engineType) params.set('engineType', filters.engineType);

      const res = await fetch(`/api/marketplace/listings?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to load listings');
      }
      const data = await res.json();
      const rawListings = data.listings || [];
      const hydratedListings = await hydrateListingLocations(rawListings);
      setListings(hydratedListings.length ? hydratedListings : DEMO_LISTINGS);
    } catch (err) {
      console.error(err);
      setListings(DEMO_LISTINGS);
      setError('Unable to load listings right now. Showing demo listings.');
    } finally {
      setLoading(false);
    }
  }

  // Reload when filters change
  useEffect(() => {
    loadListings();
  }, [filters]);

  async function hydrateListingLocations(rawListings: MarketplaceListing[]) {
    const updatedListings = await Promise.all(
      rawListings.map(async (listing) => {
        if (typeof listing.latitude === 'number' && typeof listing.longitude === 'number') {
          return listing;
        }
        if (!listing.airportIcao) return listing;
        try {
          const res = await fetch(`/api/airports/${listing.airportIcao.toUpperCase()}`);
          if (!res.ok) return listing;
          const data = await res.json();
          return {
            ...listing,
            airportName: listing.airportName || data.name,
            airportCity: listing.airportCity || data.city,
            latitude: data.latitude ?? listing.latitude,
            longitude: data.longitude ?? listing.longitude,
          };
        } catch (error) {
          console.error('Failed to hydrate listing location', error);
          return listing;
        }
      })
    );

    return updatedListings;
  }

  async function handleAirportLookup() {
    if (!formData.airportIcao) return;
    setAirportLookupState('loading');
    try {
      const res = await fetch(`/api/airports/${formData.airportIcao.toUpperCase()}`);
      if (!res.ok) throw new Error('Airport lookup failed');
      const data = await res.json();
      setAirportLookup({
        name: data.name,
        city: data.city,
        latitude: data.latitude,
        longitude: data.longitude,
      });
      setAirportLookupState('idle');
    } catch (err) {
      console.error(err);
      setAirportLookupState('error');
      setAirportLookup(null);
    }
  }

  async function handleCreateListing(e: React.FormEvent) {
    e.preventDefault();
    if (!session) {
      signIn();
      return;
    }
    if (!session.user?.emailVerified) {
      alert('Please verify your email before posting listings.');
      return;
    }

    setFormLoading(true);
    try {
      let locationPayload = airportLookup;
      if (!locationPayload && formData.airportIcao) {
        try {
          const res = await fetch(`/api/airports/${formData.airportIcao.toUpperCase()}`);
          if (res.ok) {
            const data = await res.json();
            locationPayload = {
              name: data.name,
              city: data.city,
              latitude: data.latitude,
              longitude: data.longitude,
            };
          }
        } catch (error) {
          console.error('Failed to fetch airport location', error);
        }
      }

      const payload = {
        type: formData.type,
        title: formData.title,
        aircraftType: formData.aircraftType,
        airportIcao: formData.airportIcao,
        price: formData.price ? Number(formData.price) : null,
        sharePercent: formData.sharePercent ? Number(formData.sharePercent) : null,
        hours: formData.hours ? Number(formData.hours) : null,
        description: formData.description,
        contactMethod: formData.contactMethod,
        contactValue: formData.contactValue,
        airportName: locationPayload?.name,
        airportCity: locationPayload?.city,
        latitude: locationPayload?.latitude,
        longitude: locationPayload?.longitude,
        // Aircraft-specific fields
        nNumber: formData.nNumber || null,
        make: formData.make || null,
        model: formData.model || null,
        year: formData.year ? Number(formData.year) : null,
        totalTime: formData.totalTime ? Number(formData.totalTime) : null,
        engineTime: formData.engineTime ? Number(formData.engineTime) : null,
        propTime: formData.propTime ? Number(formData.propTime) : null,
        registrationType: formData.registrationType || null,
        airworthiness: formData.airworthiness || null,
        fuelType: formData.fuelType || null,
        sellerType: formData.sellerType || null,
        videoUrl: formData.videoUrl || null,
      };

      const res = await fetch('/api/marketplace/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create listing');
      }

      const data = await res.json();
      setListings((prev) => [data.listing, ...prev]);
      setShowForm(false);
      setFormData(initialFormState);
      setAirportLookup(null);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Failed to create listing');
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* v0-style Hero Banner */}
      <div className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-slate-900 to-blue-500/20" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl font-bold text-white lg:text-5xl">
            Find Your Next Aircraft
            <span className="block text-emerald-400">With Confidence</span>
          </h1>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto text-lg">
            The premier marketplace for buying and selling aircraft. Verified listings, 
            secure transactions, satisfied pilots.
          </p>
          
          {/* Search Bar */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto">
            <input
              type="text"
              value={filters.query}
              onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
              placeholder="Search by make, model, N-number, or location..."
              className="flex-1 h-12 px-4 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <select
              value={filters.type}
              onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value as any }))}
              className="h-12 px-4 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="ALL">All Types</option>
              {LISTING_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={() => setShowForm(true)}
              className="h-12 px-6 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-xl"
            >
              + Sell Aircraft
            </button>
          </div>

          {/* Quick Stats */}
          <div className="mt-10 flex flex-wrap justify-center gap-8">
            {[
              { value: '2,400+', label: 'Verified Listings' },
              { value: '98%', label: 'Satisfaction Rate' },
              { value: '15K+', label: 'Active Buyers' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters & Content */}
      <div className="border-b border-slate-800 bg-slate-900/90 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">🛩️ Aircraft Marketplace</h1>
            <p className="text-slate-400 text-sm">Find partners, buy or sell shares, and discover active pilots near you.</p>
          </div>
          <div className="flex gap-3">
            <select
              value={filters.type}
              onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value as any }))}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="ALL">All Types</option>
              {LISTING_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <input
              type="text"
              value={filters.query}
              onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
              placeholder="Search aircraft, airport, city"
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
            />
            {(filters.type === 'AIRCRAFT_SALE' || filters.type === 'ALL') && (
              <details className="relative">
                <summary className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm cursor-pointer list-none hover:bg-slate-700">
                  Filters ▾
                </summary>
                <div className="absolute right-0 top-full mt-2 bg-slate-800 border border-slate-700 rounded-xl p-4 w-72 shadow-xl z-30">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Make</label>
                      <select
                        value={filters.make}
                        onChange={(e) => setFilters((prev) => ({ ...prev, make: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white text-sm"
                      >
                        <option value="">All Makes</option>
                        {AIRCRAFT_MAKE_OPTIONS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Min Year</label>
                        <input
                          type="number"
                          value={filters.minYear}
                          onChange={(e) => setFilters((prev) => ({ ...prev, minYear: e.target.value }))}
                          placeholder="1960"
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Max Year</label>
                        <input
                          type="number"
                          value={filters.maxYear}
                          onChange={(e) => setFilters((prev) => ({ ...prev, maxYear: e.target.value }))}
                          placeholder="2025"
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Min Price</label>
                        <input
                          type="number"
                          value={filters.minPrice}
                          onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: e.target.value }))}
                          placeholder="$0"
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Max Price</label>
                        <input
                          type="number"
                          value={filters.maxPrice}
                          onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
                          placeholder="Any"
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Engine Type</label>
                      <select
                        value={filters.engineType}
                        onChange={(e) => setFilters((prev) => ({ ...prev, engineType: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white text-sm"
                      >
                        <option value="">All Engines</option>
                        {ENGINE_TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFilters({ query: '', type: 'ALL', make: '', minYear: '', maxYear: '', minPrice: '', maxPrice: '', minTime: '', maxTime: '', engineType: '' })}
                      className="w-full text-xs text-slate-400 hover:text-white"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </details>
            )}
            <button
              onClick={() => setShowForm(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm"
            >
              + Post Listing
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {connectNotice && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-sm px-4 py-2 rounded-lg">
            {connectNotice}
          </div>
        )}
        {showForm && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Create Listing</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            {!session && (
              <div className="bg-slate-700 text-white text-sm rounded-lg px-3 py-2 mb-4">
                Please sign in to post a listing.
              </div>
            )}
            {session && !session.user?.emailVerified && (
              <div className="bg-amber-500/20 border border-amber-500/40 text-amber-200 text-sm rounded-lg px-3 py-2 mb-4">
                Verify your email to publish listings.
              </div>
            )}
            <form onSubmit={handleCreateListing} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Listing Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as ListingType }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  required
                >
                  {LISTING_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  placeholder="e.g., 1978 Piper Archer Share"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Aircraft Type</label>
                <input
                  type="text"
                  value={formData.aircraftType}
                  onChange={(e) => setFormData((prev) => ({ ...prev, aircraftType: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  placeholder="Cessna 182T"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-slate-400 mb-1">Home Airport (ICAO)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.airportIcao}
                    onChange={(e) => setFormData((prev) => ({ ...prev, airportIcao: e.target.value.toUpperCase() }))}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white uppercase"
                    placeholder="KAPA"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleAirportLookup}
                    className="bg-slate-700 text-white px-3 rounded-lg"
                  >
                    Lookup
                  </button>
                </div>
                {airportLookupState === 'loading' && <p className="text-xs text-slate-400">Looking up airport…</p>}
                {airportLookupState === 'error' && <p className="text-xs text-rose-300">Could not find airport.</p>}
                {airportLookup && (
                  <p className="text-xs text-emerald-300">
                    {airportLookup.name} • {airportLookup.city}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Price (USD)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Share Percent</label>
                <input
                  type="number"
                  value={formData.sharePercent}
                  onChange={(e) => setFormData((prev) => ({ ...prev, sharePercent: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Total Hours</label>
                <input
                  type="number"
                  value={formData.hours}
                  onChange={(e) => setFormData((prev) => ({ ...prev, hours: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Contact Method</label>
                <select
                  value={formData.contactMethod}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contactMethod: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="sms">SMS</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Contact Detail</label>
                <input
                  type="text"
                  value={formData.contactValue}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contactValue: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  placeholder="you@example.com"
                />
              </div>
              
              {/* Aircraft-specific fields - show when AIRCRAFT_SALE */}
              {(formData.type === 'AIRCRAFT_SALE') && (
                <>
                  <div className="md:col-span-2 border-t border-slate-700 pt-4 mt-2">
                    <h3 className="text-white font-medium mb-3">Aircraft Details</h3>
                  </div>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">N-Number</label>
                      <input
                        type="text"
                        value={formData.nNumber}
                        onChange={(e) => setFormData((prev) => ({ ...prev, nNumber: e.target.value.toUpperCase() }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white text-sm"
                        placeholder="N123AB"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Make</label>
                      <select
                        value={formData.make}
                        onChange={(e) => setFormData((prev) => ({ ...prev, make: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white text-sm"
                      >
                        <option value="">Select Make</option>
                        {AIRCRAFT_MAKE_OPTIONS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Model</label>
                      <input
                        type="text"
                        value={formData.model}
                        onChange={(e) => setFormData((prev) => ({ ...prev, model: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white text-sm"
                        placeholder="SR22T"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Year</label>
                      <input
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData((prev) => ({ ...prev, year: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white text-sm"
                        placeholder="2018"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Total Time (hrs)</label>
                      <input
                        type="number"
                        value={formData.totalTime}
                        onChange={(e) => setFormData((prev) => ({ ...prev, totalTime: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white text-sm"
                        placeholder="1250"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Engine Time (hrs)</label>
                      <input
                        type="number"
                        value={formData.engineTime}
                        onChange={(e) => setFormData((prev) => ({ ...prev, engineTime: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white text-sm"
                        placeholder="1250"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Fuel Type</label>
                      <select
                        value={formData.fuelType}
                        onChange={(e) => setFormData((prev) => ({ ...prev, fuelType: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white text-sm"
                      >
                        <option value="">Select</option>
                        <option value="100LL">100LL</option>
                        <option value="JetA">Jet A</option>
                        <option value="UL94">UL94</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Registration Type</label>
                      <select
                        value={formData.registrationType}
                        onChange={(e) => setFormData((prev) => ({ ...prev, registrationType: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white text-sm"
                      >
                        <option value="">Select</option>
                        <option value="Standard">Standard</option>
                        <option value="Limited">Limited</option>
                        <option value="Experimental">Experimental</option>
                        <option value="Light Sport">Light Sport</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Seller Type</label>
                      <select
                        value={formData.sellerType}
                        onChange={(e) => setFormData((prev) => ({ ...prev, sellerType: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white text-sm"
                      >
                        <option value="owner">Owner</option>
                        <option value="broker">Broker</option>
                        <option value="dealer">Dealer</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Video URL (YouTube)</label>
                    <input
                      type="url"
                      value={formData.videoUrl}
                      onChange={(e) => setFormData((prev) => ({ ...prev, videoUrl: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white text-sm"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                </>
              )}
              
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-400 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  rows={3}
                  placeholder="Aircraft condition, engine hours, hangar situation, etc."
                />
              </div>
              <div className="md:col-span-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg"
                >
                  {formLoading ? 'Posting…' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center text-slate-400">
            Loading listings…
          </div>
        ) : error ? (
          <div className="bg-rose-500/10 border border-rose-500/50 rounded-2xl p-8 text-center text-rose-200">
            {error}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl p-3">
              <MarketplaceMap
                listings={filteredListings}
                selectedId={selectedListing}
                onSelect={setSelectedListing}
              />
            </div>
            <div className="space-y-3">
              {filteredListings.length === 0 && (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center text-slate-400">
                  No listings match your search yet.
                </div>
              )}
              {filteredListings.map((listing) => (
                <div
                  key={listing.id}
                  className={`bg-slate-800 border rounded-xl p-4 transition-colors ${
                    selectedListing === listing.id ? 'border-emerald-400' : 'border-slate-700'
                  }`}
                  onMouseEnter={() => setSelectedListing(listing.id)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-white font-semibold">{listing.title}</div>
                      <div className="text-xs text-slate-400">
                        {listing.nNumber && <span className="text-emerald-400 mr-2">{listing.nNumber}</span>}
                        {listing.year && <span>{listing.year}</span>}
                        {listing.make && listing.model && <span> • {listing.make} {listing.model}</span>}
                        {listing.aircraftType && !listing.make && <span>{listing.aircraftType}</span>}
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full border border-slate-600 text-slate-300">
                      {LISTING_TYPE_OPTIONS.find((opt) => opt.value === listing.type)?.label}
                    </span>
                  </div>
                  <div className="text-sm text-slate-400 mt-2">
                    {listing.airportIcao} {listing.airportCity ? `• ${listing.airportCity}` : ''}
                  </div>
                  {listing.price && (
                    <div className="text-lg text-white font-semibold mt-1">
                      ${listing.price.toLocaleString()}
                      {listing.sharePercent && <span className="text-sm font-normal text-slate-400"> ({listing.sharePercent}% share)</span>}
                    </div>
                  )}
                  {/* Aircraft-specific info */}
                  {(listing.type === 'AIRCRAFT_SALE' || listing.totalTime) && (
                    <div className="text-xs text-slate-400 mt-1">
                      {listing.totalTime && <span>TT: {listing.totalTime.toLocaleString()} hrs</span>}
                      {listing.engineTime && <span> • Engine: {listing.engineTime.toLocaleString()} hrs</span>}
                      {listing.isVerified && (
                        <span className="ml-2 text-emerald-400">✓ Verified</span>
                      )}
                    </div>
                  )}
                  <p className="text-sm text-slate-300 mt-3 line-clamp-3">
                    {listing.description || 'No description provided.'}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="text-xs text-slate-500">
                      Posted by{' '}
                      <span className="text-slate-300">
                        {listing.user?.id ? (
                          <Link
                            href={`/pilots/${encodeURIComponent(listing.user?.username || listing.user.id)}`}
                            className="hover:underline"
                          >
                            {listing.user?.name || listing.user?.username || 'Pilot'}
                          </Link>
                        ) : (
                          listing.user?.name || listing.user?.username || 'Pilot'
                        )}
                      </span>
                    </div>

                    {listing.user?.id && listing.user.id !== session?.user?.id && (
                      <div className="flex items-center gap-2">
                        {friends.some((f) => f.id === listing.user.id) ? (
                          <button
                            onClick={() => openChatWithUser(listing.user.id)}
                            className="px-3 py-1 rounded-full text-xs bg-emerald-500/20 border border-emerald-400 text-emerald-200"
                          >
                            Chat
                          </button>
                        ) : outgoingRequests.some((req) => req.recipient?.id === listing.user.id) ? (
                          <span className="px-3 py-1 rounded-full text-xs bg-slate-700 text-slate-300">
                            Request Sent
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              if (!session) {
                                signIn();
                                return;
                              }
                              setFriendDraftFor(listing.user.id);
                              setFriendDraftMessage('');
                            }}
                            className="px-3 py-1 rounded-full text-xs bg-slate-700 text-slate-200"
                          >
                            Add Friend
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {friendDraftFor && listing.user?.id === friendDraftFor && (
                    <div className="w-full mt-3 bg-slate-900 border border-slate-700 rounded-xl p-3">
                      <div className="text-xs text-slate-400 mb-2">
                        Optional note (max 3 sentences). Sent encrypted.
                      </div>
                      <textarea
                        value={friendDraftMessage}
                        onChange={(e) => setFriendDraftMessage(e.target.value)}
                        rows={3}
                        placeholder="Hey — interested in connecting about this listing?"
                        className="w-full bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                      />
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div
                          className={`text-xs ${countSentences(friendDraftMessage) > 3 ? 'text-amber-300' : 'text-slate-500'}`}
                        >
                          {countSentences(friendDraftMessage)}/3 sentences
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setFriendDraftFor(null);
                              setFriendDraftMessage('');
                            }}
                            className="px-3 py-1 rounded-full text-xs bg-slate-800 text-slate-300"
                          >
                            Cancel
                          </button>
                          <button
                            disabled={countSentences(friendDraftMessage) > 3}
                            onClick={() => sendFriendRequest(listing.user.id, friendDraftMessage)}
                            className="px-3 py-1 rounded-full text-xs bg-emerald-500/20 border border-emerald-400 text-emerald-200 disabled:opacity-50"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {listing.contactValue && (
                    <div className="mt-3 text-xs text-slate-400">
                      Contact via {listing.contactMethod}: <span className="text-white">{listing.contactValue}</span>
                    </div>
                  )}
                  <div className="text-xs text-slate-500 mt-2">
                    Posted {new Date(listing.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
