/**
 * Email Templates - All HingeCraft Templates
 * Separated from Code.gs for better organization
 * All templates from database: set_one_student, set_two_referral, set_three_b2b
 */

/**
 * Student Template 1: Welcome to the Movement
 * From database: set_one_student, step 1
 */
function getStudentTemplate1() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h1 style="color: #4CAF50;">You're Invited: Help Build the Future</h1>
    <p>Hi {{first_name}},</p>
    <p>Our school has been granted access to join the <strong>HingeCraft Movement</strong> — a global community of students exploring creativity, sustainable design, and future innovation together.</p>
    <p><strong>This isn't a class.<br>This isn't an assignment.<br>This is your invitation to be part of something growing right now.</strong></p>
    <h2>What is the Movement?</h2>
    <p>A student-driven community built around:</p>
    <ul>
      <li>Creative expression</li>
      <li>AI-assisted learning</li>
      <li>Recycled-material innovation</li>
      <li>Digital + physical design challenges</li>
      <li>Shared progress and inspiration</li>
    </ul>
    <p>You can follow the journey, contribute your ideas, or simply watch the evolution.<br>There's no pressure — only possibility.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="{{mission_support_url}}" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Begin here: Join the Movement</a>
    </p>
    <p>Let's build something that matters, together.</p>
    <p>Best regards,<br>The HingeCraft Team</p>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
    <p style="font-size: 12px; color: #666;">
      <a href="{{unsubscribe_url}}">Unsubscribe</a> | 
      <a href="{{preferences_url}}">Update Preferences</a>
    </p>
  </div>
</body>
</html>`;
}

/**
 * Student Template 2: Here's What You Just Joined
 * From database: set_one_student, step 2
 */
function getStudentTemplate2() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h2 style="color: #4CAF50;">Here's What You Just Joined</h2>
    <p>Hi {{first_name}},</p>
    <p>Now that you're part of the Movement, here's what to expect next:</p>
    <h3>1. The Journey Updates</h3>
    <p>You'll receive updates on:</p>
    <ul>
      <li>New student-designed creations</li>
      <li>AI-generated ideas becoming real prototypes</li>
      <li>Behind-the-scenes progress on Hingecraft's design platform</li>
      <li>How recycled materials are being transformed into premium furniture</li>
    </ul>
    <h3>2. Your School's Community Page</h3>
    <p>Every school has its own page for:</p>
    <ul>
      <li>Student sharing</li>
      <li>Project uploads</li>
      <li>Discussion threads</li>
      <li>Mini challenges</li>
    </ul>
    <h3>3. Monthly Inspiration Drops</h3>
    <p>Each drop includes:</p>
    <ul>
      <li>A theme</li>
      <li>A story</li>
      <li>A design prompt</li>
      <li>A real-world example of creative innovation</li>
    </ul>
    <p>You can join in anytime.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="{{student_page_url}}" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Explore Your Student Page</a>
    </p>
    <p>More updates coming soon — you're early.</p>
    <p>Best regards,<br>The HingeCraft Team</p>
  </div>
</body>
</html>`;
}

/**
 * Student Template 3: Follow the Journey
 * From database: set_one_student, step 3
 */
function getStudentTemplate3() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h2 style="color: #4CAF50;">Follow the Journey</h2>
    <p>Hi {{first_name}},</p>
    <p>Every movement has a story.<br>Here's how you can follow ours:</p>
    <h3>📌 The Hingecraft Build Log</h3>
    <p>Weekly updates showing:</p>
    <ul>
      <li>New prototypes</li>
      <li>Behind-the-scenes lab work</li>
      <li>Sustainability breakthroughs</li>
      <li>Student ideas shaping the roadmap</li>
    </ul>
    <h3>📌 The Community Feed</h3>
    <p>Where students post:</p>
    <ul>
      <li>Creative concepts</li>
      <li>Personal projects</li>
      <li>Experiments using AI design tools</li>
      <li>Recycled-material builds</li>
    </ul>
    <h3>📌 The Path to Your First Creation</h3>
    <p>We'll send small, simple steps you can use to begin designing — even if you've never used AI tools before.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="{{build_log_url}}" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Start Following the Build Log</a>
    </p>
    <p>The journey is evolving.<br>You're part of it now.</p>
    <p>Best regards,<br>The HingeCraft Team</p>
  </div>
</body>
</html>`;
}

/**
 * Student Template 4: Your First Action Step
 * From database: set_one_student, step 4
 */
function getStudentTemplate4() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h2 style="color: #4CAF50;">Your First Action Step</h2>
    <p>Hi {{first_name}},</p>
    <p>If you want to take part in the Creative Movement, here's the simplest first step:</p>
    <h3>Your First Action: The Signature Creative Prompt</h3>
    <p style="font-style: italic; font-size: 18px; color: #4CAF50; margin: 20px 0;">
      "What would you design if you could turn recycled materials into premium furniture using AI?"
    </p>
    <p>You can submit:</p>
    <ul>
      <li>A photo</li>
      <li>A rough sketch</li>
      <li>A written idea</li>
      <li>An AI-generated image</li>
      <li>A moodboard</li>
    </ul>
    <p><strong>Everything is welcome.</strong></p>
    <p>Your school's student page has a fast upload option:</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="{{submit_creation_url}}" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Submit Your First Creation</a>
    </p>
    <p>This isn't about perfection.<br>It's about momentum.</p>
    <p>Best regards,<br>The HingeCraft Team</p>
  </div>
</body>
</html>`;
}

/**
 * Student Template 5: Become a Recognized Member
 * From database: set_one_student, step 5
 */
function getStudentTemplate5() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h2 style="color: #4CAF50;">Become a Recognized Member</h2>
    <p>Hi {{first_name}},</p>
    <p>Students who join now are being recorded as <strong>early members</strong> of the Movement.</p>
    <p>To finalize your place, activate your <strong>$1 Student Membership Pass</strong>, which gives you:</p>
    <ul>
      <li>Early access to new tools</li>
      <li>The monthly creative challenge system</li>
      <li>A digital portfolio builder</li>
      <li>Your student badge</li>
      <li>A permanent member listing</li>
      <li>The ability to join collaborative builds</li>
    </ul>
    <p>You don't need it to follow the story.<br>But if you want to contribute, collaborate, or build — it helps unlock everything.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="{{mission_support_url}}?amount=1" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Activate Your Pass ($1 for the year)</a>
    </p>
    <p>We're just getting started.<br>Let's build forward, together.</p>
    <p>Best regards,<br>The HingeCraft Team</p>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
    <p style="font-size: 12px; color: #666;">
      <a href="{{unsubscribe_url}}">Unsubscribe</a> | 
      <a href="{{preferences_url}}">Update Preferences</a>
    </p>
  </div>
</body>
</html>`;
}

/**
 * Referral Template 1: A New $1 Student Pass Just Launched
 * From database: set_two_referral, step 1
 */
function getReferralTemplate1() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h2 style="color: #4CAF50;">A New $1 Student Pass Just Launched</h2>
    <p>Dear Students,</p>
    <p>Our school has partnered with <strong>HingeCraft Global</strong> to bring you early access to a new student-focused program designed to support creativity, skill-building, and future-ready learning.</p>
    <p>For a limited time, all students can join the <strong>HingeCraft Student Pass</strong> for just <strong>$1 for the entire year</strong>.</p>
    <h3>What the Student Pass Includes:</h3>
    <ul>
      <li>A private school-specific student page</li>
      <li>Access to AI learning modules and beginner-friendly tools</li>
      <li>Monthly creative challenges (design, building, sustainable innovation)</li>
      <li>A digital portfolio-builder to showcase your work</li>
      <li>A student-only community space to connect, collaborate, and share ideas</li>
      <li>Early access to upcoming HingeCraft workshops and events</li>
    </ul>
    <h3>Why We're Sharing This With You</h3>
    <p>HingeCraft is building a new kind of platform where students can:</p>
    <ul>
      <li>✔ Explore creativity</li>
      <li>✔ Learn AI fundamentals</li>
      <li>✔ Build digital and physical projects</li>
      <li>✔ Develop new skills</li>
      <li>✔ Connect with a global community of creators</li>
    </ul>
    <p>It's designed to be simple, accessible, and supportive — whether you're into design, technology, sustainability, future innovation, or just want to try something new.</p>
    <h3>Activate Your $1 Access</h3>
    <p>You can activate your Student Pass here:</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="{{school_unique_link}}" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">👉 Activate Your Student Pass</a>
    </p>
    <p>Feel free to share this link with classmates who may also want to join.</p>
    <p>If you have any questions about how the pass works or what you'll receive, our office is happy to help.</p>
    <p>Best regards,<br>{{sender_name}}<br>{{sender_title}}<br>{{school_name}}</p>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
    <p style="font-size: 12px; color: #666;">
      <a href="{{unsubscribe_url}}">Unsubscribe</a> | 
      <a href="{{preferences_url}}">Update Preferences</a>
    </p>
  </div>
</body>
</html>`;
}

/**
 * B2B Template 1: Introducing Hingecraft
 * From database: set_three_b2b, step 1
 */
function getB2BTemplate1() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h2 style="color: #4CAF50;">Introducing Hingecraft</h2>
    <p>Hello,</p>
    <p><strong>HingeCraft</strong> is an early-stage initiative focused on creativity, sustainability, and accessible AI education — built for students, communities, and partners who care about future skills without financial barriers.</p>
    <p>At its core, Hingecraft exists to make advanced creative tools available to young people in a way that feels human, collaborative, and grounded in real-world making. We blend AI-assisted design, recycled-material innovation, and community-driven challenges into a single ecosystem.</p>
    <p>This message is being shared broadly with organizations, institutions, and partners who support education, creativity, youth development, sustainability, or innovation. If this reaches the right person, feel free to forward internally.</p>
    <p><strong>No action is required</strong> — this is simply an introduction.</p>
    <p>—<br>HingeCraft</p>
  </div>
</body>
</html>`;
}

/**
 * B2B Template 2: The $1 Abundance Pass
 * From database: set_three_b2b, step 2
 */
function getB2BTemplate2() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h2 style="color: #4CAF50;">The $1 Abundance Pass</h2>
    <p>Hello,</p>
    <p>One of the most intentional design choices behind Hingecraft is the <strong>$1 Student Pass</strong>.</p>
    <p>We built this to remove financial friction entirely — not as a discount, but as a signal. Students shouldn't have to "qualify" for access to creativity, learning, or future-facing tools.</p>
    <p>The pass unlocks:</p>
    <ul>
      <li>Guided AI-assisted creative challenges</li>
      <li>Design prompts tied to sustainability and reuse</li>
      <li>Community collaboration and team participation</li>
      <li>Early exposure to future-skill workflows</li>
    </ul>
    <p>This model allows schools, nonprofits, community groups, and partners to participate without administrative overhead or funding complexity.</p>
    <p>If this message is landing with someone who manages programs, partnerships, or outreach, feel free to pass it along.</p>
    <p>—<br>HingeCraft</p>
  </div>
</body>
</html>`;
}

/**
 * B2B Template 3: How Hingecraft Approaches AI
 * From database: set_three_b2b, step 3
 */
function getB2BTemplate3() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h2 style="color: #4CAF50;">How Hingecraft Approaches AI</h2>
    <p>Hello,</p>
    <p><strong>HingeCraft treats AI as a creative assistant, not a replacement.</strong></p>
    <p>Students don't just "use AI" — they learn how to:</p>
    <ul>
      <li>Prompt thoughtfully</li>
      <li>Iterate designs</li>
      <li>Combine digital ideas with physical outcomes</li>
      <li>Understand limitations and ethics</li>
      <li>Collaborate with peers using shared tools</li>
    </ul>
    <p>Our challenges are intentionally designed to feel more like creative studios than classrooms. The goal isn't speed — it's confidence, literacy, and creative ownership.</p>
    <p>This approach has resonated with educators, youth programs, maker spaces, and community partners who want AI exposure without risk or abstraction.</p>
    <p>Sharing for context.</p>
    <p>—<br>HingeCraft</p>
  </div>
</body>
</html>`;
}

/**
 * B2B Template 4: Why Local Participation Matters
 * From database: set_three_b2b, step 4
 */
function getB2BTemplate4() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h2 style="color: #4CAF50;">Why Local Participation Matters</h2>
    <p>Hello,</p>
    <p><strong>HingeCraft is structured so that each school or community participates as its own node</strong> — not as a passive audience.</p>
    <p>Students see:</p>
    <ul>
      <li>Their school represented on leaderboards</li>
      <li>Team-based challenges that require collaboration</li>
      <li>Recognition for participation, not just performance</li>
      <li>Creative output that reflects local identity</li>
    </ul>
    <p>This structure encourages organic sharing, peer involvement, and community pride — without competitive pressure or exclusion.</p>
    <p>Organizations supporting local youth, sustainability, or creative development often find this model aligns naturally with their goals.</p>
    <p>This message can be shared freely.</p>
    <p>—<br>HingeCraft</p>
  </div>
</body>
</html>`;
}

/**
 * B2B Template 5: Supporting Access (Optional)
 * From database: set_three_b2b, step 5
 */
function getB2BTemplate5() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h2 style="color: #4CAF50;">Supporting Access (Optional)</h2>
    <p>Hello,</p>
    <p><strong>HingeCraft is still building.</strong></p>
    <p>We operate with minimal overhead and rely on a mix of partnerships, small donations, and community support to keep student access open and affordable.</p>
    <p>For those who choose to support:</p>
    <ul>
      <li>Donations help subsidize student access</li>
      <li>Contributions fund platform development and challenges</li>
      <li>Support keeps the $1 Student Pass viable</li>
    </ul>
    <p><strong>There is no obligation</strong> — awareness alone is meaningful.</p>
    <p>If this message reaches someone responsible for community initiatives, education funding, or partnership development, it may be useful to share.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="{{mission_support_url}}" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Support HingeCraft</a>
    </p>
    <p>Thank you for taking the time to read.</p>
    <p>—<br>HingeCraft</p>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
    <p style="font-size: 12px; color: #666;">
      <a href="{{unsubscribe_url}}">Unsubscribe</a> | 
      <a href="{{preferences_url}}">Update Preferences</a>
    </p>
  </div>
</body>
</html>`;
}
