# Maturity Levels — SPIKE vs PROD vs SKEPTIC

## TL;DR
Choose the right level before each prompt: Fast prototype ([SPIKE]), production-ready ([PROD]), or extra scrutiny ([SKEPTIC]).

## The Three Levels

### [SPIKE] — Fast Prototyping
**Speed:** 🚀 Fast (2-4x faster than PROD)
**Security:** Input validation only
**Testing:** Mocks, no E2E
**Use When:** POC, throwaway code, exploring ideas
**Never Use For:** Production, customer data, payments

**Guardrails:**
- ✅ Input validation (whitelist)
- ✅ Basic error handling
- ❌ No comprehensive security
- ❌ No E2E tests
- ❌ No performance optimization

### [PROD] — Production-Ready
**Speed:** 🐢 Thorough (baseline speed)
**Security:** Full OWASP Top 10
**Testing:** Unit + Integration + E2E
**Use When:** Production features, customer-facing, default choice
**Always Use For:** User data, payments, auth

**Guardrails:**
- ✅ Input validation (whitelist)
- ✅ Output sanitization
- ✅ Error handling (Cause → Fix → Retry)
- ✅ Rate limiting
- ✅ Audit logging
- ✅ Comprehensive tests

### [SKEPTIC] — Extra Scrutiny
**Speed:** 🔬 Deep (2-3x slower than PROD)
**Security:** Full + questioning + threat modeling
**Testing:** Full + edge cases + chaos
**Use When:** Critical systems, high-risk, compliance
**Always Use For:** Admin functions, financial transactions, PHI/PII

**Guardrails:**
- ✅ All PROD guardrails
- ✅ Threat modeling (STRIDE)
- ✅ Penetration testing
- ✅ Chaos engineering
- ✅ Formal verification
- ✅ Multiple reviews

## Decision Tree

```
Is this production code? ──NO──> [SPIKE]
  │
  YES
  │
Is it critical/high-risk? ──NO──> [PROD]
  │
  YES
  │
  └─> [SKEPTIC]
```

## Examples

```bash
# SPIKE: Quick prototype
[SPIKE] Use 03-development/01-feature-implementation.md
Input: Build a calculator widget

# PROD: Production feature
[PROD] Use 03-development/01-feature-implementation.md
Input: Build checkout flow with Stripe

# SKEPTIC: Critical security
[SKEPTIC] Use 08-security/02-integration-hardening.md
Input: Harden OAuth integration handling user PII
```

## Upgrade Path

```
[SPIKE] → Code review → Add tests → Add security → [PROD]
[PROD] → Threat model → Pen test → Formal review → [SKEPTIC]
```

**Never:** Deploy [SPIKE] code to production without upgrade
