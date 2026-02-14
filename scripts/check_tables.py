"""
Quick check database tables
"""
import pymssql

conn = pymssql.connect(
    server='aviation-server-dk.database.windows.net',
    database='aviation_db',
    user='CloudSA183a5780',
    password='Password123'
)
cursor = conn.cursor(as_dict=True)

# Check tables
print("=== Tables ===")
cursor.execute("""
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_TYPE = 'BASE TABLE'
    ORDER BY TABLE_NAME
""")
for row in cursor:
    print(f"  - {row['TABLE_NAME']}")

# Check AircraftSpecs
print("\n=== AircraftSpecs ===")
try:
    cursor.execute("SELECT COUNT(*) as cnt FROM AircraftSpecs")
    row = cursor.fetchone()
    print(f"Row count: {row['cnt']}")
    
    if row['cnt'] > 0:
        cursor.execute("SELECT TOP 3 * FROM AircraftSpecs")
        for row in cursor:
            print(f"\nSample: {row.get('manufacturer')} {row.get('model')}")
            print(f"  gross_weight: {row.get('gross_weight_lbs')}")
            print(f"  cruise_speed: {row.get('cruise_speed_kts')}")
except Exception as e:
    print(f"Error: {e}")

# Check AircraftPerformance
print("\n=== AircraftPerformance ===")
try:
    cursor.execute("SELECT COUNT(*) as cnt FROM AircraftPerformance")
    row = cursor.fetchone()
    print(f"Row count: {row['cnt']}")
except Exception as e:
    print(f"Error: {e}")

# Test matching query
print("\n=== Test matching for Cessna 150 ===")
try:
    cursor.execute("""
        SELECT TOP 1 * FROM AircraftSpecs 
        WHERE UPPER(manufacturer) LIKE '%CESSNA%'
          AND UPPER(model) LIKE '%150%'
    """)
    row = cursor.fetchone()
    if row:
        print(f"FOUND: {row['manufacturer']} {row['model']}")
    else:
        print("NOT FOUND")
except Exception as e:
    print(f"Error: {e}")

conn.close()
