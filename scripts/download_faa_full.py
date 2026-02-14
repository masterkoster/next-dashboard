"""
Script to download full FAA database and import to Azure SQL.
Downloads from GitHub mirror of FAA data.

Run: python scripts/download_faa_full.py
"""

import os
import urllib.request
import zipfile
import csv
import time

# GitHub raw URLs for FAA data (mirror from simonw/scrape-faa-releasable-aircraft)
GITHUB_RAW_BASE = "https://raw.githubusercontent.com/simonw/scrape-faa-releasable-aircraft/main"

# Files to download
MASTER_FILES = [
    f"{GITHUB_RAW_BASE}/MASTER-{i}.txt" for i in range(1, 10)
]

ACFTREF_URL = f"{GITHUB_RAW_BASE}/ACFTREF.txt"

# Local paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), "data")
MASTER_FILES_DIR = os.path.join(DATA_DIR, "master_files")

def ensure_dirs():
    """Create necessary directories."""
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(MASTER_FILES_DIR, exist_ok=True)

def download_file(url, filepath):
    """Download a file from URL."""
    print(f"Downloading {url}...")
    try:
        urllib.request.urlretrieve(url, filepath)
        print(f"  Saved to {filepath}")
        return True
    except Exception as e:
        print(f"  Error: {e}")
        return False

def download_master_files():
    """Download all MASTER files."""
    print("\n=== Downloading MASTER files ===")
    for i, url in enumerate(MASTER_FILES, 1):
        filepath = os.path.join(MASTER_FILES_DIR, f"MASTER-{i}.txt")
        if os.path.exists(filepath):
            print(f"MASTER-{i}.txt already exists, skipping...")
            continue
        download_file(url, filepath)
        time.sleep(0.5)  # Be nice to the server

def download_acftref():
    """Download ACFTREF file."""
    filepath = os.path.join(DATA_DIR, "ACFTREF.txt")
    if os.path.exists(filepath):
        print("\nACFTREF.txt already exists, skipping...")
        return filepath
    
    print("\n=== Downloading ACFTREF file ===")
    if download_file(ACFTREF_URL, filepath):
        return filepath
    return None

def count_lines(filepath):
    """Count lines in a file."""
    try:
        with open(filepath, 'r', encoding='latin-1') as f:
            return sum(1 for _ in f)
    except:
        return 0

def parse_master_line(line):
    """Parse a single line from MASTER file."""
    if len(line) < 50:
        return None
    
    try:
        # FAA MASTER.txt fixed-width format
        return {
            'n_number': 'N' + line[0:5].strip(),
            'serial_number': line[6:36].strip(),
            'mfr_model_code': line[37:44].strip(),
            'eng_mfr_code': line[45:50].strip(),
            'year_mfr': line[51:55].strip(),
            'type_registrant': line[56:57].strip(),
            'name': line[58:108].strip(),
            'street1': line[109:142].strip(),
            'street2': line[143:176].strip(),
            'city': line[177:195].strip(),
            'state': line[196:198].strip(),
            'zip_code': line[199:209].strip(),
            'region': line[210:211].strip(),
            'county': line[212:215].strip(),
            'country': line[216:218].strip(),
            'last_action_date': line[219:227].strip(),
            'cert_issue_date': line[228:236].strip(),
            'airworthiness_class': line[237:238].strip(),
            'air_worth_date': line[239:247].strip(),
            'type_aircraft': line[248:250].strip(),
            'type_engine': line[251:253].strip(),
            'status_code': line[254:256].strip(),
        }
    except Exception as e:
        return None

def parse_acftref(filepath):
    """Parse ACFTREF file to get manufacturer/model names."""
    print("Parsing ACFTREF for manufacturer/model names...")
    models = {}
    
    try:
        with open(filepath, 'r', encoding='latin-1') as f:
            for line in f:
                if len(line) < 44:
                    continue
                try:
                    # ACFTREF format: Code, Mfr, Model
                    code = line[0:7].strip()
                    mfr = line[8:38].strip()
                    model = line[39:79].strip()
                    if code:
                        models[code] = {'mfr': mfr, 'model': model}
                except:
                    continue
    except Exception as e:
        print(f"Error parsing ACFTREF: {e}")
    
    print(f"  Found {len(models)} aircraft models")
    return models

def process_master_files(acftref):
    """Process all MASTER files and yield aircraft data."""
    print("\n=== Processing MASTER files ===")
    
    for i in range(1, 10):
        filepath = os.path.join(MASTER_FILES_DIR, f"MASTER-{i}.txt")
        if not os.path.exists(filepath):
            continue
            
        print(f"Processing MASTER-{i}.txt...")
        count = 0
        
        with open(filepath, 'r', encoding='latin-1') as f:
            for line in f:
                parsed = parse_master_line(line)
                if not parsed:
                    continue
                
                n_number = parsed.get('n_number', '')
                if not n_number or n_number == 'N':
                    continue
                
                # Look up manufacturer/model from ACFTREF
                mfr_model_code = parsed.get('mfr_model_code', '')
                model_info = acftref.get(mfr_model_code, {})
                
                # Map type registrant code to name
                type_reg_map = {
                    '1': 'Individual',
                    '2': 'Partnership', 
                    '3': 'Corporation',
                    '4': 'Co-Owned',
                    '5': 'Government',
                    '7': 'LLC',
                    '8': 'Non Citizen Corporation',
                    '9': 'Non Citizen Co-Owned',
                }
                
                # Map status code
                status_map = {
                    'V': 'Valid',
                    'D': 'Deregistered',
                    'E': 'Expired',
                    'R': 'Reserved',
                }
                
                aircraft = {
                    'n_number': n_number,
                    'serial_number': parsed.get('serial_number', ''),
                    'mfr': model_info.get('mfr', ''),
                    'model': model_info.get('model', ''),
                    'status_code': status_map.get(parsed.get('status_code', ''), parsed.get('status_code', '')),
                    'air_worth_date': parsed.get('air_worth_date', ''),
                    'last_action_date': parsed.get('last_action_date', ''),
                    'type_registrant': type_reg_map.get(parsed.get('type_registrant', ''), parsed.get('type_registrant', '')),
                    'name': parsed.get('name', ''),
                    'eng_mfr': '',  # Would need ENGINE file for this
                    'engine_model': '',
                    'eng_count': 1,
                }
                
                count += 1
                yield aircraft
        
        print(f"  Processed {count} aircraft from MASTER-{i}.txt")
    
    print("\nDone processing all MASTER files!")

def main():
    print("=" * 60)
    print("FAA Database Download & Import")
    print("=" * 60)
    
    ensure_dirs()
    
    # Download files
    download_master_files()
    acftref_path = download_acftref()
    
    if not acftref_path:
        print("\nERROR: Could not download ACFTREF file")
        return
    
    # Parse ACFTREF for manufacturer/model lookup
    acftref = parse_acftref(acftref_path)
    
    # Count total aircraft
    total = 0
    for _ in process_master_files(acftref):
        total += 1
        if total % 50000 == 0:
            print(f"  Counted {total} aircraft so far...")
    
    print(f"\nTotal aircraft in database: {total}")
    print("\nTo import to Azure SQL, run: python scripts/import_full_faa.py")

if __name__ == "__main__":
    main()
