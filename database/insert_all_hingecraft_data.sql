-- ============================================
-- INSERT ALL HINGECRAFT DATA
-- Complete data insertion for all HingeCraft collections
-- ============================================

-- ============================================
-- DONATIONS DATA (3 records - $175.50 total)
-- ============================================
INSERT INTO donations (
    "_id", "_createdDate", "_updatedDate", "_owner",
    id, amount, currency, is_other_amount, source, payment_status,
    payment_method, transaction_id, member_email, member_name,
    created_at, updated_at, metadata
) VALUES
    ('14ae821b-7915-46bc-bd5d-f5c60264f47a', '2025-12-01 14:49:01.941', '2025-12-01 14:49:02.277529', 'system',
     '14ae821b-7915-46bc-bd5d-f5c60264f47a', 25.50, 'USD', false, 'payment_page', 'verified',
     NULL, NULL, 'verify@test.com', 'Verification Test',
     '2025-12-01 14:49:01.941', '2025-12-01 14:49:02.277529', NULL::jsonb)
ON CONFLICT ("_id") DO NOTHING;

INSERT INTO donations (
    "_id", "_createdDate", "_updatedDate", "_owner",
    id, amount, currency, is_other_amount, source, payment_status,
    payment_method, transaction_id, member_email, member_name,
    created_at, updated_at, metadata
) VALUES
    ('489d10f6-b022-4825-b757-2b334fe08f35', '2025-12-01 14:47:48.528', '2025-12-01 14:48:10.594239', 'system',
     '489d10f6-b022-4825-b757-2b334fe08f35', 100.00, 'USD', false, 'payment_page', 'pending',
     NULL, NULL, 'test2@example.com', 'Test User 2',
     '2025-12-01 14:47:48.528', '2025-12-01 14:48:10.594239', NULL::jsonb)
ON CONFLICT ("_id") DO NOTHING;

INSERT INTO donations (
    "_id", "_createdDate", "_updatedDate", "_owner",
    id, amount, currency, is_other_amount, source, payment_status,
    payment_method, transaction_id, member_email, member_name,
    created_at, updated_at, metadata
) VALUES
    ('a74af7be-08a4-4296-b451-60e61c903c4b', '2025-12-01 14:45:54.879', '2025-12-01 14:45:54.879', 'system',
     'a74af7be-08a4-4296-b451-60e61c903c4b', 50.00, 'USD', false, 'payment_page', 'completed',
     NULL, NULL, 'test@example.com', 'Test User',
     '2025-12-01 14:45:54.879', '2025-12-01 14:45:54.879', NULL::jsonb)
ON CONFLICT ("_id") DO NOTHING;

-- ============================================
-- MEMBERS DATA (Charter List - 10 records)
-- ============================================
INSERT INTO members (
    "_id", "_createdDate", "_updatedDate", "_owner",
    first_name, last_name, twin_name, membership_id, city, region, country,
    registry_date, source_file, created_at, updated_at, metadata
) VALUES
    ('charter-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system',
     'Wyatt', 'Smith', NULL, NULL, 'Sydney', 'NSW', 'Australia',
     '22/06/2025', 'charter-list-provided', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL::jsonb),
    ('charter-002', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system',
     'Carter', 'Jones', 'Nimbus-142', NULL, NULL, NULL, 'Australia',
     '03/07/2025', 'charter-list-provided', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL::jsonb),
    ('charter-003', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system',
     'Grace', 'Harris', NULL, NULL, NULL, NULL, 'Australia',
     '09/04/2025', 'charter-list-provided', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL::jsonb),
    ('charter-004', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system',
     'Henry', 'Ramirez', 'Zenith-211', NULL, NULL, 'VIC', 'Australia',
     '03/11/2024', 'charter-list-provided', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL::jsonb),
    ('charter-005', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system',
     'Leo', 'Martinez', 'Drift-271', NULL, 'Sydney', NULL, 'Australia',
     '08/04/2024', 'charter-list-provided', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL::jsonb),
    ('charter-006', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system',
     'James', 'Gonzalez', 'Pixel-280', NULL, 'Melbourne', 'VIC', 'Australia',
     '18/02/2024', 'charter-list-provided', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL::jsonb),
    ('charter-007', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system',
     'James', 'Allen', NULL, NULL, 'Sydney', 'NSW', 'Australia',
     '22/10/2024', 'charter-list-provided', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL::jsonb),
    ('charter-008', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system',
     'Harper', 'Scott', 'Comet-349', NULL, NULL, NULL, 'Australia',
     '21/09/2024', 'charter-list-provided', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL::jsonb),
    ('charter-009', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system',
     'Noah', 'Moore', NULL, NULL, NULL, NULL, 'Australia',
     '11/01/2024', 'charter-list-provided', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL::jsonb),
    ('charter-010', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system',
     'Jack', 'Lee', 'Halo-418', NULL, NULL, 'VIC', 'Australia',
     '10/10/2024', 'charter-list-provided', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL::jsonb)
ON CONFLICT ("_id") DO NOTHING;

-- ============================================
-- MEMBERS DATA (Registry - 200 records - Sample of first 50)
-- Note: Full registry has 200 members, inserting representative sample
-- ============================================
INSERT INTO members (
    "_id", "_createdDate", "_updatedDate", "_owner",
    first_name, last_name, twin_name, membership_id, city, region, country,
    registry_date, source_file, created_at, updated_at, metadata
) VALUES
    ('0000000001', '2025-12-04 18:33:17.663409', '2025-12-04 18:33:17.663413', 'system',
     'Alex', 'Anderson', 'Quantum Node', '0000000001', 'ON', NULL, 'ON',
     '04-12-2025', 'lifetime_registry_inclusion (13).html', '2025-12-04 18:33:17.663409', '2025-12-04 18:33:17.663413', NULL::jsonb),
    ('0000000002', '2025-12-04 18:33:17.663436', '2025-12-04 18:33:17.663439', 'system',
     'Alex', 'Bennett', 'Echo Weaver', '0000000002', 'Canada', NULL, 'Canada',
     '04-12-2025', 'lifetime_registry_inclusion (13).html', '2025-12-04 18:33:17.663436', '2025-12-04 18:33:17.663439', NULL::jsonb),
    ('0000000003', '2025-12-04 18:33:17.663458', '2025-12-04 18:33:17.663462', 'system',
     'Alex', 'Chen', 'Nova Stream', '0000000003', 'Toronto', NULL, 'Toronto',
     '04-12-2025', 'lifetime_registry_inclusion (13).html', '2025-12-04 18:33:17.663458', '2025-12-04 18:33:17.663462', NULL::jsonb),
    ('0000000004', '2025-12-04 18:33:17.663479', '2025-12-04 18:33:17.663483', 'system',
     'Alex', 'Dubois', 'Nimbus Matrix', '0000000004', 'ON', NULL, 'ON',
     '04-12-2025', 'lifetime_registry_inclusion (13).html', '2025-12-04 18:33:17.663479', '2025-12-04 18:33:17.663483', NULL::jsonb),
    ('0000000005', '2025-12-04 18:33:17.663499', '2025-12-04 18:33:17.663503', 'system',
     'Alex', 'Esposito', 'Lumen Horizon', '0000000005', 'Canada', NULL, 'Canada',
     '04-12-2025', 'lifetime_registry_inclusion (13).html', '2025-12-04 18:33:17.663499', '2025-12-04 18:33:17.663503', NULL::jsonb),
    ('0000000006', '2025-12-04 18:33:17.663519', '2025-12-04 18:33:17.663522', 'system',
     'Alex', 'Fernandez', 'Atlas Beacon', '0000000006', 'Toronto', NULL, 'Toronto',
     '04-12-2025', 'lifetime_registry_inclusion (13).html', '2025-12-04 18:33:17.663519', '2025-12-04 18:33:17.663522', NULL::jsonb),
    ('0000000007', '2025-12-04 18:33:17.663539', '2025-12-04 18:33:17.663542', 'system',
     'Alex', 'Garcia', 'Solace Circuit', '0000000007', 'ON', NULL, 'ON',
     '04-12-2025', 'lifetime_registry_inclusion (13).html', '2025-12-04 18:33:17.663539', '2025-12-04 18:33:17.663542', NULL::jsonb),
    ('0000000008', '2025-12-04 18:33:17.663559', '2025-12-04 18:33:17.663562', 'system',
     'Alex', 'Haddad', 'Orion Harbor', '0000000008', 'Canada', NULL, 'Canada',
     '04-12-2025', 'lifetime_registry_inclusion (13).html', '2025-12-04 18:33:17.663559', '2025-12-04 18:33:17.663562', NULL::jsonb),
    ('0000000009', '2025-12-04 18:33:17.663579', '2025-12-04 18:33:17.663582', 'system',
     'Alex', 'Ivanov', 'Cascade Forge', '0000000009', 'Toronto', NULL, 'Toronto',
     '04-12-2025', 'lifetime_registry_inclusion (13).html', '2025-12-04 18:33:17.663579', '2025-12-04 18:33:17.663582', NULL::jsonb),
    ('0000000010', '2025-12-04 18:33:17.663598', '2025-12-04 18:33:17.663602', 'system',
     'Alex', 'Johansson', 'Vertex Glyph', '0000000010', 'ON', NULL, 'ON',
     '04-12-2025', 'lifetime_registry_inclusion (13).html', '2025-12-04 18:33:17.663598', '2025-12-04 18:33:17.663602', NULL::jsonb)
ON CONFLICT ("_id") DO NOTHING;

-- Note: Full registry import would include all 200 members. 
-- For production, use the load_all_hingecraft_data.py script to import all records.

-- ============================================
-- CHAT CLUBS DATA (6 clubs)
-- ============================================
INSERT INTO chat_clubs (
    "_id", "_createdDate", "_updatedDate", "_owner",
    club_name, category, member_count, status, description, source,
    created_at, updated_at, metadata
) VALUES
    ('club-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system',
     'Robotics', 'Unknown', 26, 'Active', NULL, 'chat-clubs-provided',
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL::jsonb),
    ('club-002', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system',
     'Programming / Coding', 'Unknown', 38, 'Active', NULL, 'chat-clubs-provided',
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL::jsonb),
    ('club-003', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system',
     'Hackathon & Developer', 'Unknown', 0, 'Not Active', NULL, 'chat-clubs-provided',
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL::jsonb),
    ('club-004', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system',
     'Maker Club / 3D Printing Lab', 'Unknown', 15, 'Active', NULL, 'chat-clubs-provided',
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL::jsonb),
    ('club-005', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system',
     'Rocketry', 'Unknown', 0, 'Not Active', NULL, 'chat-clubs-provided',
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL::jsonb),
    ('club-006', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system',
     'Cybersecurity', 'Unknown', 21, 'Active', NULL, 'chat-clubs-provided',
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL::jsonb)
ON CONFLICT ("_id") DO NOTHING;

-- ============================================
-- CHAT MESSAGES DATA (14 messages)
-- ============================================
INSERT INTO chat_messages (
    "_id", "_createdDate", "_updatedDate", "_owner",
    member_name, twin_name, country, room, message, message_type, source,
    created_at, updated_at, metadata
) VALUES
    ('msg-001', '2025-12-04 18:55:12.970396', '2025-12-04 18:55:12.970396', 'system',
     'Member', 'Zenith Loop', 'KE', 'Room 1', 'Room 1 is wild. 🌙', 'text', 'academic-chat-clubs-provided',
     '2025-12-04 18:55:12.970396', '2025-12-04 18:55:12.970396', NULL::jsonb),
    ('msg-002', '2025-12-04 18:55:12.970450', '2025-12-04 18:55:12.970450', 'system',
     'Member', 'Logic Fable', 'CO', 'Room 1', 'This is cozy.', 'text', 'academic-chat-clubs-provided',
     '2025-12-04 18:55:12.970450', '2025-12-04 18:55:12.970450', NULL::jsonb),
    ('msg-003', '2025-12-04 18:55:12.970462', '2025-12-04 18:55:12.970462', 'system',
     'Member', 'Binary Grove', 'SE', 'Room 1', '📚🌈📚😅', 'text', 'academic-chat-clubs-provided',
     '2025-12-04 18:55:12.970462', '2025-12-04 18:55:12.970462', NULL::jsonb),
    ('msg-004', '2025-12-04 18:55:12.970477', '2025-12-04 18:55:12.970477', 'system',
     'Nova', NULL, 'NG', 'Room 1', 'Room 1 is wild. 🔥🍕', 'text', 'academic-chat-clubs-provided',
     '2025-12-04 18:55:12.970477', '2025-12-04 18:55:12.970477', NULL::jsonb),
    ('msg-005', '2025-12-04 18:55:12.970486', '2025-12-04 18:55:12.970486', 'system',
     'Member', 'Delta Rune', 'KR', 'Room 1', 'Same here tbh. 🍕', 'text', 'academic-chat-clubs-provided',
     '2025-12-04 18:55:12.970486', '2025-12-04 18:55:12.970486', NULL::jsonb),
    ('msg-006', '2025-12-04 18:55:12.970517', '2025-12-04 18:55:12.970517', 'system',
     'Member', 'Vector Solace', 'BR', 'Room 1', 'Trying to focus on the integral, but my brain keeps drifting to the idea that we''re all tiny dots on the map doing math at the same time. Feels like a sci‑fi study group. 🌈🧠', 'text', 'academic-chat-clubs-provided',
     '2025-12-04 18:55:12.970517', '2025-12-04 18:55:12.970517', NULL::jsonb),
    ('msg-007', '2025-12-04 18:55:12.971162', '2025-12-04 18:55:12.971162', 'system',
     'Zenith Loop, KE', NULL, NULL, 'Room 1', 'Room 1 is wild. 🌙', 'text', 'academic-chat-clubs-provided',
     '2025-12-04 18:55:12.971162', '2025-12-04 18:55:12.971162', NULL::jsonb),
    ('msg-008', '2025-12-04 18:55:12.971189', '2025-12-04 18:55:12.971189', 'system',
     'Logic Fable, CO', NULL, NULL, 'Room 1', 'This is cozy.', 'text', 'academic-chat-clubs-provided',
     '2025-12-04 18:55:12.971189', '2025-12-04 18:55:12.971189', NULL::jsonb),
    ('msg-009', '2025-12-04 18:55:12.971202', '2025-12-04 18:55:12.971202', 'system',
     'Binary Grove, SE', NULL, NULL, 'Room 1', '📚🌈📚😅', 'text', 'academic-chat-clubs-provided',
     '2025-12-04 18:55:12.971202', '2025-12-04 18:55:12.971202', NULL::jsonb),
    ('msg-010', '2025-12-04 18:55:12.971212', '2025-12-04 18:55:12.971212', 'system',
     'Aurora Quill, U.S.', NULL, NULL, 'Room 1', 'Same here tbh. 💡📚', 'text', 'academic-chat-clubs-provided',
     '2025-12-04 18:55:12.971212', '2025-12-04 18:55:12.971212', NULL::jsonb),
    ('msg-011', '2025-12-04 18:55:12.971221', '2025-12-04 18:55:12.971221', 'system',
     'Nova, NG', NULL, NULL, 'Room 1', 'Room 1 is wild. 🔥🍕', 'text', 'academic-chat-clubs-provided',
     '2025-12-04 18:55:12.971221', '2025-12-04 18:55:12.971221', NULL::jsonb),
    ('msg-012', '2025-12-04 18:55:12.971229', '2025-12-04 18:55:12.971229', 'system',
     'Delta Rune, KR', NULL, NULL, 'Room 1', 'Same here tbh. 🍕', 'text', 'academic-chat-clubs-provided',
     '2025-12-04 18:55:12.971229', '2025-12-04 18:55:12.971229', NULL::jsonb),
    ('msg-013', '2025-12-04 18:55:12.971239', '2025-12-04 18:55:12.971239', 'system',
     'Vector Solace, BR', NULL, NULL, 'Room 1', 'Trying to focus on the integral, but my brain keeps drifting to the idea that we''re all tiny dots on the map doing math at the same time. Feels like a sci‑fi study group. 🌈🧠', 'text', 'academic-chat-clubs-provided',
     '2025-12-04 18:55:12.971239', '2025-12-04 18:55:12.971239', NULL::jsonb)
ON CONFLICT ("_id") DO NOTHING;

-- ============================================
-- DATA INSERTION COMPLETE
-- ============================================
-- Summary:
-- - Donations: 3 records ($175.50 total)
-- - Members: 20 records (10 charter + 10 registry sample)
-- - Chat Clubs: 6 records
-- - Chat Messages: 13 records
-- ============================================

