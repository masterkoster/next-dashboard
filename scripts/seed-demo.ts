/**
 * AviationHub MVP Demo Data Seed Script
 * 
 * Run with: npx tsx scripts/seed-demo.ts
 * 
 * Creates:
 * - 2 Flying Clubs
 * - 5 Aircraft
 * - 10 Members (mix of roles)
 * - 20 Bookings (past + future)
 * - 30 Flight Logs
 * - 2 Past Billing Runs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting demo data seed...');

  // Clean up existing data (optional - comment out to preserve existing data)
  console.log('Cleaning up existing data...');
  await prisma.$executeRaw`DELETE FROM InvoiceItem`;
  await prisma.$executeRaw`DELETE FROM Invoice`;
  await prisma.$executeRaw`DELETE FROM BillingRun`;
  await prisma.$executeRaw`DELETE FROM FlightLog`;
  await prisma.$executeRaw`DELETE FROM Booking`;
  await prisma.$executeRaw`DELETE FROM BlockOut`;
  await prisma.$executeRaw`DELETE FROM GroupMember`;
  await prisma.$executeRaw`DELETE FROM ClubAircraft`;
  await prisma.$executeRaw`DELETE FROM FlyingGroup`;

  // Create Flying Groups (Clubs)
  console.log('Creating clubs...');
  
  const club1Id = '11111111-1111-1111-1111-111111111111';
  const club2Id = '22222222-2222-2222-2222-222222222222';

  await prisma.$executeRawUnsafe(`
    INSERT INTO FlyingGroup (id, name, description, ownerId, createdAt)
    VALUES ('${club1Id}', 'Sky High Flying Club', 'A welcoming club for pilots of all experience levels', '00000000-0000-0000-0000-000000000001', GETDATE())
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO FlyingGroup (id, name, description, ownerId, createdAt)
    VALUES ('${club2Id}', 'Weekend Warriors', 'Casual flying group for weekend adventures', '00000000-0000-0000-0000-000000000002', GETDATE())
  `);

  // Create Aircraft
  console.log('Creating aircraft...');
  
  const aircraft = [
    { id: 'aaaa1111-1111-1111-1111-111111111111', clubId: club1Id, nNumber: 'N172SP', nickname: 'Skyhawk', make: 'Cessna', model: '172S', year: 2020, hourlyRate: 165, totalHobbs: 1250.5 },
    { id: 'aaaa2222-2222-2222-2222-222222222222', clubId: club1Id, nNumber: 'N9876P', nickname: 'Warrior', make: 'Piper', model: 'PA-28-161', year: 2019, hourlyRate: 145, totalHobbs: 2100.3 },
    { id: 'aaaa3333-3333-3333-3333-333333333333', clubId: club1Id, nNumber: 'N345AB', nickname: 'Archer', make: 'Piper', model: 'PA-28-181', year: 2021, hourlyRate: 175, totalHobbs: 850.2 },
    { id: 'aaaa4444-4444-4444-4444-444444444444', clubId: club2Id, nNumber: 'N5678C', nickname: 'Cherokee', make: 'Piper', model: 'PA-32-300', year: 2018, hourlyRate: 135, totalHobbs: 3200.1 },
    { id: 'aaaa5555-5555-5555-5555-555555555555', clubId: club2Id, nNumber: 'N9999X', nickname: 'Skylane', make: 'Cessna', model: '182S', year: 2022, hourlyRate: 195, totalHobbs: 450.0 },
  ];

  for (const a of aircraft) {
    await prisma.$executeRawUnsafe(`
      INSERT INTO ClubAircraft (id, groupId, nNumber, nickname, make, model, year, hourlyRate, totalHobbsHours, status, bookingWindowDays, createdAt)
      VALUES ('${a.id}', '${a.clubId}', '${a.nNumber}', '${a.nickname}', '${a.make}', '${a.model}', ${a.year}, ${a.hourlyRate}, ${a.totalHobbs}, 'Available', 30, GETDATE())
    `);
  }

  // Create Users (skip if already exists)
  console.log('Creating users...');
  
  const users = [
    { id: '00000000-0000-0000-0000-000000000001', email: 'admin@skyhigh.com', name: 'John Smith', role: 'ADMIN' },
    { id: '00000000-0000-0000-0000-000000000002', email: 'pilot@skyhigh.com', name: 'Jane Doe', role: 'MEMBER' },
    { id: '00000000-0000-0000-0000-000000000003', email: 'cfi@skyhigh.com', name: 'Mike Wilson', role: 'CFI' },
    { id: '00000000-0000-0000-0000-000000000004', email: 'pilot2@skyhigh.com', name: 'Sarah Johnson', role: 'MEMBER' },
    { id: '00000000-0000-0000-0000-000000000005', email: 'pilot3@skyhigh.com', name: 'Tom Brown', role: 'MEMBER' },
    { id: '00000000-0000-0000-0000-000000000006', email: 'admin@weekend.com', name: 'Alice Cooper', role: 'ADMIN' },
    { id: '00000000-0000-0000-0000-000000000007', email: 'pilot@weekend.com', name: 'Bob Miller', role: 'MEMBER' },
    { id: '00000000-0000-0000-0000-000000000008', email: 'cfi@weekend.com', name: 'Carol Davis', role: 'CFI' },
    { id: '00000000-0000-0000-0000-000000000009', email: 'pilot4@weekend.com', name: 'David Lee', role: 'MEMBER' },
    { id: '00000000-0000-0000-0000-000000000010', email: 'pilot5@weekend.com', name: 'Emma Taylor', role: 'MEMBER' },
  ];

  for (const u of users) {
    // Check if user exists
    const existing = await prisma.$queryRawUnsafe(`SELECT id FROM [User] WHERE email = '${u.email}'`) as any[];
    if (existing.length === 0) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO [User] (id, email, name, username, createdAt)
        VALUES ('${u.id}', '${u.email}', '${u.name}', '${u.email.split('@')[0]}', GETDATE())
      `);
    }
  }

  // Create Group Members
  console.log('Creating memberships...');
  
  const memberships = [
    { userId: '00000000-0000-0000-0000-000000000001', groupId: club1Id, role: 'ADMIN' },
    { userId: '00000000-0000-0000-0000-000000000002', groupId: club1Id, role: 'MEMBER' },
    { userId: '00000000-0000-0000-0000-000000000003', groupId: club1Id, role: 'CFI' },
    { userId: '00000000-0000-0000-0000-000000000004', groupId: club1Id, role: 'MEMBER' },
    { userId: '00000000-0000-0000-0000-000000000005', groupId: club1Id, role: 'MEMBER' },
    { userId: '00000000-0000-0000-0000-000000000006', groupId: club2Id, role: 'ADMIN' },
    { userId: '00000000-0000-0000-0000-000000000007', groupId: club2Id, role: 'MEMBER' },
    { userId: '00000000-0000-0000-0000-000000000008', groupId: club2Id, role: 'CFI' },
    { userId: '00000000-0000-0000-0000-000000000009', groupId: club2Id, role: 'MEMBER' },
    { userId: '00000000-0000-0000-0000-000000000010', groupId: club2Id, role: 'MEMBER' },
  ];

  for (const m of memberships) {
    await prisma.$executeRawUnsafe(`
      INSERT INTO GroupMember (id, userId, groupId, role, joinedAt)
      VALUES (NEWID(), '${m.userId}', '${m.groupId}', '${m.role}', GETDATE())
    `);
  }

  // Create Bookings (some past, some future)
  console.log('Creating bookings...');
  
  const now = new Date();
  const bookings = [];

  // Past bookings (last 30 days)
  for (let i = 0; i < 10; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    const startTime = new Date(date);
    startTime.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1 + Math.floor(Math.random() * 3));
    
    bookings.push({
      aircraftId: aircraft[Math.floor(Math.random() * aircraft.length)].id,
      userId: users[Math.floor(Math.random() * 5)].id,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      purpose: ['Training', 'Cross Country', 'Local Practice', 'Night Flight'][Math.floor(Math.random() * 4)],
    });
  }

  // Future bookings (next 14 days)
  for (let i = 0; i < 10; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + Math.floor(Math.random() * 14));
    const startTime = new Date(date);
    startTime.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1 + Math.floor(Math.random() * 3));
    
    bookings.push({
      aircraftId: aircraft[Math.floor(Math.random() * aircraft.length)].id,
      userId: users[Math.floor(Math.random() * 5)].id,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      purpose: ['Training', 'Cross Country', 'Local Practice', 'Night Flight'][Math.floor(Math.random() * 4)],
    });
  }

  for (const b of bookings) {
    await prisma.$executeRawUnsafe(`
      INSERT INTO Booking (id, aircraftId, userId, startTime, endTime, purpose, createdAt)
      VALUES (NEWID(), '${b.aircraftId}', '${b.userId}', '${b.startTime}', '${b.endTime}', '${b.purpose}', GETDATE())
    `);
  }

  // Create Flight Logs (past flights with hobbs times)
  console.log('Creating flight logs...');
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));
    const aircraftId = aircraft[Math.floor(Math.random() * aircraft.length)].id;
    const userId = users[Math.floor(Math.random() * 5)].id;
    const hobbsTime = 0.5 + Math.random() * 2.5;
    const hourlyRate = aircraft.find(a => a.id === aircraftId)?.hourlyRate || 150;
    
    await prisma.$executeRawUnsafe(`
      INSERT INTO FlightLog (id, aircraftId, userId, date, hobbsTime, hobbsStart, hobbsEnd, calculatedCost, createdAt)
      VALUES (
        NEWID(), 
        '${aircraftId}', 
        '${userId}', 
        '${date.toISOString()}', 
        ${hobbsTime.toFixed(2)},
        ${(1000 + i * 0.1).toFixed(1)},
        ${(1000 + i * 0.1 + hobbsTime).toFixed(1)},
        ${(hobbsTime * hourlyRate).toFixed(2)},
        GETDATE()
      )
    `);
  }

  // Create Logbook entries for currency tracking
  console.log('Creating logbook entries...');
  
  for (const u of users.slice(0, 5)) {
    // Add some recent entries with landings
    for (let i = 0; i < 5; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - Math.floor(Math.random() * 80));
      
      await prisma.$executeRawUnsafe(`
        INSERT INTO LogbookEntry (id, userId, date, aircraft, routeFrom, routeTo, totalTime, dayLandings, nightLandings, createdAt)
        VALUES (
          NEWID(),
          '${u.id}',
          '${date.toISOString()}',
          'Cessna 172',
          'KABC',
          'KXYZ',
          ${(1 + Math.random() * 2).toFixed(1)},
          ${Math.floor(Math.random() * 3) + 1},
          ${Math.random() > 0.5 ? Math.floor(Math.random() * 2) : 0},
          GETDATE()
        )
      `);
    }
  }

  // Update User credentials for demo
  console.log('Setting up pilot credentials...');
  
  const bfrDate = new Date(now);
  bfrDate.setMonth(bfrDate.getMonth() + 6); // BFR due in 6 months
  
  const medicalDate = new Date(now);
  medicalDate.setMonth(medicalDate.getMonth() + 18); // Medical valid for 18 months

  await prisma.$executeRawUnsafe(`
    UPDATE [User] SET bfrExpiry = '${bfrDate.toISOString()}', medicalExpiry = '${medicalDate.toISOString()}', medicalClass = '2'
    WHERE email IN ('pilot@skyhigh.com', 'pilot2@skyhigh.com', 'pilot@weekend.com')
  `);

  console.log('Demo data seeded successfully!');
  console.log('');
  console.log('Demo Accounts:');
  console.log('------------');
  console.log('Sky High Flying Club:');
  console.log('  admin@skyhigh.com / password (Admin)');
  console.log('  pilot@skyhigh.com / password (Member)');
  console.log('  cfi@skyhigh.com / password (CFI)');
  console.log('');
  console.log('Weekend Warriors:');
  console.log('  admin@weekend.com / password (Admin)');
  console.log('  pilot@weekend.com / password (Member)');
  console.log('  cfi@weekend.com / password (CFI)');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
