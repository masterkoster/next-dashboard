#!/usr/bin/env node

/**
 * Airport & Flight Club Contact Scraper
 * 
 * Scrapes contact information for:
 * - Small airports (FBO managers, airport managers)
 * - Flight clubs (presidents, treasurers)
 * - Flight schools (chief instructors, owners)
 * 
 * Sources:
 * - AirNav.com (airport info + FBOs)
 * - AOPA (flight clubs directory)
 * - EAA chapters
 * - Individual airport websites
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Configuration
const CONFIG = {
  // Target states (expand as needed)
  targetStates: ['MI', 'OH', 'IN', 'IL', 'WI', 'MN'],
  
  // Airport types to target
  airportTypes: ['small_airport', 'seaplane_base'],
  
  // Delays to avoid rate limiting (ms)
  delayBetweenRequests: 2000,
  delayBetweenAirports: 5000,
};

// Helper: Sleep function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Extract email from text
function extractEmails(text) {
  if (!text) return [];
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  return [...new Set(text.match(emailRegex) || [])];
}

// Helper: Extract phone numbers
function extractPhones(text) {
  if (!text) return [];
  const phoneRegex = /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  return [...new Set(text.match(phoneRegex) || [])];
}

// Helper: Clean and format text
function cleanText(text) {
  if (!text) return null;
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Scrape AirNav.com for airport and FBO information
 */
async function scrapeAirNav(icao) {
  const url = `https://www.airnav.com/airport/${icao}`;
  
  try {
    console.log(`[AirNav] Scraping ${icao}...`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    const contacts = [];

    // Get airport basic info
    const airportName = $('h1').first().text().trim();
    const city = $('td:contains("City:")').next().text().trim();
    const state = $('td:contains("State:")').next().text().trim();

    // Look for manager/owner contact info
    const managerSection = $('td:contains("Manager:")').next().text();
    const ownerSection = $('td:contains("Owner:")').next().text();
    
    const emails = [
      ...extractEmails(managerSection),
      ...extractEmails(ownerSection),
      ...extractEmails($.html()),
    ];

    const phones = [
      ...extractPhones(managerSection),
      ...extractPhones(ownerSection),
    ];

    if (emails.length > 0 || phones.length > 0) {
      contacts.push({
        organizationType: 'airport',
        organizationName: airportName,
        airportIcao: icao,
        airportName,
        city,
        state,
        contactEmail: emails[0] || null,
        contactPhone: phones[0] || null,
        alternateEmail: emails[1] || null,
        alternatePhone: phones[1] || null,
        sourceUrl: url,
        sourceType: 'airnav',
        notes: `Manager: ${cleanText(managerSection)}\nOwner: ${cleanText(ownerSection)}`,
      });
    }

    // Scrape FBO information
    const fboSection = $('a[name="FBO"]').parent().nextAll();
    fboSection.each((i, elem) => {
      const text = $(elem).text();
      const fboName = $(elem).find('b').first().text();
      
      if (!fboName) return;

      const fboEmails = extractEmails(text);
      const fboPhones = extractPhones(text);

      if (fboEmails.length > 0 || fboPhones.length > 0) {
        contacts.push({
          organizationType: 'fbo',
          organizationName: fboName,
          airportIcao: icao,
          airportName,
          city,
          state,
          contactEmail: fboEmails[0] || null,
          contactPhone: fboPhones[0] || null,
          alternateEmail: fboEmails[1] || null,
          sourceUrl: url,
          sourceType: 'airnav',
          notes: cleanText(text),
        });
      }
    });

    console.log(`[AirNav] Found ${contacts.length} contacts for ${icao}`);
    return contacts;

  } catch (error) {
    console.error(`[AirNav] Error scraping ${icao}:`, error.message);
    return [];
  }
}

/**
 * Scrape individual airport website
 */
async function scrapeAirportWebsite(airport) {
  if (!airport.website) return [];

  try {
    console.log(`[Website] Scraping ${airport.website}...`);
    const response = await axios.get(airport.website, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    const text = $.text();

    const emails = extractEmails(text);
    const phones = extractPhones(text);

    // Look for contact titles
    const contactTitles = ['president', 'treasurer', 'manager', 'director', 'owner', 'chief instructor'];
    let contactTitle = null;
    let contactName = null;

    for (const title of contactTitles) {
      const titleRegex = new RegExp(`(${title})[:\\s-]+([A-Z][a-z]+\\s+[A-Z][a-z]+)`, 'i');
      const match = text.match(titleRegex);
      if (match) {
        contactTitle = title.charAt(0).toUpperCase() + title.slice(1);
        contactName = match[2];
        break;
      }
    }

    if (emails.length > 0 || phones.length > 0) {
      return [{
        organizationType: 'airport',
        organizationName: airport.name,
        airportIcao: airport.icao,
        airportName: airport.name,
        city: airport.city,
        state: airport.state,
        contactName,
        contactTitle,
        contactEmail: emails[0] || null,
        contactPhone: phones[0] || null,
        alternateEmail: emails[1] || null,
        website: airport.website,
        sourceUrl: airport.website,
        sourceType: 'website',
      }];
    }

    return [];

  } catch (error) {
    console.error(`[Website] Error scraping ${airport.website}:`, error.message);
    return [];
  }
}

/**
 * Search Google for flight club contact info
 */
async function searchFlightClubs(city, state) {
  // This would use Google Custom Search API or Serper API
  // For now, returning empty - implement with API key
  console.log(`[Clubs] Searching for flight clubs in ${city}, ${state}...`);
  return [];
}

/**
 * Save contacts to database
 */
async function saveContacts(contacts) {
  let saved = 0;
  let skipped = 0;

  for (const contact of contacts) {
    try {
      // Check if contact already exists (by email or organization)
      const existing = await prisma.outreachContact.findFirst({
        where: {
          OR: [
            { contactEmail: contact.contactEmail },
            {
              AND: [
                { organizationName: contact.organizationName },
                { airportIcao: contact.airportIcao },
              ],
            },
          ],
        },
      });

      if (existing) {
        // Update if we have new info
        await prisma.outreachContact.update({
          where: { id: existing.id },
          data: {
            ...contact,
            updatedAt: new Date(),
          },
        });
        console.log(`[DB] Updated: ${contact.organizationName}`);
        skipped++;
      } else {
        // Create new
        await prisma.outreachContact.create({
          data: contact,
        });
        console.log(`[DB] Saved: ${contact.organizationName}`);
        saved++;
      }
    } catch (error) {
      console.error(`[DB] Error saving contact:`, error.message);
    }
  }

  return { saved, skipped };
}

/**
 * Main scraping function
 */
async function main() {
  console.log('🚀 Starting airport contact scraper...\n');

  // Get target airports from database
  const airports = await prisma.airportCache.findMany({
    where: {
      type: { in: CONFIG.airportTypes },
      state: { in: CONFIG.targetStates },
    },
    take: 50, // Limit for testing - remove or increase later
  });

  console.log(`Found ${airports.length} airports to scrape\n`);

  let totalContacts = [];

  for (const airport of airports) {
    console.log(`\n📍 Processing: ${airport.icao} - ${airport.name}`);

    // Scrape AirNav
    const airNavContacts = await scrapeAirNav(airport.icao);
    totalContacts = totalContacts.concat(airNavContacts);
    await sleep(CONFIG.delayBetweenRequests);

    // Scrape airport website if available
    // Note: website field doesn't exist in current schema, would need to add or fetch separately
    
    await sleep(CONFIG.delayBetweenAirports);
  }

  // Save all contacts
  console.log(`\n💾 Saving ${totalContacts.length} contacts to database...`);
  const { saved, skipped } = await saveContacts(totalContacts);

  console.log(`\n✅ Complete!`);
  console.log(`   New contacts: ${saved}`);
  console.log(`   Updated: ${skipped}`);
  console.log(`   Total: ${saved + skipped}`);

  await prisma.$disconnect();
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { scrapeAirNav, scrapeAirportWebsite, saveContacts };
