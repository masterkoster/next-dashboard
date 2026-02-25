// Engine Data Parser
// Supports generic CSV format and JPI text exports

import { ParsedEngineData } from './anomaly-detection'

export type FileType = 'JPI' | 'GARMIN' | 'AVIDYNE' | 'EI' | 'CSV'

interface CSVRow {
  [key: string]: string | number | undefined
}

// Detect file type from content
export function detectFileType(content: string, filename: string): FileType {
  const ext = filename.toLowerCase().split('.').pop()
  const lowerContent = content.toLowerCase()
  
  if (ext === 'csv' || lowerContent.includes('date,time') || lowerContent.includes('cht,egt')) {
    // Check for specific format markers
    if (lowerContent.includes('jpi') || lowerContent.includes('edm')) {
      return 'JPI'
    }
    if (lowerContent.includes('garmin') || lowerContent.includes('g1000')) {
      return 'GARMIN'
    }
    if (lowerContent.includes('avidyne')) {
      return 'AVIDYNE'
    }
    if (lowerContent.includes('electronics international')) {
      return 'EI'
    }
    return 'CSV'
  }
  
  if (ext === 'txt' || ext === 'dat') {
    if (lowerContent.includes('jpi') || lowerContent.includes('edm')) {
      return 'JPI'
    }
  }
  
  return 'CSV'
}

// Parse CSV content into engine data
export function parseCSV(content: string): ParsedEngineData[] {
  const lines = content.trim().split('\n')
  if (lines.length < 2) return []
  
  // Parse header
  const header = lines[0].toLowerCase().split(',').map(h => h.trim())
  
  // Common column name mappings
  const columnMap: Record<string, string> = {
    'date': 'date',
    'time': 'time',
    'flight date': 'date',
    'duration': 'duration',
    'flight time': 'duration',
    'hours': 'duration',
    'cht1': 'cht1', 'cht2': 'cht2', 'cht3': 'cht3', 'cht4': 'cht4',
    'cht5': 'cht5', 'cht6': 'cht6', 'cht7': 'cht7', 'cht8': 'cht8',
    'egt1': 'egt1', 'egt2': 'egt2', 'egt3': 'egt3', 'egt4': 'egt4',
    'egt5': 'egt5', 'egt6': 'egt6', 'egt7': 'egt7', 'egt8': 'egt8',
    'ff': 'fuelflow', 'fuel flow': 'fuelflow', 'fuel flow gph': 'fuelflow',
    'fuel used': 'fuelused', 'fuel': 'fuelused',
    'oil temp': 'oiltemp', 'oil temperature': 'oiltemp',
    'oil press': 'oilpress', 'oil pressure': 'oilpress',
    'rpm': 'rpm', 'manifold': 'map', 'map': 'map',
  }
  
  const results: ParsedEngineData[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length === 0) continue
    
    const row: CSVRow = {}
    header.forEach((col, idx) => {
      const mapped = columnMap[col] || col
      const val = values[idx]?.trim()
      if (val !== undefined && val !== '') {
        row[mapped] = parseFloat(val) || val
      }
    })
    
    // Extract data
    const dateStr = row.date as string
    const timeStr = row.time as string
    if (!dateStr) continue
    
    let flightDate: Date
    if (timeStr) {
      flightDate = new Date(`${dateStr}T${timeStr}`)
    } else {
      flightDate = new Date(dateStr)
    }
    
    if (isNaN(flightDate.getTime())) continue
    
    // Collect CHT values
    const chtValues: number[] = []
    for (let c = 1; c <= 8; c++) {
      const val = row[`cht${c}`]
      if (typeof val === 'number' && val > 0) chtValues.push(val)
    }
    
    // Collect EGT values
    const egtValues: number[] = []
    for (let c = 1; c <= 8; c++) {
      const val = row[`egt${c}`]
      if (typeof val === 'number' && val > 0) egtValues.push(val)
    }
    
    const flightDuration = typeof row.duration === 'number' ? row.duration : 0
    
    results.push({
      flightDate,
      flightDuration,
      chtMin: chtValues.length > 0 ? Math.min(...chtValues) : undefined,
      chtMax: chtValues.length > 0 ? Math.max(...chtValues) : undefined,
      chtAvg: chtValues.length > 0 ? chtValues.reduce((a, b) => a + b, 0) / chtValues.length : undefined,
      chtValues,
      egtMin: egtValues.length > 0 ? Math.min(...egtValues) : undefined,
      egtMax: egtValues.length > 0 ? Math.max(...egtValues) : undefined,
      egtAvg: egtValues.length > 0 ? egtValues.reduce((a, b) => a + b, 0) / egtValues.length : undefined,
      egtValues,
      fuelFlowMin: typeof row.fuelflow === 'number' ? row.fuelflow : undefined,
      fuelFlowMax: typeof row.fuelflow === 'number' ? row.fuelflow : undefined,
      fuelFlowAvg: typeof row.fuelflow === 'number' ? row.fuelflow : undefined,
      fuelUsed: typeof row.fuelused === 'number' ? row.fuelused : undefined,
      oilTempMin: typeof row.oiltemp === 'number' ? row.oiltemp : undefined,
      oilTempMax: typeof row.oiltemp === 'number' ? row.oiltemp : undefined,
      oilPressureMin: typeof row.oilpress === 'number' ? row.oilpress : undefined,
      oilPressureMax: typeof row.oilpress === 'number' ? row.oilpress : undefined,
      rpmAvg: typeof row.rpm === 'number' ? row.rpm : undefined,
      manifoldPressure: typeof row.map === 'number' ? row.map : undefined,
    })
  }
  
  return results
}

// Parse a CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)
  
  return result
}

// Validate parsed data
export function validateEngineData(data: ParsedEngineData[]): { valid: ParsedEngineData[]; errors: string[] } {
  const valid: ParsedEngineData[] = []
  const errors: string[] = []
  
  data.forEach((entry, idx) => {
    if (!entry.flightDate || isNaN(entry.flightDate.getTime())) {
      errors.push(`Row ${idx + 1}: Invalid date`)
      return
    }
    
    if (entry.flightDuration < 0 || entry.flightDuration > 24) {
      errors.push(`Row ${idx + 1}: Invalid duration (${entry.flightDuration})`)
      return
    }
    
    valid.push(entry)
  })
  
  return { valid, errors }
}
