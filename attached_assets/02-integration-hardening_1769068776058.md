# Integration Hardening — Secure APIs

## TL;DR
Secure OAuth/API integrations.

## Inputs
- `integration_type` (OAuth/API key/webhook)
- `provider` (Stripe/GitHub/etc)

## Output Contract
1. Secrets handling rules
2. Rate limit + retry behavior
3. Idempotency guidance
4. Audit logging

## Example: Stripe
```typescript
// Webhook verification
const sig = req.headers.get('stripe-signature');
const event = stripe.webhooks.constructEvent(
  body,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
);

// Idempotency
const idempotencyKey = `charge_${orderId}`;
await stripe.charges.create({
  amount: 5000
}, { idempotencyKey });
```
