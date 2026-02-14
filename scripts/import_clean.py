"""
Clean FAA Import - Delete bad records, reimport correctly
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

# Delete all existing records first
print("Deleting existing records...")
cursor.execute("DELETE FROM AircraftMaster")
conn.commit()
print("Deleted!")

# Load ACFTREF
FAA_PATH = r"C:\Users\David\Downloads\Compressed\ReleasableAircraft"
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

count = 0
errors = 0

with open(os.path.join(FAA_PATH, "MASTER.txt"), 'r', encoding='latin-1') as f:
    for line in f:
        if len(line) < 260:
            continue
        
        try:
            # Fixed field positions (1-indexed in FAA docs, 0-indexed in Python)
            n_num = line[0:5].strip()
            if not n_num or not n_num[0].isalnum():
                continue
            n_num = 'N' + n_num
            
            serial = line[6:36].strip()
            mfr_code = line[37:44].strip()
            type_reg = line[56:57].strip()
            name = line[58:108].strip()
            last_act = line[219:227].strip()
            air_worth = line[239:247].strip()
            status = line[254:256].strip()
            
            # Get mfr/model from lookup
            mfr, model = acftref.get(mfr_code, ('', ''))
            type_reg = type_map.get(type_reg, type_reg)
            status = status_map.get(status, status)
            
            cursor.execute("""
                INSERT INTO AircraftMaster 
                (N_NUMBER, SERIAL_NUMBER, MFR, MODEL, STATUS_CODE, AIR_WORTH_DATE, LAST_ACTION_DATE, TYPE_REGISTRANT, NAME)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (n_num, serial, mfr, model, status, air_worth, last_act, type_reg, name))
            
            count += 1
            
            if count % 500 == 0:
                conn.commit()
                print(f"Imported: {count}")
                
        except Exception as e:
            errors += 1
            continue

conn.commit()
cursor.execute("SELECT COUNT(*) FROM AircraftMaster")
total = cursor.fetchone()[0]

print(f"\nDONE! Imported: {count}, Total: {total}, Errors: {errors}")

# Show sample
cursor.execute("SELECT TOP 5 N_NUMBER, MFR, MODEL FROM AircraftMaster")
print("\nSample:")
for r in cursor.fetchall():
    print(f"  {r[0]}: {r[1]} {r[2]}")

cursor.close()
conn.close()
