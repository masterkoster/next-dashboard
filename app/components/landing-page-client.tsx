import { LandingNavbar } from "@/components/landing/landing-navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturedListings } from "@/components/landing/featured-listings"
import { CategoriesSection } from "@/components/landing/categories-section"
import { WhySection } from "@/components/landing/why-section"
import { SellCtaSection } from "@/components/landing/sell-cta-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { FooterSection } from "@/components/landing/footer-section"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNavbar />
      <main>
        <HeroSection />
        <FeaturedListings />
        <SellCtaSection />
        <CategoriesSection />
        <WhySection />
        <TestimonialsSection />
      </main>
      <FooterSection />
    </div>
  )
}
