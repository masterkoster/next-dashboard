"""
Download FAST AEROBASE data and import to Azure SQL
"""

import os
import urllib.request
import zipfile

# Download the FAST database
print("Downloading FAST AEROBASE from GitHub...")

url = "https://raw.githubusercontent.com/ideas-um/FAST/main/%2BDatabasePkg/EAP_Databases_Offline.xlsx"
output_path = r"C:\Users\David\next-dashboard\data\FAST_AEROBASE.xlsx"

print(f"Downloading to {output_path}...")
urllib.request.urlretrieve(url, output_path)
print("Download complete!")

# Now parse and show what sheets are available
import pandas as pd

print("\n=== Available sheets in Excel file ===")
xlsx = pd.ExcelFile(output_path)
for sheet in xlsx.sheet_names:
    print(f"  - {sheet}")

# Show sample from each sheet
for sheet in xlsx.sheet_names:
    df = pd.read_excel(xlsx, sheet_name=sheet)
    print(f"\n=== {sheet} ===")
    print(f"Columns: {list(df.columns)[:10]}")
    print(f"Rows: {len(df)}")
    if len(df) > 0:
        print(f"Sample: {df.iloc[0].to_dict()}")
