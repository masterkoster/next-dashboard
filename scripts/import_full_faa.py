"""
Script to import full FAA database into Azure SQL.
Run AFTER running: python scripts/download_faa_full.py

Run: python scripts/import_full_faa.py
"""

import os
import sys
import time

# Azure SQL connection settings
AZURE_SERVER = os.environ.get('AZURE_SERVER', 'aviation-server-dk.database.windows.net')
AZURE_DATABASE = os.environ.get('AZURE_DATABASE', 'aviation_db')
AZURE_USER = os.environ.get('AZURE_USER', 'CloudSA183a5780')
AZURE_PASSWORD = os.environ.get('AZURE_PASSWORD', 'Password123')

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), "data")
MASTER_FILES_DIR = os.path.join(DATA_DIR, "master_files")

def get_connection():
    """Get Azure SQL connection."""
    try:
        import pymssql
        conn = pymssql.connect(
            server=AZURE_SERVER,
            database=AZURE_DATABASE,
            user=AZURE_USER,
            password=AZURE_PASSWORD,
            charset='UTF-8'
        )
        return conn
    except ImportError:
        print("Error: pymssql not installed.")
        print("Install with: pip install pymssql")
        sys.exit(1)
    except Exception as e:
        print(f"Connection error: {e}")
        sys.exit(1)

def parse_master_line(line):
    """Parse a single line from MASTER file."""
    if len(line) < 50:
        return None
    
    try:
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
            'last_action_date': line[219:227].strip(),
            'cert_issue_date': line[228:236].strip(),
            'air_worth_date': line[239:247].strip(),
            'type_aircraft': line[248:250].strip(),
            'type_engine': line[251:253].strip(),
            'status_code': line[254:256].strip(),
        }
    except:
        return None

def parse_acftref(filepath):
    """Parse ACFTREF file to get manufacturer/model names."""
    models = {}
    try:
        with open(filepath, 'r', encoding='latin-1') as f:
            for line in f:
                if len(line) < 44:
                    continue
                try:
                    code = line[0:7].strip()
                    mfr = line[8:38].strip()
                    model = line[39:79].strip()
                    if code:
                        models[code] = {'mfr': mfr, 'model': model}
                except:
                    continue
    except Exception as e:
        print(f"Error parsing ACFTREF: {e}")
    return models

def get_type_registrant_name(code):
    map = {'1': 'Individual', '2': 'Partnership', '3': 'Corporation', '4': 'Co-Owned', '5': 'Government', '7': 'LLC', '8': 'Non Citizen Corp', '9': 'Non Citizen Co-Owned'}
    return map.get(code, code)

def get_status_name(code):
    map = {'V': 'Valid', 'D': 'Deregistered', 'E': 'Expired', 'R': 'Reserved'}
    return map.get(code, code)

def import_batch(cursor, aircraft_batch, batch_size=100):
    """Import a batch of aircraft."""
    imported = 0
    
    for ac in aircraft_batch:
        try:
            # Check if exists
            cursor.execute("SELECT COUNT(*) FROM AircraftMaster WHERE N_NUMBER = %s", (ac['n_number'],))
            exists = cursor.fetchone()[0] > 0
            
            if exists:
                cursor.execute("""
                    UPDATE AircraftMaster SET
                        SERIAL_NUMBER = %s,
                        MFR = %s,
                        MODEL = %s,
                        STATUS_CODE = %s,
                        AIR_WORTH_DATE = %s,
                        LAST_ACTION_DATE = %s,
                        TYPE_REGISTRANT = %s,
                        NAME = %s
                    WHERE N_NUMBER = %s
                """, (ac['serial_number'], ac['mfr'], ac['model'], ac['status_code'],
                      ac['air_worth_date'], ac['last_action_date'], ac['type_registrant'],
                      ac['name'], ac['n_number']))
            else:
                cursor.execute("""
                    INSERT INTO AircraftMaster (
                        N_NUMBER, SERIAL_NUMBER, MFR, MODEL,
                        STATUS_CODE, AIR_WORTH_DATE, LAST_ACTION_DATE,
                        TYPE_REGISTRANT, NAME
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (ac['n_number'], ac['serial_number'], ac['mfr'], ac['model'],
                      ac['status_code'], ac['air_worth_date'], ac['last_action_date'],
                      ac['type_registrant'], ac['name']))
            
            imported += 1
        except Exception as e:
            print(f"Error importing {ac.get('n_number')}: {e}")
            continue
    
    return imported

def main():
    print("=" * 60)
    print("FAA Full Database Import to Azure SQL")
    print("=" * 60)
    
    # Check if files exist
    acftref_path = os.path.join(DATA_DIR, "ACFTREF.txt")
    if not os.path.exists(acftref_path):
        print("\nERROR: ACFTREF.txt not found!")
        print("Run first: python scripts/download_faa_full.py")
        return
    
    # Parse ACFTREF
    print("\nLoading aircraft reference data...")
    acftref = parse_acftref(acftref_path)
    print(f"  Loaded {len(acftref)} aircraft models")
    
    # Connect to Azure
    print("\nConnecting to Azure SQL...")
    conn = get_connection()
    cursor = conn.cursor()
    
    # Process each MASTER file
    total_imported = 0
    total_files = 9
    
    for file_num in range(1, total_files + 1):
        master_path = os.path.join(MASTER_FILES_DIR, f"MASTER-{file_num}.txt")
        
        if not os.path.exists(master_path):
            print(f"\nMASTER-{file_num}.txt not found, skipping...")
            continue
        
        print(f"\n=== Processing MASTER-{file_num}.txt ===")
        
        batch = []
        batch_count = 0
        file_imported = 0
        
        with open(master_path, 'r', encoding='latin-1') as f:
            for line in f:
                parsed = parse_master_line(line)
                if not parsed:
                    continue
                
                n_number = parsed.get('n_number', '')
                if not n_number or n_number == 'N':
                    continue
                
                # Look up manufacturer/model
                mfr_model_code = parsed.get('mfr_model_code', '')
                model_info = acftref.get(mfr_model_code, {})
                
                aircraft = {
                    'n_number': n_number,
                    'serial_number': parsed.get('serial_number', ''),
                    'mfr': model_info.get('mfr', ''),
                    'model': model_info.get('model', ''),
                    'status_code': get_status_name(parsed.get('status_code', '')),
                    'air_worth_date': parsed.get('air_worth_date', ''),
                    'last_action_date': parsed.get('last_action_date', ''),
                    'type_registrant': get_type_registrant_name(parsed.get('type_registrant', '')),
                    'name': parsed.get('name', ''),
                }
                
                batch.append(aircraft)
                
                # Import in batches
                if len(batch) >= 500:
                    file_imported += import_batch(cursor, batch)
                    conn.commit()
                    batch = []
                    batch_count += 1
                    print(f"  Imported batch {batch_count} ({file_imported} total)...")
        
        # Import remaining
        if batch:
            file_imported += import_batch(cursor, batch)
            conn.commit()
        
        total_imported += file_imported
        print(f"  File {file_num} complete: {file_imported} aircraft imported")
    
    # Final stats
    cursor.execute("SELECT COUNT(*) FROM AircraftMaster")
    total = cursor.fetchone()[0]
    
    print("\n" + "=" * 60)
    print("IMPORT COMPLETE!")
    print("=" * 60)
    print(f"  Total imported: {total_imported}")
    print(f"  Total in database: {total}")
    
    cursor.close()
    conn.close()

if __name__ == "__main__":
    main()
