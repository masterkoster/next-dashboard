"""
Script to import FAA aircraft data into Azure SQL.
Run: python scripts/import_to_azure.py

Requirements:
    pip install pymssql pyodbc
"""

import os
import sys
import csv

# Azure SQL connection settings
# These can be overridden with environment variables
AZURE_SERVER = os.environ.get('AZURE_SERVER', 'aviation-server-dk.database.windows.net')
AZURE_DATABASE = os.environ.get('AZURE_DATABASE', 'aviation_db')
AZURE_USER = os.environ.get('AZURE_USER', 'CloudSA183a5780')
AZURE_PASSWORD = os.environ.get('AZURE_PASSWORD', 'Password123')

# Sample aircraft data (in production, this would come from parsing the FAA download)
# Using schema matching existing AircraftMaster table
SAMPLE_AIRCRAFT = [
    {
        'n_number': 'N12345',
        'serial_number': '172-12345',
        'mfr': 'CESSNA',
        'model': '172S',
        'status_code': 'Valid',
        'air_worth_date': '2024-05-15',
        'last_action_date': '2024-05-15',
        'type_registrant': 'Individual',
        'name': 'JOHN SMITH',
        'eng_mfr': 'LYCOMING',
        'engine_model': 'IO-360-L2A',
        'eng_count': 1,
    },
    {
        'n_number': 'N2025',
        'serial_number': '510',
        'mfr': 'DASSAULT AVIATION',
        'model': 'FALCON 7X',
        'status_code': 'Valid',
        'air_worth_date': '2024-12-11',
        'last_action_date': '2024-12-11',
        'type_registrant': 'Corporation',
        'name': 'TVPX AIRCRAFT SOLUTIONS INC TRUSTEE',
        'eng_mfr': 'PRATT & WHITNEY',
        'engine_model': 'PW307A',
        'eng_count': 3,
    },
    {
        'n_number': 'N5678',
        'serial_number': '2828-1234',
        'mfr': 'PIPER',
        'model': 'PA-28-181',
        'status_code': 'Valid',
        'air_worth_date': '2023-08-20',
        'last_action_date': '2023-08-20',
        'type_registrant': 'Individual',
        'name': 'JANE DOE',
        'eng_mfr': 'LYCOMING',
        'engine_model': 'IO-360-B1E',
        'eng_count': 1,
    },
    {
        'n_number': 'N9876',
        'serial_number': 'B-456',
        'mfr': 'BOEING',
        'model': '737-800',
        'status_code': 'Valid',
        'air_worth_date': '2024-01-10',
        'last_action_date': '2024-01-10',
        'type_registrant': 'Corporation',
        'name': 'AIRLINES INC',
        'eng_mfr': 'GENERAL ELECTRIC',
        'engine_model': 'CFM56-7B26',
        'eng_count': 2,
    },
    {
        'n_number': 'N100AB',
        'serial_number': '338-123',
        'mfr': 'BEECHcraft',
        'model': 'A36',
        'status_code': 'Valid',
        'air_worth_date': '2023-06-15',
        'last_action_date': '2023-06-15',
        'type_registrant': 'Individual',
        'name': 'BILL JOHNSON',
        'eng_mfr': 'CONTINENTAL',
        'engine_model': 'IO-550-B',
        'eng_count': 1,
    },
    {
        'n_number': 'N850JS',
        'serial_number': '750-001',
        'mfr': 'GULFSTREAM',
        'model': 'G650',
        'status_code': 'Valid',
        'air_worth_date': '2024-03-20',
        'last_action_date': '2024-03-20',
        'type_registrant': 'Corporation',
        'name': 'GULFSTREAM CORP',
        'eng_mfr': 'ROLLS ROYCE',
        'engine_model': 'BR725',
        'eng_count': 2,
    },
]


def get_connection():
    """Get Azure SQL connection."""
    try:
        import pymssql
        conn = pymssql.connect(
            server=AZURE_SERVER,
            database=AZURE_DATABASE,
            user=AZURE_USER,
            password=AZURE_PASSWORD,
            charset='UTF-8'
        )
        return conn
    except ImportError:
        print("Error: pymssql not installed.")
        print("Install with: pip install pymssql")
        sys.exit(1)
    except Exception as e:
        print(f"Connection error: {e}")
        sys.exit(1)


def create_table(cursor):
    """Create AircraftMaster table if it doesn't exist."""
    cursor.execute("""
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='AircraftMaster' AND xtype='U')
        CREATE TABLE AircraftMaster (
            N_NUMBER NVARCHAR(10) PRIMARY KEY,
            SERIAL_NUMBER NVARCHAR(50),
            MFR NVARCHAR(255),
            MODEL NVARCHAR(255),
            TYPE_AIRCRAFT NVARCHAR(50),
            TYPE_ENGINE NVARCHAR(50),
            STATUS_CODE NVARCHAR(50),
            AIR_WORTH_DATE NVARCHAR(50),
            LAST_ACTION_DATE NVARCHAR(50),
            CERT_ISSUE_DATE NVARCHAR(50),
            TYPE_REGISTRANT NVARCHAR(50),
            NAME NVARCHAR(255),
            STREET NVARCHAR(255),
            CITY NVARCHAR(100),
            STATE NVARCHAR(50),
            ZIP_CODE NVARCHAR(20),
            COUNTRY NVARCHAR(100),
            ENG_MFR NVARCHAR(255),
            ENGINE_MODEL NVARCHAR(255),
            ENG_COUNT INT
        )
    """)
    print("Table created or already exists.")


def import_aircraft(cursor, aircraft_list):
    """Import aircraft data into Azure SQL."""
    inserted = 0
    updated = 0
    
    for ac in aircraft_list:
        # Check if exists
        cursor.execute("SELECT COUNT(*) FROM AircraftMaster WHERE N_NUMBER = %s", (ac['n_number'],))
        exists = cursor.fetchone()[0] > 0
        
        if exists:
            # Update only the fields we have
            cursor.execute("""
                UPDATE AircraftMaster SET
                    SERIAL_NUMBER = %s,
                    MFR = %s,
                    MODEL = %s,
                    STATUS_CODE = %s,
                    AIR_WORTH_DATE = %s,
                    LAST_ACTION_DATE = %s,
                    TYPE_REGISTRANT = %s,
                    NAME = %s,
                    ENG_MFR = %s,
                    ENGINE_MODEL = %s,
                    ENG_COUNT = %s
                WHERE N_NUMBER = %s
            """, (
                ac.get('serial_number'), ac.get('mfr'), ac.get('model'),
                ac.get('status_code'), ac.get('air_worth_date'), ac.get('last_action_date'),
                ac.get('type_registrant'), ac.get('name'), ac.get('eng_mfr'),
                ac.get('engine_model'), ac.get('eng_count'), ac['n_number']
            ))
            updated += 1
        else:
            # Insert only the fields we have
            cursor.execute("""
                INSERT INTO AircraftMaster (
                    N_NUMBER, SERIAL_NUMBER, MFR, MODEL,
                    STATUS_CODE, AIR_WORTH_DATE, LAST_ACTION_DATE,
                    TYPE_REGISTRANT, NAME, ENG_MFR, ENGINE_MODEL, ENG_COUNT
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
            """, (
                ac['n_number'], ac.get('serial_number'), ac.get('mfr'), ac.get('model'),
                ac.get('status_code'), ac.get('air_worth_date'), ac.get('last_action_date'),
                ac.get('type_registrant'), ac.get('name'), ac.get('eng_mfr'),
                ac.get('engine_model'), ac.get('eng_count')
            ))
            inserted += 1
    
    return inserted, updated


def main():
    print("FAA Aircraft Import to Azure SQL")
    print("=" * 50)
    print(f"Server: {AZURE_SERVER}")
    print(f"Database: {AZURE_DATABASE}")
    print()
    
    # Connect
    print("Connecting to Azure SQL...")
    conn = get_connection()
    cursor = conn.cursor()
    
    # Create table
    print("Creating table...")
    create_table(cursor)
    conn.commit()
    
    # Import data
    print(f"Importing {len(SAMPLE_AIRCRAFT)} aircraft...")
    inserted, updated = import_aircraft(cursor, SAMPLE_AIRCRAFT)
    conn.commit()
    
    # Verify
    cursor.execute("SELECT COUNT(*) FROM AircraftMaster")
    total = cursor.fetchone()[0]
    
    print()
    print("Import complete!")
    print(f"  Inserted: {inserted}")
    print(f"  Updated: {updated}")
    print(f"  Total records: {total}")
    
    # Show sample
    print("\nSample aircraft in database:")
    cursor.execute("SELECT TOP 5 N_NUMBER, MFR, MODEL, STATUS_CODE FROM AircraftMaster")
    for row in cursor.fetchall():
        print(f"  {row[0]}: {row[1]} {row[2]} ({row[3]})")
    
    cursor.close()
    conn.close()


if __name__ == "__main__":
    main()
