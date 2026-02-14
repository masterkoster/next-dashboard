"""
FAST FAA Import - Bulk insert
Loads ACFTREF ONCE, then bulk inserts
"""

import os
import pymssql

# Connect
conn = pymssql.connect(
    server='aviation-server-dk.database.windows.net',
    database='aviation_db',
    user='CloudSA183a5780',
    password='Password123',
    autocommit=False
)
cursor = conn.cursor()

FAA_PATH = r"C:\Users\David\Downloads\Compressed\ReleasableAircraft"
MASTER_FILE = os.path.join(FAA_PATH, "MASTER.txt")
ACFTREF_FILE = os.path.join(FAA_PATH, "ACFTREF.txt")

# Load ACFTREF ONCE
print("Loading ACFTREF (once)...")
acftref = {}
with open(ACFTREF_FILE, 'r', encoding='latin-1') as f:
    for line in f:
        if len(line) > 40:
            code = line[0:7].strip()
            mfr = line[8:38].strip().strip()
            model = line[39:79].strip().strip()
            acftref[code] = (mfr, model)
print(f"Loaded {len(acftref)} models")

# Check current count
cursor.execute("SELECT COUNT(*) FROM AircraftMaster")
print(f"Current DB count: {cursor.fetchone()[0]}")

# Process in chunks
BATCH = 500
type_map = {'1': 'Individual', '2': 'Partnership', '3': 'Corporation', '4': 'Co-Owned', '5': 'Government', '7': 'LLC'}
status_map = {'V': 'Valid', 'D': 'Deregistered', 'E': 'Expired', 'R': 'Reserved'}

print(f"\nProcessing {MASTER_FILE}...")

with open(MASTER_FILE, 'r', encoding='latin-1') as f:
    batch = []
    total_imported = 0
    
    for i, line in enumerate(f):
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
            
            batch.append((n_num, serial, mfr, model, status, air_worth, last_act, type_reg, name))
            
            if len(batch) >= BATCH:
                # Bulk insert this batch
                for rec in batch:
                    try:
                        cursor.execute("""
                            IF NOT EXISTS (SELECT 1 FROM AircraftMaster WHERE N_NUMBER = %s)
                            INSERT INTO AircraftMaster (N_NUMBER, SERIAL_NUMBER, MFR, MODEL, STATUS_CODE, AIR_WORTH_DATE, LAST_ACTION_DATE, TYPE_REGISTRANT, NAME)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """, (rec[0],) + rec)
                        total_imported += 1
                    except:
                        pass
                conn.commit()
                print(f"Imported {total_imported} records...")
                batch = []
                
        except:
            continue

# Final batch
if batch:
    for rec in batch:
        try:
            cursor.execute("""
                IF NOT EXISTS (SELECT 1 FROM AircraftMaster WHERE N_NUMBER = %s)
                INSERT INTO AircraftMaster (N_NUMBER, SERIAL_NUMBER, MFR, MODEL, STATUS_CODE, AIR_WORTH_DATE, LAST_ACTION_DATE, TYPE_REGISTRANT, NAME)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (rec[0],) + rec)
            total_imported += 1
        except:
            pass
    conn.commit()

cursor.execute("SELECT COUNT(*) FROM AircraftMaster")
final_count = cursor.fetchone()[0]

print(f"\n=== DONE ===")
print(f"Imported this run: {total_imported}")
print(f"Total in database: {final_count}")

cursor.close()
conn.close()
