"use client"

import { Phone, Mail, MessageSquare, Send } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ContactSectionProps {
  sellerName?: string | null;
  sellerType?: string | null;
  phone?: string | null;
  email?: string | null;
  onContact?: () => void;
  onMakeOffer?: () => void;
}

export function ContactSection({ 
  sellerName = "Seller", 
  sellerType = "Private", 
  phone, 
  email,
  onContact,
  onMakeOffer
}: ContactSectionProps) {
  const initials = sellerName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-foreground">Contact Seller</h2>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
          {initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{sellerName}</p>
          <p className="text-xs text-muted-foreground">{sellerType === 'DEALER' ? 'Authorized Dealer' : 'Private Seller'}</p>
        </div>
      </div>

      <div className="mt-5 space-y-2.5">
        <Button 
          className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90" 
          size="lg"
          onClick={onContact}
        >
          <MessageSquare className="h-4 w-4" />
          Contact Seller
        </Button>
        <Button
          variant="outline"
          className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
          size="lg"
          onClick={onMakeOffer}
        >
          <Send className="h-4 w-4" />
          Make an Offer
        </Button>
      </div>

      <div className="mt-5 space-y-3 border-t border-border pt-5">
        {phone && (
          <a
            href={`tel:${phone}`}
            className="flex items-center gap-3 rounded-lg p-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Phone className="h-4 w-4 text-primary" />
            {phone}
          </a>
        )}
        {email && (
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-3 rounded-lg p-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Mail className="h-4 w-4 text-primary" />
            {email}
          </a>
        )}
      </div>
    </section>
  )
}
