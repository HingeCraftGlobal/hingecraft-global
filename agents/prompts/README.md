# Prompt Subroutines Library
## 100+ Modular Reusable Prompts

**Version:** 1.0  
**Last Updated:** December 4, 2025

---

## Overview

This library contains 100+ modular, reusable prompts organized by category. Each prompt is designed to be adaptable for design, content, compliance, development, governance, and onboarding tasks.

---

## Prompt Structure

Each prompt follows this structure:

```yaml
name: prompt_name
category: category_name
version: 1.0
description: Brief description
variables:
  - name: variable_name
    type: string|number|boolean|array|object
    description: Variable description
    required: true|false
    default: default_value
template: |
  Prompt template with {{variable_name}} placeholders
examples:
  - input: {variable_name: "value"}
    output: "Expected output"
tags:
  - tag1
  - tag2
```

---

## Categories

### 1. Design (20 prompts)
- Product design briefs
- Architecture design
- UI/UX design
- Design system generation
- Design review prompts

### 2. Content (25 prompts)
- Blog post generation
- Social media content
- Email campaigns
- Documentation writing
- Content editing

### 3. Compliance (15 prompts)
- Legal document review
- Policy generation
- Compliance checking
- Risk assessment
- Regulatory research

### 4. Development (20 prompts)
- Code generation
- Code review
- Documentation generation
- API design
- Testing prompts

### 5. Governance (10 prompts)
- Policy creation
- Access control rules
- Audit report generation
- Compliance reporting
- Governance documentation

### 6. Onboarding (10 prompts)
- Welcome messages
- User guides
- Tutorial generation
- FAQ generation
- Help documentation

---

## Usage

### Via API
```python
from agents.prompts import get_prompt

prompt = get_prompt("design_product_brief", {
    "product_name": "HingeCraft Platform",
    "target_audience": "Students and makers",
    "key_features": ["Design", "Manufacturing", "Community"]
})

response = llm.generate(prompt)
```

### Via Database
```sql
SELECT prompt_text, variables
FROM prompt_templates
WHERE template_name = 'design_product_brief';
```

---

## Prompt Index

See `PROMPT_INDEX.md` for complete list of all 100+ prompts.

---

## Contributing

When adding new prompts:
1. Follow the prompt structure
2. Include examples
3. Add to appropriate category
4. Update prompt index
5. Test with multiple LLM providers

---

**Status:** 🚧 In Development - Target: 100+ prompts




