'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const demoListings = [
  {
    id: 'demo-1',
    title: 'Rough idle and intermittent magneto drop',
    description: 'Need diagnosis and possible mag inspection. Aircraft grounded.',
    category: 'Engine',
    urgency: 'URGENT',
    aircraftType: 'Cessna 172',
    location: 'KPDK • Atlanta, GA',
  },
  {
    id: 'demo-2',
    title: 'Avionics check for intermittent comms',
    description: 'Garmin 430 intermittent transmit. Looking for inspection.',
    category: 'Avionics',
    urgency: 'NORMAL',
    aircraftType: 'PA-28',
    location: 'KBED • Boston, MA',
  },
  {
    id: 'demo-3',
    title: 'Oil seep near prop governor',
    description: 'Small leak observed after flight. Request inspection.',
    category: 'Airframe',
    urgency: 'HIGH',
    aircraftType: 'Bonanza A36',
    location: 'KSDL • Scottsdale, AZ',
  },
]

export default function MechanicDemoMarketplacePage() {
  return (
    <div className="min-h-screen bg-background p-6 pt-12">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Mechanic Marketplace (Demo)</h1>
          <p className="text-sm text-muted-foreground">Preview demo listings with no login required.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Demo Listings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {demoListings.map((listing) => (
              <div key={listing.id} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{listing.title}</p>
                    <p className="text-xs text-muted-foreground">{listing.location}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{listing.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-[10px]">{listing.category}</Badge>
                      <Badge variant="outline" className="text-[10px]">{listing.urgency}</Badge>
                      <Badge variant="outline" className="text-[10px]">{listing.aircraftType}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
