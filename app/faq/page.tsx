'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Plane, Mail } from 'lucide-react';

const faqs = [
  {
    question: "What is AviationHub?",
    answer: "AviationHub is a comprehensive flight planning and management platform designed for pilots. It provides tools for route planning, fuel tracking, aircraft management, flight logging, and more."
  },
  {
    question: "Is AviationHub free to use?",
    answer: "AviationHub offers both free and premium tiers. The free tier includes basic flight planning features, while Pro members get access to advanced features like real-time fuel prices, weather overlays, and unlimited flight logging."
  },
  {
    question: "How do I create a flight plan?",
    answer: "Navigate to the Flight Planner module, search for your departure and arrival airports, add them to your route, and customize settings like cruise altitude and aircraft type. You can then save or export your flight plan."
  },
  {
    question: "Can I import flight plans from other apps?",
    answer: "Yes! AviationHub supports importing flight plans in GPX, FPL, and JSON formats from popular apps like ForeFlight, Garmin Pilot, and flightplandatabase.com."
  },
  {
    question: "How do I track my flight hours?",
    answer: "Use the Logbook module to log your flights manually, or connect your account to sync with supported flight tracking services. All logged hours are automatically saved and can be exported for FAA record-keeping."
  },
  {
    question: "What aircraft types are supported?",
    answer: "AviationHub supports a wide variety of general aviation aircraft including Cessna, Piper, Diamond, Cirrus, and Beechcraft models. You can also create custom aircraft profiles with specific performance data."
  },
  {
    question: "How accurate are the fuel prices?",
    answer: "Fuel prices are sourced from multiple providers and updated regularly. However, we always recommend verifying fuel prices with official FBO sources before your flight, as prices can change frequently."
  },
  {
    question: "Can I use AviationHub offline?",
    answer: "Some features like saved flight plans and aircraft profiles work offline. However, features requiring live data (weather, fuel prices, NOTAMs) need an active internet connection."
  },
  {
    question: "How do I join a Flying Club?",
    answer: "Flying Clubs can invite members via email. If you've received an invitation, check your email for a signup link, or ask the club administrator to send you an invite."
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we take data security seriously. All data is encrypted in transit and at rest. We never share your personal flight data with third parties without your explicit consent."
  },
  {
    question: "How do I report a bug or request a feature?",
    answer: "Go to the Support page to submit a bug report or feature request. You can also email us directly at support@aviationhub.com."
  },
  {
    question: "What's the difference between Free and Pro?",
    answer: "Pro members get: unlimited flight logging, real-time fuel prices, weather overlays on maps, priority support, and early access to new features. Free users get essential flight planning tools with basic functionality."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
          <p className="mt-2 text-muted-foreground">
            Find answers to common questions about AviationHub
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
              >
                <span className="font-medium pr-4">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-4 pb-4 pt-0">
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 rounded-2xl border border-border bg-card p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">Still have questions?</h2>
          <p className="mt-1 text-muted-foreground mb-4">
            Can't find the answer you're looking for? We're here to help.
          </p>
          <a
            href="/support"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Contact Support
          </a>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <a href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
