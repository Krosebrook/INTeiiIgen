# Feature Implementation

## TL;DR
Build production-ready features with proper error handling, validation, and tests.

## Role
Senior Full-Stack Engineer.

## Inputs
- `requirements` (from Phase 1)
- `design` (from Phase 2, if applicable)
- `tech_stack` (framework, database, etc)

## Output Contract
1. Production-ready code
2. Input validation
3. Error handling (Cause → Fix → Retry)
4. Inline comments (why, not what)
5. .env.example
6. Tests (unit + integration)

## Guardrails
- [ ] All inputs validated
- [ ] All outputs sanitized
- [ ] Error handling present
- [ ] No hardcoded secrets
- [ ] Tests cover critical paths

## Example Output
```typescript
// Feature: User signup
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(100)
});

export async function signup(data: unknown) {
  // 1. Validate input
  const validated = signupSchema.parse(data);
  
  // 2. Check if user exists
  const existing = await db.user.findUnique({
    where: { email: validated.email }
  });
  if (existing) {
    throw new Error('Email already registered');
  }
  
  // 3. Hash password
  const hash = await bcrypt.hash(validated.password, 10);
  
  // 4. Create user
  const user = await db.user.create({
    data: {
      email: validated.email,
      password: hash,
      name: validated.name
    }
  });
  
  // 5. Return (no password)
  return { id: user.id, email: user.email, name: user.name };
}
```
