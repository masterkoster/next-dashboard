"""
Scrape GA aircraft specs from RisingUp Aviation
"""

import requests
from bs4 import BeautifulSoup
import json
import pymssql
import time

BASE_URL = "https://www.risingup.com/planespecs"

# Get manufacturer list first
def get_manufacturers():
    url = f"{BASE_URL}/aircraft-manufacturers/"
    resp = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
    soup = BeautifulSoup(resp.text, 'html.parser')
    
    manufacturers = []
    select = soup.find('select', {'name': 'manufacturer'})
    if select:
        for opt in select.find_all('option')[1:]:
            manufacturers.append(opt['value'])
    return manufacturers

def get_aircraft_for_manufacturer(mfr):
    url = f"{BASE_URL}/?manufacturer={mfr}&model=&search=Search+for+aircraft"
    resp = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
    soup = BeautifulSoup(resp.text, 'html.parser')
    
    aircraft = []
    table = soup.find('table')
    if table:
        for row in table.find_all('tr')[1:]:
            cols = row.find_all('td')
            if len(cols) >= 2:
                model = cols[0].get_text(strip=True)
                link = cols[0].find('a')
                if link:
                    aircraft.append({
                        'manufacturer': mfr,
                        'model': model,
                        'url': BASE_URL + '/' + link['href']
                    })
    return aircraft

def get_aircraft_specs(url):
    resp = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
    soup = BeautifulSoup(resp.text, 'html.parser')
    
    specs = {}
    
    # Find the specs table
    table = soup.find('table')
    if table:
        for row in table.find_all('tr'):
            cols = row.find_all('td')
            if len(cols) >= 2:
                key = cols[0].get_text(strip=True).lower().replace(' ', '_')
                val = cols[1].get_text(strip=True)
                specs[key] = val
    
    return specs

# Main
if __name__ == "__main__":
    print("Getting manufacturers...")
    mfrs = get_manufacturers()
    print(f"Found {len(mfrs)} manufacturers")
    
    all_aircraft = []
    
    for mfr in mfrs[:5]:  # Start with first 5
        print(f"Fetching {mfr}...")
        aircraft = get_aircraft_for_manufacturer(mfr)
        all_aircraft.extend(aircraft)
        time.sleep(1)
    
    print(f"\nFound {len(all_aircraft)} aircraft")
    
    # Save to file
    with open('ga_aircraft.json', 'w') as f:
        json.dump(all_aircraft, f, indent=2)
    
    print("Saved to ga_aircraft.json")
