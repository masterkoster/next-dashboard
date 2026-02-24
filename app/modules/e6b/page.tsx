/**
 * @fileoverview E6B Flight Computer module
 * @description Aviation E6B calculator with wind correction, fuel, TAS, and conversions
 * @module modules/e6b
 */

'use client'

import { useState } from 'react'
import { Calculator, Wind, Fuel, Gauge, ArrowRightLeft, HelpCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

/**
 * E6B Calculator modes
 */
type E6BMode = 'wind' | 'fuel' | 'speed' | 'convert'

/**
 * Wind calculation result
 */
interface WindResult {
  gs: number
  track: number
  correction: number
}

/**
 * Fuel calculation result
 */
interface FuelResult {
  fuel: number
  endurance: number
}

/**
 * E6B Flight Computer Page
 * Provides wind correction, fuel burn, true airspeed, and unit conversions
 */
export default function E6BPage() {
  const [mode, setMode] = useState<E6BMode>('wind')
  
  // Wind components
  const [tas, setTas] = useState(120)
  const [heading, setHeading] = useState(360)
  const [windDir, setWindDir] = useState(270)
  const [windSpeed, setWindSpeed] = useState(15)
  const [windResult, setWindResult] = useState<WindResult | null>(null)
  
  // Fuel
  const [fuelBurn, setFuelBurn] = useState(8.5)
  const [flightTime, setFlightTime] = useState(2.5)
  const [fuelResult, setFuelResult] = useState<FuelResult | null>(null)
  
  // Speed
  const [ias, setIas] = useState(100)
  const [altitude, setAltitude] = useState(6500)
  const [temp, setTemp] = useState(15)
  const [tasResult, setTasResult] = useState<number | null>(null)
  
  // Conversions
  const [convertFrom, setConvertFrom] = useState('nm')
  const [convertValue, setConvertValue] = useState(100)
  const [convertResult, setConvertResult] = useState<Record<string, number> | null>(null)

  // Calculate wind correction
  const calculateWind = () => {
    const headingRad = (heading * Math.PI) / 180
    const windRad = (windDir * Math.PI) / 180
    
    const windFrom = windRad + Math.PI
    const wx = windSpeed * Math.cos(windFrom)
    const wy = windSpeed * Math.sin(windFrom)
    
    const gsx = tas * Math.cos(headingRad) - wx
    const gsy = tas * Math.sin(headingRad) - wy
    
    const gs = Math.sqrt(gsx * gsx + gsy * gsy)
    const track = ((Math.atan2(gsy, gsx) * 180) / Math.PI + 360) % 360
    const correction = track - heading
    
    setWindResult({ gs: Math.round(gs), track: Math.round(track), correction: Math.round(correction) })
  }

  // Calculate fuel
  const calculateFuel = () => {
    const fuel = fuelBurn * flightTime
    const endurance = 48 / fuelBurn // Assuming 48 gal usable
    setFuelResult({ fuel: Math.round(fuel * 10) / 10, endurance: Math.round(endurance * 10) / 10 })
  }

  // Calculate TAS from IAS
  const calculateTAS = () => {
    const isaTemp = 15 - (altitude / 1000) * 2
    const oat = temp || isaTemp
    const deltaT = oat - isaTemp
    const mach = ias / 661.47
    const tas = Math.round(ias * (1 + 0.2 * Math.pow(mach, 2) + deltaT * 0.004))
    setTasResult(tas)
  }

  // Unit conversions
  const calculateConversions = () => {
    const v = convertValue
    const results: Record<string, number> = {}
    
    if (convertFrom === 'nm') {
      results['NM'] = v
      results['SM'] = Math.round(v * 1.15078)
      results['KM'] = Math.round(v * 1.852)
      results['MI'] = Math.round(v * 1852)
    } else if (convertFrom === 'sm') {
      results['NM'] = Math.round(v * 0.868976)
      results['SM'] = v
      results['KM'] = Math.round(v * 1.60934)
      results['MI'] = v * 1609.34
    } else if (convertFrom === 'gal') {
      results['Gal'] = v
      results['L'] = Math.round(v * 3.78541)
      results['Lbs'] = Math.round(v * 6)
    } else if (convertFrom === 'lbs') {
      results['Lbs'] = v
      results['Kg'] = Math.round(v * 0.453592)
      results['Gal'] = Math.round(v / 6 * 10) / 10
    } else if (convertFrom === 'f') {
      results['°F'] = v
      results['°C'] = Math.round((v - 32) * 5 / 9)
      results['K'] = Math.round((v - 32) * 5 / 9 + 273.15)
    } else if (convertFrom === 'ft') {
      results['ft'] = v
      results['m'] = Math.round(v * 0.3048)
      results['FL'] = Math.round(v / 100)
    }
    
    setConvertResult(results)
  }

  // Mode tabs configuration
  const modes = [
    { id: 'wind', label: 'Wind', icon: Wind },
    { id: 'fuel', label: 'Fuel', icon: Fuel },
    { id: 'speed', label: 'TAS', icon: Gauge },
    { id: 'convert', label: 'Convert', icon: ArrowRightLeft },
  ]

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
            <Calculator className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">E6B Flight Computer</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Essential aviation calculations
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-2 mb-4">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id as E6BMode)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                mode === m.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <m.icon className="w-4 h-4" />
              {m.label}
            </button>
          ))}
        </div>

        <Card>
          <CardContent className="p-4 space-y-4">
            {/* Wind Mode */}
            {mode === 'wind' && (
              <>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="tas" className="text-xs">True Airspeed (kts)</Label>
                    <Input
                      id="tas"
                      type="number"
                      value={tas}
                      onChange={(e) => setTas(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="heading" className="text-xs">Heading (°)</Label>
                    <Input
                      id="heading"
                      type="number"
                      value={heading}
                      onChange={(e) => setHeading(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="windDir" className="text-xs">Wind From (°)</Label>
                      <Input
                        id="windDir"
                        type="number"
                        value={windDir}
                        onChange={(e) => setWindDir(Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="windSpeed" className="text-xs">Wind Speed (kts)</Label>
                      <Input
                        id="windSpeed"
                        type="number"
                        value={windSpeed}
                        onChange={(e) => setWindSpeed(Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
                <Button onClick={calculateWind} className="w-full">
                  Calculate
                </Button>
                {windResult && (
                  <div className="bg-muted rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ground Speed:</span>
                      <span className="font-bold">{windResult.gs} kts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Track:</span>
                      <span className="font-bold">{windResult.track}°</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Wind Correction:</span>
                      <span className={`font-bold ${windResult.correction > 0 ? 'text-amber-600' : 'text-blue-600'}`}>
                        {windResult.correction > 0 ? '+' : ''}{windResult.correction}°
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Fuel Mode */}
            {mode === 'fuel' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="fuelBurn" className="text-xs">Fuel Burn (gph)</Label>
                    <Input
                      id="fuelBurn"
                      type="number"
                      step="0.1"
                      value={fuelBurn}
                      onChange={(e) => setFuelBurn(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="flightTime" className="text-xs">Flight Time (hrs)</Label>
                    <Input
                      id="flightTime"
                      type="number"
                      step="0.1"
                      value={flightTime}
                      onChange={(e) => setFlightTime(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                </div>
                <Button onClick={calculateFuel} className="w-full">
                  Calculate
                </Button>
                {fuelResult && (
                  <div className="bg-muted rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fuel Required:</span>
                      <span className="font-bold">{fuelResult.fuel} gal</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Endurance:</span>
                      <span className="font-bold">{fuelResult.endurance} hrs</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Speed Mode (TAS) */}
            {mode === 'speed' && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="ias" className="text-xs">IAS (kts)</Label>
                    <Input
                      id="ias"
                      type="number"
                      value={ias}
                      onChange={(e) => setIas(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="altitude" className="text-xs">Altitude (ft)</Label>
                    <Input
                      id="altitude"
                      type="number"
                      value={altitude}
                      onChange={(e) => setAltitude(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="temp" className="text-xs">Temp (°C)</Label>
                    <Input
                      id="temp"
                      type="number"
                      value={temp}
                      onChange={(e) => setTemp(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                </div>
                <Button onClick={calculateTAS} className="w-full">
                  Calculate TAS
                </Button>
                {tasResult !== null && (
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <div className="text-sm text-muted-foreground">True Airspeed</div>
                    <div className="text-3xl font-bold text-primary">{tasResult} kts</div>
                  </div>
                )}
              </>
            )}

            {/* Convert Mode */}
            {mode === 'convert' && (
              <>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="convertType" className="text-xs">Convert From</Label>
                    <select
                      id="convertType"
                      value={convertFrom}
                      onChange={(e) => setConvertFrom(e.target.value)}
                      className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="nm">Nautical Miles</option>
                      <option value="sm">Statute Miles</option>
                      <option value="gal">Gallons</option>
                      <option value="lbs">Pounds</option>
                      <option value="f">Fahrenheit</option>
                      <option value="ft">Feet</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="convertValue" className="text-xs">Value</Label>
                    <Input
                      id="convertValue"
                      type="number"
                      value={convertValue}
                      onChange={(e) => setConvertValue(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                </div>
                <Button onClick={calculateConversions} className="w-full">
                  Convert
                </Button>
                {convertResult && (
                  <div className="bg-muted rounded-lg p-3 space-y-2">
                    {Object.entries(convertResult).map(([key, val]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground">{key}:</span>
                        <span className="font-bold">{val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Footer */}
        <div className="mt-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <HelpCircle className="w-3 h-3" />
          Full E6B functionality for pilots
        </div>
      </div>
    </div>
  )
}
