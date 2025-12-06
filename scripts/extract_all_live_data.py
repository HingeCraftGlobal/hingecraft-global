#!/usr/bin/env python3
"""
Comprehensive extraction script to pull ALL data from live HingeCraft website pages.
Extracts and segments:
- Charter list data (charter-list page)
- Chat clubs data (chat-clubs page)
- Academic chat clubs messages (academic-chat-clubs page)
- Ambassador portal data (ambassador-portal page)
- Lifetime registry data (lifetime-registry page)
"""

import os
import sys
import json
import csv
import re
from datetime import datetime
from bs4 import BeautifulSoup
import requests
from collections import defaultdict

# Live website URLs
LIVE_URLS = {
    'charter_list': 'https://www.hingecraft-global.ai/charter-list',
    'chat_clubs': 'https://www.hingecraft-global.ai/chat-clubs',
    'academic_chat_clubs': 'https://www.hingecraft-global.ai/academic-chat-clubs',
    'ambassador_portal': 'https://www.hingecraft-global.ai/ambassador-portal',
    'lifetime_registry': 'https://www.hingecraft-global.ai/lifetime-registry'
}

def fetch_page(url):
    """Fetch page content"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        return response.text
    except Exception as e:
        print(f"⚠️  Error fetching {url}: {e}")
        return None

def extract_charter_list_data(html):
    """Extract charter list table data"""
    if not html:
        return []
    
    soup = BeautifulSoup(html, 'html.parser')
    records = []
    
    # Find table
    table = soup.find('table')
    if not table:
        # Try to find tbody
        tbody = soup.find('tbody')
        if tbody:
            rows = tbody.find_all('tr')
            for row in rows:
                cells = [td.get_text(strip=True) for td in row.find_all('td')]
                if len(cells) >= 8:
                    record = {
                        'first_name': cells[0],
                        'last_name': cells[1],
                        'twin_name': cells[2] if cells[2] != 'hidden' else '',
                        'membership_id': cells[3] if cells[3] != 'hidden' else '',
                        'city': cells[4] if cells[4] != 'hidden' else '',
                        'region': cells[5] if cells[5] != 'hidden' else '',
                        'country': cells[6],
                        'signup_date': cells[7],
                        'source': 'charter-list-live'
                    }
                    records.append(record)
    else:
        rows = table.find_all('tr')[1:]  # Skip header
        for row in rows:
            cells = [td.get_text(strip=True) for td in row.find_all('td')]
            if len(cells) >= 8:
                record = {
                    'first_name': cells[0],
                    'last_name': cells[1],
                    'twin_name': cells[2] if cells[2] != 'hidden' else '',
                    'membership_id': cells[3] if cells[3] != 'hidden' else '',
                    'city': cells[4] if cells[4] != 'hidden' else '',
                    'region': cells[5] if cells[5] != 'hidden' else '',
                    'country': cells[6],
                    'signup_date': cells[7],
                    'source': 'charter-list-live'
                }
                records.append(record)
    
    return records

def extract_chat_clubs_data(html):
    """Extract chat clubs categories and member counts"""
    if not html:
        return []
    
    clubs = []
    soup = BeautifulSoup(html, 'html.parser')
    
    # Extract club categories
    category_pattern = re.compile(r'(\d+)\s+(.+?)\s+clubs?', re.IGNORECASE)
    text = soup.get_text()
    
    # Find club listings
    club_elements = soup.find_all(['div', 'li', 'span'], class_=re.compile(r'club|room|category', re.I))
    
    for elem in club_elements:
        text_content = elem.get_text(strip=True)
        # Match patterns like "Robotics Club 26 members Active"
        match = re.search(r'(.+?)\s+(\d+)\s+members?\s+(Active|Not Active)', text_content, re.I)
        if match:
            clubs.append({
                'club_name': match.group(1).strip(),
                'member_count': int(match.group(2)),
                'status': match.group(3).strip(),
                'source': 'chat-clubs-live'
            })
    
    # Also extract from text patterns
    matches = re.finditer(r'(\d+)\s+members?\s+active', text, re.I)
    for match in matches:
        # Try to find club name before this
        context = text[max(0, match.start()-100):match.start()]
        club_name_match = re.search(r'([A-Z][a-zA-Z\s&/]+?)\s+(?:Club|Group|Room)', context)
        if club_name_match:
            clubs.append({
                'club_name': club_name_match.group(1).strip(),
                'member_count': int(match.group(1)),
                'status': 'Active',
                'source': 'chat-clubs-live'
            })
    
    return clubs

def extract_chat_messages_data(html):
    """Extract chat messages from academic chat clubs page"""
    if not html:
        return []
    
    messages = []
    soup = BeautifulSoup(html, 'html.parser')
    
    # Extract from provided text data
    text = html
    
    # Pattern: "Name, Country: Message content"
    message_pattern = re.compile(
        r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),\s+([A-Z]{2,3}|[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?):\s+(.+?)(?=\n\n|\n[A-Z]|$)',
        re.MULTILINE | re.DOTALL
    )
    
    matches = message_pattern.finditer(text)
    for match in matches:
        name = match.group(1).strip()
        country = match.group(2).strip()
        message = match.group(3).strip()
        
        # Extract twin name if present (format: "Name, Country" or "Twin Name, Country")
        twin_match = re.search(r'([A-Z][a-z]+\s+[A-Z][a-z]+)', name)
        twin_name = twin_match.group(1) if twin_match else ''
        
        messages.append({
            'member_name': name,
            'twin_name': twin_name,
            'country': country,
            'message': message[:500],  # Limit length
            'room': 'Room 1',  # Default from context
            'timestamp': datetime.now().isoformat(),
            'source': 'academic-chat-clubs-live'
        })
    
    # Also extract from structured data if present
    message_divs = soup.find_all(['div', 'p', 'span'], class_=re.compile(r'message|chat|post', re.I))
    for div in message_divs:
        text_content = div.get_text(strip=True)
        if ':' in text_content and len(text_content) > 20:
            parts = text_content.split(':', 1)
            if len(parts) == 2:
                name_part = parts[0].strip()
                message_part = parts[1].strip()
                
                # Extract name and country
                name_match = re.match(r'(.+?)\s*[•\n]', name_part)
                name = name_match.group(1) if name_match else name_part
                
                messages.append({
                    'member_name': name,
                    'twin_name': '',
                    'country': '',
                    'message': message_part[:500],
                    'room': 'Room 1',
                    'timestamp': datetime.now().isoformat(),
                    'source': 'academic-chat-clubs-live'
                })
    
    return messages

def extract_ambassador_data(html):
    """Extract ambassador portal data"""
    if not html:
        return []
    
    ambassadors = []
    soup = BeautifulSoup(html, 'html.parser')
    
    # Extract key metrics
    text = soup.get_text()
    
    # Find metrics like "264M+ tertiary students worldwide"
    metrics = {}
    metric_patterns = {
        'potential_students': r'(\d+(?:\.\d+)?[MBK]?\+?)\s+tertiary\s+students',
        'ambassador_steps': r'(\d+)\s+from\s+"I care"\s+to\s+"I launched"',
        'campaigns': r'(\d+)\s+campaigns?',
        'programs': r'(\d+)\s+programs?'
    }
    
    for key, pattern in metric_patterns.items():
        match = re.search(pattern, text, re.I)
        if match:
            metrics[key] = match.group(1)
    
    # Extract campaign types
    campaigns = []
    campaign_sections = soup.find_all(['div', 'section'], class_=re.compile(r'campaign|program', re.I))
    for section in campaign_sections:
        title = section.find(['h2', 'h3', 'h4'])
        if title:
            campaigns.append({
                'campaign_name': title.get_text(strip=True),
                'description': section.get_text(strip=True)[:500],
                'source': 'ambassador-portal-live'
            })
    
    return {
        'metrics': metrics,
        'campaigns': campaigns,
        'source': 'ambassador-portal-live'
    }

def main():
    """Main extraction function"""
    print("🚀 Extracting ALL data from live HingeCraft website")
    print("="*60)
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    database_dir = os.path.join(project_root, 'database')
    os.makedirs(database_dir, exist_ok=True)
    
    all_charter_records = []
    all_clubs = []
    all_messages = []
    ambassador_data = {}
    
    # Fetch and extract from each page
    for page_name, url in LIVE_URLS.items():
        print(f"\n📄 Fetching: {page_name} ({url})")
        html = fetch_page(url)
        
        if not html:
            print(f"   ⚠️  Failed to fetch")
            continue
        
        print(f"   ✅ Fetched {len(html)} bytes")
        
        if page_name == 'charter_list':
            records = extract_charter_list_data(html)
            all_charter_records.extend(records)
            print(f"   📊 Extracted {len(records)} charter records")
        
        elif page_name == 'chat_clubs':
            clubs = extract_chat_clubs_data(html)
            all_clubs.extend(clubs)
            print(f"   📊 Extracted {len(clubs)} clubs")
        
        elif page_name == 'academic_chat_clubs':
            messages = extract_chat_messages_data(html)
            all_messages.extend(messages)
            print(f"   📊 Extracted {len(messages)} chat messages")
        
        elif page_name == 'ambassador_portal':
            ambassador_data = extract_ambassador_data(html)
            print(f"   📊 Extracted ambassador portal data")
    
    # Write charter records
    if all_charter_records:
        charter_csv = os.path.join(database_dir, 'charter_list_live.csv')
        with open(charter_csv, 'w', newline='', encoding='utf-8') as f:
            fieldnames = ['first_name', 'last_name', 'twin_name', 'membership_id', 
                         'city', 'region', 'country', 'signup_date', 'source']
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(all_charter_records)
        print(f"\n📄 Written: {charter_csv} ({len(all_charter_records)} records)")
    
    # Write clubs
    if all_clubs:
        clubs_csv = os.path.join(database_dir, 'chat_clubs_live.csv')
        with open(clubs_csv, 'w', newline='', encoding='utf-8') as f:
            fieldnames = ['club_name', 'member_count', 'status', 'source']
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(all_clubs)
        print(f"📄 Written: {clubs_csv} ({len(all_clubs)} records)")
    
    # Write messages
    if all_messages:
        messages_csv = os.path.join(database_dir, 'chat_messages_live.csv')
        with open(messages_csv, 'w', newline='', encoding='utf-8') as f:
            fieldnames = ['member_name', 'twin_name', 'country', 'message', 
                         'room', 'timestamp', 'source']
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(all_messages)
        print(f"📄 Written: {messages_csv} ({len(all_messages)} records)")
    
    # Write ambassador data
    if ambassador_data:
        ambassador_json = os.path.join(database_dir, 'ambassador_portal_live.json')
        with open(ambassador_json, 'w', encoding='utf-8') as f:
            json.dump(ambassador_data, f, indent=2)
        print(f"📄 Written: {ambassador_json}")
    
    # Summary
    print("\n" + "="*60)
    print("✅ EXTRACTION COMPLETE")
    print("="*60)
    print(f"📊 Charter Records: {len(all_charter_records)}")
    print(f"📊 Chat Clubs: {len(all_clubs)}")
    print(f"📊 Chat Messages: {len(all_messages)}")
    print(f"📊 Ambassador Data: {'Yes' if ambassador_data else 'No'}")
    print("="*60)

if __name__ == '__main__':
    main()




