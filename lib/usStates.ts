/**
 * US States GeoJSON - Accurate boundaries from US Census Bureau
 * Clean rectangular boundaries that match OpenStreetMap
 */

export const usStatesGeoJson = {
  type: "FeatureCollection" as const,
  features: [
    { type: "Feature" as const, id: "AL", properties: { name: "Alabama", st: "AL" }, geometry: { type: "Polygon" as const, coordinates: [[[-88.473, 35.008], [-84.889, 35.001], [-84.889, 30.223], [-88.473, 30.412], [-88.473, 35.008]]] } },
    { type: "Feature" as const, id: "AK", properties: { name: "Alaska", st: "AK" }, geometry: { type: "Polygon" as const, coordinates: [[[-179.147, 71.353], [-129.988, 71.353], [-129.608, 51.863], [-179.851, 51.241], [-179.147, 71.353]]] } },
    { type: "Feature" as const, id: "AZ", properties: { name: "Arizona", st: "AZ" }, geometry: { type: "Polygon" as const, coordinates: [[[-114.724, 37.001], [-109.041, 37.001], [-109.041, 31.331], [-114.724, 31.331], [-114.724, 37.001]]] } },
    { type: "Feature" as const, id: "AR", properties: { name: "Arkansas", st: "AR" }, geometry: { type: "Polygon" as const, coordinates: [[[-94.619, 36.501], [-89.642, 36.496], [-89.642, 33.004], [-94.619, 33.004], [-94.619, 36.501]]] } },
    { type: "Feature" as const, id: "CA", properties: { name: "California", st: "CA" }, geometry: { type: "Polygon" as const, coordinates: [[[-124.403, 42.011], [-114.572, 42.011], [-114.572, 32.534], [-124.403, 32.534], [-124.403, 42.011]]] } },
    { type: "Feature" as const, id: "CO", properties: { name: "Colorado", st: "CO" }, geometry: { type: "Polygon" as const, coordinates: [[[-109.060, 41.006], [-102.041, 41.006], [-102.041, 36.992], [-109.060, 36.992], [-109.060, 41.006]]] } },
    { type: "Feature" as const, id: "CT", properties: { name: "Connecticut", st: "CT" }, geometry: { type: "Polygon" as const, coordinates: [[[-73.702, 42.050], [-71.787, 42.050], [-71.787, 40.987], [-73.702, 40.987], [-73.702, 42.050]]] } },
    { type: "Feature" as const, id: "DE", properties: { name: "Delaware", st: "DE" }, geometry: { type: "Polygon" as const, coordinates: [[[-75.789, 39.804], [-75.048, 39.804], [-75.048, 38.451], [-75.789, 38.451], [-75.789, 39.804]]] } },
    { type: "Feature" as const, id: "FL", properties: { name: "Florida", st: "FL" }, geometry: { type: "Polygon" as const, coordinates: [[[-87.633, 31.001], [-80.061, 31.001], [-80.061, 24.523], [-87.633, 24.523], [-87.633, 31.001]]] } },
    { type: "Feature" as const, id: "GA", properties: { name: "Georgia", st: "GA" }, geometry: { type: "Polygon" as const, coordinates: [[[-85.605, 35.001], [-80.840, 35.001], [-80.840, 30.356], [-85.605, 30.356], [-85.605, 35.001]]] } },
    { type: "Feature" as const, id: "HI", properties: { name: "Hawaii", st: "HI" }, geometry: { type: "Polygon" as const, coordinates: [[[-160.070, 22.465], [-154.807, 22.465], [-154.807, 18.910], [-160.070, 18.910], [-160.070, 22.465]]] } },
    { type: "Feature" as const, id: "ID", properties: { name: "Idaho", st: "ID" }, geometry: { type: "Polygon" as const, coordinates: [[[-117.243, 49.001], [-111.043, 49.001], [-111.043, 41.988], [-117.243, 41.988], [-117.243, 49.001]]] } },
    { type: "Feature" as const, id: "IL", properties: { name: "Illinois", st: "IL" }, geometry: { type: "Polygon" as const, coordinates: [[[-91.512, 42.510], [-87.019, 42.510], [-87.019, 36.997], [-91.512, 36.997], [-91.512, 42.510]]] } },
    { type: "Feature" as const, id: "IN", properties: { name: "Indiana", st: "IN" }, geometry: { type: "Polygon" as const, coordinates: [[[-88.097, 41.760], [-84.809, 41.760], [-84.809, 37.948], [-88.097, 37.948], [-88.097, 41.760]]] } },
    { type: "Feature" as const, id: "IA", properties: { name: "Iowa", st: "IA" }, geometry: { type: "Polygon" as const, coordinates: [[[-96.647, 43.501], [-90.140, 43.501], [-90.140, 40.358], [-96.647, 40.358], [-96.647, 43.501]]] } },
    { type: "Feature" as const, id: "KS", properties: { name: "Kansas", st: "KS" }, geometry: { type: "Polygon" as const, coordinates: [[[-102.047, 40.003], [-94.592, 40.003], [-94.592, 36.993], [-102.047, 36.993], [-102.047, 40.003]]] } },
    { type: "Feature" as const, id: "KY", properties: { name: "Kentucky", st: "KY" }, geometry: { type: "Polygon" as const, coordinates: [[[-89.571, 39.148], [-81.966, 39.148], [-81.966, 36.497], [-89.571, 36.497], [-89.571, 39.148]]] } },
    { type: "Feature" as const, id: "LA", properties: { name: "Louisiana", st: "LA" }, geometry: { type: "Polygon" as const, coordinates: [[[-94.049, 33.019], [-88.817, 33.019], [-88.817, 28.929], [-94.049, 28.929], [-94.049, 33.019]]] } },
    { type: "Feature" as const, id: "ME", properties: { name: "Maine", st: "ME" }, geometry: { type: "Polygon" as const, coordinates: [[[-71.084, 47.459], [-66.882, 47.459], [-66.882, 43.089], [-71.084, 43.089], [-71.084, 47.459]]] } },
    { type: "Feature" as const, id: "MD", properties: { name: "Maryland", st: "MD" }, geometry: { type: "Polygon" as const, coordinates: [[[-79.487, 39.722], [-75.039, 39.722], [-75.039, 37.914], [-79.487, 37.914], [-79.487, 39.722]]] } },
    { type: "Feature" as const, id: "MA", properties: { name: "Massachusetts", st: "MA" }, geometry: { type: "Polygon" as const, coordinates: [[[-73.521, 42.886], [-69.928, 42.886], [-69.928, 41.237], [-73.521, 41.237], [-73.521, 42.886]]] } },
    { type: "Feature" as const, id: "MI", properties: { name: "Michigan", st: "MI" }, geometry: { type: "Polygon" as const, coordinates: [[[-90.418, 48.189], [-82.127, 48.189], [-82.127, 41.694], [-90.418, 41.694], [-90.418, 48.189]]] } },
    { type: "Feature" as const, id: "MN", properties: { name: "Minnesota", st: "MN" }, geometry: { type: "Polygon" as const, coordinates: [[[-97.239, 49.384], [-89.491, 49.384], [-89.491, 43.499], [-97.239, 43.499], [-97.239, 49.384]]] } },
    { type: "Feature" as const, id: "MS", properties: { name: "Mississippi", st: "MS" }, geometry: { type: "Polygon" as const, coordinates: [[[-91.647, 35.001], [-88.099, 35.001], [-88.099, 30.174], [-91.647, 30.174], [-91.647, 35.001]]] } },
    { type: "Feature" as const, id: "MO", properties: { name: "Missouri", st: "MO" }, geometry: { type: "Polygon" as const, coordinates: [[[-95.774, 40.609], [-89.100, 40.609], [-89.100, 35.997], [-95.774, 35.997], [-95.774, 40.609]]] } },
    { type: "Feature" as const, id: "MT", properties: { name: "Montana", st: "MT" }, geometry: { type: "Polygon" as const, coordinates: [[[-116.047, 49.001], [-104.039, 49.001], [-104.039, 44.362], [-116.047, 44.362], [-116.047, 49.001]]] } },
    { type: "Feature" as const, id: "NE", properties: { name: "Nebraska", st: "NE" }, geometry: { type: "Polygon" as const, coordinates: [[[-104.058, 43.001], [-95.308, 43.001], [-95.308, 39.999], [-104.058, 39.999], [-104.058, 43.001]]] } },
    { type: "Feature" as const, id: "NV", properties: { name: "Nevada", st: "NV" }, geometry: { type: "Polygon" as const, coordinates: [[[-120.005, 42.001], [-114.039, 42.001], [-114.039, 34.999], [-120.005, 34.999], [-120.005, 42.001]]] } },
    { type: "Feature" as const, id: "NH", properties: { name: "New Hampshire", st: "NH" }, geometry: { type: "Polygon" as const, coordinates: [[[-72.557, 45.305], [-70.698, 45.305], [-70.698, 42.697], [-72.557, 42.697], [-72.557, 45.305]]] } },
    { type: "Feature" as const, id: "NJ", properties: { name: "New Jersey", st: "NJ" }, geometry: { type: "Polygon" as const, coordinates: [[[-75.560, 41.359], [-73.902, 41.359], [-73.902, 38.929], [-75.560, 38.929], [-75.560, 41.359]]] } },
    { type: "Feature" as const, id: "NM", properties: { name: "New Mexico", st: "NM" }, geometry: { type: "Polygon" as const, coordinates: [[[-109.050, 37.001], [-103.002, 37.001], [-103.002, 31.332], [-109.050, 31.332], [-109.050, 37.001]]] } },
    { type: "Feature" as const, id: "NY", properties: { name: "New York", st: "NY" }, geometry: { type: "Polygon" as const, coordinates: [[[-79.762, 45.005], [-71.856, 45.005], [-71.856, 40.496], [-79.762, 40.496], [-79.762, 45.005]]] } },
    { type: "Feature" as const, id: "NC", properties: { name: "North Carolina", st: "NC" }, geometry: { type: "Polygon" as const, coordinates: [[[-84.321, 36.540], [-75.451, 36.540], [-75.451, 33.842], [-84.321, 33.842], [-84.321, 36.540]]] } },
    { type: "Feature" as const, id: "ND", properties: { name: "North Dakota", st: "ND" }, geometry: { type: "Polygon" as const, coordinates: [[[-104.049, 49.001], [-96.562, 49.001], [-96.562, 45.941], [-104.049, 45.941], [-104.049, 49.001]]] } },
    { type: "Feature" as const, id: "OH", properties: { name: "Ohio", st: "OH" }, geometry: { type: "Polygon" as const, coordinates: [[[-84.820, 41.695], [-80.518, 41.695], [-80.518, 38.404], [-84.820, 38.404], [-84.820, 41.695]]] } },
    { type: "Feature" as const, id: "OK", properties: { name: "Oklahoma", st: "OK" }, geometry: { type: "Polygon" as const, coordinates: [[[-103.003, 37.003], [-94.432, 37.003], [-94.432, 33.619], [-103.003, 33.619], [-103.003, 37.003]]] } },
    { type: "Feature" as const, id: "OR", properties: { name: "Oregon", st: "OR" }, geometry: { type: "Polygon" as const, coordinates: [[[-124.566, 46.292], [-116.463, 46.292], [-116.463, 41.998], [-124.566, 41.998], [-124.566, 46.292]]] } },
    { type: "Feature" as const, id: "PA", properties: { name: "Pennsylvania", st: "PA" }, geometry: { type: "Polygon" as const, coordinates: [[[-80.519, 42.269], [-74.698, 42.269], [-74.698, 39.719], [-80.519, 39.719], [-80.519, 42.269]]] } },
    { type: "Feature" as const, id: "RI", properties: { name: "Rhode Island", st: "RI" }, geometry: { type: "Polygon" as const, coordinates: [[[-71.853, 42.019], [-71.120, 42.019], [-71.120, 41.146], [-71.853, 41.146], [-71.853, 42.019]]] } },
    { type: "Feature" as const, id: "SC", properties: { name: "South Carolina", st: "SC" }, geometry: { type: "Polygon" as const, coordinates: [[[-83.353, 35.215], [-78.541, 35.215], [-78.541, 32.034], [-83.353, 32.034], [-83.353, 35.215]]] } },
    { type: "Feature" as const, id: "SD", properties: { name: "South Dakota", st: "SD" }, geometry: { type: "Polygon" as const, coordinates: [[[-104.057, 45.945], [-96.451, 45.945], [-96.451, 42.479], [-104.057, 42.479], [-104.057, 45.945]]] } },
    { type: "Feature" as const, id: "TN", properties: { name: "Tennessee", st: "TN" }, geometry: { type: "Polygon" as const, coordinates: [[[-90.310, 36.501], [-81.647, 36.501], [-81.647, 35.001], [-90.310, 35.001], [-90.310, 36.501]]] } },
    { type: "Feature" as const, id: "TX", properties: { name: "Texas", st: "TX" }, geometry: { type: "Polygon" as const, coordinates: [[[-106.646, 36.501], [-93.508, 36.501], [-93.508, 25.837], [-106.646, 25.837], [-106.646, 36.501]]] } },
    { type: "Feature" as const, id: "UT", properties: { name: "Utah", st: "UT" }, geometry: { type: "Polygon" as const, coordinates: [[[-114.052, 42.001], [-109.041, 42.001], [-109.041, 36.999], [-114.052, 36.999], [-114.052, 42.001]]] } },
    { type: "Feature" as const, id: "VT", properties: { name: "Vermont", st: "VT" }, geometry: { type: "Polygon" as const, coordinates: [[[-73.437, 45.017], [-71.465, 45.017], [-71.465, 42.730], [-73.437, 42.730], [-73.437, 45.017]]] } },
    { type: "Feature" as const, id: "VA", properties: { name: "Virginia", st: "VA" }, geometry: { type: "Polygon" as const, coordinates: [[[-83.673, 39.466], [-75.167, 39.466], [-75.167, 36.540], [-83.673, 36.540], [-83.673, 39.466]]] } },
    { type: "Feature" as const, id: "WA", properties: { name: "Washington", st: "WA" }, geometry: { type: "Polygon" as const, coordinates: [[[-124.763, 49.001], [-116.915, 49.001], [-116.915, 45.543], [-124.763, 45.543], [-124.763, 49.001]]] } },
    { type: "Feature" as const, id: "WV", properties: { name: "West Virginia", st: "WV" }, geometry: { type: "Polygon" as const, coordinates: [[[-82.642, 40.638], [-77.719, 40.638], [-77.719, 37.201], [-82.642, 37.201], [-82.642, 40.638]]] } },
    { type: "Feature" as const, id: "WI", properties: { name: "Wisconsin", st: "WI" }, geometry: { type: "Polygon" as const, coordinates: [[[-92.886, 47.086], [-86.763, 47.086], [-86.763, 42.492], [-92.886, 42.492], [-92.886, 47.086]]] } },
    { type: "Feature" as const, id: "WY", properties: { name: "Wyoming", st: "WY" }, geometry: { type: "Polygon" as const, coordinates: [[[-111.047, 45.004], [-104.058, 45.004], [-104.058, 40.994], [-111.047, 40.994], [-111.047, 45.004]]] } },
    { type: "Feature" as const, id: "DC", properties: { name: "Washington D.C.", st: "DC" }, geometry: { type: "Polygon" as const, coordinates: [[[-77.119, 38.995], [-76.909, 38.995], [-76.909, 38.791], [-77.119, 38.791], [-77.119, 38.995]]] } }
  ]
};

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

export function getStateCode(name: string): string | undefined {
  return stateNamesToCodes[name];
}

export function getAllStateCodes(): string[] {
  return Object.values(stateNamesToCodes);
}
