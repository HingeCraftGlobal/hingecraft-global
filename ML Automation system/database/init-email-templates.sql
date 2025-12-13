-- Initialize Email Templates in Database
-- Creates default sequences and steps with proper templates

-- ============================================
-- WELCOME SEQUENCE
-- ============================================

-- Create Welcome Sequence
INSERT INTO sequences (id, name, description, sequence_type, total_steps, is_active)
VALUES (
  gen_random_uuid(),
  'Welcome Sequence',
  'Initial welcome sequence for new leads',
  'welcome',
  5,
  true
)
ON CONFLICT DO NOTHING
RETURNING id;

-- Get Welcome Sequence ID
DO $$
DECLARE
  welcome_seq_id UUID;
BEGIN
  SELECT id INTO welcome_seq_id FROM sequences WHERE sequence_type = 'welcome' LIMIT 1;
  
  IF welcome_seq_id IS NULL THEN
    INSERT INTO sequences (name, description, sequence_type, total_steps, is_active)
    VALUES ('Welcome Sequence', 'Initial welcome sequence for new leads', 'welcome', 5, true)
    RETURNING id INTO welcome_seq_id;
  END IF;

  -- Step 1: Welcome Email (Immediate)
  INSERT INTO sequence_steps (sequence_id, step_number, delay_hours, subject_template, body_template, conditions)
  VALUES (
    welcome_seq_id,
    1,
    0, -- Immediate
    'Welcome to HingeCraft, {{first_name}}!',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h1 style="color: #4CAF50;">Welcome to HingeCraft, {{first_name}}!</h1>
    <p>Hi {{first_name}},</p>
    <p>We''re thrilled to have you join the HingeCraft community. We''re building something special, and we''d love for you to be part of it.</p>
    <p>Our mission is to create positive change through innovative solutions and collaborative efforts.</p>
    <p>Over the next few days, we''ll share more about what we''re working on and how you can get involved.</p>
    <p>Best regards,<br>The HingeCraft Team</p>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
    <p style="font-size: 12px; color: #666;">
      You''re receiving this because you expressed interest in HingeCraft.<br>
      <a href="{{unsubscribe_url}}">Unsubscribe</a> | 
      <a href="{{preferences_url}}">Update Preferences</a>
    </p>
  </div>
</body>
</html>',
    '{}'::jsonb
  )
  ON CONFLICT DO NOTHING;

  -- Step 2: Mission Overview (24 hours)
  INSERT INTO sequence_steps (sequence_id, step_number, delay_hours, subject_template, body_template, conditions)
  VALUES (
    welcome_seq_id,
    2,
    24,
    'Join the Movement, {{first_name}}',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h2 style="color: #4CAF50;">Ready to Make an Impact?</h2>
    <p>Hi {{first_name}},</p>
    <p>Thousands of people are already part of the HingeCraft movement. Together, we''re creating solutions that matter.</p>
    <p><strong>Here''s what we''re working on:</strong></p>
    <ul>
      <li>Innovative automation solutions</li>
      <li>Community-driven initiatives</li>
      <li>Sustainable growth strategies</li>
    </ul>
    <p style="text-align: center; margin: 30px 0;">
      <a href="{{cta_url}}" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Learn More</a>
    </p>
    <p>Best regards,<br>The HingeCraft Team</p>
  </div>
</body>
</html>',
    '{"requires_open": false}'::jsonb
  )
  ON CONFLICT DO NOTHING;

  -- Step 3: Value Proposition (48 hours)
  INSERT INTO sequence_steps (sequence_id, step_number, delay_hours, subject_template, body_template, conditions)
  VALUES (
    welcome_seq_id,
    3,
    48,
    'How HingeCraft Can Help {{organization}}',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h2 style="color: #4CAF50;">Solutions for {{organization}}</h2>
    <p>Hi {{first_name}},</p>
    <p>We noticed you''re with {{organization}}. Our solutions are designed to help organizations like yours achieve their goals more efficiently.</p>
    <p><strong>Key Benefits:</strong></p>
    <ul>
      <li>Streamlined automation</li>
      <li>Data-driven insights</li>
      <li>Scalable solutions</li>
    </ul>
    <p>Would you like to learn more about how we can help {{organization}}?</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="{{cta_url}}" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Schedule a Call</a>
    </p>
    <p>Best regards,<br>The HingeCraft Team</p>
  </div>
</body>
</html>',
    '{"requires_open": false}'::jsonb
  )
  ON CONFLICT DO NOTHING;

  -- Step 4: Social Proof (72 hours)
  INSERT INTO sequence_steps (sequence_id, step_number, delay_hours, subject_template, body_template, conditions)
  VALUES (
    welcome_seq_id,
    4,
    72,
    'Join {{first_name}}, See What Others Are Saying',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h2 style="color: #4CAF50;">You''re in Good Company</h2>
    <p>Hi {{first_name}},</p>
    <p>We''re proud to work with organizations that share our vision. Here''s what our community is saying:</p>
    <blockquote style="border-left: 4px solid #4CAF50; padding-left: 20px; margin: 20px 0; font-style: italic;">
      "HingeCraft has transformed how we approach automation. The results speak for themselves."
    </blockquote>
    <p>Ready to see similar results for {{organization}}?</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="{{cta_url}}" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Get Started</a>
    </p>
    <p>Best regards,<br>The HingeCraft Team</p>
  </div>
</body>
</html>',
    '{"requires_open": false}'::jsonb
  )
  ON CONFLICT DO NOTHING;

  -- Step 5: Final Call-to-Action (96 hours)
  INSERT INTO sequence_steps (sequence_id, step_number, delay_hours, subject_template, body_template, conditions)
  VALUES (
    welcome_seq_id,
    5,
    96,
    'Last Chance, {{first_name}} - Don''t Miss Out',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h2 style="color: #4CAF50;">One Final Opportunity</h2>
    <p>Hi {{first_name}},</p>
    <p>This is our last email in this sequence, but we hope it''s not the last time we connect.</p>
    <p>If you''re interested in learning more about how HingeCraft can help {{organization}}, we''d love to hear from you.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="{{cta_url}}" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Connect With Us</a>
    </p>
    <p>Thank you for being part of our community, {{first_name}}.</p>
    <p>Best regards,<br>The HingeCraft Team</p>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
    <p style="font-size: 12px; color: #666;">
      <a href="{{unsubscribe_url}}">Unsubscribe</a> | 
      <a href="{{preferences_url}}">Update Preferences</a>
    </p>
  </div>
</body>
</html>',
    '{"requires_open": false}'::jsonb
  )
  ON CONFLICT DO NOTHING;

END $$;

-- ============================================
-- NURTURE SEQUENCE (Optional)
-- ============================================

-- Create Nurture Sequence (for leads who don't convert initially)
INSERT INTO sequences (name, description, sequence_type, total_steps, is_active)
SELECT 
  'Nurture Sequence',
  'Ongoing nurture sequence for engaged leads',
  'nurture',
  3,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM sequences WHERE sequence_type = 'nurture'
);

-- Add nurture steps (similar structure, different messaging)

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify sequences created
SELECT 
  s.name,
  s.sequence_type,
  COUNT(ss.id) as step_count
FROM sequences s
LEFT JOIN sequence_steps ss ON s.id = ss.sequence_id
WHERE s.is_active = true
GROUP BY s.id, s.name, s.sequence_type
ORDER BY s.sequence_type;
