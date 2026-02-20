"use client"

import { useState } from "react"
import { Calendar, User, ChevronDown, ChevronUp } from "lucide-react"

interface DescriptionSectionProps {
  description?: string | null;
  createdAt?: string;
  sellerName?: string | null;
}

export function DescriptionSection({ description, createdAt, sellerName }: DescriptionSectionProps) {
  const [expanded, setExpanded] = useState(false)

  const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently';

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-foreground">Description</h2>

      <div className={`relative mt-4 ${!expanded ? "max-h-36 overflow-hidden" : ""}`}>
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          {description ? (
            <p>{description}</p>
          ) : (
            <p>No description provided.</p>
          )}
        </div>
        {!expanded && description && description.length > 300 && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent" />
        )}
      </div>

      {description && description.length > 300 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          {expanded ? (
            <>
              Show less <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Read more <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      )}

      {/* Meta Info */}
      <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-border pt-5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          Listed on {formattedDate}
        </span>
        {sellerName && (
          <span className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            Posted by {sellerName}
          </span>
        )}
      </div>
    </section>
  )
}
