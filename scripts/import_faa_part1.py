"""
Script to import FULL FAA database into Azure SQL in PARTS.
Resume from where you left off if it times out.

Run: python scripts/import_faa_part1.py
     python scripts/import_faa_part2.py
     etc.
"""

import os
import sys

# Azure SQL connection settings
AZURE_SERVER = os.environ.get('AZURE_SERVER', 'aviation-server-dk.database.windows.net')
AZURE_DATABASE = os.environ.get('AZURE_DATABASE', 'aviation_db')
AZURE_USER = os.environ.get('AZURE_USER', 'CloudSA183a5780')
AZURE_PASSWORD = os.environ.get('AZURE_PASSWORD', 'Password123')

# Path to your downloaded FAA files
FAA_FILES_PATH = r"C:\Users\David\Downloads\Compressed\ReleasableAircraft"

# How many records to import per run
BATCH_SIZE = 5000

def get_connection():
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
    except Exception as e:
        print(f"Connection error: {e}")
        sys.exit(1)

def parse_master_line(line):
    if len(line) < 50:
        return None
    try:
        return {
            'n_number': 'N' + line[0:5].strip(),
            'serial_number': line[6:36].strip(),
            'mfr_model_code': line[37:44].strip(),
            'type_registrant': line[56:57].strip(),
            'name': line[58:108].strip(),
            'last_action_date': line[219:227].strip(),
            'air_worth_date': line[239:247].strip(),
            'status_code': line[254:256].strip(),
        }
    except:
        return None

def load_acftref():
    """Load manufacturer/model lookup."""
    models = {}
    path = os.path.join(FAA_FILES_PATH, "ACFTREF.txt")
    print(f"Loading {path}...")
    try:
        with open(path, 'r', encoding='latin-1') as f:
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
        print(f"Error: {e}")
    print(f"  Loaded {len(models)} models")
    return models

def get_type_registrant_name(code):
    map = {'1': 'Individual', '2': 'Partnership', '3': 'Corporation', '4': 'Co-Owned', '5': 'Government', '7': 'LLC', '8': 'Non Citizen Corp', '9': 'Non Citizen Co-Owned'}
    return map.get(code, code)

def get_status_name(code):
    map = {'V': 'Valid', 'D': 'Deregistered', 'E': 'Expired', 'R': 'Reserved'}
    return map.get(code, code)

def import_batch(cursor, aircraft_batch):
    imported = 0
    for ac in aircraft_batch:
        try:
            cursor.execute("SELECT COUNT(*) FROM AircraftMaster WHERE N_NUMBER = %s", (ac['n_number'],))
            exists = cursor.fetchone()[0] > 0
            
            if exists:
                cursor.execute("""
                    UPDATE AircraftMaster SET
                        SERIAL_NUMBER = %s, MFR = %s, MODEL = %s,
                        STATUS_CODE = %s, AIR_WORTH_DATE = %s, LAST_ACTION_DATE = %s,
                        TYPE_REGISTRANT = %s, NAME = %s
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
        except:
            continue
    return imported

def main():
    part = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    start_line = (part - 1) * BATCH_SIZE + 1
    
    print("=" * 60)
    print(f"FAA Import - PART {part}")
    print(f"Starting at line {start_line:,}")
    print("=" * 60)
    
    master_path = os.path.join(FAA_FILES_PATH, "MASTER.txt")
    if not os.path.exists(master_path):
        print(f"ERROR: MASTER.txt not found!")
        return
    
    # Load reference data
    acftref = load_acftref()
    
    # Connect
    print("\nConnecting to Azure SQL...")
    conn = get_connection()
    cursor = conn.cursor()
    
    # Count total lines
    print("Counting total records...")
    with open(master_path, 'r', encoding='latin-1') as f:
        total_lines = sum(1 for _ in f)
    print(f"  Total records: {total_lines:,}")
    
    # Process
    print(f"\nProcessing records {start_line:,} to {start_line + BATCH_SIZE:,}...")
    
    batch = []
    imported = 0
    processed = 0
    skipped = 0
    
    with open(master_path, 'r', encoding='latin-1') as f:
        for i, line in enumerate(f, 1):
            if i < start_line:
                skipped += 1
                continue
            
            if i >= start_line + BATCH_SIZE:
                break
            
            parsed = parse_master_line(line)
            if not parsed:
                continue
            
            n_number = parsed.get('n_number', '')
            if not n_number or n_number == 'N':
                continue
            
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
            processed += 1
            
            if len(batch) >= 500:
                imported += import_batch(cursor, batch)
                conn.commit()
                pct = (processed / BATCH_SIZE) * 100
                print(f"  Progress: {pct:.1f}% ({imported} imported)...")
                batch = []
    
    # Final batch
    if batch:
        imported += import_batch(cursor, batch)
        conn.commit()
    
    # Stats
    cursor.execute("SELECT COUNT(*) FROM AircraftMaster")
    total = cursor.fetchone()[0]
    
    print("\n" + "=" * 60)
    print(f"PART {part} COMPLETE!")
    print("=" * 60)
    print(f"  Imported: {imported:,} records")
    print(f"  Total in database: {total:,}")
    
    if processed >= BATCH_SIZE:
        print(f"\nTo continue, run: python scripts/import_faa_part{part+1}.py")
    
    cursor.close()
    conn.close()

if __name__ == "__main__":
    main()
