"""
RisingUp.com Aircraft Specs Scraper - Fixed pagination
"""

import requests
from bs4 import BeautifulSoup
import pymssql
import time
import re

BASE_URL = "https://www.risingup.com"
SEARCH_URL = f"{BASE_URL}/planespecs/exec/airspec.cgi"
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

MANUFACTURERS = {
    '10': 'Aeronca',
    '13': 'Aerostar',
    '27': 'American Champion',
    '30': 'American General',
    '57': 'Beechcraft',
    '59': 'Bellanca',
    '88': 'Cessna',
    '402': 'Commander',
    '97': 'EADS Socata',
    '215': 'Lake',
    '227': 'Luscombe Aircraft',
    '233': 'Maule',
    '249': 'Mooney',
    '281': 'Piper',
    '290': 'PZL',
}


def get_all_models_for_maker(maker_id):
    """Get ALL models for a manufacturer by handling pagination"""
    all_models = []
    page = 0
    
    while True:
        params = {
            'maker': maker_id,
            'model': '',
            'results': page * 20
        }
        
        response = requests.get(SEARCH_URL, params=params, headers=HEADERS, timeout=30)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find all aircraft links
        links = soup.find_all('a', href=True)
        found_any = False
        
        for link in links:
            href = link.get('href', '')
            if '/info/airplane' in href and href.endswith('.shtml'):
                found_any = True
                model_name = link.get_text(strip=True)
                if model_name:
                    all_models.append({
                        'name': model_name,
                        'url': BASE_URL + href
                    })
        
        # Check if there's a next page
        # Look for "next" link
        next_link = soup.find('a', string=re.compile(r'next|»', re.I))
        
        if not next_link or not found_any:
            break
            
        page += 1
        time.sleep(0.3)  # Rate limit
    
    return all_models


def parse_specs(url):
    """Parse aircraft specs from HTML"""
    try:
        response = requests.get(url, headers=HEADERS, timeout=30)
        soup = BeautifulSoup(response.text, 'html.parser')
        text = soup.get_text()
        
        specs = {'source_url': url}
        
        def find(pattern):
            match = re.search(pattern, text, re.IGNORECASE)
            return match.group(1).strip() if match else None
        
        specs['horsepower'] = find(r'Horsepower:\s*(\d+)')
        specs['gross_weight_lbs'] = find(r'Gross Weight:\s*(\d+)\s*lbs?')
        specs['empty_weight_lbs'] = find(r'Empty Weight:\s*(\d+)\s*lbs?')
        specs['top_speed_kts'] = find(r'Top Speed:\s*(\d+)\s*kts?')
        specs['cruise_speed_kts'] = find(r'Cruise Speed:\s*(\d+)\s*kts?')
        specs['stall_speed_dirty_kts'] = find(r'Stall Speed.*?:\s*(\d+)\s*kts?')
        specs['range_nm'] = find(r'Range:\s*(\d+)\s*nm')
        specs['fuel_capacity_gal'] = find(r'Fuel Capacity:\s*(\d+)\s*gal')
        
        # Takeoff distances
        takeoff_match = re.search(r'Takeoff\s*Ground Roll:\s*(\d+)\s*ft', text, re.IGNORECASE)
        if not takeoff_match:
            takeoff_match = re.search(r'Takeoff.*?Ground Roll.*?(\d+)\s*ft', text, re.IGNORECASE)
        specs['takeoff_ground_roll_ft'] = takeoff_match.group(1) if takeoff_match else None
        
        # Landing distances  
        landing_match = re.search(r'Landing\s*Ground Roll:\s*(\d+)\s*ft', text, re.IGNORECASE)
        if not landing_match:
            landing_match = re.search(r'Landing.*?Ground Roll.*?(\d+)\s*ft', text, re.IGNORECASE)
        specs['landing_ground_roll_ft'] = landing_match.group(1) if landing_match else None
        
        specs['rate_of_climb_fpm'] = find(r'Rate Of Climb:\s*(\d+)\s*fpm')
        specs['service_ceiling_ft'] = find(r'Ceiling:\s*(\d+)\s*ft')
        
        return specs
    except Exception as e:
        print(f"  Parse error: {e}")
        return None


def insert_specs(cursor, manufacturer, model_name, specs):
    """Insert specs into database"""
    try:
        cursor.execute("""
            INSERT INTO AircraftSpecs (
                manufacturer, model,
                horsepower, gross_weight_lbs, empty_weight_lbs,
                top_speed_kts, cruise_speed_kts, stall_speed_dirty_kts,
                range_nm, fuel_capacity_gal,
                takeoff_ground_roll_ft, landing_ground_roll_ft,
                rate_of_climb_fpm, service_ceiling_ft,
                source_url
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            manufacturer,
            model_name,
            specs.get('horsepower'),
            specs.get('gross_weight_lbs'),
            specs.get('empty_weight_lbs'),
            specs.get('top_speed_kts'),
            specs.get('cruise_speed_kts'),
            specs.get('stall_speed_dirty_kts'),
            specs.get('range_nm'),
            specs.get('fuel_capacity_gal'),
            specs.get('takeoff_ground_roll_ft'),
            specs.get('landing_ground_roll_ft'),
            specs.get('rate_of_climb_fpm'),
            specs.get('service_ceiling_ft'),
            specs.get('source_url')
        ))
        return True
    except Exception as e:
        print(f"  DB error: {e}")
        return False


def main():
    print("Starting RisingUp scraper...")
    
    # Connect to DB
    conn = pymssql.connect(
        server='aviation-server-dk.database.windows.net',
        database='aviation_db',
        user='CloudSA183a5780',
        password='Password123',
        autocommit=False
    )
    cursor = conn.cursor()
    
    total_models = 0
    inserted = 0
    
    # Process each manufacturer
    for maker_id, mfr_name in MANUFACTURERS.items():
        print(f"\n=== {mfr_name} ===")
        
        try:
            models = get_all_models_for_maker(maker_id)
            print(f"Found {len(models)} models")
            total_models += len(models)
            
            for i, model in enumerate(models):
                print(f"  [{i+1}/{len(models)}] {model['name'][:50]}...", end=" ")
                
                # Check if already exists
                cursor.execute("SELECT COUNT(*) FROM AircraftSpecs WHERE model = %s", (model['name'],))
                if cursor.fetchone()[0] > 0:
                    print("SKIP (exists)")
                    continue
                
                specs = parse_specs(model['url'])
                if specs:
                    if insert_specs(cursor, mfr_name, model['name'], specs):
                        conn.commit()
                        inserted += 1
                        print("OK")
                    else:
                        print("FAIL")
                else:
                    print("FAIL (parse)")
                    
                time.sleep(0.2)
                
        except Exception as e:
            print(f"Error: {e}")
            continue
    
    cursor.close()
    conn.close()
    
    print(f"\n=== COMPLETE ===")
    print(f"Total models found: {total_models}")
    print(f"New records inserted: {inserted}")


if __name__ == "__main__":
    main()
