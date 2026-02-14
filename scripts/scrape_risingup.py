"""
RisingUp.com Aircraft Specs Scraper
Scrapes general aviation aircraft specifications and stores in Azure SQL
"""

import requests
from bs4 import BeautifulSoup
import pymssql
import time
import re
import json

BASE_URL = "https://www.risingup.com"
SEARCH_URL = f"{BASE_URL}/planespecs/exec/airspec.cgi"

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

# Manufacturer IDs from the search form
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


def get_manufacturer_list():
    """Get list of manufacturers from the main page"""
    response = requests.get(f"{BASE_URL}/planespecs/", headers=HEADERS)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    manufacturers = []
    select = soup.find('select', {'name': 'maker'})
    if select:
        for option in select.find_all('option'):
            value = option.get('value', '')
            if value:
                manufacturers.append({
                    'id': value,
                    'name': option.get_text(strip=True)
                })
    
    return manufacturers


def get_aircraft_models(maker_id):
    """Get all aircraft models for a manufacturer"""
    models = []
    
    # Paginate through results
    page = 0
    while True:
        params = {
            'maker': maker_id,
            'model': '',
            'results': page * 20
        }
        
        response = requests.get(SEARCH_URL, params=params, headers=HEADERS)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find links to aircraft specs
        found = False
        links = soup.find_all('a', href=True)
        
        for link in links:
            href = link.get('href', '')
            if '/info/airplane' in href and href.endswith('.shtml'):
                found = True
                model_name = link.get_text(strip=True)
                full_url = BASE_URL + href
                models.append({
                    'name': model_name,
                    'url': full_url,
                    'id': href.split('airplane')[1].replace('.shtml', '')
                })
        
        # Check for next page
        next_link = soup.find('a', text=re.compile(r'next'))
        if not next_link or not found:
            break
        
        page += 1
        time.sleep(0.5)  # Rate limiting
    
    return models


def parse_specs(html_content, url):
    """Parse aircraft specifications from HTML"""
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Get title for model name
    title = soup.find('h2')
    model_name = title.get_text(strip=True).replace('Performance Information', '').strip() if title else ''
    
    # Get all text content and parse key-value pairs
    text = soup.get_text()
    
    specs = {
        'model': model_name,
        'source_url': url,
    }
    
    # Parse performance data - look for patterns like "Key: Value"
    
    # Horsepower
    match = re.search(r'Horsepower:\s*(\d+)', text)
    specs['horsepower'] = match.group(1) if match else None
    
    # Weights
    match = re.search(r'Gross Weight:\s*(\d+)\s*lbs', text)
    specs['gross_weight_lbs'] = match.group(1) if match else None
    
    match = re.search(r'Empty Weight:\s*(\d+)\s*lbs', text)
    specs['empty_weight_lbs'] = match.group(1) if match else None
    
    # Speeds
    match = re.search(r'Top Speed:\s*(\d+)\s*kts', text)
    specs['top_speed_kts'] = match.group(1) if match else None
    
    match = re.search(r'Cruise Speed:\s*(\d+)\s*kts', text)
    specs['cruise_speed_kts'] = match.group(1) if match else None
    
    match = re.search(r'Stall Speed.*?:\s*(\d+)\s*kts', text)
    specs['stall_speed_dirty_kts'] = match.group(1) if match else None
    
    # Range
    match = re.search(r'Range:\s*(\d+)\s*nm', text)
    specs['range_nm'] = match.group(1) if match else None
    
    # Fuel
    match = re.search(r'Fuel Capacity:\s*(\d+)\s*gal', text)
    specs['fuel_capacity_gal'] = match.group(1) if match else None
    
    # Takeoff distances
    match = re.search(r'Takeoff.*?Ground Roll:\s*(\d+)\s*ft', text, re.DOTALL)
    specs['takeoff_ground_roll_ft'] = match.group(1) if match else None
    
    match = re.search(r'Takeoff.*?Over 50 ft obstacle:\s*(\d+)\s*ft', text, re.DOTALL)
    specs['takeoff_over_50ft_ft'] = match.group(1) if match else None
    
    # Landing distances
    match = re.search(r'Landing.*?Ground Roll:\s*(\d+)\s*ft', text, re.DOTALL)
    specs['landing_ground_roll_ft'] = match.group(1) if match else None
    
    match = re.search(r'Landing.*?Over 50 ft obstacle:\s*(\d+)\s*ft', text, re.DOTALL)
    specs['landing_over_50ft_ft'] = match.group(1) if match else None
    
    # Rate of climb
    match = re.search(r'Rate Of Climb:\s*(\d+)\s*fpm', text)
    specs['rate_of_climb_fpm'] = match.group(1) if match else None
    
    # Ceiling
    match = re.search(r'Ceiling:\s*(\d+)\s*ft', text)
    specs['service_ceiling_ft'] = match.group(1) if match else None
    
    return specs


def insert_specs_to_db(specs, manufacturer):
    """Insert specs into Azure SQL"""
    conn = pymssql.connect(
        server='aviation-server-dk.database.windows.net',
        database='aviation_db',
        user='CloudSA183a5780',
        password='Password123',
        autocommit=False
    )
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO AircraftSpecs (
                manufacturer, model,
                length_ft, wingspan_ft, height_ft,
                takeoff_ground_roll_ft, takeoff_over_50ft_ft,
                landing_ground_roll_ft, landing_over_50ft_ft,
                top_speed_kts, cruise_speed_kts, stall_speed_dirty_kts,
                empty_weight_lbs, gross_weight_lbs,
                range_nm, fuel_capacity_gal, horsepower,
                rate_of_climb_fpm, service_ceiling_ft,
                source_url
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
        """, (
            manufacturer,
            specs.get('model'),
            specs.get('length_ft'), specs.get('wingspan_ft'), specs.get('height_ft'),
            specs.get('takeoff_ground_roll_ft'), specs.get('takeoff_over_50ft_ft'),
            specs.get('landing_ground_roll_ft'), specs.get('landing_over_50ft_ft'),
            specs.get('top_speed_kts'), specs.get('cruise_speed_kts'), specs.get('stall_speed_dirty_kts'),
            specs.get('empty_weight_lbs'), specs.get('gross_weight_lbs'),
            specs.get('range_nm'), specs.get('fuel_capacity_gal'), specs.get('horsepower'),
            specs.get('rate_of_climb_fpm'), specs.get('service_ceiling_ft'),
            specs.get('source_url')
        ))
        conn.commit()
        return True
    except Exception as e:
        print(f"Database error: {e}")
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()


def scrape_all():
    """Main scraping function"""
    print("Starting scraper...")
    
    # Get manufacturers
    manufacturers = get_manufacturer_list()
    print(f"Found {len(manufacturers)} manufacturers")
    
    # Save progress
    progress = {'completed_makers': [], 'total_models': 0, 'inserted': 0}
    
    for mfr in manufacturers:
        maker_id = mfr['id']
        mfr_name = mfr['name']
        
        if not maker_id:
            continue
            
        print(f"\n--- Scraping {mfr_name} (ID: {maker_id}) ---")
        
        try:
            models = get_aircraft_models(maker_id)
            print(f"Found {len(models)} models")
            progress['total_models'] += len(models)
            
            for i, model in enumerate(models):
                print(f"  [{i+1}/{len(models)}] {model['name']}")
                
                try:
                    response = requests.get(model['url'], headers=HEADERS)
                    specs = parse_specs(response.text, model['url'])
                    specs['manufacturer'] = mfr_name
                    
                    if insert_specs_to_db(specs, mfr_name):
                        progress['inserted'] += 1
                        print(f"    ✓ Inserted")
                    else:
                        print(f"    ✗ Failed to insert")
                    
                    time.sleep(0.3)  # Rate limiting
                    
                except Exception as e:
                    print(f"    ✗ Error: {e}")
                    continue
                    
        except Exception as e:
            print(f"Error scraping {mfr_name}: {e}")
            continue
            
        progress['completed_makers'].append(maker_id)
        
        # Save progress
        with open('scraper_progress.json', 'w') as f:
            json.dump(progress, f)
    
    print(f"\n=== COMPLETE ===")
    print(f"Total models: {progress['total_models']}")
    print(f"Inserted: {progress['inserted']}")
    
    return progress


if __name__ == "__main__":
    scrape_all()
