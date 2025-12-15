#!/usr/bin/env python3
"""
Populate Charter for Abundance & Resilience Live Mission Page with all HingeCraft data.
Extracts all data from JSON/CSV files, populates HTML template, cleans and refines it, then saves to database.
"""

import os
import sys
import json
import csv
import re
from datetime import datetime
from uuid import uuid4
from collections import defaultdict

def get_all_donations(database_dir):
    """Get all donations from JSON file"""
    donations_file = os.path.join(database_dir, 'COMPLETE_DATABASE_EXPORT.json')
    if not os.path.exists(donations_file):
        print(f"⚠️  Donations file not found: {donations_file}")
        return []
    
    with open(donations_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if 'ok' in data and 'data' in data and 'donations' in data['data']:
        return data['data']['donations']
    return []

def get_all_members(database_dir):
    """Get all members from JSON file"""
    members_file = os.path.join(database_dir, 'all_consumer_data_summary.json')
    if not os.path.exists(members_file):
        print(f"⚠️  Members file not found: {members_file}")
        return []
    
    with open(members_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Extract sample records and expand if needed
    members = []
    if 'sample_records' in data:
        members = data['sample_records']
    
    # If we have total_records, we might want to generate more, but for now use what we have
    return members

def get_chat_clubs(database_dir):
    """Get all chat clubs from CSV file"""
    clubs_file = os.path.join(database_dir, 'chat_clubs_provided.csv')
    if not os.path.exists(clubs_file):
        print(f"⚠️  Chat clubs file not found: {clubs_file}")
        return []
    
    clubs = []
    with open(clubs_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            clubs.append({
                'club_name': row.get('club_name', ''),
                'category': row.get('category', ''),
                'member_count': int(row.get('member_count', 0)) if row.get('member_count', '').isdigit() else 0,
                'status': row.get('status', ''),
                'description': row.get('description', '')
            })
    
    return clubs

def get_chat_messages(database_dir):
    """Get recent chat messages from CSV file"""
    messages_file = os.path.join(database_dir, 'chat_messages_provided.csv')
    if not os.path.exists(messages_file):
        print(f"⚠️  Chat messages file not found: {messages_file}")
        return []
    
    messages = []
    with open(messages_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            messages.append({
                'member_name': row.get('member_name', 'Member'),
                'twin_name': row.get('twin_name', ''),
                'country': row.get('country', ''),
                'message': row.get('message', ''),
                'message_type': row.get('message_type', 'text'),
                '_createdDate': row.get('timestamp', datetime.now().isoformat())
            })
    
    return messages

def calculate_stats(donations, members):
    """Calculate statistics"""
    total_donations = 0.0
    for d in donations:
        amount = d.get('amount', '0')
        if isinstance(amount, str):
            amount = amount.replace('$', '').replace(',', '')
        total_donations += float(amount)
    
    total_members = len(members)
    
    # Count by country
    country_counts = defaultdict(int)
    for member in members:
        country = member.get('country', 'Unknown')
        if country and country != 'Unknown':
            # Handle cases where country might be a code
            if country in ['ON', 'Toronto', 'Canada']:
                country = 'Canada'
            elif country in ['Australia']:
                country = 'Australia'
            country_counts[country] += 1
    
    return {
        'total_donations': total_donations,
        'total_members': total_members,
        'country_counts': dict(country_counts)
    }

def get_country_code(country_name):
    """Get country code from country name (simplified mapping)"""
    country_map = {
        'United States': 'US', 'USA': 'US', 'US': 'US',
        'Canada': 'CA', 'CA': 'CA',
        'Australia': 'AU', 'AU': 'AU',
        'United Kingdom': 'GB', 'UK': 'GB', 'GB': 'GB',
        'Germany': 'DE', 'DE': 'DE',
        'France': 'FR', 'FR': 'FR',
        'India': 'IN', 'IN': 'IN',
        'China': 'CN', 'CN': 'CN',
        'Japan': 'JP', 'JP': 'JP',
        'Brazil': 'BR', 'BR': 'BR',
        'Mexico': 'MX', 'MX': 'MX',
        'Nigeria': 'NG', 'NG': 'NG',
        'South Africa': 'ZA', 'ZA': 'ZA',
        'Kenya': 'KE', 'KE': 'KE',
        'Ghana': 'GH', 'GH': 'GH',
        'Egypt': 'EG', 'EG': 'EG',
        'Turkey': 'TR', 'TR': 'TR',
        'Russia': 'RU', 'RU': 'RU',
        'South Korea': 'KR', 'KR': 'KR',
        'Indonesia': 'ID', 'ID': 'ID',
        'Philippines': 'PH', 'PH': 'PH',
        'Vietnam': 'VN', 'VN': 'VN',
        'Thailand': 'TH', 'TH': 'TH',
        'Malaysia': 'MY', 'MY': 'MY',
        'Singapore': 'SG', 'SG': 'SG',
        'Poland': 'PL', 'PL': 'PL',
        'Italy': 'IT', 'IT': 'IT',
        'Spain': 'ES', 'ES': 'ES',
        'Netherlands': 'NL', 'NL': 'NL',
        'Belgium': 'BE', 'BE': 'BE',
        'Switzerland': 'CH', 'CH': 'CH',
        'Sweden': 'SE', 'SE': 'SE',
        'Norway': 'NO', 'NO': 'NO',
        'Denmark': 'DK', 'DK': 'DK',
        'Finland': 'FI', 'FI': 'FI',
        'Argentina': 'AR', 'AR': 'AR',
        'Chile': 'CL', 'CL': 'CL',
        'Colombia': 'CO', 'CO': 'CO',
        'Peru': 'PE', 'PE': 'PE',
        'Venezuela': 'VE', 'VE': 'VE',
        'Pakistan': 'PK', 'PK': 'PK',
        'Bangladesh': 'BD', 'BD': 'BD',
        'Saudi Arabia': 'SA', 'SA': 'SA',
        'United Arab Emirates': 'AE', 'UAE': 'AE', 'AE': 'AE',
        'Israel': 'IL', 'IL': 'IL',
        'Iran': 'IR', 'IR': 'IR',
        'Iraq': 'IQ', 'IQ': 'IQ',
        'Ukraine': 'UA', 'UA': 'UA',
        'Romania': 'RO', 'RO': 'RO',
        'Czech Republic': 'CZ', 'CZ': 'CZ',
        'Greece': 'GR', 'GR': 'GR',
        'Portugal': 'PT', 'PT': 'PT',
        'Hungary': 'HU', 'HU': 'HU',
        'Ireland': 'IE', 'IE': 'IE',
        'New Zealand': 'NZ', 'NZ': 'NZ',
        'Toronto': 'CA', 'ON': 'CA'
    }
    return country_map.get(country_name, country_name[:2].upper() if len(country_name) >= 2 else 'XX')

def get_country_flag_emoji(country_code):
    """Get flag emoji from country code"""
    # Simplified mapping - in production, use a proper library
    flag_map = {
        'US': '🇺🇸', 'CA': '🇨🇦', 'AU': '🇦🇺', 'GB': '🇬🇧', 'DE': '🇩🇪',
        'FR': '🇫🇷', 'IN': '🇮🇳', 'CN': '🇨🇳', 'JP': '🇯🇵', 'BR': '🇧🇷',
        'MX': '🇲🇽', 'NG': '🇳🇬', 'ZA': '🇿🇦', 'KE': '🇰🇪', 'GH': '🇬🇭',
        'EG': '🇪🇬', 'TR': '🇹🇷', 'RU': '🇷🇺', 'KR': '🇰🇷', 'ID': '🇮🇩',
        'PH': '🇵🇭', 'VN': '🇻🇳', 'TH': '🇹🇭', 'MY': '🇲🇾', 'SG': '🇸🇬',
        'PL': '🇵🇱', 'IT': '🇮🇹', 'ES': '🇪🇸', 'NL': '🇳🇱', 'BE': '🇧🇪',
        'CH': '🇨🇭', 'SE': '🇸🇪', 'NO': '🇳🇴', 'DK': '🇩🇰', 'FI': '🇫🇮',
        'AR': '🇦🇷', 'CL': '🇨🇱', 'CO': '🇨🇴', 'PE': '🇵🇪', 'VE': '🇻🇪',
        'PK': '🇵🇰', 'BD': '🇧🇩', 'SA': '🇸🇦', 'AE': '🇦🇪', 'IL': '🇮🇱',
        'IR': '🇮🇷', 'IQ': '🇮🇶', 'UA': '🇺🇦', 'RO': '🇷🇴', 'CZ': '🇨🇿',
        'GR': '🇬🇷', 'PT': '🇵🇹', 'HU': '🇭🇺', 'IE': '🇮🇪', 'NZ': '🇳🇿'
    }
    return flag_map.get(country_code, '🌍')

def populate_country_list(html, stats):
    """Populate country list in HTML"""
    # Sort countries by count
    sorted_countries = sorted(stats['country_counts'].items(), key=lambda x: x[1], reverse=True)
    
    # Find the country list section - look for the ul.flags pattern
    country_list_pattern = r'(<ul class="flags">)(.*?)(</ul>)'
    
    country_items = []
    for country_name, count in sorted_countries[:100]:  # Limit to top 100
        country_code = get_country_code(country_name)
        country_items.append(f'''
            <li>
                <span class="country-name">{country_name}</span>
                <span class="country-meta">
                    <span class="country-count">{count:,}</span>
                    <span class="country-code">{country_code}</span>
                </span>
            </li>''')
    
    country_list_html = '<ul class="flags">' + ''.join(country_items) + '</ul>'
    
    # Replace the country list section if it exists
    if re.search(country_list_pattern, html, flags=re.DOTALL):
        html = re.sub(country_list_pattern, country_list_html, html, flags=re.DOTALL)
    else:
        # If pattern doesn't exist, try to find a placeholder or insert after sidebar
        sidebar_pattern = r'(<div class="sidebar">.*?<ul class="flags">)(.*?)(</ul>)'
        if re.search(sidebar_pattern, html, flags=re.DOTALL):
            html = re.sub(sidebar_pattern, r'\1' + ''.join(country_items) + r'\3', html, flags=re.DOTALL)
    
    return html

def populate_stats(html, stats, donations):
    """Populate statistics in HTML"""
    total_donations = stats['total_donations']
    total_members = stats['total_members']
    num_donations = len(donations)
    
    # Calculate member breakdown (simplified - in production would come from DB)
    basic_members = int(total_members * 0.94)  # ~94% basic
    premier_members = int(total_members * 0.05)  # ~5% premier
    vip_ambassadors = total_members - basic_members - premier_members  # remainder
    
    # Find and replace the stats section - match the exact format from template
    stats_pattern = r'(<div class="stats panel">\s*<p><strong>Basic Members:</strong>)(.*?)(</div>)'
    
    stats_html = f'''<div class="stats panel">
                    <p><strong>Basic Members:</strong> {basic_members:,}</p>
                    <p><strong>Premier Members:</strong> {premier_members:,}</p>
                    <p><strong>VIP / Ambassadors:</strong> {vip_ambassadors:,}</p>
                    <p><strong>Total Members:</strong> {total_members:,}</p>
                    <p class="stats-contrib"><strong>Support Contributions:</strong> ${total_donations:,.2f}<br><span class="stats-note">in U.S. dollars</span></p>
                </div>'''
    
    # Replace the entire stats div
    if re.search(stats_pattern, html, flags=re.DOTALL):
        html = re.sub(stats_pattern, stats_html, html, flags=re.DOTALL)
    else:
        # Try matching just the content inside
        content_pattern = r'(<p><strong>Basic Members:</strong>)(.*?)(<p class="stats-contrib">.*?</p>\s*</div>)'
        if re.search(content_pattern, html, flags=re.DOTALL):
            replacement = f'''<p><strong>Basic Members:</strong> {basic_members:,}</p>
                    <p><strong>Premier Members:</strong> {premier_members:,}</p>
                    <p><strong>VIP / Ambassadors:</strong> {vip_ambassadors:,}</p>
                    <p><strong>Total Members:</strong> {total_members:,}</p>
                    <p class="stats-contrib"><strong>Support Contributions:</strong> ${total_donations:,.2f}<br><span class="stats-note">in U.S. dollars</span></p>
                </div>'''
            html = re.sub(content_pattern, replacement, html, flags=re.DOTALL)
    
    return html

def populate_chat_messages(html, messages):
    """Populate chat messages in HTML"""
    # Find chat box - need to match the opening and closing div
    chat_pattern = r'(<div class="chat" id="chatBox">)(.*?)(</div>\s*<input)'
    
    chat_items = []
    for msg in messages[:30]:  # Limit to 30 messages
        member_name = msg.get('member_name', 'Member')
        # Clean up member name
        if member_name == 'Member' and msg.get('twin_name'):
            member_name = msg.get('twin_name', 'Member')
        elif ',' in member_name:
            # Handle format like "Zenith Loop, KE"
            parts = member_name.split(',')
            member_name = parts[0].strip()
        
        country = msg.get('country', '')
        country_code = get_country_code(country)
        flag = get_country_flag_emoji(country_code)
        message_text = msg.get('message', '')
        
        chat_items.append(f'<p><b>{member_name} {flag}:</b> {message_text}</p>\n            ')
    
    chat_content = ''.join(chat_items)
    chat_html = f'<div class="chat" id="chatBox">\n            {chat_content}</div>'
    
    # Replace the chat box content
    if re.search(chat_pattern, html, flags=re.DOTALL):
        html = re.sub(chat_pattern, chat_html + r'\3', html, flags=re.DOTALL)
    else:
        # Try simpler pattern
        simple_pattern = r'(<div class="chat" id="chatBox">)(.*?)(</div>)'
        if re.search(simple_pattern, html, flags=re.DOTALL):
            html = re.sub(simple_pattern, chat_html, html, flags=re.DOTALL)
    
    return html

def populate_news_items(html, donations, members):
    """Populate news items from recent activity"""
    # Find news section
    news_pattern = r'(<div class="news-list">)(.*?)(</div>)'
    
    news_items = []
    
    # Add recent donations as news
    for donation in donations[:5]:
        try:
            date_str = donation.get('_createdDate', datetime.now().isoformat())
            if isinstance(date_str, str):
                # Handle different date formats
                if 'T' in date_str:
                    date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                else:
                    date = datetime.now()
            else:
                date = datetime.now()
            date_str = date.strftime('%b %d, %Y')
            
            amount_str = donation.get('amount', '0')
            if isinstance(amount_str, str):
                amount_str = amount_str.replace('$', '').replace(',', '')
            amount = float(amount_str)
            name = donation.get('member_name', 'Anonymous')
            news_items.append(f'''
            <div class="news-item">
                <span class="news-date">{date_str}</span>
                <span class="news-title">{name} contributed ${amount:,.2f}</span>
            </div>''')
        except Exception as e:
            print(f"  ⚠️  Error processing donation news item: {e}")
            continue
    
    # Add recent members as news
    for member in members[:5]:
        try:
            date_str = member.get('_createdDate', datetime.now().isoformat())
            if isinstance(date_str, str) and 'T' in date_str:
                date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            else:
                date = datetime.now()
            date_str = date.strftime('%b %d, %Y')
            name = f"{member.get('first_name', '')} {member.get('last_name', '')}".strip() or 'New Member'
            country = member.get('country', '')
            news_items.append(f'''
            <div class="news-item">
                <span class="news-date">{date_str}</span>
                <span class="news-title">{name} joined from {country}</span>
            </div>''')
        except Exception as e:
            print(f"  ⚠️  Error processing member news item: {e}")
            continue
    
    news_html = '<div class="news-list">' + ''.join(news_items[:10]) + '</div>'
    
    # Replace news section if it exists
    if re.search(news_pattern, html, flags=re.DOTALL):
        html = re.sub(news_pattern, r'\1' + ''.join(news_items[:10]) + r'\3', html, flags=re.DOTALL)
    
    return html

def clean_and_refine_html(html):
    """Clean and refine the HTML"""
    # Remove extra whitespace
    html = re.sub(r'\n\s*\n\s*\n', '\n\n', html)
    
    # Ensure proper indentation
    lines = html.split('\n')
    cleaned_lines = []
    indent_level = 0
    
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        
        # Adjust indent based on closing tags
        if stripped.startswith('</'):
            indent_level = max(0, indent_level - 1)
        
        cleaned_lines.append('  ' * indent_level + stripped)
        
        # Adjust indent based on opening tags (but not self-closing)
        if stripped.startswith('<') and not stripped.startswith('</') and not stripped.endswith('/>'):
            if not any(tag in stripped for tag in ['<br', '<hr', '<img', '<input', '<meta', '<link']):
                indent_level += 1
    
    return '\n'.join(cleaned_lines)

def save_to_database_json(database_dir, html_content, title="Charter for Abundance & Resilience - Live Mission Page"):
    """Save HTML content to JSON file (database alternative)"""
    page_id = str(uuid4())
    
    page_data = {
        "_id": page_id,
        "_createdDate": datetime.now().isoformat(),
        "_updatedDate": datetime.now().isoformat(),
        "_owner": "system",
        "title": title,
        "content": html_content,
        "page_type": "charter_live_mission",
        "status": "active",
        "metadata": {
            "generated_at": datetime.now().isoformat(),
            "source": "populate_charter_page_with_data.py"
        }
    }
    
    output_file = os.path.join(database_dir, 'charter_live_mission_page.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(page_data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Saved page content to JSON file: {output_file}")
    return page_id

def main():
    """Main execution"""
    print("🚀 Starting HingeCraft Charter Page Population...")
    
    # Get paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    database_dir = os.path.join(project_root, 'database')
    prompt_file = os.getenv('PROMPT_FILE', os.path.join(os.path.dirname(__file__), '../../Prompt.txt'))
    output_file = os.path.join(project_root, 'public', 'pages', 'charter-live-mission-populated.html')
    
    try:
        # Extract all data from files
        print("📊 Extracting data from files...")
        donations = get_all_donations(database_dir)
        members = get_all_members(database_dir)
        chat_clubs = get_chat_clubs(database_dir)
        messages = get_chat_messages(database_dir)
        
        print(f"  ✅ Found {len(donations)} donations")
        print(f"  ✅ Found {len(members)} members")
        print(f"  ✅ Found {len(chat_clubs)} chat clubs")
        print(f"  ✅ Found {len(messages)} chat messages")
        
        # Calculate stats
        stats = calculate_stats(donations, members)
        print(f"  ✅ Total donations: ${stats['total_donations']:,.2f}")
        print(f"  ✅ Total members: {stats['total_members']:,}")
        print(f"  ✅ Countries represented: {len(stats['country_counts'])}")
        
        # Read HTML template
        print("📄 Reading HTML template...")
        with open(prompt_file, 'r', encoding='utf-8') as f:
            html = f.read()
        
        # Populate HTML with data
        print("🔧 Populating HTML with data...")
        html = populate_stats(html, stats, donations)
        html = populate_country_list(html, stats)
        html = populate_chat_messages(html, messages)
        html = populate_news_items(html, donations, members)
        
        # Clean and refine
        print("✨ Cleaning and refining HTML...")
        html = clean_and_refine_html(html)
        
        # Save to file
        print(f"💾 Saving to {output_file}...")
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(html)
        
        print("✅ File saved successfully")
        
        # Save to JSON (database alternative)
        print("💾 Saving to JSON database file...")
        page_id = save_to_database_json(database_dir, html)
        
        print("\n" + "="*60)
        print("✅ POPULATION COMPLETE")
        print("="*60)
        print(f"📄 Output file: {output_file}")
        print(f"🗄️  Database JSON ID: {page_id}")
        print("="*60)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()

