# Deployment Execution

## TL;DR
Deploy safely with verification steps.

## Inputs
- `deployment_target` (staging/production)
- `strategy` (blue-green/rolling/canary)

## Output Contract
1. Deployment commands
2. Verification steps
3. Rollback commands
4. Monitoring dashboards

## Example (Vercel)
```bash
# Deploy to preview
vercel deploy

# Verify preview
curl https://preview-url.vercel.app/health

# Promote to production
vercel --prod

# Monitor for 10 min
# If error rate >1%, rollback
vercel rollback
```
