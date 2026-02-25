// Engine Anomaly Detection Rules
// Based on industry best practices for Lycoming/Continental engines

export type AnomalyType = 
  | 'CHT_SPREAD'
  | 'EGT_SPREAD' 
  | 'OIL_TEMP_HIGH'
  | 'OIL_TEMP_LOW'
  | 'OIL_PRESSURE_HIGH'
  | 'OIL_PRESSURE_LOW'
  | 'FUEL_FLOW_HIGH'
  | 'FUEL_FLOW_LOW'
  | 'CHT_HIGH'
  | 'EGT_HIGH'

export type Severity = 'INFO' | 'WARNING' | 'CRITICAL'

export interface AnomalyThresholds {
  // CHT (Cylinder Head Temperature)
  chtNormalMax: number      // Normal max: 380°F
  chtWarningMax: number     // Warning: 380-400°F
  chtCriticalMax: number    // Critical: >400°F
  chtSpreadWarning: number  // Warning spread: >25°F
  chtSpreadCritical: number  // Critical spread: >40°F
  
  // EGT (Exhaust Gas Temperature)
  egtSpreadWarning: number  // Warning spread: >50°F
  egtSpreadCritical: number // Critical spread: >75°F
  
  // Oil Temperature
  oilTempNormalMax: number   // Normal: 180-220°F
  oilTempWarningMax: number // Warning: 220-240°F
  oilTempCriticalMax: number // Critical: >240°F
  
  // Oil Pressure
  oilPressureNormalMin: number   // Normal: 25-65 PSI
  oilPressureWarningMin: number  // Warning: 20-25 PSI
  oilPressureCriticalMin: number // Critical: <20 PSI
  oilPressureWarningMax: number  // Warning: 65-80 PSI
  oilPressureCriticalMax: number // Critical: >80 PSI
  
  // Fuel Flow
  fuelFlowVarianceWarning: number   // Warning: >10% variance
  fuelFlowVarianceCritical: number  // Critical: >20% variance
}

export const DEFAULT_THRESHOLDS: AnomalyThresholds = {
  chtNormalMax: 380,
  chtWarningMax: 400,
  chtCriticalMax: 420,
  chtSpreadWarning: 25,
  chtSpreadCritical: 40,
  egtSpreadWarning: 50,
  egtSpreadCritical: 75,
  oilTempNormalMax: 220,
  oilTempWarningMax: 240,
  oilTempCriticalMax: 260,
  oilPressureNormalMin: 25,
  oilPressureWarningMin: 20,
  oilPressureCriticalMin: 15,
  oilPressureWarningMax: 80,
  oilPressureCriticalMax: 90,
  fuelFlowVarianceWarning: 10,
  fuelFlowVarianceCritical: 20,
}

export interface ParsedEngineData {
  flightDate: Date
  flightDuration: number // hours
  chtMin?: number
  chtMax?: number
  chtAvg?: number
  chtValues?: number[] // per cylinder
  egtMin?: number
  egtMax?: number
  egtAvg?: number
  egtValues?: number[] // per cylinder
  fuelFlowMin?: number
  fuelFlowMax?: number
  fuelFlowAvg?: number
  fuelUsed?: number
  oilTempMin?: number
  oilTempMax?: number
  oilPressureMin?: number
  oilPressureMax?: number
  rpmAvg?: number
  manifoldPressure?: number
}

export interface AnomalyResult {
  type: AnomalyType
  severity: Severity
  value: number
  threshold: number
  message: string
}

export function detectAnomalies(
  data: ParsedEngineData,
  thresholds: AnomalyThresholds = DEFAULT_THRESHOLDS
): AnomalyResult[] {
  const anomalies: AnomalyResult[] = []
  
  // CHT Spread (difference between hottest and coldest cylinder)
  if (data.chtValues && data.chtValues.length > 1) {
    const minCht = Math.min(...data.chtValues)
    const maxCht = Math.max(...data.chtValues)
    const spread = maxCht - minCht
    
    if (spread >= thresholds.chtSpreadCritical) {
      anomalies.push({
        type: 'CHT_SPREAD',
        severity: 'CRITICAL',
        value: spread,
        threshold: thresholds.chtSpreadCritical,
        message: `CHT spread of ${spread.toFixed(1)}°F exceeds critical threshold of ${thresholds.chtSpreadCritical}°F. Check for fouled plugs, faulty cylinders, or ignition issues.`
      })
    } else if (spread >= thresholds.chtSpreadWarning) {
      anomalies.push({
        type: 'CHT_SPREAD',
        severity: 'WARNING',
        value: spread,
        threshold: thresholds.chtSpreadWarning,
        message: `CHT spread of ${spread.toFixed(1)}°F is above normal (${thresholds.chtSpreadWarning}°F threshold). Monitor cylinder temperatures.`
      })
    }
  }
  
  // EGT Spread
  if (data.egtValues && data.egtValues.length > 1) {
    const minEgt = Math.min(...data.egtValues)
    const maxEgt = Math.max(...data.egtValues)
    const spread = maxEgt - minEgt
    
    if (spread >= thresholds.egtSpreadCritical) {
      anomalies.push({
        type: 'EGT_SPREAD',
        severity: 'CRITICAL',
        value: spread,
        threshold: thresholds.egtSpreadCritical,
        message: `EGT spread of ${spread.toFixed(1)}°F exceeds critical threshold. Possible lean cylinder or exhaust issue.`
      })
    } else if (spread >= thresholds.egtSpreadWarning) {
      anomalies.push({
        type: 'EGT_SPREAD',
        severity: 'WARNING',
        value: spread,
        threshold: thresholds.egtSpreadWarning,
        message: `EGT spread of ${spread.toFixed(1)}°F is above normal.`
      })
    }
  }
  
  // Oil Temperature
  if (data.oilTempMax) {
    if (data.oilTempMax >= thresholds.oilTempCriticalMax) {
      anomalies.push({
        type: 'OIL_TEMP_HIGH',
        severity: 'CRITICAL',
        value: data.oilTempMax,
        threshold: thresholds.oilTempCriticalMax,
        message: `Oil temperature of ${data.oilTempMax.toFixed(0)}°F exceeds critical threshold. Land ASAP and investigate.`
      })
    } else if (data.oilTempMax >= thresholds.oilTempWarningMax) {
      anomalies.push({
        type: 'OIL_TEMP_HIGH',
        severity: 'WARNING',
        value: data.oilTempMax,
        threshold: thresholds.oilTempWarningMax,
        message: `Oil temperature of ${data.oilTempMax.toFixed(0)}°F is elevated. Monitor closely.`
      })
    }
  }
  
  // Oil Pressure
  if (data.oilPressureMin) {
    if (data.oilPressureMin <= thresholds.oilPressureCriticalMin) {
      anomalies.push({
        type: 'OIL_PRESSURE_LOW',
        severity: 'CRITICAL',
        value: data.oilPressureMin,
        threshold: thresholds.oilPressureCriticalMin,
        message: `Oil pressure of ${data.oilPressureMin.toFixed(1)} PSI is critically low. Land immediately.`
      })
    } else if (data.oilPressureMin <= thresholds.oilPressureWarningMin) {
      anomalies.push({
        type: 'OIL_PRESSURE_LOW',
        severity: 'WARNING',
        value: data.oilPressureMin,
        threshold: thresholds.oilPressureWarningMin,
        message: `Oil pressure of ${data.oilPressureMin.toFixed(1)} PSI is below normal.`
      })
    }
  }
  
  if (data.oilPressureMax) {
    if (data.oilPressureMax >= thresholds.oilPressureCriticalMax) {
      anomalies.push({
        type: 'OIL_PRESSURE_HIGH',
        severity: 'CRITICAL',
        value: data.oilPressureMax,
        threshold: thresholds.oilPressureCriticalMax,
        message: `Oil pressure of ${data.oilPressureMax.toFixed(1)} PSI is critically high.`
      })
    } else if (data.oilPressureMax >= thresholds.oilPressureWarningMax) {
      anomalies.push({
        type: 'OIL_PRESSURE_HIGH',
        severity: 'WARNING',
        value: data.oilPressureMax,
        threshold: thresholds.oilPressureWarningMax,
        message: `Oil pressure of ${data.oilPressureMax.toFixed(1)} PSI is elevated.`
      })
    }
  }
  
  return anomalies
}

// Calculate average from array, ignoring undefined/null
function avg(arr: (number | undefined)[]): number {
  const valid = arr.filter((v): v is number => v !== undefined && v !== null)
  return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : 0
}

// Calculate min from array
function min(arr: (number | undefined)[]): number | undefined {
  const valid = arr.filter((v): v is number => v !== undefined && v !== null)
  return valid.length > 0 ? Math.min(...valid) : undefined
}

// Calculate max from array
function max(arr: (number | undefined)[]): number | undefined {
  const valid = arr.filter((v): v is number => v !== undefined && v !== null)
  return valid.length > 0 ? Math.max(...valid) : undefined
}
