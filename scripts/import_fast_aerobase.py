"""
Import FAST AEROBASE performance data to Azure SQL
This creates a table with aircraft model specifications
"""

import pandas as pd
import pymssql
import os

# Connect to Azure SQL
conn = pymssql.connect(
    server='aviation-server-dk.database.windows.net',
    database='aviation_db',
    user='CloudSA183a5780',
    password='Password123',
    autocommit=False
)
cursor = conn.cursor()

# Create the AircraftPerformance table
print("Creating AircraftPerformance table...")
cursor.execute("""
IF OBJECT_ID('AircraftPerformance', 'U') IS NOT NULL
    DROP TABLE AircraftPerformance

CREATE TABLE AircraftPerformance (
    id INT IDENTITY(1,1) PRIMARY KEY,
    designation VARCHAR(100) NOT NULL,  -- e.g., A320_251N, B737_800
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    
    -- TLAR (Type Certification)
    eis VARCHAR(50),  -- Entry Into Service
    maxpax INT,
    pax INT,
    
    -- Performance
    range_nm VARCHAR(50),  -- Range in nautical miles
    tofl VARCHAR(50),  -- Takeoff Field Length
    
    -- Weight
    mrw VARCHAR(50),  -- Maximum Ramp Weight
    mtow VARCHAR(50),  -- Maximum Takeoff Weight
    mlw VARCHAR(50),  -- Maximum Landing Weight
    mzfw VARCHAR(50),  -- Maximum Zero Fuel Weight
    oew VARCHAR(50),  -- Operating Empty Weight
    fuel VARCHAR(50),  -- Fuel Capacity
    
    -- Propulsion
    engine_designation VARCHAR(100),
    alternate_engines VARCHAR(100),
    num_engines INT,
    thrust_sls VARCHAR(50),  -- Thrust at Sea Level
    thrust_max VARCHAR(50),
    fuel_type VARCHAR(50),
    fuel_density VARCHAR(50),
    fuel_cap_usable VARCHAR(50),
    fuel_cap_unusable VARCHAR(50),
    
    -- Aerodynamics
    span_ft VARCHAR(50),
    length_ft VARCHAR(50),
    height_ft VARCHAR(50),
    tip_chord VARCHAR(50),
    sweep_deg VARCHAR(50),
    root_chord VARCHAR(50),
    wing_area VARCHAR(50),
    wingtip_device VARCHAR(50),
    mac VARCHAR(50),
    
    -- Velocities
    vmo_mo VARCHAR(50),  -- Max Operating Speed
    vc_cruise VARCHAR(50),  -- Cruise Speed
    v_takeoff VARCHAR(50),  -- Takeoff Speed
    
    -- Altitudes
    cruise_alt VARCHAR(50),  -- Cruise Altitude
    
    created_at DATETIME DEFAULT GETDATE()
)
""")
conn.commit()
print("Table created.")

# Load FAST AEROBASE Excel
print("\nLoading FAST AEROBASE...")
df = pd.read_excel('C:/Users/David/next-dashboard/data/FAST_AEROBASE.xlsx')

# Get the aircraft designation row (row 0)
designation_row = df.iloc[0]
manufacturer_row = df.iloc[2]

# Get parameter rows - find unique parameter/subparameter combinations
# Look at columns 0-5 which contain parameter info
params_found = set()
param_list = []
for i in range(len(df)):
    param = df.iloc[i]['Parameter']
    subparam = df.iloc[i]['SubParameter'] if 'SubParameter' in df.columns else None
    discipline = df.iloc[i]['Discipline'] if 'Discipline' in df.columns else None
    
    if pd.notna(param):
        key = (param, subparam, discipline)
        if key not in params_found:
            params_found.add(key)
            param_list.append({'Parameter': param, 'SubParameter': subparam, 'Discipline': discipline})

print(f"Parameters found: {len(param_list)}")

# Get all column indices that have designations - start from column 6
data_cols = []
for i in range(6, len(df.columns)):
    try:
        val = designation_row.iloc[i]
    except:
        continue
    if pd.notna(val) and str(val) != 'AircraftDesignation' and str(val) != 'name':
        try:
            manuf = manufacturer_row.iloc[i] if pd.notna(manufacturer_row.iloc[i]) else None
        except:
            manuf = None
        data_cols.append({
            'col_idx': i,
            'designation': str(val),
            'manufacturer': manuf
        })

print(f"Found {len(data_cols)} aircraft designations")

# Build the data to insert
insert_count = 0

# Get parameter data
for col_info in data_cols:
    col_idx = col_info['col_idx']
    designation = col_info['designation']
    manufacturer = col_info['manufacturer']
    
    row_data = {
        'designation': designation,
        'manufacturer': manufacturer,
    }
    
    # Get all parameter values for this column - use column index to get values
    col_series = df.iloc[:, col_idx]
    for p in param_list:
        param = p['Parameter']
        subparam = p['SubParameter']
        discipline = p['Discipline']
        
        # Find the row index for this parameter
        val = None
        for idx in range(len(df)):
            if df.iloc[idx]['Parameter'] == param:
                if pd.isna(subparam) or df.iloc[idx]['SubParameter'] == subparam:
                    try:
                        val = col_series.iloc[idx]
                    except:
                        pass
                    break
        
        if val is None:
            continue
            
        # Map to column name
        col_name = None
        if param == 'EIS':
            col_name = 'eis'
        elif param == 'MaxPax':
            col_name = 'maxpax'
        elif param == 'Pax':
            col_name = 'pax'
        elif param == 'Range':
            col_name = 'range_nm'
        elif param == 'TOFL':
            col_name = 'tofl'
        elif param == 'MRW':
            col_name = 'mrw'
        elif param == 'MTOW':
            col_name = 'mtow'
        elif param == 'MLW':
            col_name = 'mlw'
        elif param == 'MZFW':
            col_name = 'mzfw'
        elif param == 'OEW':
            col_name = 'oew'
        elif param == 'Fuel' and discipline == 'Weight':
            col_name = 'fuel'
        elif param == 'EngineDesignation':
            col_name = 'engine_designation'
        elif param == 'AlternateEngines':
            col_name = 'alternate_engines'
        elif param == 'NumEngines':
            col_name = 'num_engines'
        elif param == 'Thrust' and subparam == 'SLS':
            col_name = 'thrust_sls'
        elif param == 'Thrust' and subparam == 'Max':
            col_name = 'thrust_max'
        elif param == 'Fuel' and subparam == 'Type':
            col_name = 'fuel_type'
        elif param == 'Fuel' and subparam == 'Density':
            col_name = 'fuel_density'
        elif param == 'Fuel' and subparam == 'CapUsable':
            col_name = 'fuel_cap_usable'
        elif param == 'Fuel' and subparam == 'CapUnusable':
            col_name = 'fuel_cap_unusable'
        elif param == 'Span':
            col_name = 'span_ft'
        elif param == 'Length':
            col_name = 'length_ft'
        elif param == 'Height':
            col_name = 'height_ft'
        elif param == 'TipChord':
            col_name = 'tip_chord'
        elif param == 'Sweep':
            col_name = 'sweep_deg'
        elif param == 'RootChord':
            col_name = 'root_chord'
        elif param == 'S':
            col_name = 'wing_area'
        elif param == 'WingtipDevice':
            col_name = 'wingtip_device'
        elif param == 'MAC':
            col_name = 'mac'
        elif param == 'Vels' and subparam == 'MaxOp':
            col_name = 'vmo_mo'
        elif param == 'Vels' and subparam == 'Crs':
            col_name = 'vc_cruise'
        elif param == 'Vels' and subparam == 'Tko':
            col_name = 'v_takeoff'
        elif param == 'Alts' and subparam == 'Crs':
            col_name = 'cruise_alt'
        
        if col_name:
            row_data[col_name] = str(val) if pd.notna(val) else None
    
    # Insert into database
    try:
        cursor.execute("""
            INSERT INTO AircraftPerformance (
                designation, manufacturer,
                eis, maxpax, pax, range_nm, tofl,
                mrw, mtow, mlw, mzfw, oew, fuel,
                engine_designation, alternate_engines, num_engines,
                thrust_sls, thrust_max, fuel_type, fuel_density, fuel_cap_usable, fuel_cap_unusable,
                span_ft, length_ft, height_ft, tip_chord, sweep_deg, root_chord, wing_area, wingtip_device, mac,
                vmo_mo, vc_cruise, v_takeoff, cruise_alt
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s,
                %s, %s, %s,
                %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s
            )
        """, (
            row_data.get('designation'),
            row_data.get('manufacturer'),
            row_data.get('eis'), row_data.get('maxpax'), row_data.get('pax'), row_data.get('range_nm'), row_data.get('tofl'),
            row_data.get('mrw'), row_data.get('mtow'), row_data.get('mlw'), row_data.get('mzfw'), row_data.get('oew'), row_data.get('fuel'),
            row_data.get('engine_designation'), row_data.get('alternate_engines'), row_data.get('num_engines'),
            row_data.get('thrust_sls'), row_data.get('thrust_max'), row_data.get('fuel_type'), row_data.get('fuel_density'), row_data.get('fuel_cap_usable'), row_data.get('fuel_cap_unusable'),
            row_data.get('span_ft'), row_data.get('length_ft'), row_data.get('height_ft'), row_data.get('tip_chord'), row_data.get('sweep_deg'), row_data.get('root_chord'), row_data.get('wing_area'), row_data.get('wingtip_device'), row_data.get('mac'),
            row_data.get('vmo_mo'), row_data.get('vc_cruise'), row_data.get('v_takeoff'), row_data.get('cruise_alt')
        ))
        insert_count += 1
    except Exception as e:
        # Skip duplicates or errors
        pass
    
    if insert_count % 50 == 0:
        conn.commit()
        print(f"  Inserted {insert_count} records...")

conn.commit()

# Final count
cursor.execute("SELECT COUNT(*) FROM AircraftPerformance")
count = cursor.fetchone()[0]
print(f"\nTotal records in AircraftPerformance: {count}")

cursor.close()
conn.close()
print("Done!")
