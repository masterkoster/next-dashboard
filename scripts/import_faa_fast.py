"""
Import FAA data - 2000 records at a time (faster)
Run: python scripts/import_faa_fast.py

Then run: python scripts/import_faa_fast.py 2
     etc for more batches
"""

import os
import sys
import pymssql

conn = pymssql.connect(
    server='aviation-server-dk.database.windows.net',
    database='aviation_db',
    user='CloudSA183a5780',
    password='Password123'
)
cursor = conn.cursor()

FAA_PATH = r"C:\Users\David\Downloads\Compressed\ReleasableAircraft"

# Load ACFTREF
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
except:
    pass

print(f"Loaded {len(acftref)} models")

part = int(sys.argv[1]) if len(sys.argv) > 1 else 1
start_idx = (part - 1) * 2000
BATCH = 2000

type_map = {'1': 'Individual', '2': 'Partnership', '3': 'Corporation', '4': 'Co-Owned', '5': 'Government', '7': 'LLC'}
status_map = {'V': 'Valid', 'D': 'Deregistered', 'E': 'Expired', 'R': 'Reserved'}

print(f"\n=== PART {part}: Records {start_idx+1} to {start_idx+BATCH} ===")

# Count total
with open(os.path.join(FAA_PATH, "MASTER.txt"), 'r', encoding='latin-1') as f:
    total = sum(1 for _ in f)
print(f"Total: {total}")

imported = 0

with open(os.path.join(FAA_PATH, "MASTER.txt"), 'r', encoding='latin-1') as f:
    for i, line in enumerate(f):
        if i < start_idx:
            continue
        if i >= start_idx + BATCH:
            break
            
        if len(line) < 50:
            continue
            
        try:
            n_num = 'N' + line[0:5].strip()
            serial = line[6:36].strip()
            mfr_code = line[37:44].strip()
            type_reg = line[56:57].strip()
            name = line[58:108].strip()
            last_act = line[219:227].strip()
            air_worth = line[239:247].strip()
            status = line[254:256].strip()
            
            if not n_num or n_num == 'N' or len(n_num) < 3:
                continue
            
            mfr, model = acftref.get(mfr_code, ('', ''))
            type_reg = type_map.get(type_reg, type_reg)
            status = status_map.get(status, status)
            
            # Clean up mfr/model (remove trailing junk)
            mfr = mfr.strip() if mfr else ''
            model = model.strip() if model else ''
            
            try:
                cursor.execute("""
                    IF NOT EXISTS (SELECT 1 FROM AircraftMaster WHERE N_NUMBER = %s)
                    INSERT INTO AircraftMaster (N_NUMBER, SERIAL_NUMBER, MFR, MODEL, STATUS_CODE, AIR_WORTH_DATE, LAST_ACTION_DATE, TYPE_REGISTRANT, NAME)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (n_num, n_num, serial, mfr, model, status, air_worth, last_act, type_reg, name))
                imported += 1
            except:
                pass
        except:
            continue

conn.commit()

cursor.execute("SELECT COUNT(*) FROM AircraftMaster")
total_db = cursor.fetchone()[0]

print(f"\n=== DONE ===")
print(f"Imported: {imported}")
print(f"Total in database: {total_db}")
print(f"\nNext: python scripts/import_faa_fast.py {part+1}")

cursor.close()
conn.close()
