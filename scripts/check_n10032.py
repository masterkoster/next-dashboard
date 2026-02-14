"""
Check N10032 in database
"""
import pymssql

conn = pymssql.connect(
    server='aviation-server-dk.database.windows.net',
    database='aviation_db',
    user='CloudSA183a5780',
    password='Password123'
)
cursor = conn.cursor(as_dict=True)

# Check N10032 - use original column names
print("=== N10032 in AircraftMaster ===")
cursor.execute("""
    SELECT * FROM AircraftMaster WHERE N_NUMBER = 'N10032'
""")
row = cursor.fetchone()
if row:
    print(f"nNumber: {row['N_NUMBER']}")
    print(f"mfr: {row['MFR']}")
    print(f"model: {row['MODEL']}")
else:
    print("NOT FOUND")

# Test query with CESSNA
print("\n=== Testing query for CESSNA 150 ===")
cursor.execute("""
    SELECT TOP 1 * FROM AircraftSpecs 
    WHERE UPPER(manufacturer) LIKE '%CESSNA%'
      AND UPPER(model) LIKE '%150%'
""")
row = cursor.fetchone()
if row:
    print(f"FOUND: {row['manufacturer']} {row['model']}")
    print(f"  gross_weight_lbs: {row['gross_weight_lbs']}")
    print(f"  cruise_speed_kts: {row['cruise_speed_kts']}")
else:
    print("NOT FOUND")

conn.close()
