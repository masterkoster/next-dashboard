import { Plane, ArrowLeft, Heart, Share2 } from "lucide-react"
import Link from "next/link"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-foreground transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to listings</span>
          </Link>
          <div className="hidden h-5 w-px bg-border sm:block" />
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Plane className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-foreground">SkyMarket</span>
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Save listing"
          >
            <Heart className="h-4.5 w-4.5" />
          </button>
          <button
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Share listing"
          >
            <Share2 className="h-4.5 w-4.5" />
          </button>
        </div>
      </nav>
    </header>
  )
}
