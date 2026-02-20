'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

// Import v0 components
import { ListingHeader } from '@/components/aircraft/listing-header';
import { QuickStats } from '@/components/aircraft/quick-stats';
import { ImageGallery } from '@/components/aircraft/image-gallery';
import { EquipmentSection } from '@/components/aircraft/equipment-section';
import { LocationCard } from '@/components/aircraft/location-card';
import { ContactSection } from '@/components/aircraft/contact-section';

interface Listing {
  id: string;
  type: string;
  title: string;
  description: string | null;
  aircraftType: string;
  airportIcao: string;
  airportName: string | null;
  airportCity: string | null;
  price: number | null;
  sharePercent: number | null;
  images: string[];
  nNumber: string | null;
  make: string | null;
  model: string | null;
  year: number | null;
  totalTime: number | null;
  engineTime: number | null;
  propTime: number | null;
  registrationType: string | null;
  airworthiness: string | null;
  fuelType: string | null;
  avionics: string[] | null;
  features: string[] | null;
  upgrades: string[] | null;
  sellerType: string | null;
  isVerified: boolean | null;
  status?: string;
  createdAt?: string;
  user: {
    id: string;
    name: string | null;
    username: string | null;
  };
}

// Demo data for listing detail page
const DEMO_LISTINGS_DETAIL: Record<string, Listing> = {
  '1': {
    id: '1',
    type: 'AIRCRAFT_SALE',
    title: '2018 Cirrus SR22T GTS',
    description: 'Exceptional SR22T with GTS package, CAPS, Airbag, FIKI, and full de-ice. This aircraft has been meticulously maintained with all logs available. Features include:\n\n• Garmin Perspective+ Avionics Suite\n• GFC 700 Autopilot\n• CAPS (Cirrus Airframe Parachute System)\n• Airbag Seatbelts\n• FIKI (Flight Into Known Ice)\n• Full De-Ice System\n• Heated Seats\n• TKS Known Ice Protection\n\nFresh annual completed December 2025. Always hangared. No damage history.',
    aircraftType: 'SR22T',
    airportIcao: 'KDVT',
    airportName: 'Phoenix Deer Valley',
    airportCity: 'Phoenix, AZ',
    price: 725000,
    sharePercent: null,
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
    avionics: ['Garmin Perspective+', 'GFC 700 Autopilot', 'GDL 69A XM Weather', 'GTX 345 ADS-B In/Out', 'GTS 825 TAS', 'GMA 350c Audio Panel', 'Synthetic Vision (SVT)', 'SafeTaxi'],
    features: ['Air Conditioning', 'TKS Known Ice', 'CAPS Parachute', 'Heated Seats', 'Premium Leather Interior', 'USB Charging Ports', 'CO Detector', 'Oxygen System'],
    upgrades: ['Enhanced Vision System (EVS)', 'LED Landing Lights', 'Premium Paint Scheme', 'Bose A20 Headsets (4)', 'Tanis Engine Heater'],
    user: { id: 'user1', name: 'Cirrus Aviation Partners', username: 'cirrusav' },
    images: ['https://images.unsplash.com/photo-1559627755-0b42f3014507?w=800&q=80'],
  },
  '2': {
    id: '2',
    type: 'FOR_SALE',
    title: '1978 Piper Archer II',
    description: 'Well maintained, fresh annual, hangared. Always hangared since new. Complete logs from new. Recently upgraded with modern avionics.',
    aircraftType: 'PA-28-181',
    airportIcao: 'KAPA',
    airportName: 'Centennial Airport',
    airportCity: 'Denver, CO',
    price: 165000,
    sharePercent: null,
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
    avionics: ['Garmin G500', 'GTX 327 Transponder', 'GMA 340 Audio Panel'],
    features: ['Hangared', 'Fresh Annual', 'Complete Logs'],
    upgrades: ['New Paint (2023)', 'New Interior (2022)'],
    user: { id: 'user2', name: 'Denver Aviation', username: 'denav' },
    images: ['https://images.unsplash.com/photo-1540962351504-03099e0a778a?w=800&q=80'],
  },
  '3': {
    id: '3',
    type: 'SHARE_SELL',
    title: 'C172 Partnership - 25% Share',
    description: 'Great opportunity to join a well-maintained C172 at KSDL. Perfect for students and cross-country training. Monthly costs are approximately $450/month which covers hangar, insurance, and maintenance reserve.',
    aircraftType: 'Cessna 172S',
    airportIcao: 'KSDL',
    airportName: 'Scottsdale Airport',
    airportCity: 'Scottsdale, AZ',
    price: 45000,
    sharePercent: 25,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    nNumber: null,
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
    avionics: ['Garmin G1000', 'GFC 700 Autopilot'],
    features: ['Well Maintained', 'Perfect for Training', 'Low Monthly Costs'],
    upgrades: [],
    user: { id: 'user3', name: 'Desert Flyers Club', username: 'desertflyers' },
    images: ['https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=800&q=80'],
  },
  '4': {
    id: '4',
    type: 'AIRCRAFT_SALE',
    title: '2020 Diamond DA40 NG',
    description: 'Brand new Diamond DA40 NG with G1000 NXi, FIKI, and full de-ice. Low hours, excellent condition. Manufacturer warranty still valid.',
    aircraftType: 'DA40',
    airportIcao: 'KORD',
    airportName: "Chicago O'Hare International",
    airportCity: 'Chicago, IL',
    price: 485000,
    sharePercent: null,
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
    avionics: ['Garmin G1000 NXi', 'GFC 500 Autopilot', 'GTX 345 ADS-B'],
    features: ['FIKI', 'Full De-Ice', 'Low Hours', 'Warranty'],
    upgrades: ['G1000 NXi Upgrade'],
    user: { id: 'user4', name: 'Midwest Aviation', username: 'mwav' },
    images: ['https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=800&q=80'],
  },
  '5': {
    id: '5',
    type: 'FOR_SALE',
    title: '1967 Beechcraft Bonanza V35',
    description: 'Classic V-tail Bonanza with recent renovation. New paint, interior, and avionics upgrade. Great flying aircraft with classic lines.',
    aircraftType: 'V35',
    airportIcao: 'KSNA',
    airportName: 'John Wayne Airport',
    airportCity: 'Santa Ana, CA',
    price: 285000,
    sharePercent: null,
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
    avionics: ['Garmin GTN 650', 'G5 EI', 'PS Engineering Audio'],
    features: ['New Paint', 'New Interior', 'Classic V-Tail'],
    upgrades: ['Engine Upgrade', 'Avionics Upgrade'],
    user: { id: 'user5', name: 'West Coast Aircraft', username: 'wca' },
    images: ['https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=80'],
  },
};

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadListing();
  }, [id]);

  async function loadListing() {
    try {
      const res = await fetch(`/api/marketplace/listings/${id}`);
      if (!res.ok) throw new Error('Listing not found');
      const data = await res.json();
      setListing(data.listing);
    } catch (err) {
      // Fall back to demo data if API fails
      if (DEMO_LISTINGS_DETAIL[id]) {
        setListing(DEMO_LISTINGS_DETAIL[id]);
      } else {
        setError('Listing not found');
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-2">{error || 'Listing not found'}</div>
          <Link href="/modules/marketplace" className="text-primary hover:underline">← Back</Link>
        </div>
      </div>
    );
  }

  const images = listing.images?.length ? listing.images : ['/placeholder-aircraft.jpg'];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
          <Link href="/modules/marketplace" className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground">
            <span>←</span>
            <span>Back to Marketplace</span>
          </Link>
          <span className="font-mono text-xs">#{listing.id.slice(0, 8).toUpperCase()}</span>
        </div>

        {/* Title Section - Using v0 ListingHeader */}
        <ListingHeader 
          title={`${listing.year ? `${listing.year} ` : ''}${listing.make || ''} ${listing.model || ''}`.trim() || listing.title}
          nNumber={listing.nNumber}
          price={listing.price}
          isVerified={listing.isVerified}
          sellerType={listing.sellerType}
        />

        {/* Quick Stats - Using v0 QuickStats */}
        <div className="mt-6">
          <QuickStats 
            totalTime={listing.totalTime}
            engineTime={listing.engineTime}
            propTime={listing.propTime}
            registrationType={listing.registrationType}
            airworthiness={listing.airworthiness}
            fuelType={listing.fuelType}
            aircraftType={listing.aircraftType}
            year={listing.year}
            make={listing.make}
          />
        </div>

        {/* Main Content */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-8">
            {/* Image Gallery - Using v0 component */}
            <ImageGallery images={images} />

            {/* Description */}
            {listing.description && (
              <section className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold text-foreground">Description</h2>
                <p className="mt-4 text-muted-foreground whitespace-pre-wrap">{listing.description}</p>
              </section>
            )}

            {/* Equipment - Using v0 component */}
            {(listing.avionics?.length || listing.features?.length || listing.upgrades?.length) && (
              <EquipmentSection 
                avionics={listing.avionics}
                features={listing.features}
                upgrades={listing.upgrades}
              />
            )}
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-6 lg:sticky lg:top-20 lg:self-start">
            {/* Contact Card - Using v0 component */}
            <ContactSection 
              sellerName={listing.user.name || listing.user.username || "Seller"}
              sellerType={listing.sellerType}
            />

            {/* Location Card - Using v0 component */}
            <LocationCard 
              airportIcao={listing.airportIcao}
              airportName={listing.airportName}
              airportCity={listing.airportCity}
            />
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-border bg-card">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-6">
          <p className="text-xs text-muted-foreground">AviationHub Marketplace</p>
          <p className="text-xs text-muted-foreground font-mono">#{listing.id.slice(0, 8).toUpperCase()}</p>
        </div>
      </footer>
    </div>
  );
}
