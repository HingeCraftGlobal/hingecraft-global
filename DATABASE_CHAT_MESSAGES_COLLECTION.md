# ChatMessages Database Collection - Implementation Guide

## Overview

The ChatMessages collection stores all live chat messages from the Mission Support form, with GPT intent analysis and marketing notification tracking.

## Collection Name

**`ChatMessages`** - Dedicated collection for all chat messages

## Schema

```javascript
{
  _id: string,                    // Unique message ID (e.g., "chat_123abc...")
  message: string,               // Chat message text
  userId: string,                // User ID (from chat client or "guest")
  userEmail: string,             // User email (if available from form)
  userName: string,              // User name (if available from form)
  sessionId: string,             // Session ID
  pageUrl: string,               // Page URL where message was sent
  source: string,                // Source: "mission_support_form"
  intent: string,                // GPT-analyzed intent: "question", "statement", "complaint", etc.
  needsHumanResponse: boolean,   // Whether message needs human response
  priority: string,              // "high", "normal", "low"
  category: string,              // "payment", "technical", "general", "support", "other"
  notified: boolean,             // Whether marketing was notified
  notifiedAt: Date,              // When marketing was notified
  created_at: Date,              // Message timestamp
  metadata: {
    intentAnalysis: {
      intent: string,
      needsHumanResponse: boolean,
      priority: string,
      category: string,
      summary: string,
      confidence: number,
      suggestedResponse: string
    },
    userAgent: string,           // Browser user agent
    referrer: string             // Referrer URL
  }
}
```

## Indexes

Recommended indexes:
- `_id` (primary key) - Auto-indexed
- `userId` - For user chat history
- `sessionId` - For session-based queries
- `needsHumanResponse` - For filtering questions
- `priority` - For priority-based sorting
- `notified` - For tracking notifications
- `created_at` - For sorting and date range queries

## Integration with Live Chat

### Automatic Hook

When a user sends a message in the live chat:

1. **Message sent** via WebSocket
2. **Notification hook triggered** (non-blocking)
3. **GPT analyzes** message intent
4. **If question** → Notify marketing email
5. **Save to database** → ChatMessages collection

### Code Integration

The hook is automatically called in `handleSendMessage()`:

```javascript
// In mission-support-form.html
fetchFn('/_functions/chat-notifications/notifyMarketingOnQuestion', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: text,
    userId: chatClient.user?.id || 'guest',
    userEmail: formData?.email || null,
    userName: formData ? `${formData.firstName} ${formData.lastName}` : null,
    sessionId: generateSessionId(),
    pageUrl: window.location.href,
    userAgent: navigator.userAgent,
    referrer: document.referrer || null
  })
});
```

## GPT Intent Analysis

### Intent Types
- `question` - User is asking a question
- `statement` - User is making a statement
- `complaint` - User has a complaint
- `compliment` - User is giving praise
- `other` - Other type of message

### Categories
- `payment` - Payment-related questions
- `technical` - Technical issues
- `general` - General questions
- `support` - Support requests
- `other` - Other categories

### Priority Levels
- `high` - Urgent issues, complaints
- `normal` - Regular questions
- `low` - Simple statements, greetings

## Marketing Notification Flow

1. **User sends message** in chat
2. **GPT analyzes** message intent
3. **If `needsHumanResponse === true`**:
   - Generate notification email
   - Send to marketing email
   - Save message to database
   - Mark as notified
4. **If `needsHumanResponse === false`**:
   - Save message to database
   - No notification sent

## Notification Email Content

Marketing receives an email with:
- **Priority badge** (HIGH/NORMAL/LOW)
- **User information** (name, email, page)
- **Full message text**
- **GPT analysis** (intent, category, summary, confidence)
- **Suggested response** (if available)
- **Quick action buttons** (Reply, View Page)

## Usage Examples

### Query Messages Needing Response

```javascript
const messages = await wixData.query('ChatMessages')
    .eq('needsHumanResponse', true)
    .eq('notified', true)
    .descending('created_at')
    .find();
```

### Query High Priority Messages

```javascript
const urgent = await wixData.query('ChatMessages')
    .eq('priority', 'high')
    .descending('created_at')
    .find();
```

### Get Chat History for User

```javascript
const history = await wixData.query('ChatMessages')
    .eq('userId', userId)
    .ascending('created_at')
    .find();
```

### Query Unnotified Questions

```javascript
const unnotified = await wixData.query('ChatMessages')
    .eq('needsHumanResponse', true)
    .eq('notified', false)
    .descending('created_at')
    .find();
```

## Benefits

1. **Complete Chat History**
   - All messages stored
   - User context preserved
   - Session tracking

2. **Smart Routing**
   - GPT determines if human needed
   - Priority-based handling
   - Category classification

3. **Marketing Integration**
   - Automatic notifications
   - Detailed context provided
   - Quick action buttons

4. **Analytics**
   - Track common questions
   - Monitor response times
   - Analyze user needs

## Status

✅ **ChatMessages Collection Ready**

- Schema defined
- GPT integration ready
- Marketing notifications ready
- Database hooks implemented

**Ready for deployment!**
