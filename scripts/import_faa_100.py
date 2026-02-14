"""
Import FAA data - 100 records at a time
Run: python scripts/import_faa_100.py

Then run: python scripts/import_faa_100.py 2
     etc for more batches
"""

import os
import sys
import pymssql

# Azure SQL connection
conn = pymssql.connect(
    server='aviation-server-dk.database.windows.net',
    database='aviation_db',
    user='CloudSA183a5780',
    password='Password123'
)
cursor = conn.cursor()

# Path to your FAA files
FAA_PATH = r"C:\Users\David\Downloads\Compressed\ReleasableAircraft"

# Load ACFTREF lookup (manufacturer/model)
print("Loading ACFTREF...")
acftref = {}
try:
    with open(os.path.join(FAA_PATH, "ACFTREF.txt"), 'r', encoding='latin-1') as f:
        for line in f:
            if len(line) > 40:
                code = line[0:7].strip()
                mfr = line[8:38].strip()
                model = line[39:79].strip()
                acftref[code] = (mfr, model)
except Exception as e:
    print(f"Error loading ACFTREF: {e}")

print(f"Loaded {len(acftref)} aircraft models")

# Which part to run
part = int(sys.argv[1]) if len(sys.argv) > 1 else 1
start_idx = (part - 1) * 100

# Type registrant map
type_map = {'1': 'Individual', '2': 'Partnership', '3': 'Corporation', '4': 'Co-Owned', '5': 'Government', '7': 'LLC'}
status_map = {'V': 'Valid', 'D': 'Deregistered', 'E': 'Expired', 'R': 'Reserved'}

print(f"\n=== PART {part}: Importing records {start_idx+1} to {start_idx+100} ===")

# Count total first
with open(os.path.join(FAA_PATH, "MASTER.txt"), 'r', encoding='latin-1') as f:
    total = sum(1 for _ in f)
print(f"Total records in file: {total}")

imported = 0
skipped = 0

with open(os.path.join(FAA_PATH, "MASTER.txt"), 'r', encoding='latin-1') as f:
    for i, line in enumerate(f):
        if i < start_idx:
            skipped += 1
            continue
        if i >= start_idx + 100:
            break
            
        if len(line) < 50:
            continue
            
        try:
            # Parse line
            n_num = 'N' + line[0:5].strip()
            serial = line[6:36].strip()
            mfr_code = line[37:44].strip()
            type_reg = line[56:57].strip()
            name = line[58:108].strip()
            last_act = line[219:227].strip()
            air_worth = line[239:247].strip()
            status = line[254:256].strip()
            
            if not n_num or n_num == 'N':
                continue
            
            # Get mfr/model from lookup
            mfr, model = acftref.get(mfr_code, ('', ''))
            type_reg = type_map.get(type_reg, type_reg)
            status = status_map.get(status, status)
            
            # Insert
            try:
                cursor.execute("""
                    IF NOT EXISTS (SELECT 1 FROM AircraftMaster WHERE N_NUMBER = %s)
                    INSERT INTO AircraftMaster (N_NUMBER, SERIAL_NUMBER, MFR, MODEL, STATUS_CODE, AIR_WORTH_DATE, LAST_ACTION_DATE, TYPE_REGISTRANT, NAME)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (n_num, n_num, serial, mfr, model, status, air_worth, last_act, type_reg, name))
                imported += 1
            except:
                pass
                
        except Exception as e:
            continue

conn.commit()

# Check total
cursor.execute("SELECT COUNT(*) FROM AircraftMaster")
total_db = cursor.fetchone()[0]

print(f"\n=== DONE ===")
print(f"Imported: {imported}")
print(f"Total in database: {total_db}")
print(f"\nNext batch: python scripts/import_faa_100.py {part+1}")

cursor.close()
conn.close()
