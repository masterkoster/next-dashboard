'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession, signIn } from 'next-auth/react';
import dynamic from 'next/dynamic';

const MarketplaceMap = dynamic(() => import('./MarketplaceMap'), { ssr: false });

type ListingType = 'FOR_SALE' | 'SHARE_SELL' | 'SHARE_WANTED';

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
];

export default function MarketplacePage() {
  const { data: session, status } = useSession();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ query: '', type: 'ALL' as 'ALL' | ListingType });
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [formLoading, setFormLoading] = useState(false);
  const [airportLookup, setAirportLookup] = useState<AirportLookup | null>(null);
  const [airportLookupState, setAirportLookupState] = useState<'idle' | 'loading' | 'error'>('idle');

  useEffect(() => {
    loadListings();
  }, []);

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
      const res = await fetch('/api/marketplace/listings');
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
    <div className="min-h-screen bg-slate-900">
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
                      <div className="text-xs text-slate-400">{listing.aircraftType}</div>
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
                    </div>
                  )}
                  {listing.sharePercent && (
                    <div className="text-xs text-slate-400">Share: {listing.sharePercent}%</div>
                  )}
                  <p className="text-sm text-slate-300 mt-3 line-clamp-3">
                    {listing.description || 'No description provided.'}
                  </p>
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
