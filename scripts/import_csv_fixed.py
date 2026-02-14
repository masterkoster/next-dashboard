"""
CSV Import - Corrected column indices
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

# Clear database
print("Clearing database...")
cursor.execute("DELETE FROM AircraftMaster")
conn.commit()

FAA_PATH = r"C:\Users\David\Downloads\Compressed\ReleasableAircraft"

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

print("Processing MASTER.txt...")
with open(os.path.join(FAA_PATH, "MASTER.txt"), 'r', encoding='latin-1') as f:
    reader = csv.reader(f)
    header = next(reader)
    
    # Debug: print header indices
    print("Header columns:")
    for i, h in enumerate(header[:25]):
        print(f"  [{i}] {h}")
    
    # Find correct indices
    # N_NUMBER=0, SERIAL=1, MFR MDL CODE=2, TYPE REGISTRANT=5, NAME=7, 
    # LAST ACTION DATE=13, STATUS CODE should be somewhere near 21, AIR WORTH DATE should be near 24
    
    for row in reader:
        if len(row) < 25:
            continue
        
        try:
            n_num = row[0].strip()
            if not n_num or not n_num.isdigit():
                continue
            n_num = 'N' + n_num
            
            serial = row[1].strip()[:50]
            mfr_code = row[2].strip()
            type_reg = row[5].strip()
            name = row[7].strip()[:100]
            last_act = row[13].strip()  # Last action date
            status = row[20].strip() if len(row) > 20 else ''  # Status code column
            air_worth = row[24].strip() if len(row) > 24 else ''  # Air worth date
            
            # Lookup mfr/model
            mfr, model = acftref.get(mfr_code, ('', ''))
            type_reg = type_map.get(type_reg, type_reg)
            status = status_map.get(status, status)
            
            cursor.execute("""
                INSERT INTO AircraftMaster 
                (N_NUMBER, SERIAL_NUMBER, MFR, MODEL, STATUS_CODE, AIR_WORTH_DATE, LAST_ACTION_DATE, TYPE_REGISTRANT, NAME)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (n_num, serial, mfr, model, status, air_worth, last_act, type_reg, name))
            
            count += 1
            if count % 1000 == 0:
                conn.commit()
                print(f"Imported: {count}")
                
        except Exception as e:
            continue

conn.commit()
cursor.execute("SELECT COUNT(*) FROM AircraftMaster")
total = cursor.fetchone()[0]

print(f"\nDONE! Total: {total}")

# Show sample
cursor.execute("SELECT TOP 10 N_NUMBER, MFR, MODEL, STATUS_CODE FROM AircraftMaster")
print("\nSample:")
for r in cursor.fetchall():
    print(f"  {r[0]}: {r[1]} {r[2]} ({r[3]})")

cursor.close()
conn.close()
