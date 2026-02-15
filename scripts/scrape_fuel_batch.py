#!/usr/bin/env python3
"""
Batch Fuel Scraper - Scrapes multiple airports efficiently.
Reuses browser instance for faster scraping.

Usage: python scripts/scrape_fuel_batch.py
Or: python scripts/scrape_fuel_batch.py --limit 50
"""

import sqlite3
import os
import sys
import time
import random
from pathlib import Path
from datetime import datetime
from typing import Optional, List

# Selenium imports
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager

# BeautifulSoup for parsing
from bs4 import BeautifulSoup

# Configuration
DB_PATH = Path("data/aviation_hub.db")

# Popular GA airports to scrape (major airports with flight schools, FBOs)
POPULAR_GA_AIRPORTS = [
    # California
    "KVNY", "KHHR", "KEMT", "KSLI", "KWVI", "KPAO", "KSJC", "KOAK", 
    "KSNA", "KLAX", "KBUR", "KCNI", "KIFP", "KIPL",
    # Texas
    "KHOU", "KIAH", "KADS", "KDAL", "KTKI", "KDTO", "KAFW", "KFTW",
    "KSAT", "KSSF", "KRND", "KBAZ",
    # Florida
    "KMIA", "KFLL", "KPBI", "KOPF", "KTMB", "KFXE", "KPMP", "KSUA",
    "KMCO", "KSFB", "KDAB", "KGNV", "KTLH", "KPFN",
    # New York
    "KISP", "KFRG", "KHPN", "KTEB", "KCDW", "KMMU", "KLDJ", "KJFK",
    # Arizona
    "KPHX", "KDVT", "KGEU", "KGYR", "KSCF", "KTUS", "KRYN",
    # Colorado
    "KDEN", "KAPA", "KBJC", "KCOS", "KGJT", "KEGE",
    # Georgia
    "KATL", "KPDK", "KRYY", "KFTY", "KMCN", "KABY",
    # Washington
    "KSEA", "KBFI", "KPAE", "KGEG", "KTWF",
    # Illinois
    "KORD", "KMDW", "KPWK", "KUGN", "KCMH", "KCMI",
    # Nevada
    "KLAS", "KHND", "KRNO", "KACV",
    # Oregon
    "KPDX", "KEUG", "KMFR", "KUAO",
    # North Carolina
    "KCLT", "KRDU", "KGSO", "KFAY", "KAVL",
    # Virginia
    "KIAD", "KDCA", "KORF", "KPHF", "KRIC",
    # Massachusetts
    "KBOS", "KBED", "KOWD", "KPSM", "KHYA",
    # Michigan
    "KDTW", "KGRR", "KLAN", "KMKG", "KTTF",
    # Ohio
    "KCLE", "KCMH", "KCAK", "KTOL", "KDAY",
    # Other major GA
    "KSTL", "KMCI", "KMSP", "KDCA", "KPHL", "KPIT",
    "KSDF", "KTUL", "KABQ", "KOMA", "KMKE", "KIND",
    "KSAN", "KSMF", "KFAT", "KMRY", "KAVP", "KSCE",
]

# Only airports NOT already in cache
def get_airports_to_scrape(limit: int = 100) -> List[str]:
    """Get list of airports that need fuel data."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get airports already cached (fuel data, any freshness)
    cursor.execute("""
        SELECT DISTINCT icao FROM airport_cache 
        WHERE data_type = 'fuel'
    """)
    cached = {row[0] for row in cursor.fetchall()}
    
    # Get all airports from our database
    cursor.execute("SELECT icao FROM airports LIMIT 5000")
    all_airports = {row[0] for row in cursor.fetchall()}
    
    conn.close()
    
    # Filter to airports we have in DB but not cached
    uncached = [a for a in POPULAR_GA_AIRPORTS if a in all_airports and a not in cached]
    
    # If none from our list, try random from DB
    if not uncached:
        uncached = [a for a in all_airports if a not in cached]
        random.shuffle(uncached)
    
    return uncached[:limit]


def init_cache_table():
    """Create airport_cache table for fuel/fees if not exists."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS airport_cache (
            icao TEXT NOT NULL,
            data_type TEXT NOT NULL,
            price REAL,
            source_site TEXT,
            last_updated TEXT NOT NULL,
            PRIMARY KEY (icao, data_type)
        )
    """)
    
    conn.commit()
    conn.close()


def save_cached_data(icao: str, data_type: str, price: float, source_site: str):
    """Save or update cached data."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT OR REPLACE INTO airport_cache (icao, data_type, price, source_site, last_updated)
        VALUES (?, ?, ?, ?, ?)
    """, (icao, data_type, price, source_site, datetime.now().isoformat()))
    
    conn.commit()
    conn.close()


def create_driver():
    """Create headless Selenium WebDriver."""
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    driver.set_page_load_timeout(20)
    driver.implicitly_wait(5)
    return driver


def scrape_airport(driver, icao: str) -> dict:
    """Scrape fuel prices from AirNav for a single airport."""
    url = f"https://www.airnav.com/airport/{icao}"
    
    result = {
        "icao": icao,
        "avgas_price": None,
        "jet_a_price": None,
        "landing_fee": None,
        "success": False,
        "error": None
    }
    
    try:
        driver.get(url)
        
        # Wait for page to load
        time.sleep(2)  # Simple wait
        
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        page_text = soup.get_text()
        
        import re
        
        # Pattern: "100LL Jet AFS $X.XX $X.XX" - two prices
        match = re.search(r'100LL\s+Jet\s+AFS.*?\$(\d+\.?\d*).*?\$(\d+\.?\d*)', page_text, re.IGNORECASE)
        if match:
            result["avgas_price"] = float(match.group(1))
            result["jet_a_price"] = float(match.group(2))
        else:
            # Try just finding $ amounts
            prices = re.findall(r'\$(\d+\.?\d*)', page_text)
            if prices:
                try:
                    result["avgas_price"] = float(prices[0])
                except:
                    pass
                try:
                    result["jet_a_price"] = float(prices[1])
                except:
                    pass
        
        # Landing fees
        fee_match = re.search(r'Landing[:\s]*\$?(\d+\.?\d*)', page_text, re.IGNORECASE)
        if fee_match:
            result["landing_fee"] = float(fee_match.group(1))
        
        result["success"] = bool(result["avgas_price"] or result["jet_a_price"])
        
    except Exception as e:
        result["error"] = str(e)[:100]
    
    return result


def batch_scrape(icao_list: List[str], delay_between: float = 3.0):
    """Scrape multiple airports using a single browser instance."""
    driver = create_driver()
    
    stats = {"success": 0, "failed": 0, "skipped": 0}
    
    try:
        for i, icao in enumerate(icao_list):
            print(f"[{i+1}/{len(icao_list)}] Scraping {icao}...", end=" ")
            
            # Rate limiting
            if i > 0:
                time.sleep(delay_between + random.uniform(0.5, 1.5))
            
            result = scrape_airport(driver, icao)
            
            if result["success"]:
                print(f"SUCCESS - 100LL: ${result['avgas_price']}, Jet A: ${result['jet_a_price']}")
                
                # Save fuel data
                if result["avgas_price"]:
                    save_cached_data(icao, "fuel", result["avgas_price"], "airnav")
                
                # Save landing fee if found
                if result["landing_fee"]:
                    save_cached_data(icao, "fee", result["landing_fee"], "airnav")
                
                stats["success"] += 1
            else:
                if result["error"]:
                    print(f"FAILED - {result['error']}")
                else:
                    print(f"NO DATA - No fuel prices found")
                stats["failed"] += 1
                
    except KeyboardInterrupt:
        print("\n\nInterrupted by user!")
    finally:
        driver.quit()
    
    return stats


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Batch fuel scraper")
    parser.add_argument("--limit", type=int, default=30, help="Max airports to scrape")
    parser.add_argument("--delay", type=float, default=3.0, help="Delay between requests (seconds)")
    args = parser.parse_args()
    
    print("=" * 60)
    print("BATCH FUEL SCRAPER - Aviation Hub")
    print("=" * 60)
    
    # Initialize
    init_cache_table()
    
    # Get airports to scrape
    airports = get_airports_to_scrape(args.limit)
    
    if not airports:
        print("No airports to scrape (all cached)!")
        return
    
    print(f"Found {len(airports)} airports to scrape")
    print(f"Delay between requests: {args.delay}s")
    print("-" * 60)
    
    # Run batch
    stats = batch_scrape(airports, args.delay)
    
    print("-" * 60)
    print("STATS:")
    print(f"  Success: {stats['success']}")
    print(f"  Failed:  {stats['failed']}")
    print(f"  Total:   {stats['success'] + stats['failed']}")
    print("=" * 60)


if __name__ == "__main__":
    main()
