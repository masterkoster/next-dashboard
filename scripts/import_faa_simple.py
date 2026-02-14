"""
Simple FAA Import - 500 records per batch
Usage: python scripts/import_faa_simple.py [batch_num]
  batch 1 = records 0-500
  batch 2 = records 500-1000
  etc.
"""
import os
import pymssql
import sys

FAA_PATH = r"C:\Users\David\Downloads\Compressed\ReleasableAircraft"
BATCH = 500

# Get batch number from command line, default to 1
batch_num = int(sys.argv[1]) if len(sys.argv) > 1 else 1
start_idx = (batch_num - 1) * BATCH
end_idx = start_idx + BATCH

conn = pymssql.connect(
    server='aviation-server-dk.database.windows.net',
    database='aviation_db',
    user='CloudSA183a5780',
    password='Password123'
)
cursor = conn.cursor()

# Get current count
cursor.execute("SELECT COUNT(*) FROM AircraftMaster")
start_count = cursor.fetchone()[0]
print(f"Starting count: {start_count:,}")

# Load ACFTREF
print("Loading ACFTREF...")
acftref = {}
with open(os.path.join(FAA_PATH, "ACFTREF.txt"), 'r', encoding='latin-1') as f:
    for line in f:
        if len(line) > 40:
            code = line[0:7].strip()
            mfr = line[8:38].strip()
            model = line[39:79].strip()
            acftref[code] = (mfr.strip(), model.strip())
print(f"Loaded {len(acftref)} models")

type_map = {'1': 'Individual', '2': 'Partnership', '3': 'Corporation', '4': 'Co-Owned', '5': 'Government', '7': 'LLC'}
status_map = {'V': 'Valid', 'D': 'Deregistered', 'E': 'Expired', 'R': 'Reserved'}

# Process BATCH records starting from start_idx
print(f"\nProcessing batch {batch_num}: records {start_idx} to {end_idx}...")
imported = 0

with open(os.path.join(FAA_PATH, "MASTER.txt"), 'r', encoding='latin-1') as f:
    for i, line in enumerate(f):
        if i < start_idx:
            continue
        if i >= end_idx:
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
            
            cursor.execute("""
                IF NOT EXISTS (SELECT 1 FROM AircraftMaster WHERE N_NUMBER = %s)
                INSERT INTO AircraftMaster (N_NUMBER, SERIAL_NUMBER, MFR, MODEL, STATUS_CODE, AIR_WORTH_DATE, LAST_ACTION_DATE, TYPE_REGISTRANT, NAME)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (n_num, n_num, serial, mfr, model, status, air_worth, last_act, type_reg, name))
            imported += 1
            
        except Exception as e:
            continue

conn.commit()

cursor.execute("SELECT COUNT(*) FROM AircraftMaster")
end_count = cursor.fetchone()[0]

print(f"\n=== DONE ===")
print(f"Processed: {imported}")
print(f"Start count: {start_count:,}")
print(f"End count: {end_count:,}")
print(f"Added: {end_count - start_count:,}")

cursor.close()
conn.close()
