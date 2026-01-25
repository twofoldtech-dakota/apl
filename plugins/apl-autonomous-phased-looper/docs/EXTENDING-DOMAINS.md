# Extending Domain Questions

This guide explains how to create custom domain question files for the APL requirements analyst. Domain questions help gather industry-specific requirements during project planning.

## Overview

Domain question files are JSON documents that define questions relevant to specific industries or project types. The requirements analyst uses these to gather contextual information that shapes epics and stories.

## File Location

Domain question files are stored in:
```
templates/domain-questions/
├── healthcare.json
├── fintech.json
├── ecommerce.json
├── gaming.json        # Your new domain
└── README.md
```

## Domain Question Schema

```json
{
  "domain": "string - unique identifier",
  "display_name": "string - human-readable name",
  "version": "string - semantic version",
  "description": "string - when to use this domain",

  "detection_keywords": ["strings that trigger this domain"],

  "question_categories": [
    {
      "category": "category_name",
      "questions": [
        {
          "id": "unique_question_id",
          "question": "The question text",
          "type": "single_choice|multi_choice|text|number",
          "required": true|false,
          "options": ["for choice questions"],
          "default": "optional default value",
          "follow_up": {
            "condition": "when to ask follow-up",
            "questions": [...]
          },
          "impacts": ["what this answer affects"]
        }
      ]
    }
  ],

  "generated_requirements": {
    "always_include": ["requirements always added"],
    "conditional": [
      {
        "condition": "answer_condition",
        "requirements": ["requirements if condition met"]
      }
    ]
  }
}
```

## Creating a New Domain

### Step 1: Identify Domain-Specific Concerns

List what makes this domain unique:
- Regulatory requirements
- Security considerations
- User expectations
- Industry standards
- Common patterns

### Step 2: Define Question Categories

Group questions logically:
- Compliance/Regulatory
- Security
- User Experience
- Integration
- Performance
- Business Logic

### Step 3: Write Questions

For each question:
1. Make it specific and actionable
2. Provide clear options
3. Define follow-up logic
4. Document impact on requirements

### Step 4: Map to Requirements

Define how answers translate to:
- Architectural decisions
- Feature requirements
- Non-functional requirements
- Compliance needs

## Example: Gaming Domain

```json
{
  "domain": "gaming",
  "display_name": "Gaming & Interactive Entertainment",
  "version": "1.0.0",
  "description": "Questions for video games, mobile games, and interactive entertainment applications",

  "detection_keywords": [
    "game", "gaming", "video game", "mobile game",
    "player", "multiplayer", "leaderboard", "achievements",
    "in-app purchase", "IAP", "game server"
  ],

  "question_categories": [
    {
      "category": "platform_distribution",
      "display_name": "Platform & Distribution",
      "questions": [
        {
          "id": "game_platform",
          "question": "What platforms will the game target?",
          "type": "multi_choice",
          "required": true,
          "options": [
            "Web browser",
            "iOS",
            "Android",
            "PC (Windows/Mac/Linux)",
            "Console (PlayStation/Xbox/Switch)"
          ],
          "impacts": [
            "Architecture decisions",
            "Input handling",
            "Performance requirements",
            "Store compliance"
          ]
        },
        {
          "id": "age_rating",
          "question": "What age rating are you targeting?",
          "type": "single_choice",
          "required": true,
          "options": [
            "Everyone (E)",
            "Everyone 10+ (E10+)",
            "Teen (T)",
            "Mature (M)",
            "Adults Only (AO)"
          ],
          "impacts": [
            "Content restrictions",
            "Monetization options",
            "Store requirements"
          ]
        }
      ]
    },
    {
      "category": "multiplayer",
      "display_name": "Multiplayer & Social",
      "questions": [
        {
          "id": "multiplayer_mode",
          "question": "What multiplayer modes are needed?",
          "type": "multi_choice",
          "required": false,
          "options": [
            "Single-player only",
            "Local multiplayer",
            "Online multiplayer (real-time)",
            "Asynchronous multiplayer",
            "Co-op gameplay"
          ],
          "follow_up": {
            "condition": "includes 'Online multiplayer'",
            "questions": [
              {
                "id": "concurrent_players",
                "question": "Expected concurrent players per match/session?",
                "type": "single_choice",
                "options": ["2-4", "5-10", "10-50", "50-100", "100+"]
              },
              {
                "id": "matchmaking_required",
                "question": "Do you need skill-based matchmaking?",
                "type": "single_choice",
                "options": ["Yes", "No", "Future consideration"]
              }
            ]
          },
          "impacts": [
            "Server infrastructure",
            "Netcode requirements",
            "Database design"
          ]
        }
      ]
    },
    {
      "category": "monetization",
      "display_name": "Monetization",
      "questions": [
        {
          "id": "monetization_model",
          "question": "What is the primary monetization model?",
          "type": "single_choice",
          "required": true,
          "options": [
            "Premium (one-time purchase)",
            "Free-to-play with ads",
            "Free-to-play with IAP",
            "Subscription",
            "Freemium (premium + IAP)"
          ],
          "follow_up": {
            "condition": "includes 'IAP'",
            "questions": [
              {
                "id": "iap_types",
                "question": "What types of in-app purchases?",
                "type": "multi_choice",
                "options": [
                  "Consumables (coins, gems)",
                  "Cosmetics (skins, themes)",
                  "Gameplay items (weapons, power-ups)",
                  "Season pass / Battle pass",
                  "Character unlocks"
                ]
              },
              {
                "id": "iap_compliance",
                "question": "Do you need COPPA compliance for purchases?",
                "type": "single_choice",
                "options": ["Yes (under-13 audience)", "No", "Unsure"]
              }
            ]
          }
        }
      ]
    },
    {
      "category": "game_services",
      "display_name": "Game Services",
      "questions": [
        {
          "id": "game_services_features",
          "question": "Which game service features are needed?",
          "type": "multi_choice",
          "required": false,
          "options": [
            "Player accounts / authentication",
            "Cloud save / progress sync",
            "Leaderboards",
            "Achievements / trophies",
            "Friends / social features",
            "Push notifications",
            "Analytics / telemetry"
          ],
          "impacts": [
            "Backend requirements",
            "Database schema",
            "API design"
          ]
        },
        {
          "id": "platform_integration",
          "question": "Do you need platform-specific integrations?",
          "type": "multi_choice",
          "required": false,
          "options": [
            "Steam achievements / leaderboards",
            "Apple Game Center",
            "Google Play Games",
            "Xbox Live",
            "PlayStation Network",
            "Discord Rich Presence"
          ]
        }
      ]
    },
    {
      "category": "anti_cheat",
      "display_name": "Security & Anti-Cheat",
      "questions": [
        {
          "id": "anti_cheat_required",
          "question": "What level of anti-cheat protection is needed?",
          "type": "single_choice",
          "required": false,
          "options": [
            "None (single-player only)",
            "Basic server validation",
            "Comprehensive anti-cheat system",
            "Third-party solution (EAC, BattlEye)"
          ],
          "impacts": [
            "Server architecture",
            "Client-server trust model",
            "Development complexity"
          ]
        },
        {
          "id": "economy_protection",
          "question": "Does the game have a virtual economy needing protection?",
          "type": "single_choice",
          "options": ["Yes", "No"],
          "follow_up": {
            "condition": "Yes",
            "questions": [
              {
                "id": "economy_type",
                "question": "What type of economy?",
                "type": "multi_choice",
                "options": [
                  "Soft currency only",
                  "Premium currency",
                  "Player-to-player trading",
                  "Real-money transactions"
                ]
              }
            ]
          }
        }
      ]
    }
  ],

  "generated_requirements": {
    "always_include": [
      "Game client optimized for target platform performance",
      "Frame rate targets defined for each platform",
      "Input handling for platform-appropriate controls"
    ],
    "conditional": [
      {
        "condition": "multiplayer_mode includes 'Online multiplayer'",
        "requirements": [
          "Dedicated game server infrastructure",
          "Netcode with lag compensation",
          "Connection quality indicators",
          "Graceful disconnect handling"
        ]
      },
      {
        "condition": "monetization_model includes 'IAP'",
        "requirements": [
          "Store integration (App Store, Google Play)",
          "Purchase verification server-side",
          "Receipt validation",
          "Refund handling workflow"
        ]
      },
      {
        "condition": "age_rating == 'Everyone (E)' AND monetization_model includes 'IAP'",
        "requirements": [
          "COPPA compliance review",
          "Parental gate for purchases",
          "Age-appropriate content filters"
        ]
      },
      {
        "condition": "anti_cheat_required != 'None'",
        "requirements": [
          "Server-authoritative game state",
          "Input validation on server",
          "Anomaly detection logging"
        ]
      }
    ]
  },

  "metadata": {
    "author": "APL Framework",
    "created": "2024-01-15",
    "last_updated": "2024-01-15",
    "related_domains": ["mobile_app", "saas"]
  }
}
```

## Domain Composition

Domains can be combined. For a "mobile gaming" project, both `gaming` and `mobile_app` questions might apply.

### Composition Rules

```json
{
  "composition": {
    "allow_multiple": true,
    "priority_order": ["primary_domain", "secondary_domain"],
    "deduplication": "by_question_id"
  }
}
```

### Example: Combined Domains

```
User: "Build a mobile multiplayer game"

Detected domains:
1. gaming (primary) - from "game", "multiplayer"
2. mobile_app (secondary) - from "mobile"

Questions presented:
- Gaming: multiplayer_mode, monetization, anti_cheat
- Mobile: app_store_distribution, push_notifications, offline_support
```

## Integration with Requirements Analyst

The requirements analyst loads domain questions based on:

1. **Keyword Detection**: Initial goal text triggers domain matching
2. **Explicit Selection**: User can specify domain
3. **Clarification**: Analyst asks if ambiguous

### In `agents/requirements-analyst.md`:

```markdown
## Domain Question Loading

1. Parse initial goal for domain keywords
2. Load matching domain question files
3. If multiple domains match, ask user to prioritize
4. Present questions in category order
5. Apply conditional follow-ups
6. Generate domain-specific requirements

## Example Flow

Goal: "Build a healthcare mobile app"

1. Detected: healthcare, mobile_app
2. Ask: "I detected healthcare and mobile app domains.
   Should I ask questions for both? [Yes/Healthcare only/Mobile only]"
3. User: "Yes"
4. Present healthcare compliance questions first (higher risk)
5. Follow with mobile app questions
6. Merge requirements, noting conflicts
```

## Testing Domain Questions

### Validation Checklist

- [ ] All question IDs are unique within domain
- [ ] Required questions have sensible defaults or clear impact
- [ ] Follow-up conditions are testable
- [ ] Generated requirements are actionable
- [ ] No circular dependencies in follow-ups

### Test Scenarios

```javascript
describe('Gaming Domain Questions', () => {
  it('should detect gaming keywords', () => {
    const goal = "Build a multiplayer mobile game";
    const domains = detectDomains(goal);
    expect(domains).toContain('gaming');
  });

  it('should trigger IAP follow-ups correctly', () => {
    const answers = { monetization_model: 'Free-to-play with IAP' };
    const followUps = getFollowUpQuestions('monetization_model', answers);
    expect(followUps).toContainEqual(
      expect.objectContaining({ id: 'iap_types' })
    );
  });

  it('should generate multiplayer requirements', () => {
    const answers = { multiplayer_mode: ['Online multiplayer (real-time)'] };
    const requirements = generateRequirements('gaming', answers);
    expect(requirements).toContain('Dedicated game server infrastructure');
  });
});
```

## Best Practices

### 1. Keep Questions Focused
Each question should gather one piece of information.

### 2. Provide Context
Options should be self-explanatory. Add descriptions if needed.

### 3. Define Clear Impacts
Document how answers affect the project.

### 4. Use Conditional Logic Sparingly
Too many follow-ups create a complex tree.

### 5. Align with Industry Standards
Use industry-standard terminology.

### 6. Version Your Domains
Track changes for compatibility.

## Next Steps

- Review existing domains in `templates/domain-questions/`
- Create your domain question file
- Test with the requirements analyst
- Iterate based on real project feedback
