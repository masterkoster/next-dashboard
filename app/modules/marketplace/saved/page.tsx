import { Suspense } from 'react'
import Link from 'next/link'
import { Heart, Plane, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SavedListingsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/modules/marketplace" className="hover:text-primary transition-colors">
              Marketplace
            </Link>
            <span>/</span>
            <span className="text-foreground">Saved Listings</span>
          </div>
          <h1 className="text-3xl font-bold">Saved Listings</h1>
          <p className="text-muted-foreground mt-2">
            Aircraft you&apos;ve saved for later
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No saved listings yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Browse aircraft listings and click the heart icon to save your favorites.
          </p>
          <Link href="/modules/marketplace">
            <Button className="gap-2">
              <Plane className="w-4 h-4" />
              Browse Listings
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
