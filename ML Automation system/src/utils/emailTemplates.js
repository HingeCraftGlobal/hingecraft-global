/**
 * Email Template Library
 * Pre-built email templates for sequences
 */

const templates = {
  welcome: {
    subject: 'Welcome to HingeCraft, {{first_name}}!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to HingeCraft!</h1>
          </div>
          <div class="content">
            <p>Hi {{first_name}},</p>
            <p>We're thrilled to have you join the HingeCraft movement. You're now part of a community dedicated to creating abundance and resilience for youth worldwide.</p>
            <p>Our mission is simple: <strong>No one receives information — they receive identity.</strong></p>
            <p>Every message, every interaction, every opportunity reinforces your identity as someone who belongs, who matters, and who can make a difference.</p>
            <a href="https://www.hingecraft-global.ai" class="button">Explore Our Mission</a>
            <p>Welcome aboard,<br>The HingeCraft Team</p>
          </div>
          <div class="footer">
            <p>HingeCraft Global | Building Abundance for Youth Worldwide</p>
            <p><a href="{{unsubscribe_url}}">Unsubscribe</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hi {{first_name}},\n\nWelcome to HingeCraft! We're thrilled to have you join our movement.\n\nVisit us at https://www.hingecraft-global.ai\n\nBest,\nThe HingeCraft Team`
  },

  mission_intro: {
    subject: 'Join the Movement, {{first_name}}',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <p>Hi {{first_name}},</p>
            <p>Ready to make an impact? You're not just joining a platform — you're joining a movement.</p>
            <p>HingeCraft empowers youth through:</p>
            <ul>
              <li>🎓 Educational resources and tools</li>
              <li>🤝 Community connections</li>
              <li>💡 Innovation opportunities</li>
              <li>🌍 Global impact initiatives</li>
            </ul>
            <p>For just $1/year, you can become a member and unlock access to our Student Abundance Pass.</p>
            <a href="https://www.hingecraft-global.ai/payment" class="button">Join Now - $1/Year</a>
            <p>Together, we're building a future where every young person has the tools they need to thrive.</p>
            <p>Best,<br>The HingeCraft Team</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hi {{first_name}},\n\nJoin the HingeCraft movement! For just $1/year, become a member and unlock access to our Student Abundance Pass.\n\nVisit: https://www.hingecraft-global.ai/payment\n\nBest,\nThe HingeCraft Team`
  },

  value_proposition: {
    subject: 'What Makes HingeCraft Different, {{first_name}}?',
    html: `
      <!DOCTYPE html>
      <html>
      <body>
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <p>Hi {{first_name}},</p>
          <p>You might be wondering: <strong>What makes HingeCraft different?</strong></p>
          <p>It's simple: We don't just provide information. We provide <strong>identity</strong>.</p>
          <p>Every interaction with HingeCraft reinforces:</p>
          <ul>
            <li>Your belonging in a global community</li>
            <li>Your ability to create change</li>
            <li>Your value as an individual</li>
            <li>Your potential for growth</li>
          </ul>
          <p>This isn't just another platform. It's a movement that recognizes and amplifies who you are.</p>
          <p>Ready to experience it? <a href="https://www.hingecraft-global.ai">Explore HingeCraft</a></p>
          <p>Best,<br>The HingeCraft Team</p>
        </div>
      </body>
      </html>
    `,
    text: `Hi {{first_name}},\n\nWhat makes HingeCraft different? We don't just provide information — we provide identity.\n\nLearn more: https://www.hingecraft-global.ai\n\nBest,\nThe HingeCraft Team`
  },

  call_to_action: {
    subject: 'Your $1 Can Change Everything, {{first_name}}',
    html: `
      <!DOCTYPE html>
      <html>
      <body>
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <p>Hi {{first_name}},</p>
          <p>For just <strong>$1 per year</strong>, you can become a HingeCraft member and join thousands of youth creating positive change.</p>
          <p><strong>What you get:</strong></p>
          <ul>
            <li>✅ Student Abundance Pass</li>
            <li>✅ Access to exclusive resources</li>
            <li>✅ Community membership</li>
            <li>✅ Impact opportunities</li>
          </ul>
          <p style="text-align: center;">
            <a href="https://www.hingecraft-global.ai/payment" style="display: inline-block; padding: 15px 30px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
              Join Now - $1/Year
            </a>
          </p>
          <p>Your membership directly supports our mission to empower youth worldwide.</p>
          <p>Best,<br>The HingeCraft Team</p>
        </div>
      </body>
      </html>
    `,
    text: `Hi {{first_name}},\n\nJoin HingeCraft for just $1/year and unlock the Student Abundance Pass.\n\nJoin now: https://www.hingecraft-global.ai/payment\n\nBest,\nThe HingeCraft Team`
  },

  re_engagement: {
    subject: 'We Miss You, {{first_name}}',
    html: `
      <!DOCTYPE html>
      <html>
      <body>
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <p>Hi {{first_name}},</p>
          <p>It's been a while since we connected, and we wanted to reach out.</p>
          <p>The HingeCraft community is growing, and we'd love to have you back. Whether you're interested in:</p>
          <ul>
            <li>🎓 Educational resources</li>
            <li>🤝 Community connections</li>
            <li>💡 Innovation opportunities</li>
            <li>🌍 Making a global impact</li>
          </ul>
          <p>We're here for you.</p>
          <p><a href="https://www.hingecraft-global.ai">Reconnect with HingeCraft</a></p>
          <p>If you'd prefer not to receive these emails, <a href="{{unsubscribe_url}}">you can unsubscribe here</a>.</p>
          <p>Best,<br>The HingeCraft Team</p>
        </div>
      </body>
      </html>
    `,
    text: `Hi {{first_name}},\n\nWe miss you! Reconnect with HingeCraft: https://www.hingecraft-global.ai\n\nBest,\nThe HingeCraft Team`
  }
};

/**
 * Personalize template with lead data
 */
function personalizeTemplate(template, lead, options = {}) {
  let html = template.html || '';
  let text = template.text || '';
  let subject = template.subject || '';

  const variables = {
    first_name: lead.first_name || '',
    last_name: lead.last_name || '',
    name: `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'there',
    organization: lead.organization || '',
    email: lead.email || '',
    city: lead.city || '',
    country: lead.country || '',
    unsubscribe_url: options.unsubscribeUrl || 'https://www.hingecraft-global.ai/unsubscribe'
  };

  // Replace variables
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    html = html.replace(regex, variables[key]);
    text = text.replace(regex, variables[key]);
    subject = subject.replace(regex, variables[key]);
  });

  return { html, text, subject };
}

/**
 * Get template by name
 */
function getTemplate(name) {
  return templates[name] || templates.welcome;
}

module.exports = {
  templates,
  personalizeTemplate,
  getTemplate
};
