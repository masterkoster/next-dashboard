// Demo data for Flying Club demo mode
// This data is used when users try the Flying Club without an account

export interface DemoGroup {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  dryRate: number;
  wetRate: number;
  role: string;
  aircraft: DemoAircraft[];
  members: DemoMember[];
  showBookings: boolean;
  showAircraft: boolean;
  showFlights: boolean;
  showMaintenance: boolean;
  showBilling: boolean;
  showBillingAll: boolean;
  showMembers: boolean;
  showPartners: boolean;
  defaultInviteExpiry: number;
}

export interface DemoAircraft {
  id: string;
  groupId: string;
  nNumber: string;
  nickname: string;
  customName: string;
  make: string;
  model: string;
  year: number;
  totalTachHours: number;
  totalHobbsHours: number;
  registrationType: string;
  hasInsurance: boolean;
  maxPassengers: number;
  hourlyRate: number;
  aircraftNotes: string;
  status: string;
}

export interface DemoMember {
  id: string;
  userId: string;
  groupId: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface DemoBooking {
  id: string;
  aircraftId: string;
  userId: string;
  startTime: string;
  endTime: string;
  purpose: string;
  createdAt: string;
  groupName: string;
  aircraft: {
    id: string;
    nNumber: string;
    customName: string;
    nickname: string;
    make: string;
    model: string;
    groupName: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface DemoFlightLog {
  id: string;
  aircraftId: string;
  userId: string;
  date: string;
  tachTime: number;
  hobbsTime: number;
  notes: string;
  createdAt: string;
  aircraft: {
    id: string;
    nNumber: string;
    customName: string;
    nickname: string;
    make: string;
    model: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface DemoMaintenance {
  id: string;
  aircraftId: string;
  userId: string;
  description: string;
  notes: string;
  status: string;
  cost: number;
  isGrounded: boolean;
  reportedDate: string;
  resolvedDate: string | null;
  createdAt: string;
  aircraft: {
    id: string;
    nNumber: string;
    customName: string;
    nickname: string;
  };
}

// Get today's date and calculate some dates
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);

const lastWeek = new Date(today);
lastWeek.setDate(lastWeek.getDate() - 7);

const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

const threeDaysAgo = new Date(today);
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

const fiveDaysAgo = new Date(today);
fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

// Demo users
export const demoUsers = [
  { id: 'demo-user-1', name: 'Demo Admin', email: 'demo@admin.com' },
  { id: 'demo-user-2', name: 'John Smith', email: 'john@demo.com' },
  { id: 'demo-user-3', name: 'Sarah Johnson', email: 'sarah@demo.com' },
  { id: 'demo-user-4', name: 'Mike Wilson', email: 'mike@demo.com' },
];

// Demo groups
export const demoGroups: DemoGroup[] = [
  {
    id: 'demo-group-1',
    name: 'Sky High Flying Club',
    description: 'A welcoming club for pilots of all experience levels. We operate modern aircraft and maintain high safety standards.',
    ownerId: 'demo-user-1',
    dryRate: 145,
    wetRate: 195,
    role: 'ADMIN',
    aircraft: [
      {
        id: 'demo-aircraft-1',
        groupId: 'demo-group-1',
        nNumber: 'N172SP',
        nickname: 'Skyhawk',
        customName: 'Skyhawk',
        make: 'Cessna',
        model: '172S Skyhawk',
        year: 2025,
        totalTachHours: 125.4,
        totalHobbsHours: 98.2,
        registrationType: 'Standard',
        hasInsurance: true,
        maxPassengers: 4,
        hourlyRate: 165,
        aircraftNotes: JSON.stringify({
          aircraftStatus: 'Available',
          lastAnnual: '2025-06-15',
          nextAnnualDue: '2026-06-15',
          registrationExp: '2027-01-15',
          insuranceExp: '2026-03-01',
          engineHours: 125.4,
          timeSinceNew: 98.2,
          lastOilChange: 115.0,
          nextOilDue: 120.0,
        }),
        status: 'Available',
      },
      {
        id: 'demo-aircraft-2',
        groupId: 'demo-group-1',
        nNumber: 'N9876P',
        nickname: 'Warrior',
        customName: 'Warrior II',
        make: 'Piper',
        model: 'PA-28-161',
        year: 2019,
        totalTachHours: 2150.5,
        totalHobbsHours: 1842.3,
        registrationType: 'Standard',
        hasInsurance: true,
        maxPassengers: 4,
        hourlyRate: 145,
        aircraftNotes: JSON.stringify({
          aircraftStatus: 'Available',
          lastAnnual: '2025-08-20',
          nextAnnualDue: '2026-08-20',
          registrationExp: '2026-11-30',
          insuranceExp: '2026-02-15',
          engineHours: 2150.5,
          timeSinceNew: 1842.3,
          lastOilChange: 2100.0,
          nextOilDue: 2150.0,
        }),
        status: 'Available',
      },
    ],
    members: [
      { id: 'demo-member-1', userId: 'demo-user-1', groupId: 'demo-group-1', role: 'ADMIN', joinedAt: '2024-01-15', user: demoUsers[0] },
      { id: 'demo-member-2', userId: 'demo-user-2', groupId: 'demo-group-1', role: 'MEMBER', joinedAt: '2024-03-20', user: demoUsers[1] },
      { id: 'demo-member-3', userId: 'demo-user-3', groupId: 'demo-group-1', role: 'MEMBER', joinedAt: '2024-06-10', user: demoUsers[2] },
    ],
    showBookings: true,
    showAircraft: true,
    showFlights: true,
    showMaintenance: true,
    showBilling: true,
    showBillingAll: true,
    showMembers: true,
    showPartners: true,
    defaultInviteExpiry: 7,
  },
  {
    id: 'demo-group-2',
    name: 'Weekend Warriors',
    description: 'Casual flying group for weekend adventures. Perfect for pilots who want to split costs and enjoy social flights.',
    ownerId: 'demo-user-1',
    dryRate: 120,
    wetRate: 165,
    role: 'MEMBER',
    aircraft: [
      {
        id: 'demo-aircraft-3',
        groupId: 'demo-group-2',
        nNumber: 'N345AB',
        nickname: 'Cherokee',
        customName: 'Cherokee Six',
        make: 'Piper',
        model: 'PA-32-300',
        year: 1978,
        totalTachHours: 5420.0,
        totalHobbsHours: 4890.5,
        registrationType: 'Standard',
        hasInsurance: true,
        maxPassengers: 6,
        hourlyRate: 135,
        aircraftNotes: JSON.stringify({
          aircraftStatus: 'Available',
          lastAnnual: '2025-04-10',
          nextAnnualDue: '2026-04-10',
          registrationExp: '2026-08-20',
          insuranceExp: '2026-01-30',
          engineHours: 5420.0,
          timeSinceNew: 4890.5,
          lastOilChange: 5350.0,
          nextOilDue: 5400.0,
        }),
        status: 'Available',
      },
    ],
    members: [
      { id: 'demo-member-4', userId: 'demo-user-4', groupId: 'demo-group-2', role: 'ADMIN', joinedAt: '2023-11-01', user: demoUsers[3] },
      { id: 'demo-member-5', userId: 'demo-user-1', groupId: 'demo-group-2', role: 'MEMBER', joinedAt: '2024-02-15', user: demoUsers[0] },
    ],
    showBookings: true,
    showAircraft: true,
    showFlights: true,
    showMaintenance: true,
    showBilling: true,
    showBillingAll: false,
    showMembers: true,
    showPartners: true,
    defaultInviteExpiry: 30,
  },
];

// Demo bookings
export const demoBookings: DemoBooking[] = [
  {
    id: 'demo-booking-1',
    aircraftId: 'demo-aircraft-1',
    userId: 'demo-user-1',
    startTime: threeDaysAgo.toISOString(),
    endTime: new Date(threeDaysAgo.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    purpose: 'Local practice flight - maneuvers and landings',
    createdAt: lastWeek.toISOString(),
    groupName: 'Sky High Flying Club',
    aircraft: {
      id: 'demo-aircraft-1',
      nNumber: 'N172SP',
      customName: 'Skyhawk',
      nickname: 'Skyhawk',
      make: 'Cessna',
      model: '172S Skyhawk',
      groupName: 'Sky High Flying Club',
    },
    user: demoUsers[0],
  },
  {
    id: 'demo-booking-2',
    aircraftId: 'demo-aircraft-1',
    userId: 'demo-user-2',
    startTime: fiveDaysAgo.toISOString(),
    endTime: new Date(fiveDaysAgo.getTime() + 3 * 60 * 60 * 1000).toISOString(),
    purpose: 'Cross-country to KCRQ',
    createdAt: lastWeek.toISOString(),
    groupName: 'Sky High Flying Club',
    aircraft: {
      id: 'demo-aircraft-1',
      nNumber: 'N172SP',
      customName: 'Skyhawk',
      nickname: 'Skyhawk',
      make: 'Cessna',
      model: '172S Skyhawk',
      groupName: 'Sky High Flying Club',
    },
    user: demoUsers[1],
  },
  {
    id: 'demo-booking-3',
    aircraftId: 'demo-aircraft-1',
    userId: 'demo-user-1',
    startTime: tomorrow.toISOString(),
    endTime: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    purpose: 'Weekend local flight',
    createdAt: today.toISOString(),
    groupName: 'Sky High Flying Club',
    aircraft: {
      id: 'demo-aircraft-1',
      nNumber: 'N172SP',
      customName: 'Skyhawk',
      nickname: 'Skyhawk',
      make: 'Cessna',
      model: '172S Skyhawk',
      groupName: 'Sky High Flying Club',
    },
    user: demoUsers[0],
  },
  {
    id: 'demo-booking-4',
    aircraftId: 'demo-aircraft-2',
    userId: 'demo-user-3',
    startTime: nextWeek.toISOString(),
    endTime: new Date(nextWeek.getTime() + 4 * 60 * 60 * 1000).toISOString(),
    purpose: 'Cross-country to KBFL and back',
    createdAt: today.toISOString(),
    groupName: 'Sky High Flying Club',
    aircraft: {
      id: 'demo-aircraft-2',
      nNumber: 'N9876P',
      customName: 'Warrior II',
      nickname: 'Warrior',
      make: 'Piper',
      model: 'PA-28-161',
      groupName: 'Sky High Flying Club',
    },
    user: demoUsers[2],
  },
  {
    id: 'demo-booking-5',
    aircraftId: 'demo-aircraft-3',
    userId: 'demo-user-1',
    startTime: new Date(today.getTime() + 3 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(today.getTime() + 6 * 60 * 60 * 1000).toISOString(),
    purpose: 'Weekend group flight to the coast',
    createdAt: twoDaysAgo.toISOString(),
    groupName: 'Weekend Warriors',
    aircraft: {
      id: 'demo-aircraft-3',
      nNumber: 'N345AB',
      customName: 'Cherokee Six',
      nickname: 'Cherokee',
      make: 'Piper',
      model: 'PA-32-300',
      groupName: 'Weekend Warriors',
    },
    user: demoUsers[0],
  },
];

// Demo flight logs
export const demoFlightLogs: DemoFlightLog[] = [
  {
    id: 'demo-log-1',
    aircraftId: 'demo-aircraft-1',
    userId: 'demo-user-1',
    date: threeDaysAgo.toISOString(),
    tachTime: 1.8,
    hobbsTime: 2.0,
    notes: 'Practice maneuvers, 3 takeoffs and landings. Good flight.',
    createdAt: threeDaysAgo.toISOString(),
    aircraft: {
      id: 'demo-aircraft-1',
      nNumber: 'N172SP',
      customName: 'Skyhawk',
      nickname: 'Skyhawk',
      make: 'Cessna',
      model: '172S Skyhawk',
    },
    user: demoUsers[0],
  },
  {
    id: 'demo-log-2',
    aircraftId: 'demo-aircraft-1',
    userId: 'demo-user-2',
    date: fiveDaysAgo.toISOString(),
    tachTime: 2.9,
    hobbsTime: 3.1,
    notes: 'Cross-country to KCRQ. Beautiful day for flying. Stopped for lunch.',
    createdAt: fiveDaysAgo.toISOString(),
    aircraft: {
      id: 'demo-aircraft-1',
      nNumber: 'N172SP',
      customName: 'Skyhawk',
      nickname: 'Skyhawk',
      make: 'Cessna',
      model: '172S Skyhawk',
    },
    user: demoUsers[1],
  },
  {
    id: 'demo-log-3',
    aircraftId: 'demo-aircraft-2',
    userId: 'demo-user-3',
    date: twoDaysAgo.toISOString(),
    tachTime: 1.5,
    hobbsTime: 1.4,
    notes: 'Night currency flight. 3 takeoffs and landings full stop.',
    createdAt: twoDaysAgo.toISOString(),
    aircraft: {
      id: 'demo-aircraft-2',
      nNumber: 'N9876P',
      customName: 'Warrior II',
      nickname: 'Warrior',
      make: 'Piper',
      model: 'PA-28-161',
    },
    user: demoUsers[2],
  },
  {
    id: 'demo-log-4',
    aircraftId: 'demo-aircraft-1',
    userId: 'demo-user-1',
    date: lastWeek.toISOString(),
    tachTime: 4.2,
    hobbsTime: 4.5,
    notes: 'Instrument practice in IMC. Hood work and approaches.',
    createdAt: lastWeek.toISOString(),
    aircraft: {
      id: 'demo-aircraft-1',
      nNumber: 'N172SP',
      customName: 'Skyhawk',
      nickname: 'Skyhawk',
      make: 'Cessna',
      model: '172S Skyhawk',
    },
    user: demoUsers[0],
  },
  {
    id: 'demo-log-5',
    aircraftId: 'demo-aircraft-3',
    userId: 'demo-user-1',
    date: twoDaysAgo.toISOString(),
    tachTime: 5.5,
    hobbsTime: 6.0,
    notes: 'Group flight to coastal airport. Great weather. Landed at KAVX.',
    createdAt: twoDaysAgo.toISOString(),
    aircraft: {
      id: 'demo-aircraft-3',
      nNumber: 'N345AB',
      customName: 'Cherokee Six',
      nickname: 'Cherokee',
      make: 'Piper',
      model: 'PA-32-300',
    },
    user: demoUsers[0],
  },
];

// Demo maintenance
export const demoMaintenance: DemoMaintenance[] = [
  {
    id: 'demo-maint-1',
    aircraftId: 'demo-aircraft-1',
    userId: 'demo-user-1',
    description: 'Oil change due at 120 hours',
    notes: 'Standard oil change. Using AeroShell Oil W100.',
    status: 'NEEDED',
    cost: 85,
    isGrounded: false,
    reportedDate: today.toISOString(),
    resolvedDate: null,
    createdAt: today.toISOString(),
    aircraft: {
      id: 'demo-aircraft-1',
      nNumber: 'N172SP',
      customName: 'Skyhawk',
      nickname: 'Skyhawk',
    },
  },
  {
    id: 'demo-maint-2',
    aircraftId: 'demo-aircraft-2',
    userId: 'demo-user-1',
    description: 'Annual inspection coming due',
    notes: 'Annual inspection due August 20th. Schedule with maintenance provider.',
    status: 'NEEDED',
    cost: 2500,
    isGrounded: false,
    reportedDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedDate: null,
    createdAt: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    aircraft: {
      id: 'demo-aircraft-2',
      nNumber: 'N9876P',
      customName: 'Warrior II',
      nickname: 'Warrior',
    },
  },
  {
    id: 'demo-maint-3',
    aircraftId: 'demo-aircraft-3',
    userId: 'demo-user-4',
    description: 'VOR check completed',
    notes: 'VOR check completed within 30 days. All within tolerances.',
    status: 'DONE',
    cost: 0,
    isGrounded: false,
    reportedDate: lastWeek.toISOString(),
    resolvedDate: lastWeek.toISOString(),
    createdAt: lastWeek.toISOString(),
    aircraft: {
      id: 'demo-aircraft-3',
      nNumber: 'N345AB',
      customName: 'Cherokee Six',
      nickname: 'Cherokee',
    },
  },
];
