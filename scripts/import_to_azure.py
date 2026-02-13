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
# Popular US aircraft - can be expanded to full FAA database later
SAMPLE_AIRCRAFT = [
    # Cessna Singles
    {'n_number': 'N12345', 'serial_number': '172-12345', 'mfr': 'CESSNA', 'model': '172S', 'status_code': 'Valid', 'air_worth_date': '2024-05-15', 'last_action_date': '2024-05-15', 'type_registrant': 'Individual', 'name': 'JOHN SMITH', 'eng_mfr': 'LYCOMING', 'engine_model': 'IO-360-L2A', 'eng_count': 1},
    {'n_number': 'N5678', 'serial_number': '2828-1234', 'mfr': 'PIPER', 'model': 'PA-28-181', 'status_code': 'Valid', 'air_worth_date': '2023-08-20', 'last_action_date': '2023-08-20', 'type_registrant': 'Individual', 'name': 'JANE DOE', 'eng_mfr': 'LYCOMING', 'engine_model': 'IO-360-B1E', 'eng_count': 1},
    
    # Business Jets
    {'n_number': 'N2025', 'serial_number': '510', 'mfr': 'DASSAULT AVIATION', 'model': 'FALCON 7X', 'status_code': 'Valid', 'air_worth_date': '2024-12-11', 'last_action_date': '2024-12-11', 'type_registrant': 'Corporation', 'name': 'TVPX AIRCRAFT SOLUTIONS INC', 'eng_mfr': 'PRATT & WHITNEY', 'engine_model': 'PW307A', 'eng_count': 3},
    {'n_number': 'N9876', 'serial_number': 'B-456', 'mfr': 'BOEING', 'model': '737-800', 'status_code': 'Valid', 'air_worth_date': '2024-01-10', 'last_action_date': '2024-01-10', 'type_registrant': 'Corporation', 'name': 'AIRLINES INC', 'eng_mfr': 'GENERAL ELECTRIC', 'engine_model': 'CFM56-7B26', 'eng_count': 2},
    {'n_number': 'N850JS', 'serial_number': '750-001', 'mfr': 'GULFSTREAM', 'model': 'G650', 'status_code': 'Valid', 'air_worth_date': '2024-03-20', 'last_action_date': '2024-03-20', 'type_registrant': 'Corporation', 'name': 'GULFSTREAM CORP', 'eng_mfr': 'ROLLS ROYCE', 'engine_model': 'BR725', 'eng_count': 2},
    {'n_number': 'N100AB', 'serial_number': '338-123', 'mfr': 'BEECHcraft', 'model': 'A36', 'status_code': 'Valid', 'air_worth_date': '2023-06-15', 'last_action_date': '2023-06-15', 'type_registrant': 'Individual', 'name': 'BILL JOHNSON', 'eng_mfr': 'CONTINENTAL', 'engine_model': 'IO-550-B', 'eng_count': 1},
    
    # More Popular Aircraft
    {'n_number': 'N500XJ', 'serial_number': '150-001', 'mfr': 'CESSNA', 'model': '150M', 'status_code': 'Valid', 'air_worth_date': '2023-04-10', 'last_action_date': '2023-04-10', 'type_registrant': 'Individual', 'name': 'MIKE WILSON', 'eng_mfr': 'CONTINENTAL', 'engine_model': 'O-200-A', 'eng_count': 1},
    {'n_number': 'N721RW', 'serial_number': '182-001', 'mfr': 'CESSNA', 'model': '182T', 'status_code': 'Valid', 'air_worth_date': '2024-02-28', 'last_action_date': '2024-02-28', 'type_registrant': 'Individual', 'name': 'ROBERT BROWN', 'eng_mfr': 'LYCOMING', 'engine_model': 'IO-540-AB1A5', 'eng_count': 1},
    {'n_number': 'N333LP', 'serial_number': '310-001', 'mfr': 'CESSNA', 'model': '310R', 'status_code': 'Valid', 'air_worth_date': '2023-09-15', 'last_action_date': '2023-09-15', 'type_registrant': 'Corporation', 'name': 'LUXURY PRIVATE JETS LLC', 'eng_mfr': 'CONTINENTAL', 'engine_model': 'TSIO-520-NB', 'eng_count': 2},
    {'n_number': 'N414TS', 'serial_number': '414-001', 'mfr': 'CESSNA', 'model': '414A', 'status_code': 'Valid', 'air_worth_date': '2024-01-22', 'last_action_date': '2024-01-22', 'type_registrant': 'Corporation', 'name': 'EXECUTIVE AIR CHARTER', 'eng_mfr': 'CONTINENTAL', 'engine_model': 'TSIO-520-NB', 'eng_count': 2},
    
    # Pipers
    {'n_number': 'N2468P', 'serial_number': '180-001', 'mfr': 'PIPER', 'model': 'PA-18-150', 'status_code': 'Valid', 'air_worth_date': '2023-07-04', 'last_action_date': '2023-07-04', 'type_registrant': 'Individual', 'name': 'PAUL ANDERSON', 'eng_mfr': 'LYCOMING', 'engine_model': 'O-320-E2D', 'eng_count': 1},
    {'n_number': 'N7532P', 'serial_number': '32-001', 'mfr': 'PIPER', 'model': 'PA-32-301', 'status_code': 'Valid', 'air_worth_date': '2024-03-11', 'last_action_date': '2024-03-11', 'type_registrant': 'Individual', 'name': 'SARAH JOHNSON', 'eng_mfr': 'LYCOMING', 'engine_model': 'IO-540-K1A5', 'eng_count': 1},
    {'n_number': 'N8915P', 'serial_number': '46-001', 'mfr': 'PIPER', 'model': 'PA-46-350P', 'status_code': 'Valid', 'air_worth_date': '2024-05-20', 'last_action_date': '2024-05-20', 'type_registrant': 'Individual', 'name': 'CORPORATE PILOT INC', 'eng_mfr': 'WILLIAMS', 'engine_model': 'FJ44-3AP', 'eng_count': 1},
    
    # Beechcraft
    {'n_number': 'N3213B', 'serial_number': '58-001', 'mfr': 'BEECHcraft', 'model': '58 BARON', 'status_code': 'Valid', 'air_worth_date': '2023-11-30', 'last_action_date': '2023-11-30', 'type_registrant': 'Corporation', 'name': 'EXECUTIVE JET SERVICES', 'eng_mfr': 'CONTINENTAL', 'engine_model': 'IO-550-C', 'eng_count': 2},
    {'n_number': 'N9090T', 'serial_number': '90-001', 'mfr': 'BEECHcraft', 'model': 'A36 BONANZA', 'status_code': 'Valid', 'air_worth_date': '2024-04-18', 'last_action_date': '2024-04-18', 'type_registrant': 'Individual', 'name': 'THOMAS GARcia', 'eng_mfr': 'CONTINENTAL', 'engine_model': 'IO-550-B', 'eng_count': 1},
    {'n_number': 'N2000F', 'serial_number': '1900-001', 'mfr': 'BEECHcraft', 'model': '1900D', 'status_code': 'Valid', 'air_worth_date': '2023-08-25', 'last_action_date': '2023-08-25', 'type_registrant': 'Corporation', 'name': 'REGIONAL AIRLINES', 'eng_mfr': 'PRATT & WHITNEY', 'engine_model': 'PT6A-67D', 'eng_count': 2},
    
    # Mooney
    {'n_number': 'N4567M', 'serial_number': '231-001', 'mfr': 'MOONEY', 'model': 'M22', 'status_code': 'Valid', 'air_worth_date': '2023-12-05', 'last_action_date': '2023-12-05', 'type_registrant': 'Individual', 'name': 'DAVID LEE', 'eng_mfr': 'LYCOMING', 'engine_model': 'IO-540-U4A', 'eng_count': 1},
    
    # Diamond
    {'n_number': 'N7890D', 'serial_number': 'DA40-001', 'mfr': 'DIAMOND', 'model': 'DA40 NG', 'status_code': 'Valid', 'air_worth_date': '2024-06-01', 'last_action_date': '2024-06-01', 'type_registrant': 'Corporation', 'name': 'FLIGHT TRAINING ACADEMY', 'eng_mfr': 'CONTINENTAL', 'engine_model': 'CD-300', 'eng_count': 1},
    {'n_number': 'N5432D', 'serial_number': 'DA42-001', 'mfr': 'DIAMOND', 'model': 'DA42-VI', 'status_code': 'Valid', 'air_worth_date': '2024-02-14', 'last_action_date': '2024-02-14', 'type_registrant': 'Corporation', 'name': 'AVIATION ACADEMY LLC', 'eng_mfr': 'AUSTRO ENGINE', 'engine_model': 'E4-A', 'eng_count': 2},
    
    # Cirrus
    {'n_number': 'N2468S', 'serial_number': 'SR22-001', 'mfr': 'CIRRUS', 'model': 'SR22T', 'status_code': 'Valid', 'air_worth_date': '2024-01-08', 'last_action_date': '2024-01-08', 'type_registrant': 'Individual', 'name': 'CHRIS MARTINEZ', 'eng_mfr': 'CONTINENTAL', 'engine_model': 'IO-550-N', 'eng_count': 1},
    {'n_number': 'N1357S', 'serial_number': 'SR20-001', 'mfr': 'CIRRUS', 'model': 'SR20', 'status_code': 'Valid', 'air_worth_date': '2023-10-22', 'last_action_date': '2023-10-22', 'type_registrant': 'Individual', 'name': 'EMILY WONG', 'eng_mfr': 'CONTINENTAL', 'engine_model': 'IO-360-L2A', 'eng_count': 1},
    
    # Helicopters
    {'n_number': 'N5050H', 'serial_number': '206-001', 'mfr': 'BELL', 'model': '206B', 'status_code': 'Valid', 'air_worth_date': '2024-04-02', 'last_action_date': '2024-04-02', 'type_registrant': 'Corporation', 'name': 'HELI-TAXI SERVICES', 'eng_mfr': 'ALLISON', 'engine_model': '250-C20J', 'eng_count': 1},
    {'n_number': 'N7878A', 'serial_number': '407-001', 'mfr': 'BELL', 'model': '407GXi', 'status_code': 'Valid', 'air_worth_date': '2024-05-15', 'last_action_date': '2024-05-15', 'type_registrant': 'Corporation', 'name': 'AIR AMBULANCE INC', 'eng_mfr': 'ROLLS ROYCE', 'engine_model': '250-C47B', 'eng_count': 1},
    {'n_number': 'N2222R', 'serial_number': 'AS350-001', 'mfr': 'AIRBUS HELICOPTERS', 'model': 'AS350 B3', 'status_code': 'Valid', 'air_worth_date': '2023-09-10', 'last_action_date': '2023-09-10', 'type_registrant': 'Corporation', 'name': 'TOUR HELICOPTERS LLC', 'eng_mfr': 'SAFRAN', 'engine_model': 'ARRIEL 2D', 'eng_count': 1},
    
    # Airbus/Boeing Commercial
    {'n_number': 'N901DN', 'serial_number': 'A320-001', 'mfr': 'AIRBUS', 'model': 'A320-214', 'status_code': 'Valid', 'air_worth_date': '2024-03-25', 'last_action_date': '2024-03-25', 'type_registrant': 'Corporation', 'name': 'DELTA AIR LINES', 'eng_mfr': 'CFM INTERNATIONAL', 'engine_model': 'CFM56-5B4/P', 'eng_count': 2},
    {'n_number': 'N921WN', 'serial_number': '737-700-001', 'mfr': 'BOEING', 'model': '737-700', 'status_code': 'Valid', 'air_worth_date': '2024-02-20', 'last_action_date': '2024-02-20', 'type_registrant': 'Corporation', 'name': 'SOUTHWEST AIRLINES', 'eng_mfr': 'GENERAL ELECTRIC', 'engine_model': 'CFM56-7B24', 'eng_count': 2},
    {'n_number': 'N456UA', 'serial_number': '777-300-001', 'mfr': 'BOEING', 'model': '777-300ER', 'status_code': 'Valid', 'air_worth_date': '2024-01-15', 'last_action_date': '2024-01-15', 'type_registrant': 'Corporation', 'name': 'UNITED AIRLINES', 'eng_mfr': 'GENERAL ELECTRIC', 'engine_model': 'GE90-115BL', 'eng_count': 2},
    {'n_number': 'N678AA', 'serial_number': 'A321-001', 'mfr': 'AIRBUS', 'model': 'A321neo', 'status_code': 'Valid', 'air_worth_date': '2024-06-10', 'last_action_date': '2024-06-10', 'type_registrant': 'Corporation', 'name': 'AMERICAN AIRLINES', 'eng_mfr': 'CFM INTERNATIONAL', 'engine_model': 'LEAP-1A32', 'eng_count': 2},
    
    # Embraer
    {'n_number': 'N400E', 'serial_number': 'E175-001', 'mfr': 'EMBRAER', 'model': 'E175LR', 'status_code': 'Valid', 'air_worth_date': '2024-04-05', 'last_action_date': '2024-04-05', 'type_registrant': 'Corporation', 'name': 'SKYWEST AIRLINES', 'eng_mfr': 'GENERAL ELECTRIC', 'engine_model': 'CF34-8E1', 'eng_count': 2},
    {'n_number': 'N590E', 'serial_number': 'E190-001', 'mfr': 'EMBRAER', 'model': 'E190AR', 'status_code': 'Valid', 'air_worth_date': '2023-12-18', 'last_action_date': '2023-12-18', 'type_registrant': 'Corporation', 'name': 'JETBLUE AIRWAYS', 'eng_mfr': 'GENERAL ELECTRIC', 'engine_model': 'CF34-10E', 'eng_count': 2},
    
    # Bombardier
    {'n_number': 'N708CA', 'serial_number': 'CRJ9-001', 'mfr': 'BOMBARDIER', 'model': 'CRJ-900', 'status_code': 'Valid', 'air_worth_date': '2024-01-30', 'last_action_date': '2024-01-30', 'type_registrant': 'Corporation', 'name': 'ALASKA AIRLINES', 'eng_mfr': 'GE', 'engine_model': 'CF34-8C5', 'eng_count': 2},
    {'n_number': 'N550BD', 'serial_number': 'Global-001', 'mfr': 'BOMBARDIER', 'model': 'GLOBAL 6000', 'status_code': 'Valid', 'air_worth_date': '2024-05-28', 'last_action_date': '2024-05-28', 'type_registrant': 'Corporation', 'name': 'PRIVATE JET HOLDINGS', 'eng_mfr': 'ROLLS ROYCE', 'engine_model': 'BR710 A2-20', 'eng_count': 2},
    
    # Experimental/Light Sport
    {'n_number': 'N6789X', 'serial_number': 'RV7-001', 'mfr': 'VANS', 'model': 'RV-7', 'status_code': 'Experimental', 'air_worth_date': '2024-02-10', 'last_action_date': '2024-02-10', 'type_registrant': 'Individual', 'name': 'HOME BUILDER AIRCRAFT', 'eng_mfr': 'LYCOMING', 'engine_model': 'O-360-A1A', 'eng_count': 1},
    {'n_number': 'N1234L', 'serial_number': 'LSA-001', 'mfr': 'TECNAM', 'model': 'P92 EAGLET', 'status_code': 'Light Sport', 'air_worth_date': '2023-06-20', 'last_action_date': '2023-06-20', 'type_registrant': 'Individual', 'name': 'SPORT PILOT LLC', 'eng_mfr': 'ROTAX', 'engine_model': '912 ULS', 'eng_count': 1},
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
