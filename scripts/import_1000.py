"""
CSV Import - Commit every 1000 records
"""

import os
import csv
import pymssql

conn = pymssql.connect(
    server='aviation-server-dk.database.windows.net',
    database='aviation_db',
    user='CloudSA183a5780',
    password='Password123',
    autocommit=False
)
cursor = conn.cursor()

FAA_PATH = r"C:\Users\David\Downloads\Compressed\ReleasableAircraft"

# Check current count
cursor.execute("SELECT COUNT(*) FROM AircraftMaster")
start_count = cursor.fetchone()[0]
print(f"Current count: {start_count}")

# Load ACFTREF
print("Loading ACFTREF...")
acftref = {}
with open(os.path.join(FAA_PATH, "ACFTREF.txt"), 'r', encoding='latin-1') as f:
    reader = csv.reader(f)
    for row in reader:
        if len(row) >= 3:
            code = row[0].strip()
            mfr = row[1].strip()
            model = row[2].strip()
            if code:
                acftref[code] = (mfr, model)
print(f"Loaded {len(acftref)} models")

type_map = {'1': 'Individual', '2': 'Partnership', '3': 'Corporation', '4': 'Co-Owned', '5': 'Government', '7': 'LLC'}
status_map = {'V': 'Valid', 'D': 'Deregistered', 'E': 'Expired', 'R': 'Reserved'}

count = 0
skipped = 0

print("Processing MASTER.txt...")
with open(os.path.join(FAA_PATH, "MASTER.txt"), 'r', encoding='latin-1') as f:
    reader = csv.reader(f)
    header = next(reader)
    
    for row in reader:
        if len(row) < 25:
            continue
        
        try:
            n_num = row[0].strip()
            if not n_num or not n_num.isdigit():
                continue
            n_num = 'N' + n_num
            
            # Check if exists
            cursor.execute("SELECT 1 FROM AircraftMaster WHERE N_NUMBER = %s", (n_num,))
            if cursor.fetchone():
                skipped += 1
                continue
            
            serial = row[1].strip()[:50]
            mfr_code = row[2].strip()
            type_reg = row[5].strip()
            name = row[7].strip()[:100]
            last_act = row[13].strip()
            status = row[20].strip() if len(row) > 20 else ''
            air_worth = row[24].strip() if len(row) > 24 else ''
            
            mfr, model = acftref.get(mfr_code, ('', ''))
            type_reg = type_map.get(type_reg, type_reg)
            status = status_map.get(status, status)
            
            cursor.execute("""
                INSERT INTO AircraftMaster 
                (N_NUMBER, SERIAL_NUMBER, MFR, MODEL, STATUS_CODE, AIR_WORTH_DATE, LAST_ACTION_DATE, TYPE_REGISTRANT, NAME)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (n_num, serial, mfr, model, status, air_worth, last_act, type_reg, name))
            
            count += 1
            
            # Commit every 1000
            if count % 1000 == 0:
                conn.commit()
                cursor.execute("SELECT COUNT(*) FROM AircraftMaster")
                current = cursor.fetchone()[0]
                print(f"Imported: {count}, Total DB: {current}, Skipped: {skipped}")
                
        except Exception as e:
            continue

conn.commit()
cursor.execute("SELECT COUNT(*) FROM AircraftMaster")
total = cursor.fetchone()[0]

print(f"\nDONE! Imported: {count}, Total: {total}, Skipped: {skipped}")

cursor.close()
conn.close()
