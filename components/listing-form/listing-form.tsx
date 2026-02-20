"use client"

import { useState } from "react"
import {
  ArrowLeft,
  Plane,
  DollarSign,
  Clock,
  Gauge,
  Settings,
  Fuel,
  FileText,
  Tag,
  ImageIcon,
  Send,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { FormSection } from "./form-section"
import { TagInput } from "./tag-input"
import { ImageUpload } from "./image-upload"

const AIRCRAFT_CATEGORIES = [
  "Single Engine Piston",
  "Multi Engine Piston",
  "Turboprop",
  "Light Jet",
  "Midsize Jet",
  "Heavy Jet",
  "Helicopter",
  "Experimental",
  "Light Sport",
  "Glider",
  "Warbird",
]

const FUEL_TYPES = ["100LL (AVGAS)", "Jet-A", "MOGAS", "Diesel", "Electric"]

const REGISTRATION_CATEGORIES = ["Standard", "Experimental", "Restricted", "Limited", "Provisional"]

const AIRWORTHINESS_STATUS = ["Current", "Expired", "Pending Inspection"]

export function ListingForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState("")
  const [price, setPrice] = useState("")
  const [acceptOffers, setAcceptOffers] = useState(false)
  const [category, setCategory] = useState("")
  const [year, setYear] = useState("")
  const [totalTime, setTotalTime] = useState("")
  const [engineTime, setEngineTime] = useState("")
  const [propTime, setPropTime] = useState("")
  const [registration, setRegistration] = useState("")
  const [airworthiness, setAirworthiness] = useState("")
  const [fuelType, setFuelType] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [avionics, setAvionics] = useState<string[]>([])
  const [features, setFeatures] = useState<string[]>([])
  const [upgrades, setUpgrades] = useState<string[]>([])
  const [images, setImages] = useState<string[]>([])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/marketplace/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'AIRCRAFT_SALE',
          title,
          aircraftType: category,
          airportIcao: location.toUpperCase(),
          price: parseInt(price.replace(/,/g, '')),
          year: parseInt(year),
          totalTime: parseInt(totalTime.replace(/,/g, '')) || 0,
          engineTime: parseInt(engineTime.replace(/,/g, '')) || 0,
          propTime: parseInt(propTime.replace(/,/g, '')) || 0,
          registrationType: registration,
          airworthiness,
          fuelType,
          description,
          avionics,
          features,
          upgrades,
          make: title.split(' ')[0] || null,
          model: title.split(' ').slice(1).join(' ') || null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/modules/marketplace/listing/${data.listing.id}`)
      } else {
        const error = await response.json()
        console.error('Failed to create listing:', error.error || 'Unknown error')
        alert('Failed to create listing: ' + (error.error || 'Please try again'))
      }
    } catch (error) {
      console.error('Error creating listing:', error)
      alert('Error creating listing. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => router.push('/modules/marketplace')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-300 w-fit"
        >
          <ArrowLeft className="size-4" />
          Back to Marketplace
        </button>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance lg:text-3xl">
            Create New Listing
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Fill out the details below to list your aircraft on SkyMarket.
          </p>
        </div>
      </div>

      {/* Aircraft Details */}
      <Card id="basic-info" className="border-border bg-card scroll-mt-32">
        <CardContent className="flex flex-col gap-8">
          <FormSection
            title="Aircraft Details"
            description="Basic information about the aircraft."
          >
            <div className="flex flex-col gap-5">
              {/* Title */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="title" className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Plane className="size-4 text-primary" />
                  Listing Title
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. 2015 Cessna 172S"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Year + Category row */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="year" className="text-sm font-medium text-foreground">
                    Year
                  </Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="e.g. 2015"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    min={1900}
                    max={2030}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="category" className="text-sm font-medium text-foreground">
                    Aircraft Category
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category" className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {AIRCRAFT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="location" className="text-sm font-medium text-foreground">
                  Location (Airport Code)
                </Label>
                <Input
                  id="location"
                  placeholder="e.g. KSDL"
                  value={location}
                  onChange={(e) => setLocation(e.target.value.toUpperCase())}
                  maxLength={4}
                />
              </div>
            </div>
          </FormSection>

          <Separator className="bg-border" />

          {/* Pricing */}
          <FormSection
            title="Pricing"
            description="Set the asking price for your aircraft."
          >
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="price" className="text-sm font-medium text-foreground flex items-center gap-2">
                  <DollarSign className="size-4 text-primary" />
                  Asking Price (USD)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-mono">$</span>
                  <Input
                    id="price"
                    type="text"
                    inputMode="numeric"
                    placeholder="45,000"
                    value={price}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9,]/g, "")
                      setPrice(val)
                    }}
                    className="pl-7 font-mono"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="accept-offers"
                  checked={acceptOffers}
                  onCheckedChange={setAcceptOffers}
                />
                <Label htmlFor="accept-offers" className="text-sm text-foreground cursor-pointer">
                  Accept offers from buyers
                </Label>
              </div>
            </div>
          </FormSection>

          <Separator className="bg-border" />

          {/* Times & Status */}
          <FormSection
            title="Times & Status"
            description="Engine hours, airframe time, and airworthiness details."
          >
            <div className="flex flex-col gap-5">
              {/* Hours row */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="totalTime" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Clock className="size-4 text-primary" />
                    Total Time
                  </Label>
                  <div className="relative">
                    <Input
                      id="totalTime"
                      type="number"
                      placeholder="2,150"
                      value={totalTime}
                      onChange={(e) => setTotalTime(e.target.value)}
                      className="pr-14"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                      TTSN
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="engineTime" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Gauge className="size-4 text-primary" />
                    Engine Time
                  </Label>
                  <div className="relative">
                    <Input
                      id="engineTime"
                      type="number"
                      placeholder="450"
                      value={engineTime}
                      onChange={(e) => setEngineTime(e.target.value)}
                      className="pr-14"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                      SMOH
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="propTime" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Settings className="size-4 text-primary" />
                    Prop Time
                  </Label>
                  <div className="relative">
                    <Input
                      id="propTime"
                      type="number"
                      placeholder="450"
                      value={propTime}
                      onChange={(e) => setPropTime(e.target.value)}
                      className="pr-14"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                      SPOH
                    </span>
                  </div>
                </div>
              </div>

              {/* Status row */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="registration" className="text-sm font-medium text-foreground">
                    Registration
                  </Label>
                  <Select value={registration} onValueChange={setRegistration}>
                    <SelectTrigger id="registration" className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {REGISTRATION_CATEGORIES.map((reg) => (
                        <SelectItem key={reg} value={reg}>{reg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="airworthiness" className="text-sm font-medium text-foreground">
                    Airworthiness
                  </Label>
                  <Select value={airworthiness} onValueChange={setAirworthiness}>
                    <SelectTrigger id="airworthiness" className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {AIRWORTHINESS_STATUS.map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="fuelType" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Fuel className="size-4 text-primary" />
                    Fuel Type
                  </Label>
                  <Select value={fuelType} onValueChange={setFuelType}>
                    <SelectTrigger id="fuelType" className="w-full">
                      <SelectValue placeholder="Select fuel" />
                    </SelectTrigger>
                    <SelectContent>
                      {FUEL_TYPES.map((fuel) => (
                        <SelectItem key={fuel} value={fuel}>{fuel}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </FormSection>
        </CardContent>
      </Card>

      {/* Description */}
      <Card id="specifications" className="border-border bg-card scroll-mt-32">
        <CardContent>
          <FormSection
            title="Description"
            description="Write a detailed description to attract potential buyers."
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="description" className="text-sm font-medium text-foreground flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                Listing Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your aircraft, its history, maintenance records, and what makes it a great buy..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[160px]"
              />
              <p className="text-xs text-muted-foreground">
                {description.length}/2000 characters
              </p>
            </div>
          </FormSection>
        </CardContent>
      </Card>

      {/* Equipment */}
      <Card id="specifications" className="border-border bg-card scroll-mt-32">
        <CardContent className="flex flex-col gap-8">
          <FormSection
            title="Equipment"
            description="Add avionics, features, and upgrades. Press Enter after each item."
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Tag className="size-4 text-primary" />
                  Avionics
                </Label>
                <TagInput
                  tags={avionics}
                  onTagsChange={setAvionics}
                  placeholder="e.g. Garmin G1000"
                />
              </div>

              <Separator className="bg-border" />

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Tag className="size-4 text-primary" />
                  Features
                </Label>
                <TagInput
                  tags={features}
                  onTagsChange={setFeatures}
                  placeholder="e.g. Well Maintained"
                />
              </div>

              <Separator className="bg-border" />

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Tag className="size-4 text-primary" />
                  Upgrades
                </Label>
                <TagInput
                  tags={upgrades}
                  onTagsChange={setUpgrades}
                  placeholder="e.g. LED Landing Lights"
                />
              </div>
            </div>
          </FormSection>
        </CardContent>
      </Card>

      {/* Images */}
      <Card id="photos" className="border-border bg-card scroll-mt-32">
        <CardContent>
          <FormSection
            title="Photos"
            description="Upload high-quality images of your aircraft. The first image will be used as the cover."
          >
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                <ImageIcon className="size-4 text-primary" />
                Aircraft Images
              </Label>
              <ImageUpload images={images} onImagesChange={setImages} />
            </div>
          </FormSection>
        </CardContent>
      </Card>

      {/* Submit */}
      <div id="review" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between scroll-mt-32">
        <p className="text-xs text-muted-foreground leading-relaxed">
          By submitting, you confirm the accuracy of the details provided.
        </p>
        <div className="flex gap-3">
          <Button type="button" variant="outline" className="border-border">
            Save as Draft
          </Button>
          <Button type="submit" className="gap-2" disabled={isSubmitting}>
            <Send className="size-4" />
            {isSubmitting ? "Publishing..." : "Publish Listing"}
          </Button>
        </div>
      </div>
    </form>
  )
}
