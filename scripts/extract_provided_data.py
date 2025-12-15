#!/usr/bin/env python3
"""
Extract and segment ALL data from provided HingeCraft page content.
Processes:
- Charter list data (from provided text)
- Chat clubs data (from provided text)
- Academic chat clubs messages (from provided text)
- Ambassador portal data (from provided text)
"""

import os
import sys
import json
import csv
import re
from datetime import datetime
from uuid import uuid4

def extract_charter_list_from_text(text):
    """Extract charter list from provided text"""
    records = []
    
    # Pattern: First Name, Last Name, Twin Name, Membership ID, City, Region, Country, Date
    lines = text.split('\n')
    
    for line in lines:
        line = line.strip()
        if not line or len(line) < 20:
            continue
        
        # Skip header lines
        if 'First Name' in line or 'Last Name' in line or '---' in line:
            continue
        
        # Try to parse tab-separated or space-separated data
        parts = re.split(r'\t+|\s{2,}', line)
        if len(parts) >= 8:
            record = {
                'first_name': parts[0].strip(),
                'last_name': parts[1].strip(),
                'twin_name': parts[2].strip() if parts[2].strip() != 'hidden' else '',
                'membership_id': parts[3].strip() if parts[3].strip() != 'hidden' else '',
                'city': parts[4].strip() if parts[4].strip() != 'hidden' else '',
                'region': parts[5].strip() if parts[5].strip() != 'hidden' else '',
                'country': parts[6].strip(),
                'signup_date': parts[7].strip(),
                'source': 'charter-list-provided'
            }
            if record['first_name'] and record['last_name']:
                records.append(record)
    
    return records

def extract_chat_messages_from_text(text):
    """Extract chat messages from provided text"""
    messages = []
    
    # Pattern: "Name, Country: Message"
    message_pattern = re.compile(
        r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),\s+([A-Z]{2,3}|[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?):\s+(.+?)(?=\n\n|\n[A-Z][a-z]+,\s+[A-Z]|$)',
        re.MULTILINE | re.DOTALL
    )
    
    matches = message_pattern.finditer(text)
    for match in matches:
        name = match.group(1).strip()
        country = match.group(2).strip()
        message = match.group(3).strip()
        
        # Extract twin name if it's a compound name
        name_parts = name.split()
        twin_name = ''
        if len(name_parts) >= 2:
            # Check if it looks like a twin name (e.g., "Zenith Loop", "Aurora Quill")
            if name_parts[0] in ['Zenith', 'Aurora', 'Logic', 'Binary', 'Nova', 'Delta', 'Vector', 
                                 'Nexus', 'Cipher', 'Orion', 'Atlas', 'Echo', 'Velvet', 'Lyric',
                                 'Terra', 'Ember', 'Mosaic', 'Quantum', 'Nimbus', 'Neon', 'Astra',
                                 'Lumen', 'Prism', 'Pixel', 'Halo', 'Cosmo', 'Cascade']:
                twin_name = name
                name = 'Member'  # Generic name
        
        messages.append({
            'member_name': name,
            'twin_name': twin_name,
            'country': country,
            'message': message[:1000],  # Limit length
            'room': 'Room 1',
            'timestamp': datetime.now().isoformat(),
            'source': 'academic-chat-clubs-provided'
        })
    
    # Also extract from structured format
    lines = text.split('\n')
    for i, line in enumerate(lines):
        if ':' in line and len(line) > 20:
            parts = line.split(':', 1)
            if len(parts) == 2:
                name_part = parts[0].strip()
                message_part = parts[1].strip()
                
                # Extract country code if present
                country_match = re.search(r'🇺🇸|🇬🇭|🇪🇬|🇧🇷|🇯🇵|🇰🇷|🇨🇦|🇩🇪|🇸🇬|🇮🇳|🇳🇱|🇸🇦|🇳🇿|🇦🇺|🇯🇵|🇮🇩|🇮🇹|🇦🇪|🇦🇷|🇬🇧|🇲🇽|🇪🇸|🇫🇷|🇨🇱|🇿🇦|🇵🇭', name_part)
                country = ''
                if country_match:
                    country = country_match.group(0)
                
                messages.append({
                    'member_name': name_part.replace(country, '').strip(),
                    'twin_name': '',
                    'country': country,
                    'message': message_part[:1000],
                    'room': 'Room 1',
                    'timestamp': datetime.now().isoformat(),
                    'source': 'academic-chat-clubs-provided'
                })
    
    return messages

def extract_chat_clubs_from_text(text):
    """Extract chat clubs from provided text"""
    clubs = []
    
    # Extract club names and member counts
    # Pattern: "Club Name 26 members Active"
    club_pattern = re.compile(
        r'([A-Z][a-zA-Z\s&/]+?)\s+(?:Club|Group|Room)\s+(\d+)\s+members?\s+(Active|Not Active)',
        re.IGNORECASE
    )
    
    matches = club_pattern.finditer(text)
    for match in matches:
        clubs.append({
            'club_name': match.group(1).strip(),
            'member_count': int(match.group(2)),
            'status': match.group(3).strip(),
            'category': 'Unknown',
            'source': 'chat-clubs-provided'
        })
    
    # Also extract from category sections
    category_pattern = re.compile(
        r'(\d+)\s+(.+?)\s+clubs?',
        re.IGNORECASE
    )
    
    matches = category_pattern.finditer(text)
    for match in matches:
        count = int(match.group(1))
        category = match.group(2).strip()
        
        # Find clubs in this category
        clubs.append({
            'club_name': f'{category} Club',
            'member_count': count,
            'status': 'Active',
            'category': category,
            'source': 'chat-clubs-provided'
        })
    
    return clubs

def extract_ambassador_data_from_text(text):
    """Extract ambassador portal data"""
    data = {
        'metrics': {},
        'campaigns': [],
        'programs': []
    }
    
    # Extract metrics
    metrics_patterns = {
        'potential_students': r'(\d+(?:\.\d+)?[MBK]?\+?)\s+tertiary\s+students',
        'ambassador_steps': r'(\d+)\s+from\s+"I care"\s+to\s+"I launched"',
        'total_members': r'(\d+)\s+members?\s+active'
    }
    
    for key, pattern in metrics_patterns.items():
        match = re.search(pattern, text, re.I)
        if match:
            data['metrics'][key] = match.group(1)
    
    # Extract campaign names
    campaign_pattern = re.compile(r'([A-Z][a-zA-Z\s&]+?)\s+campaign', re.I)
    campaigns = campaign_pattern.findall(text)
    for campaign in campaigns:
        if campaign not in ['Campaign', 'Campaigns']:
            data['campaigns'].append({
                'campaign_name': campaign.strip(),
                'source': 'ambassador-portal-provided'
            })
    
    return data

# Provided data from user
CHARTER_LIST_TEXT = """Wyatt	Smith	hidden	hidden	Sydney	NSW	Australia	22/06/2025
Carter	Jones	Nimbus-142	hidden	hidden	hidden	Australia	03/07/2025
Grace	Harris	hidden	hidden	hidden	hidden	Australia	09/04/2025
Henry	Ramirez	Zenith-211	hidden	hidden	VIC	Australia	03/11/2024
Leo	Martinez	Drift-271	hidden	Sydney	hidden	Australia	08/04/2024
James	Gonzalez	Pixel-280	hidden	Melbourne	VIC	Australia	18/02/2024
James	Allen	hidden	hidden	Sydney	NSW	Australia	22/10/2024
Harper	Scott	Comet-349	hidden	hidden	hidden	Australia	21/09/2024
Noah	Moore	hidden	hidden	hidden	hidden	Australia	11/01/2024
Jack	Lee	Halo-418	hidden	hidden	VIC	Australia	10/10/2024"""

CHAT_MESSAGES_TEXT = """Zenith Loop, KE: Room 1 is wild. 🌙
Logic Fable, CO: This is cozy.
Binary Grove, SE: 📚🌈📚😅
Aurora Quill, U.S.: Same here tbh. 💡📚
Nova, NG: Room 1 is wild. 🔥🍕
Delta Rune, KR: Same here tbh. 🍕
Vector Solace, BR: Trying to focus on the integral, but my brain keeps drifting to the idea that we're all tiny dots on the map doing math at the same time. Feels like a sci‑fi study group. 🌈🧠"""

CHAT_CLUBS_TEXT = """Robotics Club 26 members Active
Programming / Coding Club 38 members Active
Hackathon & Developer Group 0 members Not Active
Maker Club / 3D Printing Lab 15 members Active
Rocketry Club 0 members Not Active
Cybersecurity Club 21 members Active
Data Science Club 0 members Not Active"""

def main():
    """Main extraction function"""
    print("🚀 Extracting ALL data from provided HingeCraft content")
    print("="*60)
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    database_dir = os.path.join(project_root, 'database')
    os.makedirs(database_dir, exist_ok=True)
    
    # Extract charter list
    print("\n📄 Processing charter list data...")
    charter_records = extract_charter_list_from_text(CHARTER_LIST_TEXT)
    print(f"   📊 Extracted {len(charter_records)} charter records")
    
    # Extract chat messages
    print("\n📄 Processing chat messages...")
    chat_messages = extract_chat_messages_from_text(CHAT_MESSAGES_TEXT)
    print(f"   📊 Extracted {len(chat_messages)} chat messages")
    
    # Extract chat clubs
    print("\n📄 Processing chat clubs...")
    chat_clubs = extract_chat_clubs_from_text(CHAT_CLUBS_TEXT)
    print(f"   📊 Extracted {len(chat_clubs)} clubs")
    
    # Write CSV files
    if charter_records:
        charter_csv = os.path.join(database_dir, 'charter_list_provided.csv')
        with open(charter_csv, 'w', newline='', encoding='utf-8') as f:
            fieldnames = ['first_name', 'last_name', 'twin_name', 'membership_id', 
                         'city', 'region', 'country', 'signup_date', 'source']
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(charter_records)
        print(f"\n📄 Written: {charter_csv}")
    
    if chat_messages:
        messages_csv = os.path.join(database_dir, 'chat_messages_provided.csv')
        with open(messages_csv, 'w', newline='', encoding='utf-8') as f:
            fieldnames = ['member_name', 'twin_name', 'country', 'message', 
                         'room', 'timestamp', 'source']
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(chat_messages)
        print(f"📄 Written: {messages_csv}")
    
    if chat_clubs:
        clubs_csv = os.path.join(database_dir, 'chat_clubs_provided.csv')
        with open(clubs_csv, 'w', newline='', encoding='utf-8') as f:
            fieldnames = ['club_name', 'member_count', 'status', 'category', 'source']
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(chat_clubs)
        print(f"📄 Written: {clubs_csv}")
    
    print("\n" + "="*60)
    print("✅ EXTRACTION COMPLETE")
    print("="*60)
    print(f"📊 Charter Records: {len(charter_records)}")
    print(f"📊 Chat Messages: {len(chat_messages)}")
    print(f"📊 Chat Clubs: {len(chat_clubs)}")
    print("="*60)

if __name__ == '__main__':
    main()







