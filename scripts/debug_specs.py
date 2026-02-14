"""
Check AircraftSpecs manufacturer values and test matching more
"""
import pymssql

conn = pymssql.connect(
    server='aviation-server-dk.database.windows.net',
    database='aviation_db',
    user='CloudSA183a5780',
    password='Password123'
)
cursor = conn.cursor(as_dict=True)

# Check distinct manufacturers
print("=== Distinct Manufacturers ===")
cursor.execute("""
    SELECT DISTINCT manufacturer, COUNT(*) as cnt 
    FROM AircraftSpecs 
    GROUP BY manufacturer 
    ORDER BY manufacturer
""")
for row in cursor:
    print(f"  {row['manufacturer']}: {row['cnt']}")

# Check model values that start with Cessna
print("\n=== Cessna Models ===")
cursor.execute("""
    SELECT TOP 10 model, gross_weight_lbs, cruise_speed_kts
    FROM AircraftSpecs 
    WHERE manufacturer = 'Cessna'
    ORDER BY model
""")
for row in cursor:
    print(f"  {row['model']}: GW={row['gross_weight_lbs']}, Cruise={row['cruise_speed_kts']}")

# Test exact query the app uses
print("\n=== Testing app query (CESSNA, 150) ===")
cursor.execute("""
    SELECT TOP 1 * FROM AircraftSpecs 
    WHERE UPPER(manufacturer) LIKE '%' + %s + '%'
      AND UPPER(model) LIKE '%' + %s + '%'
""", ('CESSNA', '150'))
row = cursor.fetchone()
if row:
    print(f"FOUND: {row['manufacturer']} {row['model']}")
    print(f"  gross_weight_lbs: {row['gross_weight_lbs']}")
    print(f"  cruise_speed_kts: {row['cruise_speed_kts']}")
    print(f"  wingspan_ft: {row.get('wingspan_ft')}")
    print(f"  length_ft: {row.get('length_ft')}")
else:
    print("NOT FOUND")

# Check what columns exist
print("\n=== Columns in AircraftSpecs ===")
cursor.execute("""
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'AircraftSpecs'
    ORDER BY ORDINAL_POSITION
""")
for row in cursor:
    print(f"  - {row['COLUMN_NAME']}")

conn.close()
