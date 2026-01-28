---
name: content
description: Content Strategy specialist. Creates SEO-optimized, brand-consistent content for blogs, marketing, technical docs, and more. Ensures content ranks in traditional search AND AI-powered citations.
argument-hint: "<content type> <topic> or <subcommand>"
disable-model-invocation: false
user-invocable: true
allowed-tools: Read, Write, Edit, Glob, Grep, Task, TodoWrite
model: sonnet
context: fork
agent: content-strategy-agent
---

# /apl content - Content Strategy Command

Generate SEO-optimized, brand-consistent content with structured data for maximum discoverability.

## Invocation

The user has invoked: `/apl content $ARGUMENTS`

Parse the arguments to determine the content type and topic.

## Commands

### Generate Content

```
/apl content <type> <topic>
```

**Content Types:**
- `blog` - SEO-optimized blog post with Article schema
- `landing` - Conversion-focused landing page copy
- `docs` - Technical documentation with HowTo schema
- `email` - Email campaign content
- `social` - Social media posts (multi-platform)
- `marketing` - Marketing copy (ads, brochures)
- `faq` - FAQ content with FAQPage schema

**Examples:**
```
/apl content blog "Getting Started with TypeScript Generics"
/apl content landing "AI-powered code review tool"
/apl content docs "API authentication guide"
/apl content faq "Common billing questions"
```

### Audit Existing Content

```
/apl content audit <file_path>
```

Analyzes existing content for:
- SEO optimization score
- Keyword usage and density
- Heading structure validity
- Missing structured data
- Accessibility issues
- Brand voice consistency

**Example:**
```
/apl content audit src/pages/about.mdx
/apl content audit content/blog/*.md
```

### Configure Brand Voice

```
/apl content config
```

Interactive wizard to configure brand voice settings:
- Tone (professional, casual, technical, friendly, authoritative)
- Personality traits
- Vocabulary level
- Words to avoid
- Preferred phrases

Saves to `.apl/config.json` under `content_strategy.brand_voice`.

### Show Current Config

```
/apl content config show
```

Displays current content strategy configuration from master-config.json merged with project overrides.

## Initialization

1. **Load Configuration**:
   - Read `master-config.json` for default content_strategy settings
   - Override with `.apl/config.json` if exists
   - Extract brand_voice, seo, and ai_citation_optimization settings

2. **Load Content Patterns**:
   - Check `patterns/content/` for applicable patterns
   - Load SEO patterns, structured data templates, brand voice guidelines

3. **Analyze Request**:
   - Parse content type from arguments
   - Extract topic or file path
   - Determine if generation or audit

## Generation Workflow

For content generation requests:

1. **Research Phase**:
   - Analyze topic for keyword opportunities
   - Check existing content for internal linking
   - Identify content gaps

2. **Outline Phase**:
   - Create heading structure (H1, H2, H3)
   - Plan content sections
   - Identify structured data type

3. **Draft Phase**:
   - Write content following brand voice
   - Apply SEO best practices
   - Include relevant keywords naturally

4. **Optimize Phase**:
   - Add meta title and description
   - Generate JSON-LD structured data
   - Check accessibility requirements

5. **Review Phase**:
   - Calculate SEO score
   - Verify keyword density
   - Validate heading hierarchy

## Audit Workflow

For content audit requests:

1. **Read Content**: Load specified file(s)
2. **Analyze SEO**: Check title, meta, headings, keywords
3. **Check Structure**: Validate JSON-LD if present
4. **Assess Accessibility**: Review alt text, heading levels, link text
5. **Score Content**: Generate overall quality score
6. **Report Findings**: List issues and recommendations

## Output Format

### Generation Output

```
[APL Content] Type: BLOG | Topic: "Getting Started with TypeScript"

Generating SEO-optimized blog post...

Content Generated:
- Title: "TypeScript Generics: A Beginner's Guide to Type-Safe Code"
- Word Count: 1,523
- SEO Score: 94/100
- Readability: Grade 8

Structured Data: Article schema included
Keywords: typescript generics, type safety, generic functions (density: 1.8%)

Files Created:
- content/blog/typescript-generics-guide.mdx

Recommendations:
- Add internal link to "TypeScript Basics" post
- Consider adding FAQ section for featured snippets
```

### Audit Output

```
[APL Content] Auditing: src/pages/about.mdx

SEO Analysis:
- Title: "About Us" (⚠️ Could be more descriptive)
- Meta Description: Missing (❌)
- H1: Present and unique (✓)
- Keyword Density: 0.3% (⚠️ Below recommended 1-2%)

Structured Data:
- JSON-LD: Not found (❌)
- Recommended: Organization schema

Accessibility:
- Images without alt text: 2 (❌)
- Heading hierarchy: Valid (✓)
- Link text: 1 "click here" found (⚠️)

Overall Score: 62/100

Recommendations:
1. Add meta description (150-160 chars)
2. Include Organization JSON-LD schema
3. Add alt text to hero image and team photo
4. Replace "click here" with descriptive link text
5. Increase keyword usage for target terms
```

## Brand Voice Application

When generating content, apply brand voice settings:

```json
{
  "brand_voice": {
    "tone": "professional",
    "personality_traits": ["helpful", "knowledgeable", "approachable"],
    "vocabulary_level": "moderate",
    "avoid_words": ["utilize", "leverage", "synergy"],
    "preferred_phrases": ["Here's how", "Let's explore", "In practice"]
  }
}
```

- **Professional tone**: Clear, authoritative, avoid slang
- **Casual tone**: Conversational, use contractions, relatable
- **Technical tone**: Precise terminology, detailed explanations
- **Friendly tone**: Warm, encouraging, supportive
- **Authoritative tone**: Expert positioning, confident statements

## Error Handling

- **Missing topic**: Prompt user for topic
- **Invalid content type**: List available types
- **File not found**: Check path and suggest alternatives
- **Brand voice not configured**: Use defaults, suggest `/apl content config`
