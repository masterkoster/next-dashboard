#!/usr/bin/env python3
"""
Static Data Loader for Aviation Hub
Downloads airports, runways, and frequencies from OurAirports.com
and loads them into SQLite database with upsert support.

Usage: python scripts/load_static_data.py
"""

import os
import sqlite3
import requests
import pandas as pd
from datetime import datetime
from io import StringIO
from pathlib import Path

# Configuration
DB_PATH = Path("data/aviation_hub.db")
TEMP_DIR = Path("data/temp")

# CSV URLs from OurAirports
CSV_URLS = {
    "airports": "https://ourairports.com/data/airports.csv",
    "runways": "https://ourairports.com/data/runways.csv",
    "frequencies": "https://ourairports.com/data/airport-frequencies.csv"
}

# Filter constants
VALID_AIRPORT_TYPES = ['large_airport', 'medium_airport', 'small_airport', 'seaplane_base']
VALID_FREQ_TYPES = ['ATIS', 'TOWER', 'GROUND', 'UNICOM', 'CTAF', 'AWOS', 'ASOS']


def setup_database():
    """Create tables and indexes if they don't exist."""
    print("[SETUP] Setting up database...")
    
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Airports table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS airports (
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
            loaded_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Runways table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS runways (
            id INTEGER PRIMARY KEY,
            icao TEXT NOT NULL,
            runway_ident TEXT,
            length_ft INTEGER,
            width_ft INTEGER,
            surface TEXT,
            he_ident TEXT,
            le_ident TEXT
        )
    """)
    
    # Frequencies table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS frequencies (
            id INTEGER PRIMARY KEY,
            icao TEXT NOT NULL,
            frequency_mhz REAL,
            description TEXT,
            type TEXT
        )
    """)
    
    conn.commit()
    conn.close()
    
    print("   [OK] Database tables created")


def create_indexes():
    """Create indexes for fast lookups."""
    print("[INDEX] Creating indexes...")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    indexes = [
        "CREATE INDEX IF NOT EXISTS idx_runways_icao ON runways(icao)",
        "CREATE INDEX IF NOT EXISTS idx_frequencies_icao ON frequencies(icao)",
        "CREATE INDEX IF NOT EXISTS idx_airports_type ON airports(type)",
        "CREATE INDEX IF NOT EXISTS idx_airports_state ON airports(state)",
        "CREATE INDEX IF NOT EXISTS idx_airports_country ON airports(country)",
    ]
    
    for idx_sql in indexes:
        cursor.execute(idx_sql)
    
    conn.commit()
    conn.close()
    
    print("   [OK] Indexes created")


def download_csv(name: str) -> pd.DataFrame:
    """Download a CSV from OurAirports and return as DataFrame."""
    url = CSV_URLS[name]
    print(f"[DOWNLOAD] Downloading {name}.csv...")
    
    response = requests.get(url, timeout=60)
    response.raise_for_status()
    
    df = pd.read_csv(StringIO(response.text), low_memory=False)
    print(f"[OK] Downloaded {len(df):,} rows")
    
    return df


def filter_airports(df: pd.DataFrame) -> pd.DataFrame:
    """Filter airports to valid types and exclude closed ones."""
    print("[FILTER] Filtering airports...")
    
    # Filter by type
    df = df[df['type'].isin(VALID_AIRPORT_TYPES)].copy()
    
    # Note: OurAirports CSV no longer has is_closed column
    # Closed airports are marked by type='closed'
    
    # Rename ident to icao for clarity
    df = df.rename(columns={'ident': 'icao'})
    
    # Select relevant columns
    cols = ['icao', 'iata_code', 'name', 'type', 'latitude_deg', 'longitude_deg', 
            'elevation_ft', 'municipality', 'iso_region', 'iso_country']
    df = df[[c for c in cols if c in df.columns]]
    
    # Rename columns to match schema
    rename_map = {
        'iata_code': 'iata',
        'latitude_deg': 'latitude',
        'longitude_deg': 'longitude',
        'elevation_ft': 'elevation_ft',
        'municipality': 'city',
        'iso_region': 'state',
        'iso_country': 'country'
    }
    df = df.rename(columns=rename_map)
    
    # Add is_closed (always 0 since closed airports are filtered by type)
    df['is_closed'] = 0
    
    # Add loaded_at timestamp
    df['loaded_at'] = datetime.now().isoformat()
    
    print(f"   -> {len(df):,} airports after filtering")
    
    return df


def filter_runways(df: pd.DataFrame, valid_icaos: set) -> pd.DataFrame:
    """Filter runways to only include airports we imported."""
    print("[FILTER] Filtering runways...")
    
    # Filter to valid airports only
    df = df[df['airport_ident'].isin(valid_icaos)].copy()
    
    # Rename columns
    df = df.rename(columns={
        'airport_ident': 'icao',
        'runway_ident': 'runway_ident',
        'length_ft': 'length_ft',
        'width_ft': 'width_ft',
        'surface': 'surface',
        'he_ident': 'he_ident',
        'le_ident': 'le_ident'
    })
    
    # Select relevant columns
    cols = ['icao', 'runway_ident', 'length_ft', 'width_ft', 'surface', 'he_ident', 'le_ident']
    df = df[[c for c in cols if c in df.columns]]
    
    # Convert numeric columns, handle missing
    df['length_ft'] = pd.to_numeric(df['length_ft'], errors='coerce').fillna(0).astype(int)
    df['width_ft'] = pd.to_numeric(df['width_ft'], errors='coerce').fillna(0).astype(int)
    
    print(f"   -> {len(df):,} runways after filtering")
    
    return df


def filter_frequencies(df: pd.DataFrame, valid_icaos: set) -> pd.DataFrame:
    """Filter frequencies to valid types and airports."""
    print("[FILTER] Filtering frequencies...")
    
    # Filter to valid airports
    df = df[df['airport_ident'].isin(valid_icaos)].copy()
    
    # Filter to valid types
    df = df[df['type'].isin(VALID_FREQ_TYPES)].copy()
    
    # Rename columns
    df = df.rename(columns={
        'airport_ident': 'icao',
        'frequency_mhz': 'frequency_mhz'
    })
    
    # Select relevant columns
    cols = ['icao', 'frequency_mhz', 'description', 'type']
    df = df[[c for c in cols if c in df.columns]]
    
    # Convert frequency to float
    df['frequency_mhz'] = pd.to_numeric(df['frequency_mhz'], errors='coerce')
    
    # Remove rows with no frequency
    df = df.dropna(subset=['frequency_mhz'])
    
    print(f"   -> {len(df):,} frequencies after filtering")
    
    return df


def insert_data(df: pd.DataFrame, table_name: str):
    """Insert or replace data using upsert (INSERT OR REPLACE)."""
    print(f"[INSERT] Inserting {table_name}...")
    
    conn = sqlite3.connect(DB_PATH)
    
    # Use INSERT OR REPLACE for upsert behavior
    df.to_sql(table_name, conn, if_exists='replace', index=False)
    
    conn.commit()
    conn.close()
    
    print(f"   [OK] {len(df):,} rows inserted into {table_name}")


def print_summary():
    """Print database summary."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("\n[STATS] Database Summary:")
    print("-" * 40)
    
    # Count airports by type
    cursor.execute("SELECT type, COUNT(*) FROM airports GROUP BY type ORDER BY COUNT(*) DESC")
    print("\nAirports by type:")
    for row in cursor.fetchall():
        print(f"   {row[0]}: {row[1]:,}")
    
    # Total counts
    cursor.execute("SELECT COUNT(*) FROM airports")
    total = cursor.fetchone()[0]
    print(f"\n   Total airports: {total:,}")
    
    cursor.execute("SELECT COUNT(*) FROM runways")
    print(f"   Total runways: {cursor.fetchone()[0]:,}")
    
    cursor.execute("SELECT COUNT(*) FROM frequencies")
    print(f"   Total frequencies: {cursor.fetchone()[0]:,}")
    
    # Sample airport
    cursor.execute("SELECT icao, name, city, state FROM airports LIMIT 3")
    print("\nSample airports:")
    for row in cursor.fetchall():
        print(f"   {row[0]}: {row[1]} ({row[2]}, {row[3]})")
    
    conn.close()


def main():
    """Main function to run the entire import process."""
    print("=" * 50)
    print("AViation Hub Static Data Loader")
    print("=" * 50)
    print(f"\nStarted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    start_time = datetime.now()
    
    # Step 1: Setup database
    setup_database()
    
    # Step 2: Download CSVs
    airports_df = download_csv("airports")
    runways_df = download_csv("runways")
    frequencies_df = download_csv("frequencies")
    
    # Step 3: Filter data
    airports_df = filter_airports(airports_df)
    valid_icaos = set(airports_df['icao'])
    
    runways_df = filter_runways(runways_df, valid_icaos)
    frequencies_df = filter_frequencies(frequencies_df, valid_icaos)
    
    # Step 4: Insert into database (upsert mode)
    insert_data(airports_df, "airports")
    insert_data(runways_df, "runways")
    insert_data(frequencies_df, "frequencies")
    
    # Step 5: Create indexes
    create_indexes()
    
    # Step 6: Print summary
    print_summary()
    
    elapsed = (datetime.now() - start_time).total_seconds()
    print(f"\n[DONE] Completed in {elapsed:.1f} seconds")
    print(f"[PATH] Database location: {DB_PATH.absolute()}")


if __name__ == "__main__":
    main()
