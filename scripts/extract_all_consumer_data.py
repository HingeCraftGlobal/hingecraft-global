#!/usr/bin/env python3
"""
Comprehensive extraction script to pull ALL consumer data from HingeCraft HTML files.
Identifies and extracts all user/member data from:
- name_on_public_charter_masked_sorted (3).html (table data)
- membership_portal_full V3.html (mock member data)
- portal_login_social_participation.html (portal member data)
- lifetime_registry_inclusion (13).html (registry data)
- lifetime_registry_inclusion (13) (1).html (registry data)
"""

import os
import sys
import json
import csv
import re
from datetime import datetime
from bs4 import BeautifulSoup
from collections import defaultdict

# HTML file paths
HTML_FILES = [
    '[USER_HOME]/Downloads/name_on_public_charter_masked_sorted (3).html',
    '[USER_HOME]/Downloads/membership_portal_full V3.html',
    '[USER_HOME]/Downloads/portal_login_social_participation.html',
    '[USER_HOME]/Downloads/lifetime_registry_inclusion (13).html',
    '[USER_HOME]/Downloads/lifetime_registry_inclusion (13) (1).html'
]

def extract_table_data(html_path):
    """Extract data from HTML tables"""
    if not os.path.exists(html_path):
        return []
    
    with open(html_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    
    records = []
    tables = soup.find_all('table')
    
    for table in tables:
        headers = []
        header_row = table.find('thead')
        if header_row:
            headers = [th.get_text(strip=True) for th in header_row.find_all('th')]
        
        tbody = table.find('tbody')
        if tbody:
            for row in tbody.find_all('tr'):
                cells = [td.get_text(strip=True) for td in row.find_all('td')]
                if cells:
                    record = {}
                    for i, header in enumerate(headers):
                        if i < len(cells):
                            record[header.lower().replace(' ', '_')] = cells[i]
                    if record:
                        record['source_file'] = os.path.basename(html_path)
                        records.append(record)
    
    return records

def extract_js_object_data(html_path):
    """Extract JavaScript object data from HTML files"""
    if not os.path.exists(html_path):
        return []
    
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    records = []
    
    # Pattern for mockMember or similar objects
    patterns = [
        r'const\s+mockMember\s*=\s*({[^}]+})',
        r'const\s+mockPortalMember\s*=\s*({[^}]+})',
        r'member\s*[:=]\s*({[^}]+})',
        r'const\s+member\s*=\s*({[^}]+})'
    ]
    
    for pattern in patterns:
        matches = re.finditer(pattern, content, re.DOTALL)
        for match in matches:
            try:
                # Try to parse as JSON
                obj_str = match.group(1)
                # Clean up JavaScript object syntax
                obj_str = obj_str.replace("'", '"')
                obj_str = re.sub(r'(\w+):', r'"\1":', obj_str)
                obj = json.loads(obj_str)
                obj['source_file'] = os.path.basename(html_path)
                records.append(obj)
            except:
                continue
    
    # Extract from React component props
    prop_patterns = [
        r'member\s*=\s*{([^}]+)}',
        r'initialMember\s*=\s*{([^}]+)}'
    ]
    
    for pattern in prop_patterns:
        matches = re.finditer(pattern, content, re.DOTALL)
        for match in matches:
            try:
                props_str = match.group(1)
                # Simple key-value extraction
                props = {}
                for kv in re.finditer(r'(\w+):\s*"([^"]+)"', props_str):
                    props[kv.group(1)] = kv.group(2)
                if props:
                    props['source_file'] = os.path.basename(html_path)
                    records.append(props)
            except:
                continue
    
    return records

def extract_registry_data(html_path):
    """Extract registry data from lifetime registry HTML files"""
    if not os.path.exists(html_path):
        return []
    
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    records = []
    
    # Extract from JavaScript arrays
    first_names_pattern = r'const\s+firstNames\s*=\s*\[([^\]]+)\]'
    last_names_pattern = r'const\s+lastNames\s*=\s*\[([^\]]+)\]'
    twin_prefixes_pattern = r'const\s+twinPrefixes\s*=\s*\[([^\]]+)\]'
    twin_suffixes_pattern = r'const\s+twinSuffixes\s*=\s*\[([^\]]+)\]'
    locations_pattern = r'const\s+locations\s*=\s*\[([^\]]+)\]'
    
    first_names = []
    last_names = []
    twin_prefixes = []
    twin_suffixes = []
    locations = []
    
    for pattern, target_list in [
        (first_names_pattern, first_names),
        (last_names_pattern, last_names),
        (twin_prefixes_pattern, twin_prefixes),
        (twin_suffixes_pattern, twin_suffixes),
        (locations_pattern, locations)
    ]:
        match = re.search(pattern, content)
        if match:
            items = re.findall(r'"([^"]+)"', match.group(1))
            target_list.extend(items)
    
    # Extract buildRegistryData function logic
    # This generates combinations of names and locations
    counter = 1
    for first in first_names[:20]:  # Limit to avoid too many records
        for last in last_names[:10]:
            if counter > 200:
                break
            prefix = twin_prefixes[counter % len(twin_prefixes)] if twin_prefixes else "Aurora"
            suffix = twin_suffixes[counter % len(twin_suffixes)] if twin_suffixes else "Muse"
            location = locations[counter % len(locations)] if locations else ["Unknown", "", "Unknown"]
            
            record = {
                'first_name': first,
                'last_name': last,
                'twin_name': f"{prefix} {suffix}",
                'membership_id': str(counter).zfill(10),
                'city': location[0] if isinstance(location, list) else location,
                'region': location[1] if isinstance(location, list) and len(location) > 1 else '',
                'country': location[2] if isinstance(location, list) and len(location) > 2 else location,
                'registry_date': datetime.now().strftime('%d-%m-%Y'),
                'source_file': os.path.basename(html_path)
            }
            records.append(record)
            counter += 1
    
    return records

def normalize_member_record(record, source_file):
    """Normalize a member record to standard format"""
    normalized = {
        '_id': record.get('membership_id') or record.get('id') or record.get('_id') or '',
        'first_name': record.get('first_name') or record.get('firstName') or record.get('first') or '',
        'last_name': record.get('last_name') or record.get('lastName') or record.get('last') or '',
        'twin_name': record.get('twin_name') or record.get('twinName') or record.get('ai_digital_twin_name') or '',
        'membership_id': record.get('membership_id') or record.get('membershipId') or record.get('id') or '',
        'city': record.get('city') or '',
        'region': record.get('region') or record.get('state') or record.get('province') or '',
        'country': record.get('country') or '',
        'registry_date': record.get('registry_date') or record.get('signup_date') or record.get('signupDate') or '',
        'source_file': source_file,
        'email': record.get('email') or record.get('member_email') or '',
        'organization': record.get('organization') or '',
        'tier': record.get('tier') or record.get('membership_tier') or '',
        'membership_type': record.get('membership_type') or record.get('membershipType') or ''
    }
    
    # Generate _id if missing
    if not normalized['_id']:
        normalized['_id'] = normalized['membership_id'] or f"member_{hash(normalized['first_name'] + normalized['last_name'])}"
    
    return normalized

def main():
    """Main extraction function"""
    print("🚀 Extracting ALL consumer data from HingeCraft HTML files")
    print("="*60)
    
    all_records = []
    seen_ids = set()
    
    for html_file in HTML_FILES:
        if not os.path.exists(html_file):
            print(f"⚠️  File not found: {html_file}")
            continue
        
        print(f"\n📄 Processing: {os.path.basename(html_file)}")
        source_file = os.path.basename(html_file)
        
        # Extract table data
        table_records = extract_table_data(html_file)
        print(f"   📊 Extracted {len(table_records)} table records")
        
        # Extract JS object data
        js_records = extract_js_object_data(html_file)
        print(f"   📊 Extracted {len(js_records)} JS object records")
        
        # Extract registry data (for registry files)
        if 'registry' in html_file.lower():
            registry_records = extract_registry_data(html_file)
            print(f"   📊 Extracted {len(registry_records)} registry records")
        else:
            registry_records = []
        
        # Combine and normalize
        for record in table_records + js_records + registry_records:
            normalized = normalize_member_record(record, source_file)
            
            # De-duplicate by membership_id
            member_id = normalized['membership_id']
            if member_id and member_id != 'hidden' and member_id not in seen_ids:
                seen_ids.add(member_id)
                all_records.append(normalized)
            elif not member_id or member_id == 'hidden':
                # Use _id for deduplication
                if normalized['_id'] not in seen_ids:
                    seen_ids.add(normalized['_id'])
                    all_records.append(normalized)
    
    print(f"\n✅ Total unique records extracted: {len(all_records)}")
    
    # Write to CSV files
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    database_dir = os.path.join(project_root, 'database')
    
    os.makedirs(database_dir, exist_ok=True)
    
    # Write registry import CSV
    registry_csv = os.path.join(database_dir, 'registry_import.csv')
    with open(registry_csv, 'w', newline='', encoding='utf-8') as f:
        fieldnames = [
            '_id', '_createdDate', '_updatedDate', '_owner',
            'first_name', 'last_name', 'twin_name', 'membership_id',
            'city', 'region', 'country', 'registry_date', 'source_file', 'metadata'
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        for record in all_records:
            writer.writerow({
                '_id': record['_id'],
                '_createdDate': datetime.now().isoformat(),
                '_updatedDate': datetime.now().isoformat(),
                '_owner': 'system',
                'first_name': record['first_name'],
                'last_name': record['last_name'],
                'twin_name': record['twin_name'],
                'membership_id': record['membership_id'],
                'city': record['city'],
                'region': record['region'],
                'country': record['country'],
                'registry_date': record['registry_date'],
                'source_file': record['source_file'],
                'metadata': json.dumps({
                    'email': record.get('email', ''),
                    'organization': record.get('organization', ''),
                    'tier': record.get('tier', ''),
                    'membership_type': record.get('membership_type', '')
                }) if any([record.get('email'), record.get('organization'), record.get('tier')]) else ''
            })
    
    print(f"📄 Written: {registry_csv}")
    
    # Write Wix import CSV
    wix_csv = os.path.join(database_dir, 'registry_wix_import.csv')
    with open(wix_csv, 'w', newline='', encoding='utf-8') as f:
        fieldnames = [
            '_id', '_createdDate', '_updatedDate', '_owner',
            'first_name', 'last_name', 'twin_name', 'membership_id',
            'city', 'region', 'country', 'registry_date', 'source_file'
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        for record in all_records:
            writer.writerow({
                '_id': record['_id'],
                '_createdDate': datetime.now().isoformat(),
                '_updatedDate': datetime.now().isoformat(),
                '_owner': 'system',
                'first_name': record['first_name'],
                'last_name': record['last_name'],
                'twin_name': record['twin_name'],
                'membership_id': record['membership_id'],
                'city': record['city'],
                'region': record['region'],
                'country': record['country'],
                'registry_date': record['registry_date'],
                'source_file': record['source_file']
            })
    
    print(f"📄 Written: {wix_csv}")
    
    # Write JSON summary
    summary_json = os.path.join(database_dir, 'all_consumer_data_summary.json')
    with open(summary_json, 'w', encoding='utf-8') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'total_records': len(all_records),
            'source_files': list(set(r['source_file'] for r in all_records)),
            'records_by_source': {
                source: len([r for r in all_records if r['source_file'] == source])
                for source in set(r['source_file'] for r in all_records)
            },
            'sample_records': all_records[:10]
        }, f, indent=2)
    
    print(f"📄 Written: {summary_json}")
    print("\n✅ Extraction complete!")

if __name__ == '__main__':
    main()







