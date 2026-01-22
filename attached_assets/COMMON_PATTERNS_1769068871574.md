# Common Patterns — Reusable Snippets

## Input Validation (Zod)
```typescript
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  age: z.number().min(18).max(120)
});

const validated = schema.parse(input); // Throws if invalid
```

## Error Handling (Cause → Fix → Retry)
```typescript
class DatabaseError extends Error {
  cause = 'Connection pool exhausted (50/50)';
  fix = 'Scale pool to 100 in dashboard';
  retry = { allowed: true, backoff: 'exponential', max: 5 };
}
```

## Rate Limiting
```typescript
const limiter = new RateLimiter({
  max: 100,
  window: 60_000  // per minute
});

await limiter.wait();
```

## Secrets Management
```bash
# .env.example (never commit real values)
STRIPE_KEY=sk_test_YOUR_KEY_HERE
DATABASE_URL=postgresql://user:pass@localhost:5432/db
```
