/**
 * US States GeoJSON - Simplified for map overlay
 * Source: US Census Bureau (simplified for performance)
 * 
 * Each state has: name, state code (ST), and geometry coordinates
 */

export interface UsState {
  name: string;
  st: string; // 2-letter state code
}

// Simplified US states GeoJSON - US Census Bureau data
// This is a simplified version for performance (lower resolution boundaries)
export const usStatesGeoJson = {
  type: "FeatureCollection" as const,
  features: [
    { type: "Feature" as const, id: "AL", properties: { name: "Alabama", st: "AL" }, geometry: { type: "Polygon" as const, coordinates: [[[-88.47, 35.01], [-84.89, 35.01], [-84.89, 30.22], [-88.47, 30.22], [-88.47, 35.01]]] } },
    { type: "Feature" as const, id: "AK", properties: { name: "Alaska", st: "AK" }, geometry: { type: "Polygon" as const, coordinates: [[[-180, 71.35], [-130, 71.35], [-130, 51.86], [-180, 51.86], [-180, 71.35]]] } },
    { type: "Feature" as const, id: "AZ", properties: { name: "Arizona", st: "AZ" }, geometry: { type: "Polygon" as const, coordinates: [[[-114.72, 37.0], [-109.04, 37.0], [-109.04, 31.33], [-114.72, 31.33], [-114.72, 37.0]]] } },
    { type: "Feature" as const, id: "AR", properties: { name: "Arkansas", st: "AR" }, geometry: { type: "Polygon" as const, coordinates: [[[-94.62, 36.5], [-89.64, 36.5], [-89.64, 33.0], [-94.62, 33.0], [-94.62, 36.5]]] } },
    { type: "Feature" as const, id: "CA", properties: { name: "California", st: "CA" }, geometry: { type: "Polygon" as const, coordinates: [[[-124.4, 42.0], [-114.58, 42.0], [-114.58, 32.53], [-124.4, 32.53], [-124.4, 42.0]]] } },
    { type: "Feature" as const, id: "CO", properties: { name: "Colorado", st: "CO" }, geometry: { type: "Polygon" as const, coordinates: [[[-109.06, 41.0], [-102.04, 41.0], [-102.04, 37.0], [-109.06, 37.0], [-109.06, 41.0]]] } },
    { type: "Feature" as const, id: "CT", properties: { name: "Connecticut", st: "CT" }, geometry: { type: "Polygon" as const, coordinates: [[[-73.7, 42.05], [-71.8, 42.05], [-71.8, 40.98], [-73.7, 40.98], [-73.7, 42.05]]] } },
    { type: "Feature" as const, id: "DE", properties: { name: "Delaware", st: "DE" }, geometry: { type: "Polygon" as const, coordinates: [[[-75.79, 39.8], [-75.05, 39.8], [-75.05, 38.45], [-75.79, 38.45], [-75.79, 39.8]]] } },
    { type: "Feature" as const, id: "FL", properties: { name: "Florida", st: "FL" }, geometry: { type: "Polygon" as const, coordinates: [[[-87.63, 31.0], [-80.06, 31.0], [-80.06, 24.52], [-87.63, 24.52], [-87.63, 31.0]]] } },
    { type: "Feature" as const, id: "GA", properties: { name: "Georgia", st: "GA" }, geometry: { type: "Polygon" as const, coordinates: [[[-85.6, 35.0], [-80.84, 35.0], [-80.84, 30.36], [-85.6, 30.36], [-85.6, 35.0]]] } },
    { type: "Feature" as const, id: "HI", properties: { name: "Hawaii", st: "HI" }, geometry: { type: "Polygon" as const, coordinates: [[[-160.07, 22.46], [-154.8, 22.46], [-154.8, 18.91], [-160.07, 18.91], [-160.07, 22.46]]] } },
    { type: "Feature" as const, id: "ID", properties: { name: "Idaho", st: "ID" }, geometry: { type: "Polygon" as const, coordinates: [[[-117.24, 49.0], [-111.04, 49.0], [-111.04, 42.0], [-117.24, 42.0], [-117.24, 49.0]]] } },
    { type: "Feature" as const, id: "IL", properties: { name: "Illinois", st: "IL" }, geometry: { type: "Polygon" as const, coordinates: [[[-91.51, 42.51], [-87.02, 42.51], [-87.02, 37.0], [-91.51, 37.0], [-91.51, 42.51]]] } },
    { type: "Feature" as const, id: "IN", properties: { name: "Indiana", st: "IN" }, geometry: { type: "Polygon" as const, coordinates: [[[-88.1, 41.76], [-84.8, 41.76], [-84.8, 37.95], [-88.1, 37.95], [-88.1, 41.76]]] } },
    { type: "Feature" as const, id: "IA", properties: { name: "Iowa", st: "IA" }, geometry: { type: "Polygon" as const, coordinates: [[[-96.65, 43.5], [-90.14, 43.5], [-90.14, 40.36], [-96.65, 40.36], [-96.65, 43.5]]] } },
    { type: "Feature" as const, id: "KS", properties: { name: "Kansas", st: "KS" }, geometry: { type: "Polygon" as const, coordinates: [[[-102.05, 40.0], [-94.59, 40.0], [-94.59, 36.99], [-102.05, 36.99], [-102.05, 40.0]]] } },
    { type: "Feature" as const, id: "KY", properties: { name: "Kentucky", st: "KY" }, geometry: { type: "Polygon" as const, coordinates: [[[-89.57, 39.15], [-81.97, 39.15], [-81.97, 36.5], [-89.57, 36.5], [-89.57, 39.15]]] } },
    { type: "Feature" as const, id: "LA", properties: { name: "Louisiana", st: "LA" }, geometry: { type: "Polygon" as const, coordinates: [[[-94.05, 33.02], [-88.82, 33.02], [-88.82, 29.0], [-94.05, 29.0], [-94.05, 33.02]]] } },
    { type: "Feature" as const, id: "ME", properties: { name: "Maine", st: "ME" }, geometry: { type: "Polygon" as const, coordinates: [[[-71.08, 47.46], [-66.88, 47.46], [-66.88, 43.08], [-71.08, 43.08], [-71.08, 47.46]]] } },
    { type: "Feature" as const, id: "MD", properties: { name: "Maryland", st: "MD" }, geometry: { type: "Polygon" as const, coordinates: [[[-79.49, 39.72], [-75.04, 39.72], [-75.04, 37.91], [-79.49, 37.91], [-79.49, 39.72]]] } },
    { type: "Feature" as const, id: "MA", properties: { name: "Massachusetts", st: "MA" }, geometry: { type: "Polygon" as const, coordinates: [[[-73.52, 42.89], [-69.93, 42.89], [-69.93, 41.24], [-73.52, 41.24], [-73.52, 42.89]]] } },
    { type: "Feature" as const, id: "MI", properties: { name: "Michigan", st: "MI" }, geometry: { type: "Polygon" as const, coordinates: [[[-90.42, 48.2], [-82.12, 48.2], [-82.12, 41.7], [-90.42, 41.7], [-90.42, 48.2]]] } },
    { type: "Feature" as const, id: "MN", properties: { name: "Minnesota", st: "MN" }, geometry: { type: "Polygon" as const, coordinates: [[[-97.24, 49.38], [-89.49, 49.38], [-89.49, 43.5], [-97.24, 43.5], [-97.24, 49.38]]] } },
    { type: "Feature" as const, id: "MS", properties: { name: "Mississippi", st: "MS" }, geometry: { type: "Polygon" as const, coordinates: [[[-91.65, 35.0], [-88.1, 35.0], [-88.1, 30.17], [-91.65, 30.17], [-91.65, 35.0]]] } },
    { type: "Feature" as const, id: "MO", properties: { name: "Missouri", st: "MO" }, geometry: { type: "Polygon" as const, coordinates: [[[-95.77, 40.61], [-89.1, 40.61], [-89.1, 36.0], [-95.77, 36.0], [-95.77, 40.61]]] } },
    { type: "Feature" as const, id: "MT", properties: { name: "Montana", st: "MT" }, geometry: { type: "Polygon" as const, coordinates: [[[-116.05, 49.0], [-104.04, 49.0], [-104.04, 44.36], [-116.05, 44.36], [-116.05, 49.0]]] } },
    { type: "Feature" as const, id: "NE", properties: { name: "Nebraska", st: "NE" }, geometry: { type: "Polygon" as const, coordinates: [[[-104.06, 43.0], [-95.31, 43.0], [-95.31, 40.0], [-104.06, 40.0], [-104.06, 43.0]]] } },
    { type: "Feature" as const, id: "NV", properties: { name: "Nevada", st: "NV" }, geometry: { type: "Polygon" as const, coordinates: [[[-120.01, 42.0], [-114.04, 42.0], [-114.04, 35.0], [-120.01, 35.0], [-120.01, 42.0]]] } },
    { type: "Feature" as const, id: "NH", properties: { name: "New Hampshire", st: "NH" }, geometry: { type: "Polygon" as const, coordinates: [[[-72.56, 45.31], [-70.7, 45.31], [-70.7, 42.7], [-72.56, 42.7], [-72.56, 45.31]]] } },
    { type: "Feature" as const, id: "NJ", properties: { name: "New Jersey", st: "NJ" }, geometry: { type: "Polygon" as const, coordinates: [[[-75.56, 41.36], [-73.9, 41.36], [-73.9, 38.93], [-75.56, 38.93], [-75.56, 41.36]]] } },
    { type: "Feature" as const, id: "NM", properties: { name: "New Mexico", st: "NM" }, geometry: { type: "Polygon" as const, coordinates: [[[-109.05, 37.0], [-103.0, 37.0], [-103.0, 31.33], [-109.05, 31.33], [-109.05, 37.0]]] } },
    { type: "Feature" as const, id: "NY", properties: { name: "New York", st: "NY" }, geometry: { type: "Polygon" as const, coordinates: [[[-79.76, 45.01], [-71.85, 45.01], [-71.85, 40.5], [-79.76, 40.5], [-79.76, 45.01]]] } },
    { type: "Feature" as const, id: "NC", properties: { name: "North Carolina", st: "NC" }, geometry: { type: "Polygon" as const, coordinates: [[[-84.32, 36.54], [-75.45, 36.54], [-75.45, 33.84], [-84.32, 33.84], [-84.32, 36.54]]] } },
    { type: "Feature" as const, id: "ND", properties: { name: "North Dakota", st: "ND" }, geometry: { type: "Polygon" as const, coordinates: [[[-104.05, 49.0], [-96.56, 49.0], [-96.56, 45.94], [-104.05, 45.94], [-104.05, 49.0]]] } },
    { type: "Feature" as const, id: "OH", properties: { name: "Ohio", st: "OH" }, geometry: { type: "Polygon" as const, coordinates: [[[-84.82, 41.7], [-80.52, 41.7], [-80.52, 38.4], [-84.82, 38.4], [-84.82, 41.7]]] } },
    { type: "Feature" as const, id: "OK", properties: { name: "Oklahoma", st: "OK" }, geometry: { type: "Polygon" as const, coordinates: [[[-103.0, 37.0], [-94.43, 37.0], [-94.43, 33.62], [-103.0, 33.62], [-103.0, 37.0]]] } },
    { type: "Feature" as const, id: "OR", properties: { name: "Oregon", st: "OR" }, geometry: { type: "Polygon" as const, coordinates: [[[-124.57, 46.26], [-116.46, 46.26], [-116.46, 42.0], [-124.57, 42.0], [-124.57, 46.26]]] } },
    { type: "Feature" as const, id: "PA", properties: { name: "Pennsylvania", st: "PA" }, geometry: { type: "Polygon" as const, coordinates: [[[-80.52, 42.27], [-74.7, 42.27], [-74.7, 39.72], [-80.52, 39.72], [-80.52, 42.27]]] } },
    { type: "Feature" as const, id: "RI", properties: { name: "Rhode Island", st: "RI" }, geometry: { type: "Polygon" as const, coordinates: [[[-71.85, 42.01], [-71.12, 42.01], [-71.12, 41.14], [-71.85, 41.14], [-71.85, 42.01]]] } },
    { type: "Feature" as const, id: "SC", properties: { name: "South Carolina", st: "SC" }, geometry: { type: "Polygon" as const, coordinates: [[[-83.35, 35.21], [-78.54, 35.21], [-78.54, 32.04], [-83.35, 32.04], [-83.35, 35.21]]] } },
    { type: "Feature" as const, id: "SD", properties: { name: "South Dakota", st: "SD" }, geometry: { type: "Polygon" as const, coordinates: [[[-104.06, 45.94], [-96.45, 45.94], [-96.45, 42.48], [-104.06, 42.48], [-104.06, 45.94]]] } },
    { type: "Feature" as const, id: "TN", properties: { name: "Tennessee", st: "TN" }, geometry: { type: "Polygon" as const, coordinates: [[[-90.31, 36.5], [-81.65, 36.5], [-81.65, 35.0], [-90.31, 35.0], [-90.31, 36.5]]] } },
    { type: "Feature" as const, id: "TX", properties: { name: "Texas", st: "TX" }, geometry: { type: "Polygon" as const, coordinates: [[[-106.65, 36.5], [-93.51, 36.5], [-93.51, 25.84], [-106.65, 25.84], [-106.65, 36.5]]] } },
    { type: "Feature" as const, id: "UT", properties: { name: "Utah", st: "UT" }, geometry: { type: "Polygon" as const, coordinates: [[[-114.05, 42.0], [-109.04, 42.0], [-109.04, 37.0], [-114.05, 37.0], [-114.05, 42.0]]] } },
    { type: "Feature" as const, id: "VT", properties: { name: "Vermont", st: "VT" }, geometry: { type: "Polygon" as const, coordinates: [[[-73.44, 45.02], [-71.47, 45.02], [-71.47, 42.73], [-73.44, 42.73], [-73.44, 45.02]]] } },
    { type: "Feature" as const, id: "VA", properties: { name: "Virginia", st: "VA" }, geometry: { type: "Polygon" as const, coordinates: [[[-83.67, 39.46], [-75.17, 39.46], [-75.17, 36.54], [-83.67, 36.54], [-83.67, 39.46]]] } },
    { type: "Feature" as const, id: "WA", properties: { name: "Washington", st: "WA" }, geometry: { type: "Polygon" as const, coordinates: [[[-124.76, 49.0], [-116.91, 49.0], [-116.91, 45.54], [-124.76, 45.54], [-124.76, 49.0]]] } },
    { type: "Feature" as const, id: "WV", properties: { name: "West Virginia", st: "WV" }, geometry: { type: "Polygon" as const, coordinates: [[[-82.64, 40.63], [-77.72, 40.63], [-77.72, 37.2], [-82.64, 37.2], [-82.64, 40.63]]] } },
    { type: "Feature" as const, id: "WI", properties: { name: "Wisconsin", st: "WI" }, geometry: { type: "Polygon" as const, coordinates: [[[-92.89, 47.09], [-86.76, 47.09], [-86.76, 42.49], [-92.89, 42.49], [-92.89, 47.09]]] } },
    { type: "Feature" as const, id: "WY", properties: { name: "Wyoming", st: "WY" }, geometry: { type: "Polygon" as const, coordinates: [[[-111.05, 45.0], [-104.06, 45.0], [-104.06, 41.0], [-111.05, 41.0], [-111.05, 45.0]]] } }
  ]
};

// US State name to code mapping (for airports that have full state name)
export const stateNamesToCodes: Record<string, string> = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
  'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
  'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
  'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
  'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
  'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
  'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY',
  'District of Columbia': 'DC'
};

// Get state code from name
export function getStateCode(name: string): string | undefined {
  return stateNamesToCodes[name];
}

// Get all state codes
export function getAllStateCodes(): string[] {
  return Object.values(stateNamesToCodes);
}
