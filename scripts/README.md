# Aviation Hub Scripts

This directory contains Python scripts for loading static airport data and scraping fuel/fees.

## Prerequisites

Install Python dependencies:

```bash
pip install -r requirements.txt
```

## 1. Load Static Data (One-Time Setup)

Downloads airports, runways, and frequencies from OurAirports.com and loads them into SQLite.

```bash
python scripts/load_static_data.py
```

This will:
- Download 3 CSV files from OurAirports.com
- Filter airports to valid types (large_airport, medium_airport, small_airport, seaplane_base)
- Filter frequencies to ATIS, TOWER, GROUND, UNICOM, CTAF, AWOS, ASOS
- Store all runways for each airport
- Create indexes for fast lookups
- Output database to `data/aviation_hub.db`

**Expected output:**
```
🚀 Aviation Hub Static Data Loader

📥 Downloading airports.csv... ✓ (50,234 airports)
📥 Downloading runways.csv... ✓ (68,450 runways)
📥 Downloading frequencies.csv... ✓ (45,890 frequencies)

🔍 Filtering airports...
   → 18,234 airports after filtering

💾 Inserting data (upsert mode)...
   • airports: 18,234 rows
   • runways: 52,891 rows
   • frequencies: 12,456 rows

✅ Done! Database ready at data/aviation_hub.db
```

## 2. Scrape Fuel & Fees (On-Demand)

Scrapes fuel prices and landing fees from AirNav (primary) and GlobalAir (fallback).

```bash
python scripts/scrape_fuel.py KORD
```

Features:
- **Dual-source**: Tries AirNav first, falls back to GlobalAir
- **Tiered caching**: 
  - Fuel prices: 72-hour TTL
  - Landing fees: 30-day TTL
- **Fail-safe**: Returns stale cached data if both scrapers fail
- **Headless**: Runs in headless Chrome mode

## Database Schema

### airports (static - loaded once)
```sql
CREATE TABLE airports (
    icao TEXT PRIMARY KEY,
    iata TEXT,
    name TEXT,
    type TEXT,
    latitude REAL,
    longitude REAL,
    elevation_ft INTEGER,
    city TEXT,
    state TEXT,
    country TEXT,
    is_closed INTEGER DEFAULT 0,
    loaded_at TEXT
);
```

### runways (static - one-to-many)
```sql
CREATE TABLE runways (
    id INTEGER PRIMARY KEY,
    icao TEXT NOT NULL,
    runway_ident TEXT,
    length_ft INTEGER,
    width_ft INTEGER,
    surface TEXT,
    he_ident TEXT,
    le_ident TEXT
);
```

### frequencies (static - filtered)
```sql
CREATE TABLE frequencies (
    id INTEGER PRIMARY KEY,
    icao TEXT NOT NULL,
    frequency_mhz REAL,
    description TEXT,
    type TEXT
);
```

### airport_cache (dynamic - fuel/fees)
```sql
CREATE TABLE airport_cache (
    icao TEXT NOT NULL,
    data_type TEXT NOT NULL,  -- 'fuel' or 'fee'
    price REAL,
    source_site TEXT,        -- 'airnav' or 'globalair'
    last_updated TEXT NOT NULL,
    PRIMARY KEY (icao, data_type)
);
```

## Usage from Python

```python
import sqlite3
from pathlib import Path

DB_PATH = Path("data/aviation_hub.db")
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Get airport info
cursor.execute("SELECT * FROM airports WHERE icao = ?", ("KORD",))
airport = cursor.fetchone()

# Get all runways
cursor.execute("SELECT * FROM runways WHERE icao = ?", ("KORD",))
runways = cursor.fetchall()

# Get frequencies
cursor.execute("SELECT * FROM frequencies WHERE icao = ? ORDER BY type", ("KORD",))
freqs = cursor.fetchall()
```

## Troubleshooting

### Selenium/Chrome issues
If you get Chrome driver errors, ensure Chrome is installed:
```bash
# Check Chrome version
chrome --version

# Or install Chrome
# macOS: brew install google-chrome
# Ubuntu: wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
```

### Database locked errors
Close any other connections to the database before running scripts.
