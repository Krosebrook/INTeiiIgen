# Discovery Protocol Template — Staff Engineer Edition

## When to Use This Template

**ALWAYS use when:**
- User requests audit/review of their work
- User asks "what's missing" or "how to improve"
- User proposes a large project (>20 hours)
- User's plan has potential critical gaps
- User asks for recommendations without context

**RED FLAGS that trigger this:**
- "Audit my work"
- "What am I missing?"
- "How should I build X?"
- "Is this production-ready?"
- Any request where you don't understand their goals/constraints

---

## Discovery Script (Copy-Paste This)

```
Before I dive into recommendations, let me ask a few quick questions 
to give you the RIGHT advice, not just generic advice:

🎯 GOAL & CONTEXT
1. What are you building this for?
   [ ] Personal use (my own productivity)
   [ ] Team use (my company/startup)  
   [ ] Product to sell (SaaS/marketplace)
   [ ] Learning/teaching (course/tutorial)
   [ ] Client work (consulting/agency)
   [ ] Other: ___________

2. Who's the end user?
   [ ] Just me
   [ ] My team (2-10 people)
   [ ] My company (10-100+ people)
   [ ] External customers (paying users)
   [ ] Students/learners
   [ ] Open source community

3. What problem does this solve?
   (1-2 sentences: What pain point are you addressing?)

💰 CONSTRAINTS
4. What's your realistic time budget?
   [ ] 2-4 hours (quick wins only)
   [ ] 1-2 weeks part-time (10-20 hours)
   [ ] 1-2 months part-time (40-80 hours)
   [ ] Full-time for X weeks/months
   [ ] Ongoing/no deadline

5. What's your budget for tools/services?
   [ ] $0 (free tier only)
   [ ] <$100/month (indie/bootstrap)
   [ ] $100-1000/month (small team)
   [ ] $1000+/month (enterprise)
   [ ] Unlimited/not a concern

🚀 DEPLOYMENT & SCALE
6. Are you deploying to production?
   [ ] No, personal/internal use only
   [ ] Yes, but low traffic (<100 users)
   [ ] Yes, moderate traffic (100-10K users)
   [ ] Yes, high traffic (10K-100K+ users)
   [ ] Not applicable

7. What's your current stage?
   [ ] Idea/planning (nothing built yet)
   [ ] Prototype (rough version exists)
   [ ] MVP (working but incomplete)
   [ ] Production (live with users)
   [ ] Scaling (growth phase)

👥 TEAM & EXPERTISE
8. Who's on your team?
   [ ] Solo (just me)
   [ ] 2-3 people
   [ ] 4-10 people
   [ ] 10+ people
   [ ] Contractors/freelancers available

9. What's your tech expertise level?
   [ ] Beginner (learning as I go)
   [ ] Intermediate (can build things)
   [ ] Advanced (years of experience)
   [ ] Expert (could teach this)

🎚️ QUALITY REQUIREMENTS
10. What level of quality do you need?
    [ ] SPIKE (quick prototype, input validation only)
    [ ] MVP (works but not polished)
    [ ] PROD (production-ready, tested)
    [ ] SKEPTIC (mission-critical, extra scrutiny)

These answers will completely change my recommendations. Take 2 minutes 
to answer, and I'll give you a tailored plan instead of generic advice.
```

---

## Response Framework (After Getting Answers)

### Step 1: Acknowledge Context (30 seconds)
```
Got it. You're building [SUMMARY]:
- For: [USER TYPE]
- Goal: [PROBLEM SOLVED]
- Constraints: [TIME/BUDGET]
- Stage: [CURRENT PHASE]

This changes my recommendations completely. Here's what matters for YOUR situation...
```

### Step 2: Identify Jobs To Be Done (2 minutes)
```
Based on your answers, your users need to:
1. [PRIMARY JOB] — Most important
2. [SECONDARY JOB] — Nice to have
3. [TERTIARY JOB] — Future consideration

Let me optimize for these, not theoretical completeness...
```

### Step 3: Critical Path Analysis (3 minutes)
```
🔴 CRITICAL (Will fail without these):
- [BLOCKER 1] — Why: [REASON]
- [BLOCKER 2] — Why: [REASON]

⚠️ IMPORTANT (Significantly better with these):
- [FEATURE 1] — Why: [REASON]
- [FEATURE 2] — Why: [REASON]

💡 NICE-TO-HAVE (Add later):
- [ENHANCEMENT 1]
- [ENHANCEMENT 2]
```

### Step 4: Tiered Recommendations (5 minutes)
```
TIER 1: Minimum Viable (Ship This Week)
⏱️ Effort: [X hours]
🎯 Goal: [OUTCOME]
📋 What to add:
   - [ITEM 1] ([TIME])
   - [ITEM 2] ([TIME])
   - [ITEM 3] ([TIME])
💰 Value: [WHY THIS MATTERS]
✅ Recommendation: [DO THIS / SKIP THIS / OPTIONAL]

TIER 2: Production-Ready (Ship In 2-4 Weeks)
⏱️ Effort: [X hours]
🎯 Goal: [OUTCOME]
📋 What to add:
   - Everything from Tier 1
   - [NEW ITEM 1] ([TIME])
   - [NEW ITEM 2] ([TIME])
💰 Value: [WHY THIS MATTERS]
✅ Recommendation: [DO THIS / SKIP THIS / OPTIONAL]

TIER 3: Complete (Ship In 1-3 Months)
⏱️ Effort: [X hours]
🎯 Goal: [OUTCOME]
📋 What to add:
   - Everything from Tier 2
   - [NEW ITEM 1] ([TIME])
   - [NEW ITEM 2] ([TIME])
💰 Value: [WHY THIS MATTERS]
✅ Recommendation: [DO THIS / SKIP THIS / OPTIONAL]
```

### Step 5: Prioritization Matrix (2 minutes)
```
                HIGH IMPACT
                     │
    [DO FIRST]       │     [AVOID]
    Quick wins       │     Waste of time
         ┌───────────┼───────────┐
         │           │           │
         │  [TIER 1] │           │
         │           │           │
LOW      │           │           │  HIGH
EFFORT   ├───────────┼───────────┤  EFFORT
         │           │           │
         │ [TIER 2-3]│  [LATER]  │
         │           │  If ever  │
         └───────────┼───────────┘
                     │
                LOW IMPACT

Start: Top-left (high impact, low effort)
Then: Move right (high impact, high effort)
Avoid: Bottom-right (low impact, high effort)
```

### Step 6: Decision Framework (1 minute)
```
MY RECOMMENDATION:
Start with Tier [1/2/3] because:
- Fits your [TIME/BUDGET] constraints
- Solves [PRIMARY JOB]
- Ships in [TIMELINE]
- Costs [EFFORT]

Skip Tier [X] because:
- Doesn't match your [CONSTRAINT]
- Solves problem you don't have
- Premature optimization

YOUR DECISION:
Which tier matches your situation?
Any questions before you start?
```

---

## Red Flags Checklist (Stop and Ask Questions)

**Before giving recommendations, check:**

- [ ] Do I know WHO this is for? (User type)
- [ ] Do I know WHY they're building it? (Goal)
- [ ] Do I know WHEN they need it? (Timeline)
- [ ] Do I know HOW MUCH they can spend? (Budget)
- [ ] Do I know WHAT STAGE they're at? (Prototype/Production)
- [ ] Do I know WHAT QUALITY they need? (SPIKE/PROD/SKEPTIC)

**If ANY are unknown → STOP and ask questions**

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Assuming Enterprise Scale
```
Bad:  "You need Kubernetes, microservices, and distributed tracing"
Good: "How many users? 100? A single Vercel deploy is fine."
```

### ❌ Mistake 2: Optimizing for Completeness
```
Bad:  "You're missing 9 phases and 61 prompts"
Good: "These 3 additions would 10x your value in 6 hours"
```

### ❌ Mistake 3: Industry Standards Without Context
```
Bad:  "All AI products need LLM evals in CI/CD"
Good: "Are you shipping AI to users? No? Then skip evals for now."
```

### ❌ Mistake 4: Building Before Shipping
```
Bad:  "Build all 78 prompts before launching"
Good: "Ship 10 great prompts now, add more based on feedback"
```

### ❌ Mistake 5: Not Providing "Do Nothing" Option
```
Bad:  Option A (build small), Option B (build big)
Good: Option A (do nothing), Option B (quick wins), Option C (comprehensive)
```

---

## Example Application

### User Request:
"Audit my prompt bundle. What's missing?"

### Bad Response (What NOT to do):
```
Your bundle is missing:
- Phase 0: Discovery
- Phase 4.5: LLM Evals
- Phase 9: Versioning
[... 50 more lines of missing features ...]
You need 308 hours to complete this.
```

### Good Response (Use Discovery Template):
```
Before I audit, let me understand your context:

1. What are you building this for?
2. Who's the end user?
3. What problem does this solve?
4. What's your time budget?
5. What's your deployment scenario?

[Wait for answers, THEN give tailored recommendations]
```

### After Getting Answers:
```
Got it. You're building a product to sell to developers.

Based on that, here's what matters:

🔴 CRITICAL (Must have):
- Copy-paste templates (4 hours)
  Why: Developers want to ship fast, not read docs
  
⚠️ IMPORTANT (Should have):
- LLM eval quick start (8 hours)
  Why: Your customers build AI products, need testing
  
💡 NICE-TO-HAVE (Later):
- Full observability suite (100+ hours)
  Why: Only enterprise customers need this, not solo devs

RECOMMENDATION:
Ship Tier 1 (4 hours) this week for free, build Tier 2 
(12 hours total) next week and charge $49.

This beats trying to build 78 prompts (308 hours) before 
getting any user feedback.

Questions?
```

---

## Quick Reference Card (Print This)

```
┌─────────────────────────────────────────────┐
│  DISCOVERY PROTOCOL — QUICK CHECKLIST       │
├─────────────────────────────────────────────┤
│                                             │
│  📋 BEFORE RECOMMENDING:                    │
│  ☐ Who is this for?                         │
│  ☐ Why are they building it?                │
│  ☐ What's the timeline?                     │
│  ☐ What's the budget?                       │
│  ☐ What stage are they at?                  │
│  ☐ What quality level needed?               │
│                                             │
│  🎯 RECOMMENDATION STRUCTURE:                │
│  1. Acknowledge context (30s)               │
│  2. Identify jobs to be done (2m)           │
│  3. Critical path analysis (3m)             │
│  4. Tiered options (5m)                     │
│  5. Recommendation + decision (1m)          │
│                                             │
│  ⚠️ RED FLAGS:                               │
│  • Assuming enterprise scale                │
│  • Optimizing for completeness              │
│  • Industry standards without context       │
│  • Building before shipping                 │
│  • No "do nothing" option                   │
│                                             │
│  ✅ REMEMBER:                                │
│  Quality > Quantity                         │
│  Ship fast > Perfect later                  │
│  User needs > Industry standards            │
│  80/20 rule > 100% complete                 │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Implementation Checklist

**To add this to your workflow:**

- [ ] Save this template somewhere accessible
- [ ] Read it once (15 minutes)
- [ ] Practice on next 3 requests
- [ ] Refine based on what works
- [ ] Make it automatic (muscle memory)

**Time to proficiency:** 3-5 uses

**Payoff:** 10x better recommendations, happier users

---

## Template Version
**Version:** 1.0  
**Created:** 2025-01-18  
**Author:** Senior Staff Engineer  
**Usage:** Copy-paste, adapt to situation, iterate

---

## CLAIMS / COUNTEREXAMPLE / CONTRADICTIONS

**CLAIM:** This template works for all requests

**COUNTEREXAMPLE:** Simple/obvious requests don't need discovery
- "Fix this typo" → Just fix it
- "What's 2+2" → Just answer it
- "Explain X" → Just explain it

**RESOLUTION:** Use judgment. Discovery for:
- Audits/reviews
- Recommendations
- Large projects
- Ambiguous requests

Skip discovery for:
- Simple questions
- Clear/scoped requests
- Emergency fixes
- Obvious answers

---

**Use this template. Adapt it. Make it yours.**
