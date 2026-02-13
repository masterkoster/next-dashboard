// demo aircraft record for Plane Carfax and TailHistory
export const DEMO_AIRCRAFT = {
  nNumber: "N123AB",
  manufacturer: "Cessna Aircraft Company",
  model: "172 Skyhawk",
  serialNumber: "17200572",
  airworthinessDate: "2018-06-12",
  lastActionDate: "2024-03-20",
  status: "Active",
  ownerName: "Oakland Aviation LLC",
  typeRegistrant: "Corporation",
  engineManufacturer: "Lycoming",
  engineModel: "IO-540-A5B",
  engineCount: 2,
} as const;

export function getDemoAircraft() {
  return DEMO_AIRCRAFT;
}