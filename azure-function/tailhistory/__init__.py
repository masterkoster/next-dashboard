import os
import json
import logging
import azure.functions as func

# Database connection string from environment
DATABASE_URL = os.environ.get('DATABASE_URL')

# Try to import pymssql (pure Python, no ODBC needed)
try:
    import pymssql
    PYMSSQL_AVAILABLE = True
except ImportError:
    PYMSSQL_AVAILABLE = False
    logging.warning("pymssql not available - database queries disabled")


def _get_connection():
    """Create a database connection using pymssql."""
    if not DATABASE_URL:
        return None
    
    # Parse the connection string
    # Format: Driver={ODBC Driver 18 for SQL Server};Server=tcp:server.database.windows.net,1433;Database=db;Uid=user;Pwd=pass;Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;
    import re
    
    server = ''
    database = ''
    user = ''
    password = ''
    
    # Extract server
    server_match = re.search(r'Server=tcp:([^,]+)', DATABASE_URL)
    if server_match:
        server = server_match.group(1)
    
    # Extract database
    db_match = re.search(r'Database=([^;]+)', DATABASE_URL)
    if db_match:
        database = db_match.group(1)
    
    # Extract user
    user_match = re.search(r'Uid=([^;]+)', DATABASE_URL)
    if user_match:
        user = user_match.group(1)
    
    # Extract password
    pwd_match = re.search(r'Pwd=([^;]+)', DATABASE_URL)
    if pwd_match:
        password = pwd_match.group(1)
    
    if not all([server, database, user, password]):
        logging.warning(f"Could not parse all connection params from URL")
        return None
    
    try:
        conn = pymssql.connect(server=server, database=database, user=user, password=password)
        return conn
    except Exception as e:
        logging.error(f"Connection error: {e}")
        return None


def _query_aircraft(n_number: str) -> dict | None:
    """Query the FAA AircraftMaster table for a specific N-number."""
    if not PYMSSQL_AVAILABLE:
        logging.warning("pymssql not available, cannot query database")
        return None
    
    if not DATABASE_URL:
        logging.warning("DATABASE_URL not set, cannot query database")
        return None
    
    # Normalize N-number: strip and uppercase
    n_clean = n_number.strip().upper()
    logging.info(f"Searching for N-number: {n_clean}")
    
    conn = _get_connection()
    if not conn:
        logging.error("Could not connect to database")
        return None
    
    try:
        cursor = conn.cursor()
        
        # Use TRIM and UPPER for flexible matching
        cursor.execute(
            "SELECT N_NUMBER, NAME, TYPE_REGISTRANT, LAST_ACTION_DATE, AIR_WORTH_DATE, MFR, MODEL, SERIAL_NUMBER, ENG_MFR, ENGINE_MODEL, ENG_COUNT, STATUS_CODE FROM AircraftMaster WHERE TRIM(UPPER(N_NUMBER)) = %s",
            (n_clean,)
        )
        row = cursor.fetchone()
        
        if not row:
            conn.close()
            logging.info(f"No aircraft found for {n_clean}")
            return None
        
        logging.info(f"Found aircraft: {row[0]}")
        
        # Map row to dictionary
        result = {
            "nNumber": row[0],
            "ownerName": row[1],
            "typeRegistrant": row[2],
            "lastActionDate": str(row[3]) if row[3] else None,
            "airworthinessDate": str(row[4]) if row[4] else None,
            "manufacturer": row[5],
            "model": row[6],
            "serialNumber": row[7],
            "engineManufacturer": row[8],
            "engineModel": row[9],
            "engineCount": row[10],
            "status": row[11],
        }
        
        # Get performance data
        perf = _get_performance_data(row[5], row[6])
        if perf:
            result["performance"] = perf
        
        conn.close()
        return result
        
    except Exception as e:
        logging.error(f"Database query error: {e}")
        if conn:
            conn.close()
        return None


def _get_performance_data(mfr: str, model: str) -> dict | None:
    """Query the AircraftPerformance table for performance specs."""
    if not PYMSSQL_AVAILABLE or not DATABASE_URL:
        return None
    
    if not mfr or not model:
        return None
    
    mfr_upper = mfr.upper()
    model_upper = model.upper()
    
    patterns = []
    
    if 'BOEING' in mfr_upper:
        import re
        match = re.search(r'(\d{3})', model_upper)
        if match:
            patterns.append(f"B{match.group(1)}%")
            patterns.append(f"B73{match.group(1)[-1]}%")
    
    if 'AIRBUS' in mfr_upper:
        import re
        match = re.search(r'A(\d{3})', model_upper)
        if match:
            patterns.append(f"A{match.group(1)}%")
    
    if 'EMBRAER' in mfr_upper:
        if 'ERJ' in model_upper or 'EMB-145' in model_upper:
            patterns.append('ERJ_145%')
        if 'ERJ190' in model_upper:
            patterns.append('ERJ_190%')
        if 'ERJ170' in model_upper:
            patterns.append('ERJ_170%')
    
    for pattern in patterns:
        try:
            conn = _get_connection()
            if not conn:
                continue
            
            cursor = conn.cursor()
            cursor.execute(
                "SELECT TOP 1 designation, mtow, mlw, mzfw, oew, fuel, range_nm, tofl, num_engines, engine_designation, thrust_max, span_ft, length_ft, height_ft, wing_area, vc_cruise, vmo_mo, cruise_alt, maxpax FROM AircraftPerformance WHERE designation LIKE %s",
                (pattern,)
            )
            row = cursor.fetchone()
            conn.close()
            
            if row:
                return {
                    "designation": row[0],
                    "mtow": row[1],
                    "mlw": row[2],
                    "mzfw": row[3],
                    "oew": row[4],
                    "fuelCapacity": row[5],
                    "rangeNm": row[6],
                    "takeoffFieldLength": row[7],
                    "numEngines": row[8],
                    "engineModel": row[9],
                    "thrustMax": row[10],
                    "spanFt": row[11],
                    "lengthFt": row[12],
                    "heightFt": row[13],
                    "wingArea": row[14],
                    "cruiseSpeed": row[15],
                    "maxOperatingSpeed": row[16],
                    "cruiseAltitude": row[17],
                    "maxPax": row[18],
                }
        except Exception as e:
            logging.error(f"Performance query error: {e}")
            continue
    
    return None


def _list_aircraft(limit: int = 20) -> dict:
    """List some aircraft from the database for debugging."""
    if not PYMSSQL_AVAILABLE or not DATABASE_URL:
        return {"error": "Database not available", "pymssql": PYMSSQL_AVAILABLE, "db_url": bool(DATABASE_URL)}
    
    conn = _get_connection()
    if not conn:
        return {"error": "Could not connect to database"}
    
    try:
        cursor = conn.cursor()
        
        # First, get table info
        cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'")
        tables = [r[0] for r in cursor.fetchall()]
        
        # Get row count
        cursor.execute("SELECT COUNT(*) FROM AircraftMaster")
        count = cursor.fetchone()[0]
        
        # Get sample data
        cursor.execute(f"SELECT TOP {limit} N_NUMBER, MFR, MODEL, STATUS_CODE FROM AircraftMaster ORDER BY N_NUMBER")
        rows = cursor.fetchall()
        
        results = {
            "tables": tables,
            "aircraftCount": count,
            "aircraft": [{"nNumber": r[0], "manufacturer": r[1], "model": r[2], "status": r[3]} for r in rows]
        }
        
        conn.close()
        return results
        
    except Exception as e:
        logging.error(f"Database list error: {e}")
        if conn:
            conn.close()
        return {"error": str(e)}


def main(req: func.HttpRequest) -> func.HttpResponse:
    n_number = req.params.get("nNumber")
    
    # Debug endpoint: list aircraft
    if req.params.get("list"):
        aircraft = _list_aircraft(20)
        return func.HttpResponse(
            json.dumps({"aircraft": aircraft}),
            status_code=200,
            mimetype="application/json"
        )
    
    if not n_number:
        return func.HttpResponse(
            json.dumps({"error": "nNumber parameter is required"}),
            status_code=400,
            mimetype="application/json"
        )
    
    # Query the database
    aircraft_data = _query_aircraft(n_number)
    
    if aircraft_data:
        return func.HttpResponse(
            json.dumps({"data": aircraft_data}),
            status_code=200,
            mimetype="application/json"
        )
    else:
        # Return not found message
        return func.HttpResponse(
            json.dumps({
                "error": f"Aircraft {n_number} not found in FAA database",
                "note": "Database may not be connected" if not DATABASE_URL else "N-number not in FAA records"
            }),
            status_code=404,
            mimetype="application/json"
        )
