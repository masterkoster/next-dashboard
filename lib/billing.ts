import { prisma } from '@/lib/prisma';
import { chargeCustomer } from './stripe';

export interface BillingResult {
  userId: string;
  email: string;
  name: string;
  success: boolean;
  amount: number;
  invoiceId?: string;
  error?: string;
}

export async function runBillingCycle(groupId: string): Promise<BillingResult[]> {
  const results: BillingResult[] = [];

  // Get the most recent billing run for this group
  const lastRun = await prisma.$queryRawUnsafe(`
    SELECT TOP 1 * FROM BillingRun 
    WHERE groupId = '${groupId}' 
    ORDER BY startedAt DESC
  `) as any[];

  const lastRunDate = lastRun && lastRun.length > 0 
    ? new Date(lastRun[0].startedAt) 
    : new Date(0); // If no previous run, get all flights

  // Get all flight logs since last billing run
  const flightLogs = await prisma.$queryRawUnsafe(`
    SELECT 
      fl.*,
      a.nNumber,
      a.hourlyRate,
      a.groupId as aircraftGroupId,
      u.email as userEmail,
      u.name as userName
    FROM FlightLog fl
    JOIN ClubAircraft a ON fl.aircraftId = a.id
    JOIN [User] u ON fl.userId = u.id
    WHERE a.groupId = '${groupId}'
    AND fl.createdAt > '${lastRunDate.toISOString()}'
    ORDER BY fl.userId, fl.date
  `) as any[];

  if (!flightLogs || flightLogs.length === 0) {
    console.log('No flights to bill');
    return results;
  }

  // Group flights by user
  const flightsByUser: Record<string, any[]> = {};
  for (const flight of flightLogs) {
    if (!flightsByUser[flight.userId]) {
      flightsByUser[flight.userId] = [];
    }
    flightsByUser[flight.userId].push(flight);
  }

  // Create billing run record
  const billingRunId = crypto.randomUUID();
  await prisma.$executeRawUnsafe(`
    INSERT INTO BillingRun (id, groupId, startedAt, status)
    VALUES ('${billingRunId}', '${groupId}', GETDATE(), 'running')
  `);

  // Process each user's billing
  for (const [userId, flights] of Object.entries(flightsByUser)) {
    const user = flights[0];
    const email = user.userEmail;
    const name = user.userName || 'Member';
    
    // Calculate total
    let total = 0;
    const invoiceItems: any[] = [];
    
    for (const flight of flights) {
      const hobbs = flight.hobbsTime ? Number(flight.hobbsTime) : 0;
      const rate = flight.hourlyRate ? Number(flight.hourlyRate) : 0;
      const amount = hobbs * rate;
      total += amount;
      
      invoiceItems.push({
        flightLogId: flight.id,
        aircraftId: flight.aircraftId,
        hobbsHours: hobbs,
        hourlyRate: rate,
        amount,
      });
    }

    // Apply account credits
    const userRecord = await prisma.$queryRawUnsafe(`
      SELECT credits FROM [User] WHERE id = '${userId}'
    `) as any[];
    
    let creditApplied = 0;
    if (userRecord && userRecord.length > 0 && userRecord[0].credits > 0) {
      creditApplied = Math.min(userRecord[0].credits, total);
      total = total - creditApplied;
      
      // Deduct credits
      await prisma.$executeRawUnsafe(`
        UPDATE [User] SET credits = credits - ${creditApplied} WHERE id = '${userId}'
      `);
    }

    // Create invoice
    const invoiceId = crypto.randomUUID();
    await prisma.$executeRawUnsafe(`
      INSERT INTO Invoice (id, groupId, userId, billingRunId, totalAmount, status, createdAt)
      VALUES ('${invoiceId}', '${groupId}', '${userId}', '${billingRunId}', ${total}, 'pending', GETDATE())
    `);

    // Create invoice items
    for (const item of invoiceItems) {
      const itemId = crypto.randomUUID();
      await prisma.$executeRawUnsafe(`
        INSERT INTO InvoiceItem (id, invoiceId, flightLogId, aircraftId, hobbsHours, hourlyRate, amount)
        VALUES ('${itemId}', '${invoiceId}', '${item.flightLogId}', '${item.aircraftId}', ${item.hobbsHours}, ${item.hourlyRate}, ${item.amount})
      `);
    }

    // Attempt Stripe charge
    let success = false;
    let error: string | undefined;
    let stripePaymentId: string | undefined;

    try {
      const userDetails = await prisma.$queryRawUnsafe(`
        SELECT stripeCustomerId FROM [User] WHERE id = '${userId}'
      `) as any[];

      if (userDetails && userDetails.length > 0 && userDetails[0].stripeCustomerId && total > 0) {
        const charge = await chargeCustomer(
          userDetails[0].stripeCustomerId,
          total,
          `Flight charges - ${flights.length} flights`
        );
        
        if (charge.status === 'succeeded') {
          success = true;
          stripePaymentId = charge.id;
          
          // Update invoice status
          await prisma.$executeRawUnsafe(`
            UPDATE Invoice SET status = 'paid', stripePaymentId = '${stripePaymentId}' WHERE id = '${invoiceId}'
          `);
        } else {
          error = `Payment ${charge.status}`;
        }
      } else if (total === 0) {
        // No charge needed (credits covered everything)
        success = true;
        await prisma.$executeRawUnsafe(`
          UPDATE Invoice SET status = 'paid' WHERE id = '${invoiceId}'
        `);
      } else {
        error = 'No Stripe customer on file';
      }
    } catch (e: any) {
      error = e.message || 'Stripe charge failed';
    }

    results.push({
      userId,
      email,
      name,
      success,
      amount: total,
      invoiceId,
      error,
    });
  }

  // Update billing run with results
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;
  const totalAmount = results.reduce((sum, r) => sum + r.amount, 0);

  await prisma.$executeRawUnsafe(`
    UPDATE BillingRun 
    SET status = 'completed', 
        completedAt = GETDATE(),
        totalAmount = ${totalAmount},
        successCount = ${successCount},
        failureCount = ${failureCount},
        details = '${JSON.stringify(results).replace(/'/g, "''")}'
    WHERE id = '${billingRunId}'
  `);

  return results;
}
