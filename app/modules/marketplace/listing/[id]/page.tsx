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
  user: {
    id: string;
    name: string | null;
    username: string | null;
  };
}

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
      setError('Failed to load listing');
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
