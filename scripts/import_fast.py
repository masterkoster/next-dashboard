"""
Super Fast Import - Use SQL Server's bulk insert
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

# Check current
cursor.execute("SELECT COUNT(*) FROM AircraftMaster")
print(f"Current: {cursor.fetchone()[0]}")

# Load ACFTREF once into a dict
print("Loading ACFTREF...")
acftref = {}
with open(os.path.join(FAA_PATH, "ACFTREF.txt"), 'r', encoding='latin-1') as f:
    reader = csv.reader(f)
    for row in reader:
        if len(row) >= 3:
            code = row[0].strip()
            if code:
                acftref[code] = (row[1].strip(), row[2].strip())
print(f"Loaded {len(acftref)}")

type_map = {'1': 'Individual', '2': 'Partnership', '3': 'Corporation', '4': 'Co-Owned', '5': 'Government', '7': 'LLC'}
status_map = {'V': 'Valid', 'D': 'Deregistered', 'E': 'Expired', 'R': 'Reserved'}

# Get list of existing N-numbers
cursor.execute("SELECT N_NUMBER FROM AircraftMaster")
existing = set(row[0] for row in cursor.fetchall())
print(f"Existing: {len(existing)}")

count = 0

print("Processing...")
with open(os.path.join(FAA_PATH, "MASTER.txt"), 'r', encoding='latin-1') as f:
    reader = csv.reader(f)
    next(reader)  # skip header
    
    batch = []
    for row in reader:
        if len(row) < 25:
            continue
        
        try:
            n_num = row[0].strip()
            if not n_num or not n_num.isdigit():
                continue
            
            n_num = 'N' + n_num
            if n_num in existing:
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
            
            batch.append((n_num, serial, mfr, model, status, air_worth, last_act, type_reg, name))
            existing.add(n_num)
            
            if len(batch) >= 500:
                # Bulk insert
                for rec in batch:
                    try:
                        cursor.execute("""
                            INSERT INTO AircraftMaster 
                            (N_NUMBER, SERIAL_NUMBER, MFR, MODEL, STATUS_CODE, AIR_WORTH_DATE, LAST_ACTION_DATE, TYPE_REGISTRANT, NAME)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """, rec)
                        count += 1
                    except:
                        pass
                conn.commit()
                print(f"Imported: {count}")
                batch = []
                
        except:
            continue

# Final batch
if batch:
    for rec in batch:
        try:
            cursor.execute("""
                INSERT INTO AircraftMaster 
                (N_NUMBER, SERIAL_NUMBER, MFR, MODEL, STATUS_CODE, AIR_WORTH_DATE, LAST_ACTION_DATE, TYPE_REGISTRANT, NAME)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, rec)
            count += 1
        except:
            pass
    conn.commit()

cursor.execute("SELECT COUNT(*) FROM AircraftMaster")
print(f"\nTotal: {cursor.fetchone()[0]}")

cursor.close()
conn.close()
