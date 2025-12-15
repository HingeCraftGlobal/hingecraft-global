#!/bin/bash
# Load data via Docker exec to bypass password issues

set -e

PROJECT_ROOT="/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global"
HINGECRAFT_DIR="/Users/chandlerfergusen/Desktop/CURSOR/HingeCraft"

echo "🚀 Loading data via Docker..."

# Load chat clubs
echo "Loading chat clubs..."
cd "$HINGECRAFT_DIR"
docker compose exec -T postgres psql -U hingecraft_user -d hingecraft_db <<EOF
INSERT INTO chat_clubs ("_id", "_createdDate", "_updatedDate", "_owner", club_name, category, member_count, status, source)
VALUES 
    (gen_random_uuid()::VARCHAR, NOW(), NOW(), 'system', 'Robotics Club', 'STEM, Makers & Innovation', 26, 'Active', 'chat-clubs-provided'),
    (gen_random_uuid()::VARCHAR, NOW(), NOW(), 'system', 'Programming / Coding Club', 'STEM, Makers & Innovation', 38, 'Active', 'chat-clubs-provided'),
    (gen_random_uuid()::VARCHAR, NOW(), NOW(), 'system', 'Hackathon & Developer Group', 'STEM, Makers & Innovation', 0, 'Not Active', 'chat-clubs-provided'),
    (gen_random_uuid()::VARCHAR, NOW(), NOW(), 'system', 'Maker Club / 3D Printing Lab', 'STEM, Makers & Innovation', 15, 'Active', 'chat-clubs-provided'),
    (gen_random_uuid()::VARCHAR, NOW(), NOW(), 'system', 'Rocketry Club', 'STEM, Makers & Innovation', 0, 'Not Active', 'chat-clubs-provided'),
    (gen_random_uuid()::VARCHAR, NOW(), NOW(), 'system', 'Cybersecurity Club', 'STEM, Makers & Innovation', 21, 'Active', 'chat-clubs-provided')
ON CONFLICT ("_id") DO NOTHING;
EOF

# Load chat messages
echo "Loading chat messages..."
docker compose exec -T postgres psql -U hingecraft_user -d hingecraft_db <<EOF
INSERT INTO chat_messages ("_id", "_createdDate", "_updatedDate", "_owner", member_name, twin_name, country, room, message, source)
VALUES 
    (gen_random_uuid()::VARCHAR, NOW(), NOW(), 'system', 'Zenith Loop', 'Zenith Loop', 'KE', 'Room 1', 'Room 1 is wild. 🌙', 'academic-chat-clubs-provided'),
    (gen_random_uuid()::VARCHAR, NOW(), NOW(), 'system', 'Logic Fable', 'Logic Fable', 'CO', 'Room 1', 'This is cozy.', 'academic-chat-clubs-provided'),
    (gen_random_uuid()::VARCHAR, NOW(), NOW(), 'system', 'Binary Grove', 'Binary Grove', 'SE', 'Room 1', '📚🌈📚😅', 'academic-chat-clubs-provided'),
    (gen_random_uuid()::VARCHAR, NOW(), NOW(), 'system', 'Aurora Quill', 'Aurora Quill', 'U.S.', 'Room 1', 'Same here tbh. 💡📚', 'academic-chat-clubs-provided'),
    (gen_random_uuid()::VARCHAR, NOW(), NOW(), 'system', 'Nova', 'Nova', 'NG', 'Room 1', 'Room 1 is wild. 🔥🍕', 'academic-chat-clubs-provided'),
    (gen_random_uuid()::VARCHAR, NOW(), NOW(), 'system', 'Delta Rune', 'Delta Rune', 'KR', 'Room 1', 'Same here tbh. 🍕', 'academic-chat-clubs-provided'),
    (gen_random_uuid()::VARCHAR, NOW(), NOW(), 'system', 'Vector Solace', 'Vector Solace', 'BR', 'Room 1', 'Trying to focus on the integral, but my brain keeps drifting to the idea that we''re all tiny dots on the map doing math at the same time. Feels like a sci‑fi study group. 🌈🧠', 'academic-chat-clubs-provided')
ON CONFLICT ("_id") DO NOTHING;
EOF

echo "✅ Data loaded!"

# Verify
echo ""
echo "Verifying..."
docker compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -c "SELECT COUNT(*) as members FROM members; SELECT COUNT(*) as clubs FROM chat_clubs; SELECT COUNT(*) as messages FROM chat_messages;"







