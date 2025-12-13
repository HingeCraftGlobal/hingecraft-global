# FormConfigurations Database Collection - Implementation Guide

## Overview

The FormConfigurations collection stores GPT-generated form configurations, allowing dynamic form updates based on prompts.

## Collection Name

**`FormConfigurations`** - GPT-generated form configurations

## Schema

```javascript
{
  _id: string,                    // Unique config ID (e.g., "config_mission-support-form_123abc...")
  formId: string,                // Form identifier (e.g., "mission-support-form")
  configuration: object,          // Complete form configuration (JSON)
  prompt: string,                // Original prompt that generated this config
  version: string,               // Version number (e.g., "1.0", "1.1")
  isActive: boolean,             // Whether this is the active configuration
  created_at: Date,              // Creation timestamp
  updated_at: Date,              // Last update timestamp
  metadata: {
    generatedBy: string,          // "gpt-4-turbo-preview" or "manual"
    generatedAt: string,         // ISO timestamp
    updatedBy: string,           // "gpt" or "manual"
    updatedAt: string            // ISO timestamp
  }
}
```

## Configuration Structure

The `configuration` object contains:

```javascript
{
  fields: {
    firstName: {
      required: true,
      validation: "/^[a-zA-Z\\-\\s]{1,50}$/",
      label: "First Name",
      placeholder: "Enter your first name"
    },
    // ... other fields
  },
  paymentOptions: {
    microPayments: [1, 2, 5],
    allowCustomAmount: true,
    paymentMethods: ["card", "crypto"]
  },
  validation: {
    rules: { ... },
    errorMessages: { ... }
  },
  messages: {
    success: "...",
    error: "...",
    validation: { ... }
  },
  styling: {
    suggestions: "..."
  }
}
```

## Usage

### Configure Form from Prompt

```javascript
POST /_functions/gpt-form-config/configureFormFromPrompt
Body: {
  prompt: "Make the form more user-friendly with better validation and clearer error messages",
  formId: "mission-support-form"
}
```

### Get Current Configuration

```javascript
POST /_functions/gpt-form-config/getFormConfiguration
Body: {
  formId: "mission-support-form"
}
```

### Update Configuration

```javascript
POST /_functions/gpt-form-config/updateFormConfiguration
Body: {
  formId: "mission-support-form",
  config: { ... }
}
```

## Benefits

1. **Dynamic Configuration**
   - Update forms without code changes
   - GPT-generated optimizations
   - Version history

2. **A/B Testing**
   - Multiple configurations
   - Easy switching
   - Performance tracking

3. **Continuous Improvement**
   - Iterate based on feedback
   - GPT suggestions
   - Best practices

## Status

✅ **FormConfigurations Collection Ready**

- Schema defined
- GPT integration ready
- Version control ready

**Ready for deployment!**
