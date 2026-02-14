"""
Test CSV Import - Just 10 records first
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

# Delete test records
cursor.execute("DELETE FROM AircraftMaster WHERE N_NUMBER LIKE 'N1%'")
conn.commit()

FAA_PATH = r"C:\Users\David\Downloads\Compressed\ReleasableAircraft"

# Load ACFTREF
acftref = {}
with open(os.path.join(FAA_PATH, "ACFTREF.txt"), 'r', encoding='latin-1') as f:
    reader = csv.reader(f)
    for row in reader:
        if len(row) >= 3:
            code = row[0].strip()
            mfr = row[1].strip() if len(row) > 1 else ''
            model = row[2].strip() if len(row) > 2 else ''
            if code:
                acftref[code] = (mfr, model)

print(f"Loaded {len(acftref)} models")

type_map = {'1': 'Individual', '2': 'Partnership', '3': 'Corporation', '4': 'Co-Owned', '5': 'Government', '7': 'LLC'}
status_map = {'V': 'Valid', 'D': 'Deregistered', 'E': 'Expired', 'R': 'Reserved'}

# Show first 3 rows to debug
print("\n=== First 3 MASTER rows ===")
with open(os.path.join(FAA_PATH, "MASTER.txt"), 'r', encoding='latin-1') as f:
    reader = csv.reader(f)
    header = next(reader)
    print("Header:", header[:10])
    
    for i, row in enumerate(reader):
        if i >= 3:
            break
        print(f"\nRow {i+1}:")
        print(f"  [0] N_NUMBER: {row[0]}")
        print(f"  [1] SERIAL: {row[1]}")
        print(f"  [2] MFR CODE: {row[2]}")
        print(f"  [5] TYPE REG: {row[5]}")
        print(f"  [7] NAME: {row[7][:30]}...")
        print(f"  [13] LAST ACT: {row[13]}")
        print(f"  [21] STATUS: {row[21]}")
        print(f"  [24] AIR WORTH: {row[24]}")

cursor.close()
conn.close()
