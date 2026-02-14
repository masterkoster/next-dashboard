"""
Script to import FULL FAA database into Azure SQL.
Reads from your downloaded FAA files.

Run: python scripts/import_faa_release.py
"""

import os
import sys

# Azure SQL connection settings
AZURE_SERVER = os.environ.get('AZURE_SERVER', 'aviation-server-dk.database.windows.net')
AZURE_DATABASE = os.environ.get('AZURE_DATABASE', 'aviation_db')
AZURE_USER = os.environ.get('AZURE_USER', 'CloudSA183a5780')
AZURE_PASSWORD = os.environ.get('AZURE_PASSWORD', 'Password123')

# Path to your downloaded FAA files
# Update this if your files are in a different location
FAA_FILES_PATH = r"C:\Users\David\Downloads\Compressed\ReleasableAircraft"

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
    except:
        return None

def parse_acftref(filepath):
    """Parse ACFTREF file to get manufacturer/model names."""
    models = {}
    print("Parsing ACFTREF.txt for manufacturer/model names...")
    
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
    
    print(f"  Found {len(models)} aircraft models")
    return models

def parse_engine(filepath):
    """Parse ENGINE file to get engine manufacturer/model names."""
    engines = {}
    print("Parsing ENGINE.txt for engine info...")
    
    try:
        with open(filepath, 'r', encoding='latin-1') as f:
            for line in f:
                if len(line) < 30:
                    continue
                try:
                    code = line[0:6].strip()
                    mfr = line[7:37].strip()
                    model = line[38:78].strip()
                    if code:
                        engines[code] = {'mfr': mfr, 'model': model}
                except:
                    continue
    except Exception as e:
        print(f"Error parsing ENGINE: {e}")
    
    print(f"  Found {len(engines)} engine models")
    return engines

def get_type_registrant_name(code):
    map = {
        '1': 'Individual', 
        '2': 'Partnership', 
        '3': 'Corporation',
        '4': 'Co-Owned', 
        '5': 'Government', 
        '7': 'LLC', 
        '8': 'Non Citizen Corp', 
        '9': 'Non Citizen Co-Owned'
    }
    return map.get(code, code)

def get_status_name(code):
    map = {'V': 'Valid', 'D': 'Deregistered', 'E': 'Expired', 'R': 'Reserved'}
    return map.get(code, code)

def import_batch(cursor, aircraft_batch):
    """Import a batch of aircraft."""
    imported = 0
    
    for ac in aircraft_batch:
        try:
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
            continue
    
    return imported

def main():
    print("=" * 60)
    print("FAA Full Database Import to Azure SQL")
    print("=" * 60)
    print(f"Source: {FAA_FILES_PATH}")
    
    # Check if files exist
    master_path = os.path.join(FAA_FILES_PATH, "MASTER.txt")
    acftref_path = os.path.join(FAA_FILES_PATH, "ACFTREF.txt")
    engine_path = os.path.join(FAA_FILES_PATH, "ENGINE.txt")
    
    if not os.path.exists(master_path):
        print(f"\nERROR: MASTER.txt not found at {master_path}")
        return
    
    if not os.path.exists(acftref_path):
        print(f"\nERROR: ACFTREF.txt not found at {acftref_path}")
        return
    
    # Parse reference files
    print("\nLoading reference data...")
    acftref = parse_acftref(acftref_path)
    engines = parse_engine(engine_path) if os.path.exists(engine_path) else {}
    
    # Connect to Azure
    print("\nConnecting to Azure SQL...")
    conn = get_connection()
    cursor = conn.cursor()
    
    # Count lines first
    print("\nCounting aircraft in MASTER.txt...")
    with open(master_path, 'r', encoding='latin-1') as f:
        total_lines = sum(1 for _ in f)
    print(f"  Total records: {total_lines:,}")
    
    # Process MASTER.txt
    print("\n=== Processing MASTER.txt ===")
    
    batch = []
    batch_num = 0
    total_imported = 0
    processed = 0
    
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
            
            # Look up engine
            eng_code = parsed.get('eng_mfr_code', '')
            eng_info = engines.get(eng_code, {})
            
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
            
            # Import in batches of 500
            if len(batch) >= 500:
                batch_num += 1
                imported = import_batch(cursor, batch)
                conn.commit()
                total_imported += imported
                processed += len(batch)
                
                pct = (processed / total_lines) * 100
                print(f"  Batch {batch_num}: {imported} imported ({pct:.1f}% complete)...")
                batch = []
    
    # Import remaining
    if batch:
        batch_num += 1
        imported = import_batch(cursor, batch)
        conn.commit()
        total_imported += imported
        print(f"  Final batch {batch_num}: {imported} imported...")
    
    # Final stats
    cursor.execute("SELECT COUNT(*) FROM AircraftMaster")
    total = cursor.fetchone()[0]
    
    print("\n" + "=" * 60)
    print("IMPORT COMPLETE!")
    print("=" * 60)
    print(f"  Imported: {total_imported:,} aircraft")
    print(f"  Total in database: {total:,}")
    
    cursor.close()
    conn.close()
    
    print("\nYour Plane Carfax now has the FULL FAA database!")

if __name__ == "__main__":
    main()
