"""
Import FAA master data from local CSV files
"""
import pymssql
import os
import csv

BATCH_SIZE = 500
MASTER_DIR = "data/master_files"

conn = pymssql.connect(
    server='aviation-server-dk.database.windows.net',
    database='aviation_db',
    user='CloudSA183a5780',
    password='Password123',
    autocommit=False
)
cursor = conn.cursor()

# Get current count
cursor.execute("SELECT COUNT(*) FROM AircraftMaster")
current_count = cursor.fetchone()[0]
print(f"Current AircraftMaster count: {current_count:,}")

# Get list of files sorted by number
files = sorted([f for f in os.listdir(MASTER_DIR) if f.startswith('MASTER-')])

total_inserted = 0

for filename in files:
    filepath = os.path.join(MASTER_DIR, filename)
    print(f"\n=== Processing {filename} ===")
    
    batch = []
    line_count = 0
    
    with open(filepath, 'r', encoding='latin-1') as f:
        reader = csv.reader(f)
        header = next(reader)  # Skip header
        
        for row in reader:
            if len(row) < 22:
                continue
            
            try:
                n_number = row[0].strip()
                if not n_number:
                    continue
                
                # Ensure N prefix
                if not n_number.startswith('N'):
                    n_number = 'N' + n_number.strip()
                
                # Skip if too short
                if len(n_number.strip('N')) < 1:
                    continue
                
                # Build record
                record = (
                    n_number[:10],  # N_NUMBER
                    row[6].strip()[:255] if len(row) > 6 else '',  # NAME
                    row[5].strip()[:50] if len(row) > 5 else '',  # TYPE_REGISTRANT
                    row[16].strip()[:50] if len(row) > 16 else '',  # LAST_ACTION_DATE
                    row[22].strip()[:50] if len(row) > 22 else '',  # AIR_WORTH_DATE
                    row[2].strip()[:255] if len(row) > 2 else '',  # MFR (from MDL CODE - we'll use as-is)
                    '',  # MODEL - need to look up
                    row[1].strip()[:255] if len(row) > 1 else '',  # SERIAL_NUMBER
                    row[3].strip()[:255] if len(row) > 3 else '',  # ENG_MFR
                    row[3].strip()[:255] if len(row) > 3 else '',  # ENGINE_MODEL
                    '',  # ENG_COUNT
                    row[21].strip()[:50] if len(row) > 21 else '',  # STATUS_CODE
                )
                
                batch.append(record)
                line_count += 1
                
                if len(batch) >= BATCH_SIZE:
                    try:
                        cursor.executemany("""
                            INSERT INTO AircraftMaster (
                                N_NUMBER, NAME, TYPE_REGISTRANT, LAST_ACTION_DATE,
                                AIR_WORTH_DATE, MFR, MODEL, SERIAL_NUMBER,
                                ENG_MFR, ENGINE_MODEL, ENG_COUNT, STATUS_CODE
                            ) VALUES (
                                @0, @1, @2, @3, @4, @5, @6, @7, @8, @9, @10, @11
                            )
                        """, batch)
                        conn.commit()
                        total_inserted += len(batch)
                        print(f"  Inserted {len(batch)} (total: {total_inserted:,})")
                        batch = []
                    except Exception as e:
                        conn.rollback()
                        print(f"  Batch error: {e}")
                        batch = []
                        
            except Exception as e:
                continue
    
    # Insert remaining
    if batch:
        try:
            cursor.executemany("""
                INSERT INTO AircraftMaster (
                    N_NUMBER, NAME, TYPE_REGISTRANT, LAST_ACTION_DATE,
                    AIR_WORTH_DATE, MFR, MODEL, SERIAL_NUMBER,
                    ENG_MFR, ENGINE_MODEL, ENG_COUNT, STATUS_CODE
                ) VALUES (
                    @0, @1, @2, @3, @4, @5, @6, @7, @8, @9, @10, @11
                )
            """, batch)
            conn.commit()
            total_inserted += len(batch)
            print(f"  Inserted {len(batch)} remaining")
        except Exception as e:
            conn.rollback()
            print(f"  Final batch error: {e}")
    
    print(f"  Processed {line_count} rows from {filename}")

# Final count
cursor.execute("SELECT COUNT(*) FROM AircraftMaster")
final_count = cursor.fetchone()[0]
print(f"\n=== COMPLETE ===")
print(f"Added approximately: {total_inserted:,}")
print(f"Final count: {final_count:,}")

cursor.close()
conn.close()
