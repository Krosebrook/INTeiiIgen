# Security Baseline — 5-Layer Castle Defense

## TL;DR
Every prompt inherits these security guardrails. Non-negotiable.

## The 5 Layers

### Layer 1: Guards (Input Validation)
- Whitelist validation (never blacklist)
- Type checking
- Length bounds
- Format validation
- Injection pattern blocking

### Layer 2: Walls (Structural Safety)
- Secure by default
- Principle of least privilege
- Fail closed
- Immutable audit logs
- No default passwords

### Layer 3: Moat (External Filtering)
- Never trust external data
- TLS 1.3 minimum
- Response size limits
- Timeout on all network calls
- Retry with exponential backoff

### Layer 4: Watchers (Monitoring)
- Log security events
- Structured logs (JSON)
- No PII in logs
- No secrets in logs
- Alert on anomalies

### Layer 5: Judgment (Human Oversight)
- High-risk ops require confirmation
- Delete data → Type "DELETE"
- Payment changes → Re-auth
- Admin privilege → Manual approval
