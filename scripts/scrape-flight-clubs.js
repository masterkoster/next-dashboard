#!/usr/bin/env node

/**
 * Flight Club Contact Scraper
 * 
 * Scrapes flight club directories for contact information
 * 
 * Sources:
 * - AOPA Flight Training Directory
 * - EAA Chapters
 * - Individual club websites
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function extractEmails(text) {
  if (!text) return [];
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  return [...new Set(text.match(emailRegex) || [])];
}

function extractPhones(text) {
  if (!text) return [];
  const phoneRegex = /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  return [...new Set(text.match(phoneRegex) || [])];
}

function cleanText(text) {
  if (!text) return null;
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Scrape EAA Chapter directory
 * https://www.eaa.org/eaa/eaa-chapters/find-an-eaa-chapter
 */
async function scrapeEAAChapters(state) {
  console.log(`[EAA] Scraping chapters for ${state}...`);
  
  const contacts = [];

  try {
    // EAA has a chapter locator - this is a simplified version
    // Real implementation would need to handle their actual API/form
    const response = await axios.get(`https://www.eaa.org/eaa/eaa-chapters/find-an-eaa-chapter`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);

    // Parse chapter listings
    $('.chapter-listing').each((i, elem) => {
      const chapterName = $(elem).find('.chapter-name').text().trim();
      const location = $(elem).find('.location').text().trim();
      const contact = $(elem).find('.contact').text();
      
      const emails = extractEmails(contact);
      const phones = extractPhones(contact);

      // Extract contact name and title
      const nameMatch = contact.match(/([A-Z][a-z]+\s+[A-Z][a-z]+)/);
      const titleMatch = contact.match(/(President|Treasurer|Secretary)/i);

      if (emails.length > 0 || phones.length > 0) {
        contacts.push({
          organizationType: 'flight_club',
          organizationName: chapterName,
          city: location.split(',')[0]?.trim(),
          state: location.split(',')[1]?.trim(),
          contactName: nameMatch ? nameMatch[1] : null,
          contactTitle: titleMatch ? titleMatch[1] : null,
          contactEmail: emails[0] || null,
          contactPhone: phones[0] || null,
          alternateEmail: emails[1] || null,
          sourceUrl: 'https://www.eaa.org/eaa/eaa-chapters/find-an-eaa-chapter',
          sourceType: 'eaa',
          notes: cleanText(contact),
        });
      }
    });

    console.log(`[EAA] Found ${contacts.length} chapters`);
    return contacts;

  } catch (error) {
    console.error(`[EAA] Error:`, error.message);
    return [];
  }
}

/**
 * Scrape flight school directories
 */
async function scrapeFlightSchools(city, state) {
  console.log(`[Schools] Searching for flight schools in ${city}, ${state}...`);
  
  const contacts = [];

  try {
    // Search Google for flight schools
    // Note: This requires Google Custom Search API key
    // For now, using a placeholder

    // Alternative: Scrape AOPA flight training directory
    const response = await axios.get(`https://www.aopa.org/training-and-safety/learn-to-fly/flight-training-resources`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);

    // Parse flight school listings (structure depends on actual site)
    $('.school-listing').each((i, elem) => {
      const schoolName = $(elem).find('.name').text().trim();
      const locationText = $(elem).find('.location').text().trim();
      const contactText = $(elem).text();

      const emails = extractEmails(contactText);
      const phones = extractPhones(contactText);

      if (emails.length > 0 || phones.length > 0) {
        contacts.push({
          organizationType: 'flight_school',
          organizationName: schoolName,
          city: city,
          state: state,
          contactEmail: emails[0] || null,
          contactPhone: phones[0] || null,
          alternateEmail: emails[1] || null,
          sourceUrl: response.config.url,
          sourceType: 'aopa',
          notes: cleanText(contactText),
        });
      }
    });

    console.log(`[Schools] Found ${contacts.length} schools`);
    return contacts;

  } catch (error) {
    console.error(`[Schools] Error:`, error.message);
    return [];
  }
}

/**
 * Scrape individual club website
 */
async function scrapeClubWebsite(url) {
  try {
    console.log(`[Club Website] Scraping ${url}...`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    const text = $.text();
    const html = $.html();

    // Extract contact info
    const emails = extractEmails(html);
    const phones = extractPhones(text);

    // Look for officer names and titles
    const officers = [];
    const titlePatterns = [
      /President[:\s-]+([A-Z][a-z]+\s+[A-Z][a-z]+)/gi,
      /Treasurer[:\s-]+([A-Z][a-z]+\s+[A-Z][a-z]+)/gi,
      /Secretary[:\s-]+([A-Z][a-z]+\s+[A-Z][a-z]+)/gi,
      /Chief\s+Instructor[:\s-]+([A-Z][a-z]+\s+[A-Z][a-z]+)/gi,
    ];

    for (const pattern of titlePatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const title = match[0].split(/[:\s-]/)[0];
        const name = match[1];
        officers.push({ title, name });
      }
    }

    // Get club name from title or h1
    const clubName = $('title').text().split('|')[0].trim() || $('h1').first().text().trim();

    const results = [];

    if (officers.length > 0) {
      officers.forEach((officer, index) => {
        results.push({
          organizationType: 'flight_club',
          organizationName: clubName,
          contactName: officer.name,
          contactTitle: officer.title,
          contactEmail: emails[index] || emails[0] || null,
          contactPhone: phones[index] || phones[0] || null,
          website: url,
          sourceUrl: url,
          sourceType: 'website',
        });
      });
    } else if (emails.length > 0 || phones.length > 0) {
      results.push({
        organizationType: 'flight_club',
        organizationName: clubName,
        contactEmail: emails[0] || null,
        contactPhone: phones[0] || null,
        alternateEmail: emails[1] || null,
        website: url,
        sourceUrl: url,
        sourceType: 'website',
      });
    }

    return results;

  } catch (error) {
    console.error(`[Club Website] Error scraping ${url}:`, error.message);
    return [];
  }
}

/**
 * Save contacts to database
 */
async function saveContacts(contacts) {
  let saved = 0;
  let skipped = 0;

  for (const contact of contacts) {
    try {
      const existing = await prisma.outreachContact.findFirst({
        where: {
          OR: [
            { contactEmail: contact.contactEmail },
            { organizationName: contact.organizationName },
          ],
        },
      });

      if (existing) {
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
 * Main function
 */
async function main() {
  console.log('🚀 Starting flight club scraper...\n');

  const targetStates = ['MI', 'OH', 'IN', 'IL', 'WI', 'MN'];
  let allContacts = [];

  // Scrape EAA chapters
  for (const state of targetStates) {
    const chapters = await scrapeEAAChapters(state);
    allContacts = allContacts.concat(chapters);
    await sleep(3000);
  }

  // Save all contacts
  console.log(`\n💾 Saving ${allContacts.length} contacts to database...`);
  const { saved, skipped } = await saveContacts(allContacts);

  console.log(`\n✅ Complete!`);
  console.log(`   New contacts: ${saved}`);
  console.log(`   Updated: ${skipped}`);
  console.log(`   Total: ${saved + skipped}`);

  await prisma.$disconnect();
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { scrapeEAAChapters, scrapeFlightSchools, scrapeClubWebsite, saveContacts };
