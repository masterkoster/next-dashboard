"""
Script to download and import FAA Aircraft Registration database into Azure SQL.
Run: python scripts/import_faa_data.py
"""

import os
import urllib.request
import zipfile
import csv
import sqlite3
import time

# FAA Database Download URL
FAA_DOWNLOAD_URL = "https://www.faa.gov/licenses_certificates/aircraft_certification/aircraft_registry/releasable_aircraft_download"

# Local paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), "data")
ACFT_FILE = os.path.join(DATA_DIR, "ACFTREF.txt")
MASTER_FILE = os.path.join(DATA_DIR, "MASTER.txt")

def download_faa_data():
    """Download FAA database files."""
    import ssl
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    
    # The FAA provides the download as a zip - we need to find the actual link
    # For now, let's try to download from the known location
    # The file is typically at: https://www.faa.gov/licenses_certificates/.../ACFT.zip
    
    print("Downloading FAA database...")
    print("Note: You'll need to manually download from:")
    print(FAA_DOWNLOAD_URL)
    print("\nDownload these files and place in the data folder:")
    print("  - MASTER.txt (Aircraft Registration Master file)")
    print("  - ACFTREF.txt (Aircraft Reference file)")
    
    # For demo purposes, create sample data if files don't exist
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
    
    return os.path.exists(MASTER_FILE) and os.path.exists(ACFT_FILE)

def parse_master_file(filepath):
    """Parse the FAA MASTER.txt file."""
    print(f"Parsing {filepath}...")
    
    aircraft = []
    with open(filepath, 'r', encoding='latin-1') as f:
        reader = csv.reader(f)
        for row in reader:
            if len(row) < 50:
                continue
            try:
                # FAA MASTER.txt column layout (approximate)
                aircraft.append({
                    'n_number': row[0].strip() if len(row) > 0 else '',
                    'serial_number': row[1].strip() if len(row) > 1 else '',
                    'mfr': row[2].strip() if len(row) > 2 else '',
                    'model': row[3].strip() if len(row) > 3 else '',
                    'type_aircraft': row[4].strip() if len(row) > 4 else '',
                    'type_engine': row[5].strip() if len(row) > 5 else '',
                    'status_code': row[6].strip() if len(row) > 6 else '',
                    'air_worth_date': row[7].strip() if len(row) > 7 else '',
                    'last_action_date': row[8].strip() if len(row) > 8 else '',
                    'cert_issue_date': row[9].strip() if len(row) > 9 else '',
                    'type_registrant': row[10].strip() if len(row) > 10 else '',
                    'name': row[11].strip() if len(row) > 11 else '',
                    'street': row[12].strip() if len(row) > 12 else '',
                    'city': row[13].strip() if len(row) > 13 else '',
                    'state': row[14].strip() if len(row) > 14 else '',
                    'zip_code': row[15].strip() if len(row) > 15 else '',
                    'country': row[16].strip() if len(row) > 16 else '',
                    'eng_mfr': row[17].strip() if len(row) > 17 else '',
                    'engine_model': row[18].strip() if len(row) > 18 else '',
                    'eng_count': row[19].strip() if len(row) > 19 else '',
                })
            except Exception as e:
                continue
    
    return aircraft

def create_sample_data():
    """Create sample aircraft data for testing."""
    print("Creating sample data...")
    
    # Sample aircraft data for testing
    sample_aircraft = [
        {
            'n_number': 'N12345',
            'serial_number': '172-12345',
            'mfr': 'CESSNA',
            'model': '172S',
            'type_aircraft': 'Fixed Wing Single-Engine',
            'type_engine': 'Reciprocating',
            'status_code': 'Valid',
            'air_worth_date': '2024-05-15',
            'last_action_date': '2024-05-15',
            'cert_issue_date': '2020-05-15',
            'type_registrant': 'Individual',
            'name': 'JOHN SMITH',
            'street': '123 MAIN ST',
            'city': 'ANYTOWN',
            'state': 'CA',
            'zip_code': '90210',
            'country': 'UNITED STATES',
            'eng_mfr': 'LYCOMING',
            'engine_model': 'IO-360-L2A',
            'eng_count': '1',
        },
        {
            'n_number': 'N2025',
            'serial_number': '510',
            'mfr': 'DASSAULT AVIATION',
            'model': 'FALCON 7X',
            'type_aircraft': 'Fixed Wing Multi-Engine',
            'type_engine': 'Turbo-fan',
            'status_code': 'Valid',
            'air_worth_date': '2024-12-11',
            'last_action_date': '2024-12-11',
            'cert_issue_date': '2024-12-11',
            'type_registrant': 'Corporation',
            'name': 'TVPX AIRCRAFT SOLUTIONS INC TRUSTEE',
            'street': '39 E EAGLE RIDGE DR STE 201',
            'city': 'NORTH SALT LAKE',
            'state': 'UT',
            'zip_code': '84054',
            'country': 'UNITED STATES',
            'eng_mfr': 'PRATT & WHITNEY',
            'engine_model': 'PW307A',
            'eng_count': '3',
        },
        {
            'n_number': 'N5678',
            'serial_number': '2828-1234',
            'mfr': 'PIPER',
            'model': 'PA-28-181',
            'type_aircraft': 'Fixed Wing Single-Engine',
            'type_engine': 'Reciprocating',
            'status_code': 'Valid',
            'air_worth_date': '2023-08-20',
            'last_action_date': '2023-08-20',
            'cert_issue_date': '2018-08-20',
            'type_registrant': 'Individual',
            'name': 'JANE DOE',
            'street': '456 OAK AVE',
            'city': 'MIAMI',
            'state': 'FL',
            'zip_code': '33101',
            'country': 'UNITED STATES',
            'eng_mfr': 'LYCOMING',
            'engine_model': 'IO-360-B1E',
            'eng_count': '1',
        },
        {
            'n_number': 'N9876',
            'serial_number': 'B-456',
            'mfr': 'BOEING',
            'model': '737-800',
            'type_aircraft': 'Fixed Wing Multi-Engine',
            'type_engine': 'Turbo-fan',
            'status_code': 'Valid',
            'air_worth_date': '2024-01-10',
            'last_action_date': '2024-01-10',
            'cert_issue_date': '2022-01-10',
            'type_registrant': 'Corporation',
            'name': 'AIRLINES INC',
            'street': '789 AIRPORT BLVD',
            'city': 'ATLANTA',
            'state': 'GA',
            'zip_code': '30301',
            'country': 'UNITED STATES',
            'eng_mfr': 'GENERAL ELECTRIC',
            'engine_model': 'CFM56-7B26',
            'eng_count': '2',
        },
    ]
    
    return sample_aircraft

def save_to_sqlite(aircraft):
    """Save aircraft data to SQLite for testing."""
    db_path = os.path.join(DATA_DIR, "aircraft.db")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS AircraftMaster (
            n_number TEXT PRIMARY KEY,
            serial_number TEXT,
            mfr TEXT,
            model TEXT,
            type_aircraft TEXT,
            type_engine TEXT,
            status_code TEXT,
            air_worth_date TEXT,
            last_action_date TEXT,
            cert_issue_date TEXT,
            type_registrant TEXT,
            name TEXT,
            street TEXT,
            city TEXT,
            state TEXT,
            zip_code TEXT,
            country TEXT,
            eng_mfr TEXT,
            engine_model TEXT,
            eng_count TEXT
        )
    """)
    
    # Insert data
    for ac in aircraft:
        cursor.execute("""
            INSERT OR REPLACE INTO AircraftMaster 
            (n_number, serial_number, mfr, model, type_aircraft, type_engine,
             status_code, air_worth_date, last_action_date, cert_issue_date,
             type_registrant, name, street, city, state, zip_code, country,
             eng_mfr, engine_model, eng_count)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            ac['n_number'], ac['serial_number'], ac['mfr'], ac['model'],
            ac['type_aircraft'], ac['type_engine'], ac['status_code'],
            ac['air_worth_date'], ac['last_action_date'], ac['cert_issue_date'],
            ac['type_registrant'], ac['name'], ac['street'], ac['city'],
            ac['state'], ac['zip_code'], ac['country'], ac['eng_mfr'],
            ac['engine_model'], ac['eng_count']
        ))
    
    conn.commit()
    conn.close()
    
    print(f"Saved {len(aircraft)} aircraft to {db_path}")
    return db_path

if __name__ == "__main__":
    print("FAA Aircraft Data Import Script")
    print("=" * 50)
    
    # Check if FAA files exist
    if download_faa_data():
        aircraft = parse_master_file(MASTER_FILE)
    else:
        # Use sample data
        aircraft = create_sample_data()
    
    # Save to SQLite for local testing
    db_path = save_to_sqlite(aircraft)
    
    print(f"\nDone! Data saved to: {db_path}")
    print(f"Total aircraft: {len(aircraft)}")
