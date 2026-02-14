"""
SUPER FAST FAA Import - Skip duplicates, minimal logging
"""

import os
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

# Load ACFTREF ONCE
acftref = {}
with open(os.path.join(FAA_PATH, "ACFTREF.txt"), 'r', encoding='latin-1') as f:
    for line in f:
        if len(line) > 40:
            code = line[0:7].strip()
            mfr = line[8:38].strip().strip()
            model = line[39:79].strip().strip()
            if code:
                acftref[code] = (mfr, model)

print(f"Loaded {len(acftref)} models")

type_map = {'1': 'Individual', '2': 'Partnership', '3': 'Corporation', '4': 'Co-Owned', '5': 'Government', '7': 'LLC'}
status_map = {'V': 'Valid', 'D': 'Deregistered', 'E': 'Expired', 'R': 'Reserved'}

cursor.execute("SELECT COUNT(*) FROM AircraftMaster")
print(f"Current: {cursor.fetchone()[0]}")

# Simple fast insert - skip problematic lines
batch = []
count = 0
total = 0

with open(os.path.join(FAA_PATH, "MASTER.txt"), 'r', encoding='latin-1') as f:
    for line in f:
        if len(line) < 260:  # Skip short lines
            continue
        
        try:
            n_num = line[0:5].strip()
            if not n_num or n_num.isdigit() == False:
                continue
            
            n_num = 'N' + n_num
            
            # Skip if already exists
            cursor.execute("SELECT 1 FROM AircraftMaster WHERE N_NUMBER = %s", (n_num,))
            if cursor.fetchone():
                continue
            
            serial = line[6:36].strip()[:50]
            mfr_code = line[37:44].strip()
            type_reg = line[56:57].strip()
            name = line[58:108].strip()[:100]
            last_act = line[219:227].strip()
            air_worth = line[239:247].strip()
            status = line[254:256].strip()
            
            mfr, model = acftref.get(mfr_code, ('', ''))
            type_reg = type_map.get(type_reg, type_reg)
            status = status_map.get(status, status)
            
            cursor.execute("""
                INSERT INTO AircraftMaster (N_NUMBER, SERIAL_NUMBER, MFR, MODEL, STATUS_CODE, AIR_WORTH_DATE, LAST_ACTION_DATE, TYPE_REGISTRANT, NAME)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (n_num, serial, mfr, model, status, air_worth, last_act, type_reg, name))
            
            count += 1
            total += 1
            
            if count >= 500:
                conn.commit()
                cursor.execute("SELECT COUNT(*) FROM AircraftMaster")
                print(f"Imported: {total}, Total: {cursor.fetchone()[0]}")
                count = 0
                
        except:
            continue

conn.commit()
cursor.execute("SELECT COUNT(*) FROM AircraftMaster")
print(f"\nDONE! Total: {cursor.fetchone()[0]}")

cursor.close()
conn.close()
