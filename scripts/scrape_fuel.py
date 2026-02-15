#!/usr/bin/env python3
"""
Dual-Source Fuel & Fees Scraper
Uses Selenium with AirNav as primary, GlobalAir as fallback.
Caches data in SQLite with tiered TTL.

Usage: python scripts/scrape_fuel.py KORD
"""

import sqlite3
import os
import sys
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional

# Selenium imports
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# BeautifulSoup for parsing
from bs4 import BeautifulSoup

# Configuration
DB_PATH = Path("data/aviation_hub.db")

# TTL constants (in seconds)
FUEL_TTL = 72 * 3600        # 72 hours
FEE_TTL = 30 * 24 * 3600    # 30 days


def init_cache_table():
    """Create airport_cache table for fuel/fees if not exists."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS airport_cache (
            icao TEXT NOT NULL,
            data_type TEXT NOT NULL,  -- 'fuel' or 'fee'
            price REAL,
            source_site TEXT,          -- 'airnav' or 'globalair'
            last_updated TEXT NOT NULL,
            PRIMARY KEY (icao, data_type)
        )
    """)
    
    conn.commit()
    conn.close()


def get_cached_data(icao: str, data_type: str, ttl_seconds: int) -> Optional[dict]:
    """Check if valid cached data exists."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT price, source_site, last_updated 
        FROM airport_cache 
        WHERE icao = ? AND data_type = ?
    """, (icao, data_type))
    
    row = cursor.fetchone()
    conn.close()
    
    if row:
        last_updated = datetime.fromisoformat(row[2])
        age_seconds = (datetime.now() - last_updated).total_seconds()
        
        if age_seconds < ttl_seconds:
            return {
                "price": row[0],
                "source_site": row[1],
                "last_updated": row[2],
                "age_seconds": age_seconds,
                "is_fresh": True
            }
    
    return None


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
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    
    driver = webdriver.Chrome(options=options)
    driver.set_page_load_timeout(15)
    return driver


def scrape_airnav(icao: str) -> dict:
    """Scrape fuel prices and landing fees from AirNav."""
    url = f"https://www.airnav.com/airport/{icao}"
    
    result = {
        "avgas_price": None,
        "jet_a_price": None,
        "landing_fee": None,
        "source": "airnav",
        "success": False
    }
    
    try:
        driver = create_driver()
        wait = WebDriverWait(driver, 10)
        
        driver.get(url)
        
        # Wait for page to load
        wait.until(lambda d: d.execute_script("return document.readyState") == "complete")
        
        # Get page source for BeautifulSoup
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        
        # Find fuel prices - AirNav typically has them in tables or specific sections
        # Try multiple selectors
        fuel_data = scrape_airnav_fuel_prices(soup)
        result.update(fuel_data)
        
        # Find landing fees
        fee_data = scrape_airnav_landing_fees(soup)
        result.update(fee_data)
        
        result["success"] = True
        
    except Exception as e:
        print(f"   WARNING AirNav error for {icao}: {str(e)[:50]}")
    finally:
        try:
            driver.quit()
        except:
            pass
    
    return result


def scrape_airnav_fuel_prices(soup: BeautifulSoup) -> dict:
    """Extract fuel prices from AirNav page."""
    result = {"avgas_price": None, "jet_a_price": None}
    
    try:
        # Look for fuel price patterns in the page
        # AirNav typically shows prices like "$5.89" near fuel labels
        page_text = soup.get_text()
        
        # Try to find 100LL price
        import re
        ll_patterns = [
            r'100LL[:\s]*\$?(\d+\.?\d*)',
            r'100 LL[:\s]*\$?(\d+\.?\d*)',
            r'Avgas[:\s]*\$?(\d+\.?\d*)',
            r'AVGAS[:\s]*\$?(\d+\.?\d*)'
        ]
        
        for pattern in ll_patterns:
            match = re.search(pattern, page_text, re.IGNORECASE)
            if match:
                result["avgas_price"] = float(match.group(1))
                break
        
        # Try to find Jet A price
        jet_patterns = [
            r'Jet\s*A[:\s]*\$?(\d+\.?\d*)',
            r'JET\s*A[:\s]*\$?(\d+\.?\d*)'
        ]
        
        for pattern in jet_patterns:
            match = re.search(pattern, page_text, re.IGNORECASE)
            if match:
                result["jet_a_price"] = float(match.group(1))
                break
                
    except Exception as e:
        print(f"   WARNING Error parsing fuel: {e}")
    
    return result


def scrape_airnav_landing_fees(soup: BeautifulSoup) -> dict:
    """Extract landing fees from AirNav page."""
    result = {"landing_fee": None}
    
    try:
        page_text = soup.get_text()
        import re
        
        # Look for landing fee patterns
        fee_patterns = [
            r'Landing[:\s]*\$?(\d+\.?\d*)',
            r'Landing\s+Fee[:\s]*\$?(\d+\.?\d*)',
            r'Ramp[:\s]*\$?(\d+\.?\d*)',
            r'Landing\s+charge[:\s]*\$?(\d+\.?\d*)'
        ]
        
        for pattern in fee_patterns:
            match = re.search(pattern, page_text, re.IGNORECASE)
            if match:
                result["landing_fee"] = float(match.group(1))
                break
                
    except Exception as e:
        print(f"   WARNING Error parsing fees: {e}")
    
    return result


def scrape_globalair(icao: str) -> dict:
    """Scrape fuel prices from GlobalAir (fallback source)."""
    url = f"https://www.globalair.com/airport/{icao}"
    
    result = {
        "avgas_price": None,
        "jet_a_price": None,
        "landing_fee": None,
        "source": "globalair",
        "success": False
    }
    
    try:
        driver = create_driver()
        wait = WebDriverWait(driver, 10)
        
        driver.get(url)
        wait.until(lambda d: d.execute_script("return document.readyState") == "complete")
        
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        
        # Similar extraction logic for GlobalAir
        fuel_data = scrape_globalair_fuel_prices(soup)
        result.update(fuel_data)
        
        result["success"] = True
        
    except Exception as e:
        print(f"   WARNING GlobalAir error for {icao}: {str(e)[:50]}")
    finally:
        try:
            driver.quit()
        except:
            pass
    
    return result


def scrape_globalair_fuel_prices(soup: BeautifulSoup) -> dict:
    """Extract fuel prices from GlobalAir page."""
    result = {"avgas_price": None, "jet_a_price": None}
    
    try:
        import re
        page_text = soup.get_text()
        
        # Similar pattern matching for GlobalAir
        ll_match = re.search(r'100LL[:\s]*\$?(\d+\.?\d*)', page_text, re.IGNORECASE)
        if ll_match:
            result["avgas_price"] = float(ll_match.group(1))
        
        jet_match = re.search(r'Jet\s*A[:\s]*\$?(\d+\.?\d*)', page_text, re.IGNORECASE)
        if jet_match:
            result["jet_a_price"] = float(jet_match.group(1))
            
    except Exception as e:
        print(f"   WARNING Error parsing GlobalAir fuel: {e}")
    
    return result


def get_airport_data(icao: str) -> dict:
    """
    Main function to get airport fuel/fees data.
    Uses tiered caching: checks each data type against its TTL.
    Tries AirNav first, falls back to GlobalAir on failure.
    """
    icao = icao.upper()
    
    print(f"\nAIRPORT Getting data for {icao}...")
    
    result = {
        "icao": icao,
        "fuel": {},
        "fees": {},
        "warnings": []
    }
    
    # --- FUEL DATA ---
    cached_fuel = get_cached_data(icao, "fuel", FUEL_TTL)
    
    if cached_fuel:
        result["fuel"] = {
            "avgas_price": cached_fuel["price"],
            "jet_a_price": cached_fuel["price"],  # Simplified - could store both
            "source": cached_fuel["source_site"],
            "last_updated": cached_fuel["last_updated"],
            "age_hours": int(cached_fuel["age_seconds"] / 3600),
            "is_fresh": True
        }
        print(f"   OK Fuel: Using cached (from {cached_fuel['source_site']})")
    else:
        # Try AirNav first
        print(f"   FETCH Scraping AirNav...")
        airnav_result = scrape_airnav(icao)
        
        if airnav_result["success"] and (airnav_result["avgas_price"] or airnav_result["jet_a_price"]):
            # Save to cache
            if airnav_result["avgas_price"]:
                save_cached_data(icao, "fuel", airnav_result["avgas_price"], "airnav")
            
            result["fuel"] = {
                "avgas_price": airnav_result["avgas_price"],
                "jet_a_price": airnav_result["jet_a_price"],
                "source": "airnav",
                "last_updated": datetime.now().isoformat(),
                "age_hours": 0,
                "is_fresh": True
            }
            print(f"   OK Fuel: Scraped from AirNav (${airnav_result['avgas_price']}/gal)")
        else:
            # Fallback to GlobalAir
            print(f"   FETCH AirNav failed, trying GlobalAir...")
            globalair_result = scrape_globalair(icao)
            
            if globalair_result["success"] and (globalair_result["avgas_price"] or globalair_result["jet_a_price"]):
                if globalair_result["avgas_price"]:
                    save_cached_data(icao, "fuel", globalair_result["avgas_price"], "globalair")
                
                result["fuel"] = {
                    "avgas_price": globalair_result["avgas_price"],
                    "jet_a_price": globalair_result["jet_a_price"],
                    "source": "globalair",
                    "last_updated": datetime.now().isoformat(),
                    "age_hours": 0,
                    "is_fresh": True
                }
                print(f"   OK Fuel: Scraped from GlobalAir (${globalair_result['avgas_price']}/gal)")
            else:
                # Both failed - try to get stale data
                stale_fuel = get_cached_data(icao, "fuel", float('inf'))  # Get any data
                if stale_fuel:
                    result["fuel"] = {
                        "avgas_price": stale_fuel["price"],
                        "source": stale_fuel["source_site"],
                        "last_updated": stale_fuel["last_updated"],
                        "age_hours": int(stale_fuel["age_seconds"] / 3600),
                        "is_fresh": False
                    }
                    result["warnings"].append("Using stale fuel data - both scrapers failed")
                    print(f"   WARNING Fuel: Using stale data (age: {int(stale_fuel['age_seconds']/3600)}h)")
                else:
                    result["warnings"].append("No fuel data available")
                    print(f"   X Fuel: No data available")
    
    # --- FEES DATA (same logic, different TTL) ---
    cached_fees = get_cached_data(icao, "fee", FEE_TTL)
    
    if cached_fees:
        result["fees"] = {
            "landing_fee": cached_fees["price"],
            "source": cached_fees["source_site"],
            "last_updated": cached_fees["last_updated"],
            "age_days": int(cached_fees["age_seconds"] / 86400),
            "is_fresh": True
        }
        print(f"   OK Fees: Using cached (from {cached_fees['source_site']})")
    else:
        # Scrape fees from AirNav (primary for fees too)
        print(f"   FETCH Scraping fees from AirNav...")
        airnav_result = scrape_airnav(icao)
        
        if airnav_result["success"] and airnav_result.get("landing_fee"):
            save_cached_data(icao, "fee", airnav_result["landing_fee"], "airnav")
            
            result["fees"] = {
                "landing_fee": airnav_result["landing_fee"],
                "source": "airnav",
                "last_updated": datetime.now().isoformat(),
                "age_days": 0,
                "is_fresh": True
            }
            print(f"   OK Fees: Scraped ${airnav_result['landing_fee']} from AirNav")
        else:
            # Try GlobalAir
            print(f"   FETCH AirNav fees failed, trying GlobalAir...")
            globalair_result = scrape_globalair(icao)
            
            if globalair_result["success"] and globalair_result.get("landing_fee"):
                save_cached_data(icao, "fee", globalair_result["landing_fee"], "globalair")
                
                result["fees"] = {
                    "landing_fee": globalair_result["landing_fee"],
                    "source": "globalair",
                    "last_updated": datetime.now().isoformat(),
                    "age_days": 0,
                    "is_fresh": True
                }
            else:
                # Use stale if available
                stale_fees = get_cached_data(icao, "fee", float('inf'))
                if stale_fees:
                    result["fees"] = {
                        "landing_fee": stale_fees["price"],
                        "source": stale_fees["source_site"],
                        "last_updated": stale_fees["last_updated"],
                        "age_days": int(stale_fees["age_seconds"] / 86400),
                        "is_fresh": False
                    }
                    result["warnings"].append("Using stale fee data")
                else:
                    result["warnings"].append("No fee data available")
    
    return result


def main():
    """CLI entry point."""
    if len(sys.argv) < 2:
        print("Usage: python scripts/scrape_fuel.py <ICAO>")
        print("Example: python scripts/scrape_fuel.py KORD")
        sys.exit(1)
    
    icao = sys.argv[1].upper()
    
    print("=" * 50)
    print("FUEL  Aviation Hub Fuel & Fees Scraper")
    print("=" * 50)
    
    # Initialize cache table
    init_cache_table()
    
    # Get data
    result = get_airport_data(icao)
    
    # Print result
    print("\nSTATS Result:")
    print("-" * 40)
    print(f"ICAO: {result['icao']}")
    
    if result['fuel']:
        print(f"Fuel (100LL): ${result['fuel'].get('avgas_price', 'N/A')}")
        print(f"Fuel Source: {result['fuel'].get('source', 'N/A')}")
        print(f"Fuel Fresh: {result['fuel'].get('is_fresh', 'N/A')}")
    
    if result['fees']:
        print(f"Landing Fee: ${result['fees'].get('landing_fee', 'N/A')}")
    
    if result['warnings']:
        print(f"\n[WARNS] Warnings:")
        for w in result['warnings']:
            print(f"   - {w}")
    
    print("\n[DONE] Done!")


if __name__ == "__main__":
    main()
