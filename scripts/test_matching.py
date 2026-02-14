"""
Test model matching logic
"""
import pymssql

conn = pymssql.connect(
    server='aviation-server-dk.database.windows.net',
    database='aviation_db',
    user='CloudSA183a5780',
    password='Password123'
)
cursor = conn.cursor(as_dict=True)

# Simulate what the code does for CESSNA 150L
mfrUpper = "CESSNA"
modelUpper = "150L"

# Extract numbers from model
import re
modelNumbers = re.findall(r'\d+', modelUpper)
print(f"modelUpper: {modelUpper}")
print(f"modelNumbers: {modelNumbers}")

# Test each number
for num in modelNumbers:
    mfrPattern = f"%{mfrUpper}%"
    modelPattern = f"%{num}%"
    print(f"\nSearching with mfrPattern: {mfrPattern}, modelPattern: {modelPattern}")
    
    cursor.execute(f"""
        SELECT TOP 1 manufacturer, model, gross_weight_lbs 
        FROM AircraftSpecs 
        WHERE UPPER(manufacturer) LIKE '{mfrPattern}'
          AND UPPER(model) LIKE '{modelPattern}'
    """)
    row = cursor.fetchone()
    if row:
        print(f"  FOUND: {row['manufacturer']} {row['model']} - GW: {row['gross_weight_lbs']}")
    else:
        print("  NOT FOUND")

conn.close()
