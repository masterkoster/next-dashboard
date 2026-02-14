"""
FIXED FAA Import - Correct field positions
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

count = 0
total = 0
errors = 0

with open(os.path.join(FAA_PATH, "MASTER.txt"), 'r', encoding='latin-1') as f:
    for line in f:
        # Skip if line too short or doesn't start with alphanumeric
        if len(line) < 260:
            continue
        
        try:
            # N-Number: positions 1-5 (0-4)
            n_num = line[0:5].strip()
            if not n_num or not n_num[0].isalnum():
                continue
            n_num = 'N' + n_num
            
            # Skip if exists
            cursor.execute("SELECT 1 FROM AircraftMaster WHERE N_NUMBER = %s", (n_num,))
            if cursor.fetchone():
                continue
            
            # Serial: positions 7-36 (6-35)
            serial = line[6:36].strip()[:50]
            
            # Mfr Model Code: positions 38-44 (37-43)
            mfr_code = line[37:44].strip()
            
            # Type Registrant: position 57 (56)
            type_reg = line[56:57].strip()
            
            # Name: positions 59-108 (58-107)
            name = line[58:108].strip()[:100]
            
            # Last Action: positions 220-227 (219-226)
            last_act = line[219:227].strip()
            
            # Air Worth: positions 240-247 (239-246)
            air_worth = line[239:247].strip()
            
            # Status: positions 255-256 (254-255)
            status = line[254:256].strip()
            
            # Get mfr/model from ACFTREF
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
                print(f"Imported: {total}, Total DB: {cursor.fetchone()[0]}")
                count = 0
                
        except Exception as e:
            errors += 1
            continue

conn.commit()
cursor.execute("SELECT COUNT(*) FROM AircraftMaster")
print(f"\nDONE! Total imported: {total}, Total DB: {cursor.fetchone()[0]}, Errors: {errors}")

cursor.close()
conn.close()
