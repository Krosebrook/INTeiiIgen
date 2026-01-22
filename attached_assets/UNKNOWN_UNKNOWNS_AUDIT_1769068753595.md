# Unknown Unknowns Audit — Gap Analysis & Hidden Risks

## TL;DR
Systematic identification of blind spots, hidden assumptions, and risks you didn't know to look for. Read this when stuck or before critical decisions.

---

## 🎯 What Are Unknown Unknowns?

### The Knowledge Matrix (Rumsfeld Framework)

```
┌─────────────────────┬─────────────────────┐
│  KNOWN KNOWNS       │  KNOWN UNKNOWNS     │
│  "I know Python"    │  "I don't know Rust"│
│  ✅ Safe zone       │  ⚠️ Ask for help    │
├─────────────────────┼─────────────────────┤
│  UNKNOWN KNOWNS     │  UNKNOWN UNKNOWNS   │
│  "Muscle memory"    │  "???"              │
│  💡 Hard to teach   │  ⚠️⚠️⚠️ DANGER    │
└─────────────────────┴─────────────────────┘
```

**Unknown Unknowns:** Risks you didn't even know to ask about.

**Examples:**
- "I didn't know browsers cache 307 redirects forever" → Production down
- "I didn't know Stripe webhooks can arrive out-of-order" → Double charges
- "I didn't know AWS bills for NAT gateway data transfer" → $10K surprise bill

---

## 🚨 Category 1: Technology Blind Spots

### 1.1 Browser Behavior (Not Obvious)

**Unknown:** Browsers cache 301/307/308 redirects **permanently** (even after server changes)

**Impact:** Change redirect destination → users stuck on old URL until cache clear

**Example:**
```javascript
// 2024-01-01: Redirect /old → /new
res.redirect(301, '/new');

// 2024-02-01: Change redirect /old → /newer
res.redirect(301, '/newer');

// Problem: Users visiting /old STILL go to /new (cached)
```

**Mitigation:**
- Use 302 (temporary) for redirects that might change
- Include `Cache-Control: max-age=86400` for 301s
- Test in incognito mode (no cache)

---

**Unknown:** `localStorage` is **synchronous** and blocks UI thread

**Impact:** Writing 5MB to localStorage freezes page for 50-100ms

**Example:**
```javascript
// ❌ Bad: Blocks UI
localStorage.setItem('bigData', JSON.stringify(largeObject));

// ✅ Good: Use async IndexedDB
await db.put('bigData', largeObject);
```

**Mitigation:**
- Use IndexedDB for >100KB data
- Debounce writes (batch updates)

---

**Unknown:** Service Workers cache **persists across deployments**

**Impact:** Users stuck on old version until manual cache clear

**Example:**
```javascript
// Old service worker caches v1.0 of app
// Deploy v2.0 → users still see v1.0

// Fix: Force update in service worker
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Activate immediately
});
```

**Mitigation:**
- Version cache keys: `cache-v2.0.0`
- Delete old caches on activate
- Test cache invalidation in staging

---

### 1.2 Database Behavior (Not Documented)

**Unknown:** PostgreSQL **locks entire table** on `ALTER TABLE` (even "ADD COLUMN")

**Impact:** 30-second migration = 30-second downtime for reads/writes

**Example:**
```sql
-- This locks `users` table for 30 seconds
ALTER TABLE users ADD COLUMN avatar_url TEXT;

-- During lock: All queries wait (even SELECT)
```

**Mitigation:**
- Add columns as **nullable** first (no lock)
- Backfill data separately
- Make non-nullable later (quick lock)

```sql
-- Step 1: Add nullable (fast, no lock)
ALTER TABLE users ADD COLUMN avatar_url TEXT;

-- Step 2: Backfill (no lock)
UPDATE users SET avatar_url = 'default.png' WHERE avatar_url IS NULL;

-- Step 3: Make non-nullable (fast lock)
ALTER TABLE users ALTER COLUMN avatar_url SET NOT NULL;
```

---

**Unknown:** Database connection pools **don't recover** from network blips

**Impact:** Pool fills with dead connections → new requests hang

**Example:**
```javascript
// Network blip for 5 seconds
// Pool now has 50 dead connections
// New requests wait indefinitely (no timeout)
```

**Mitigation:**
- Set `connectionTimeoutMillis: 5000`
- Enable `idleTimeoutMillis: 30000`
- Health check connections before use

---

**Unknown:** Foreign key constraints **lock both tables** during writes

**Impact:** High-traffic child table slows down parent table

**Example:**
```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) -- ⚠️ Locks users on every post insert
);

-- Insert post → locks users.id row
```

**Mitigation:**
- Use deferred constraints: `DEFERRABLE INITIALLY DEFERRED`
- Or: App-level validation (no FK constraint)

---

### 1.3 API / Integration Surprises

**Unknown:** Stripe webhooks can arrive **out-of-order**

**Impact:** `payment_succeeded` arrives before `customer_created` → broken workflow

**Example:**
```javascript
// Expected order:
// 1. customer.created
// 2. payment_intent.created
// 3. payment_intent.succeeded

// Actual order (sometimes):
// 1. payment_intent.succeeded  ← Error: Customer not found
// 2. customer.created
```

**Mitigation:**
- Webhooks should be **idempotent** (safe to process multiple times)
- Store webhook events, process in order later
- Use `idempotency_key` in API calls

---

**Unknown:** OAuth tokens expire **without warning**

**Impact:** Integration breaks silently, users can't log in

**Example:**
```javascript
// Google OAuth access token expires after 1 hour
// Refresh token expires after 6 months (if not used)
// No alert when refresh token expires → integration dead
```

**Mitigation:**
- Refresh tokens proactively (don't wait for expiry)
- Alert on refresh failures (>5% fail rate = investigate)
- Test token expiry in staging (manually expire)

---

**Unknown:** Third-party APIs have **undocumented rate limits**

**Impact:** 429 errors in production with no warning

**Example:**
```javascript
// API docs say: "No rate limit"
// Reality: 100 requests/second, then 429

// Your code:
for (let i = 0; i < 1000; i++) {
  await api.call(); // 500 of these fail
}
```

**Mitigation:**
- Assume 100 req/sec limit unless documented higher
- Implement exponential backoff (1s, 2s, 4s, 8s)
- Monitor 429 responses (alert if >1%)

---

### 1.4 Cloud Provider Gotchas

**Unknown:** AWS NAT Gateway bills **per GB transferred** (not per hour)

**Impact:** $0.045/GB adds up fast (10TB/month = $450)

**Example:**
```
Your EC2 instances download 10TB from internet
Costs:
- EC2 data transfer: $0.09/GB = $900
- NAT Gateway data: $0.045/GB = $450
- NAT Gateway hours: $0.045/hour x 720 = $32
Total: $1,382 (surprise!)
```

**Mitigation:**
- Use VPC endpoints for AWS services (no NAT)
- Use CloudFront for static assets (free egress)
- Monitor data transfer (alert if >1TB/day)

---

**Unknown:** Vercel charges for **function execution time**, not invocations

**Impact:** Long-running function = high bill

**Example:**
```javascript
// Function runs for 30 seconds
// Invoked 10,000 times/month
// Cost: 10,000 x 30s x $0.000018/GB-s = $5.40/month

// Optimization: Reduce to 5 seconds
// Cost: 10,000 x 5s x $0.000018/GB-s = $0.90/month
```

**Mitigation:**
- Optimize function duration (lazy load, cache)
- Use Edge Functions (<10ms) instead of Serverless (<30s)
- Monitor execution time (alert if >10s avg)

---

**Unknown:** Cloudflare Workers have **CPU time limit** (not wall clock time)

**Impact:** Waiting for API response = OK (not counted). Heavy computation = timeout.

**Example:**
```javascript
// ✅ OK: Waits 5 seconds for API (wall clock time)
const data = await fetch(api).then(r => r.json());

// ❌ Timeout: 5 seconds of CPU computation
for (let i = 0; i < 1_000_000_000; i++) {
  doWork();
}
```

**Mitigation:**
- Move heavy computation to durable objects
- Use Web Workers for parallelism
- Cache computation results

---

## 🚨 Category 2: Security Blind Spots

### 2.1 Authentication Surprises

**Unknown:** JWT tokens can't be **revoked** (unless you build infrastructure)

**Impact:** Stolen token valid until expiry (could be weeks)

**Example:**
```javascript
// Issue JWT with 7-day expiry
const token = jwt.sign({ userId: 123 }, secret, { expiresIn: '7d' });

// User reports: "My account was hacked!"
// You change password → JWT STILL VALID for 7 days
```

**Mitigation:**
- Short expiry (1 hour), refresh token pattern
- Token revocation list (Redis) for critical apps
- Use session-based auth for high-security apps

---

**Unknown:** `httpOnly` cookies **don't prevent CSRF**

**Impact:** Attacker tricks user into malicious request

**Example:**
```html
<!-- Attacker's site -->
<img src="https://yoursite.com/api/delete-account">
<!-- Browser sends httpOnly cookie automatically → account deleted -->
```

**Mitigation:**
- CSRF token in hidden form field
- SameSite=Strict on cookies
- Verify Origin/Referer header

---

**Unknown:** OAuth state parameter **must be unpredictable** (not user ID)

**Impact:** CSRF in OAuth flow → attacker links their account to victim's

**Example:**
```javascript
// ❌ Bad: Predictable state
const state = userId; // 123

// ✅ Good: Random state
const state = crypto.randomBytes(32).toString('hex');
// Store in session: sessions[state] = { userId, redirectUri }
```

---

### 2.2 Data Leakage Risks

**Unknown:** Error messages leak **stack traces** in production

**Impact:** Attacker learns file paths, library versions, SQL queries

**Example:**
```javascript
// Error in production:
// "Error: ENOENT: no such file or directory, open '/home/app/secrets/.env'"
// Attacker now knows: Node.js app, secrets in .env, file path
```

**Mitigation:**
- `NODE_ENV=production` (hides stack traces)
- Generic error messages: "Internal server error"
- Log details to Sentry (not user)

---

**Unknown:** GraphQL **introspection** exposes entire schema

**Impact:** Attacker sees all queries, mutations, fields (even private)

**Example:**
```graphql
query {
  __schema {
    types {
      name
      fields { name }
    }
  }
}

# Returns: "adminDeleteUser" mutation (even if not public)
```

**Mitigation:**
- Disable introspection in production
- Use depth limiting (prevent deep nesting)
- Rate limit GraphQL queries

---

**Unknown:** CORS allows **credentials** by default (if Origin matches)

**Impact:** Attacker's site can make authenticated requests

**Example:**
```javascript
// Your API:
res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
res.setHeader('Access-Control-Allow-Credentials', 'true');

// Attacker's site:
fetch('https://yourapi.com/user/data', { credentials: 'include' })
// Success! Gets user's data
```

**Mitigation:**
- Whitelist specific origins (not wildcard)
- Don't reflect `req.headers.origin` directly
- Verify Origin in API logic

---

### 2.3 Infrastructure Risks

**Unknown:** Docker containers run as **root by default**

**Impact:** Container escape = full host access

**Example:**
```dockerfile
# ❌ Bad: Runs as root
FROM node:20
COPY . .
CMD ["node", "app.js"]

# ✅ Good: Runs as non-root
FROM node:20
USER node
COPY --chown=node:node . .
CMD ["node", "app.js"]
```

---

**Unknown:** Environment variables are **visible to child processes**

**Impact:** Secrets leak to subprocesses, logs, error messages

**Example:**
```javascript
// .env: DB_PASSWORD=secret123
process.env.DB_PASSWORD // "secret123"

// Spawn child process:
const child = spawn('npm', ['run', 'script']);
// Child can read DB_PASSWORD!
```

**Mitigation:**
- Use secrets manager (read on-demand)
- Clear env vars before spawning: `delete process.env.DB_PASSWORD`

---

## 🚨 Category 3: Performance Traps

### 3.1 Database Performance

**Unknown:** `SELECT *` is **slow** (even with indexes)

**Impact:** Fetching 50 columns when you need 3 = 10x slower

**Example:**
```sql
-- ❌ Slow: Fetches 50 columns, 5MB of data
SELECT * FROM users WHERE email = 'user@example.com';

-- ✅ Fast: Fetches 3 columns, 100KB of data
SELECT id, name, email FROM users WHERE email = 'user@example.com';
```

**Mitigation:**
- Always specify columns
- Use database views for common queries

---

**Unknown:** `LIKE '%pattern%'` can't use indexes

**Impact:** Full table scan on 10M rows = 30 seconds

**Example:**
```sql
-- ❌ Slow: Can't use index
SELECT * FROM products WHERE name LIKE '%shoe%';

-- ✅ Fast: Uses index
SELECT * FROM products WHERE name LIKE 'shoe%'; -- prefix only
```

**Mitigation:**
- Use full-text search (Elasticsearch, PostgreSQL FTS)
- Prefix searches only: `name LIKE 'shoe%'`

---

**Unknown:** `COUNT(*)` is **slow** on large tables (even with indexes)

**Impact:** Counting 10M rows = 5 seconds (every time)

**Example:**
```sql
-- ❌ Slow: Counts all 10M rows
SELECT COUNT(*) FROM orders;

-- ✅ Fast: Use approximate count
SELECT reltuples::BIGINT FROM pg_class WHERE relname = 'orders';
-- Returns: ~10M (estimate, instant)
```

---

### 3.2 Frontend Performance

**Unknown:** Large JSON parsing **blocks UI thread**

**Impact:** Parsing 10MB JSON = 500ms freeze

**Example:**
```javascript
// ❌ Bad: Blocks for 500ms
const data = JSON.parse(bigJsonString); // 10MB

// ✅ Good: Use streaming JSON parser
import { parse } from 'streaming-json-parse';
for await (const item of parse(stream)) {
  processItem(item); // Non-blocking
}
```

---

**Unknown:** Third-party scripts **block page load** (even with `async`)

**Impact:** Google Analytics taking 5 seconds = page blank for 5 seconds

**Example:**
```html
<!-- ❌ Bad: Blocks page load -->
<script src="https://www.google-analytics.com/analytics.js"></script>

<!-- ✅ Good: Defer until after load -->
<script>
  window.addEventListener('load', () => {
    const script = document.createElement('script');
    script.src = 'https://www.google-analytics.com/analytics.js';
    document.body.appendChild(script);
  });
</script>
```

---

**Unknown:** Inline CSS (in `<style>`) counts toward **HTML parse time**

**Impact:** 500KB of inline CSS = 100ms longer parse

**Example:**
```html
<!-- ❌ Slow: 500KB inline CSS -->
<style>
  /* 500KB of Tailwind CSS */
</style>

<!-- ✅ Fast: External stylesheet (parallel download) -->
<link rel="stylesheet" href="/styles.css">
```

---

## 🚨 Category 4: Cost Surprises

### 4.1 Cloud Costs

**Unknown:** Idle resources **cost money** (even when not used)

**Impact:** Forgot to delete test RDS instance = $200/month

**Example:**
- RDS db.t3.medium: $60/month (even if 0 queries)
- NAT Gateway: $32/month (even if 0 traffic)
- Elastic IP: $3.60/month (if not attached)

**Mitigation:**
- Tag all resources with `env:test`, auto-delete after 7 days
- Weekly cost review (alert if >10% increase)
- Use AWS Cost Anomaly Detection

---

**Unknown:** Data transfer between **availability zones** costs money

**Impact:** $0.01/GB adds up (10TB = $100)

**Example:**
```
App in us-east-1a fetches from RDS in us-east-1b
10TB data transfer = $100/month
```

**Mitigation:**
- Keep app and database in same AZ
- Use RDS read replicas in same AZ

---

**Unknown:** Vercel/Netlify charge for **bandwidth**, not storage

**Impact:** 1GB image downloaded 10,000 times = $0.10/GB x 10,000 = $1,000

**Example:**
- Host 1GB video on Vercel
- Goes viral (1M views)
- Cost: 1GB x 1M x $0.10/GB = $100,000 (!!)
```

**Mitigation:**
- Use dedicated CDN (Cloudflare, BunnyCDN)
- Compress videos (1GB → 100MB = 10x savings)

---

### 4.2 API Costs

**Unknown:** OpenAI API charges **per token**, including **input** tokens

**Impact:** Sending 10K token prompt = $0.30 (even if 1-token response)

**Example:**
```javascript
// Prompt: 10,000 tokens (long context)
// Response: 100 tokens
// Cost: (10,000 + 100) x $0.03/1K = $0.30
```

**Mitigation:**
- Summarize context (10K → 1K tokens)
- Cache responses (dedup prompts)
- Use cheaper models for simple tasks (GPT-3.5)

---

**Unknown:** Stripe charges **per API call** (not per transaction)

**Impact:** Polling balance every second = $0.01 x 86,400 = $864/day

**Example:**
```javascript
// ❌ Bad: Poll every second
setInterval(() => {
  stripe.balance.retrieve(); // $0.01 per call
}, 1000);
// Cost: $864/day
```

**Mitigation:**
- Use webhooks (free)
- Cache balance (update every 5 minutes)

---

## 🚨 Category 5: Compliance Gotchas

### 5.1 GDPR Traps

**Unknown:** Cookie consent must be **opt-in** (not opt-out)

**Impact:** Pre-checked boxes = illegal = €20M fine

**Example:**
```html
<!-- ❌ Illegal: Pre-checked -->
<input type="checkbox" checked> Accept cookies

<!-- ✅ Legal: User must explicitly check -->
<input type="checkbox"> Accept cookies
```

---

**Unknown:** GDPR applies to **any EU user** (not just EU companies)

**Impact:** US company serving EU users = GDPR compliance required

**Mitigation:**
- Block EU traffic (nuclear option)
- Implement GDPR compliance (data export, delete)

---

**Unknown:** "Legitimate interest" for cookies requires **documentation**

**Impact:** Can't just claim legitimate interest without proof

**Mitigation:**
- Use "Consent" for marketing cookies
- Use "Legitimate interest" only for essential (analytics, security)
- Document Legitimate Interest Assessment (LIA)

---

### 5.2 Accessibility Traps

**Unknown:** `aria-label` **overrides** visible text

**Impact:** Screen reader announces wrong thing

**Example:**
```html
<!-- Button says "Delete" but screen reader says "Remove" -->
<button aria-label="Remove">Delete</button>
```

**Mitigation:**
- Use `aria-label` only when no visible text
- Use `aria-labelledby` to reference visible element

---

**Unknown:** Keyboard navigation requires **visible focus indicator**

**Impact:** `outline: none` fails WCAG (users can't see where they are)

**Example:**
```css
/* ❌ Fails WCAG */
button:focus {
  outline: none;
}

/* ✅ Passes WCAG */
button:focus {
  outline: 2px solid blue;
  outline-offset: 2px;
}
```

---

## 🔍 How to Find Your Own Unknown Unknowns

### Method 1: Pre-Mortem (Assume Failure)
1. Assume project failed catastrophically
2. List all reasons it could fail
3. For each reason, ask: "What would have prevented this?"

**Example:**
- "Production went down for 6 hours" → Why? → "Database ran out of connections"
- Prevention: Connection pool monitoring

### Method 2: Red Team Exercise
1. Role-play as attacker/adversary
2. Try to break system (ethically)
3. Document what worked

**Example:**
- Try SQL injection in all inputs
- Try rate limit bypass (VPN, multiple accounts)
- Try CSRF on all POST endpoints

### Method 3: Incident Retros (Learn from Others)
1. Read public post-mortems (AWS, GitHub, Cloudflare)
2. Extract unknown unknowns
3. Check if you're vulnerable

**Resources:**
- https://github.com/danluu/post-mortems
- https://www.firecracker-microvm.io/blog/

### Method 4: Ask "What Could Go Wrong?"
For each decision, list failure modes:

**Example:**
- Decision: Use JWT for auth
- Failure modes:
  - Token stolen → Can't revoke
  - Token too large → Cookie limit
  - Token expired → User logged out mid-session

---

## 📋 Unknown Unknowns Checklist

### Before Planning
- [ ] Researched similar projects (what failed?)
- [ ] Identified critical dependencies (can they fail?)
- [ ] Documented assumptions (what are we assuming?)

### Before Development
- [ ] Reviewed API docs thoroughly (edge cases?)
- [ ] Tested third-party integrations (rate limits?)
- [ ] Checked browser compatibility (polyfills needed?)

### Before Deployment
- [ ] Load tested (how does it break?)
- [ ] Chaos tested (what if X fails?)
- [ ] Cost projected (worst-case bill?)

### After Deployment
- [ ] Monitored for 24 hours (unexpected behavior?)
- [ ] Reviewed logs (errors we didn't expect?)
- [ ] Surveyed users (confusion, bugs, edge cases?)

---

## 🎓 Learning Resources

### Books
- "The Design of Everyday Things" (Norman) — Hidden affordances
- "Thinking, Fast and Slow" (Kahneman) — Cognitive biases
- "Black Swan" (Taleb) — Unpredictable events

### Blogs
- Julia Evans (wizardzines.com) — Browser/network mysteries
- Dan Luu (danluu.com) — Performance surprises
- High Scalability (highscalability.com) — Architecture gotchas

---

## CLAIMS / COUNTEREXAMPLE / CONTRADICTIONS

**CLAIM:** This document identifies all unknown unknowns.

**COUNTEREXAMPLE:** By definition, unknown unknowns can't be fully enumerated. This is a snapshot of common ones (2025).

**MITIGATION:** Treat this as a starting point. Add your own discoveries. Review quarterly.

**CONTRADICTION:** "Unknown unknowns can't be known" vs "Here's a list of them" → Resolution: These *were* unknown unknowns (now known). But more exist.
