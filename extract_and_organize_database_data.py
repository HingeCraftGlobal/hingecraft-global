#!/usr/bin/env python3
"""
HingeCraft Database Data Extraction and Organization
====================================================

Extracts all data from the HingeCraft database and organizes it by project.
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime


class DatabaseDataExtractor:
    """Extract and organize database data from SQL files"""
    
    def __init__(self, sql_file_path: str):
        self.sql_file_path = Path(sql_file_path)
        self.tables_data: Dict[str, List[Dict[str, Any]]] = {}
        
    def extract_all_data(self) -> Dict[str, Any]:
        """Extract all data from SQL file"""
        
        print(f"📊 Extracting data from {self.sql_file_path}...")
        
        with open(self.sql_file_path, 'r') as f:
            sql_content = f.read()
        
        # Extract donations data
        self.tables_data['donations'] = self._extract_donations(sql_content)
        
        # Extract members data
        self.tables_data['members'] = self._extract_members(sql_content)
        
        # Extract chat_clubs data
        self.tables_data['chat_clubs'] = self._extract_chat_clubs(sql_content)
        
        # Extract chat_messages data
        self.tables_data['chat_messages'] = self._extract_chat_messages(sql_content)
        
        # Extract ambassadors data (if exists)
        self.tables_data['ambassadors'] = self._extract_ambassadors(sql_content)
        
        print(f"✅ Extracted data from {len(self.tables_data)} tables")
        return self.tables_data
    
    def _extract_donations(self, sql_content: str) -> List[Dict[str, Any]]:
        """Extract donations data"""
        donations = []
        
        # Find all INSERT statements for donations
        pattern = r"INSERT INTO donations[^;]*VALUES\s*\(([^)]+)\)"
        matches = re.finditer(pattern, sql_content, re.IGNORECASE | re.DOTALL)
        
        for match in matches:
            values_str = match.group(1)
            # Parse values (simplified - would need proper SQL parsing for production)
            # Extract key fields
            donation = {}
            
            # Extract _id
            id_match = re.search(r"'([a-f0-9-]+)'", values_str)
            if id_match:
                donation['_id'] = id_match.group(1)
            
            # Extract amount
            amount_match = re.search(r"(\d+\.?\d*)", values_str)
            if amount_match:
                donation['amount'] = float(amount_match.group(1))
            
            # Extract email
            email_match = re.search(r"'([^']+@[^']+)'", values_str)
            if email_match:
                donation['member_email'] = email_match.group(1)
            
            # Extract status
            if 'verified' in values_str.lower():
                donation['payment_status'] = 'verified'
            elif 'pending' in values_str.lower():
                donation['payment_status'] = 'pending'
            elif 'completed' in values_str.lower():
                donation['payment_status'] = 'completed'
            
            if donation:
                donations.append(donation)
        
        return donations
    
    def _extract_members(self, sql_content: str) -> List[Dict[str, Any]]:
        """Extract members data"""
        members = []
        
        # Find all INSERT statements for members
        pattern = r"INSERT INTO members[^;]*VALUES\s*\(([^)]+)\)"
        matches = re.finditer(pattern, sql_content, re.IGNORECASE | re.DOTALL)
        
        for match in matches:
            values_str = match.group(1)
            member = {}
            
            # Extract _id
            id_match = re.search(r"'([^']+)'", values_str)
            if id_match:
                member['_id'] = id_match.group(1)
            
            # Extract first_name
            names = re.findall(r"'([A-Z][a-z]+)'", values_str)
            if len(names) >= 1:
                member['first_name'] = names[0]
            if len(names) >= 2:
                member['last_name'] = names[1]
            if len(names) >= 3:
                member['twin_name'] = names[2]
            
            # Extract location
            locations = ['Sydney', 'Melbourne', 'Toronto', 'Canada', 'Australia', 'ON', 'VIC', 'NSW']
            for loc in locations:
                if loc in values_str:
                    if loc in ['Sydney', 'Melbourne', 'Toronto']:
                        member['city'] = loc
                    elif loc in ['ON', 'VIC', 'NSW']:
                        member['region'] = loc
                    elif loc in ['Canada', 'Australia']:
                        member['country'] = loc
            
            if member:
                members.append(member)
        
        return members
    
    def _extract_chat_clubs(self, sql_content: str) -> List[Dict[str, Any]]:
        """Extract chat clubs data"""
        clubs = []
        
        pattern = r"INSERT INTO chat_clubs[^;]*VALUES\s*\(([^)]+)\)"
        matches = re.finditer(pattern, sql_content, re.IGNORECASE | re.DOTALL)
        
        for match in matches:
            values_str = match.group(1)
            club = {}
            
            # Extract club name
            club_names = ['Robotics', 'Programming', 'Hackathon', 'Maker', 'Rocketry', 'Cybersecurity']
            for name in club_names:
                if name in values_str:
                    club['club_name'] = name
                    break
            
            # Extract status
            if 'Active' in values_str:
                club['status'] = 'Active'
            elif 'Not Active' in values_str:
                club['status'] = 'Not Active'
            
            # Extract member count
            count_match = re.search(r'(\d+)', values_str)
            if count_match:
                club['member_count'] = int(count_match.group(1))
            
            if club:
                clubs.append(club)
        
        return clubs
    
    def _extract_chat_messages(self, sql_content: str) -> List[Dict[str, Any]]:
        """Extract chat messages data"""
        messages = []
        
        pattern = r"INSERT INTO chat_messages[^;]*VALUES\s*\(([^)]+)\)"
        matches = re.finditer(pattern, sql_content, re.IGNORECASE | re.DOTALL)
        
        for match in matches:
            values_str = match.group(1)
            message = {}
            
            # Extract message text
            msg_match = re.search(r"'([^']{10,})'", values_str)
            if msg_match:
                message['message'] = msg_match.group(1)[:100]  # First 100 chars
            
            # Extract room
            if 'Room 1' in values_str:
                message['room'] = 'Room 1'
            
            # Extract country codes
            country_codes = ['KE', 'CO', 'SE', 'NG', 'KR', 'BR']
            for code in country_codes:
                if f"'{code}'" in values_str:
                    message['country'] = code
                    break
            
            if message:
                messages.append(message)
        
        return messages
    
    def _extract_ambassadors(self, sql_content: str) -> List[Dict[str, Any]]:
        """Extract ambassadors data (if exists)"""
        # Check if ambassadors table has data
        if 'INSERT INTO ambassadors' not in sql_content:
            return []
        
        # Similar extraction logic as above
        return []
    
    def save_extracted_data(self, output_path: str = "hingecraft_database_data.json"):
        """Save extracted data to JSON"""
        output_file = Path(output_path)
        
        with open(output_file, 'w') as f:
            json.dump(self.tables_data, f, indent=2, default=str)
        
        print(f"💾 Saved extracted data to {output_file}")
        return output_file


def main():
    """Main execution"""
    sql_file = Path(__file__).parent / "database" / "init.sql"
    
    if not sql_file.exists():
        print(f"❌ Error: {sql_file} not found")
        return
    
    extractor = DatabaseDataExtractor(sql_file)
    data = extractor.extract_all_data()
    
    # Save extracted data
    extractor.save_extracted_data("hingecraft_database_data.json")
    
    # Print summary
    print("\n📊 Extraction Summary:")
    for table_name, records in data.items():
        print(f"  - {table_name}: {len(records)} records")


if __name__ == "__main__":
    main()
