'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';

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
  const { data: session } = useSession();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showInquiry, setShowInquiry] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);

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

  async function handleInquiry(e: React.FormEvent) {
    e.preventDefault();
    if (!session) {
      signIn();
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/marketplace/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: id,
          message: inquiryMessage,
          offerAmount: offerAmount || null,
        }),
      });
      if (!res.ok) throw new Error('Failed to send inquiry');
      setInquirySent(true);
      setShowInquiry(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading...</div>;
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-2">{error || 'Listing not found'}</div>
          <Link href="/modules/marketplace" className="text-emerald-400 hover:underline">← Back</Link>
        </div>
      </div>
    );
  }

  const images = listing.images?.length ? listing.images : ['/placeholder-aircraft.jpg'];
  const isOwnListing = listing.user.id === session?.user?.id;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/90 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/modules/marketplace" className="flex items-center gap-2 text-slate-400 hover:text-white">
            <span>←</span><span>Back to Marketplace</span>
          </Link>
          <span className="text-xs text-slate-500 font-mono">#{listing.id.slice(0, 8).toUpperCase()}</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {listing.isVerified && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">✓ Verified</span>
              )}
              {listing.sellerType && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
                  {listing.sellerType.charAt(0).toUpperCase() + listing.sellerType.slice(1)}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold lg:text-3xl">
              {listing.nNumber && <span className="text-emerald-400 mr-2">{listing.nNumber}</span>}
              {listing.year && `${listing.year} `}{listing.make} {listing.model}
            </h1>
            <p className="font-mono text-sm text-slate-400">{listing.aircraftType}</p>
          </div>
          <div className="flex flex-col items-start lg:items-end">
            <span className="text-3xl font-bold lg:text-4xl">${listing.price?.toLocaleString() || 'Call for price'}</span>
            {listing.sharePercent && <span className="text-xs text-slate-400">{listing.sharePercent}% share</span>}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Time', value: listing.totalTime ? `${listing.totalTime.toLocaleString()} hrs` : 'N/A' },
            { label: 'Engine', value: listing.engineTime ? `${listing.engineTime.toLocaleString()} hrs` : 'N/A' },
            { label: 'Prop', value: listing.propTime ? `${listing.propTime.toLocaleString()} hrs` : 'N/A' },
            { label: 'Registration', value: listing.registrationType || 'N/A' },
          ].map((stat, i) => (
            <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <div className="text-xs text-slate-400 mb-1">{stat.label}</div>
              <div className="text-lg font-semibold">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-8">
            {/* Image Gallery */}
            <div className="flex flex-col gap-3">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-800">
                <img src={images[activeImageIndex]} alt="Aircraft" className="w-full h-full object-cover" />
                {images.length > 1 && (
                  <>
                    <button onClick={() => setActiveImageIndex((activeImageIndex - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-slate-900/70 p-2 rounded-full">←</button>
                    <button onClick={() => setActiveImageIndex((activeImageIndex + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900/70 p-2 rounded-full">→</button>
                  </>
                )}
                <div className="absolute bottom-3 right-3 bg-slate-900/70 px-2 py-1 rounded text-xs">{activeImageIndex + 1}/{images.length}</div>
              </div>
              {images.length > 1 && (
                <div className="flex gap-2">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImageIndex(i)} className={`w-1/4 aspect-video rounded-lg overflow-hidden border-2 ${i === activeImageIndex ? 'border-emerald-500' : 'border-slate-800 opacity-60'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            {listing.description && (
              <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                <h2 className="text-lg font-semibold mb-4">Description</h2>
                <p className="text-slate-300 whitespace-pre-wrap">{listing.description}</p>
              </section>
            )}

            {/* Equipment */}
            {(listing.avionics?.length || listing.features?.length || listing.upgrades?.length) && (
              <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                <h2 className="text-lg font-semibold mb-4">Equipment & Features</h2>
                <div className="space-y-4">
                  {listing.avionics?.length && (
                    <div>
                      <div className="text-sm text-slate-400 mb-2">Avionics</div>
                      <div className="flex flex-wrap gap-2">
                        {listing.avionics.map((item, i) => (<span key={i} className="text-xs px-2 py-1 bg-slate-800 rounded-full text-slate-300">{item}</span>))}
                      </div>
                    </div>
                  )}
                  {listing.features?.length && (
                    <div>
                      <div className="text-sm text-slate-400 mb-2">Features</div>
                      <div className="flex flex-wrap gap-2">
                        {listing.features.map((item, i) => (<span key={i} className="text-xs px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-300">{item}</span>))}
                      </div>
                    </div>
                  )}
                  {listing.upgrades?.length && (
                    <div>
                      <div className="text-sm text-slate-400 mb-2">Upgrades</div>
                      <div className="flex flex-wrap gap-2">
                        {listing.upgrades.map((item, i) => (<span key={i} className="text-xs px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300">{item}</span>))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-6 lg:sticky lg:top-20 lg:self-start">
            {/* Contact Card */}
            <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-lg font-semibold mb-4">Contact Seller</h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-emerald-500/10 flex items-center justify-center font-semibold text-emerald-400">
                  {listing.user.name?.[0] || listing.user.username?.[0] || '?'}
                </div>
                <div>
                  <p className="font-semibold">{listing.user.name || listing.user.username}</p>
                  <p className="text-xs text-slate-400">{listing.sellerType || 'Seller'}</p>
                </div>
              </div>
              
              {isOwnListing ? (
                <div className="text-slate-400 text-sm">This is your listing.</div>
              ) : inquirySent ? (
                <div className="text-emerald-400 text-sm">✓ Inquiry sent!</div>
              ) : showInquiry ? (
                <form onSubmit={handleInquiry} className="space-y-3">
                  <textarea value={inquiryMessage} onChange={(e) => setInquiryMessage(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" rows={4} placeholder="I'm interested..." required />
                  <input type="number" value={offerAmount} onChange={(e) => setOfferAmount(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" placeholder="Offer amount (optional)" />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowInquiry(false)} className="flex-1 py-2 bg-slate-800 rounded-lg text-sm">Cancel</button>
                    <button type="submit" disabled={submitting} className="flex-1 py-2 bg-emerald-500 rounded-lg text-sm disabled:opacity-50">{submitting ? 'Sending...' : 'Send'}</button>
                  </div>
                </form>
              ) : (
                <div className="space-y-2">
                  <button onClick={() => setShowInquiry(true)} className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 rounded-lg font-medium">Contact Seller</button>
                  <button onClick={() => setShowInquiry(true)} className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-lg">Make an Offer</button>
                </div>
              )}
            </section>

            {/* Location Card */}
            <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-lg font-semibold mb-4">Location</h2>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="font-mono">{listing.airportIcao}</span>
                {listing.airportName && <span>• {listing.airportName}</span>}
              </div>
              {listing.airportCity && <p className="text-sm text-slate-400 mt-1">{listing.airportCity}</p>}
            </section>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800 bg-slate-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-6">
          <p className="text-xs text-slate-500">AviationHub Marketplace</p>
          <p className="text-xs text-slate-500">#{listing.id.slice(0, 8).toUpperCase()}</p>
        </div>
      </footer>
    </div>
  );
}
