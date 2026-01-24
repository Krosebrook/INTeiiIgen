# How to Deploy DashGen

This guide covers deploying DashGen to production on Replit.

---

## Prerequisites

1. Working local development version
2. Database with schema pushed
3. All required secrets configured

---

## Step 1: Verify Local Build

Run the development server and ensure everything works:
```bash
npm run dev
```

Check the health endpoint:
```bash
curl http://localhost:5000/api/health
```

---

## Step 2: Configure Secrets

Ensure these secrets are set in Replit's Secrets panel:

| Secret | Required | Description |
|--------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Session signing key (32+ chars) |
| `OPENAI_API_KEY` | No | For AI insights feature |

**Note:** Cloud storage OAuth tokens are managed via Replit integrations.

---

## Step 3: Deploy

1. Open the **Deployments** tab in Replit
2. Select **Autoscale** deployment type
3. Configure:
   - **Build command:** `npm run build`
   - **Run command:** `npm start`
   - **Health check:** `/api/health`
4. Click **Deploy**

---

## Step 4: Verify Production

After deployment completes:

1. Visit your `.replit.app` domain
2. Test login flow
3. Check API health: `https://yourapp.replit.app/api/health`
4. Verify PWA installs correctly

---

## Custom Domain (Optional)

1. Go to **Deployments** → **Domains**
2. Add your custom domain
3. Configure DNS with provided values
4. SSL certificate is provisioned automatically

---

## Rollback

If issues occur:
1. Open **Deployments** → **History**
2. Click on a previous successful deployment
3. Select **Rollback**

---

## Monitoring

- **Health endpoint:** `GET /api/health` returns uptime and version
- **Logs:** View in Replit's Console tab
- **Database:** Access via Replit's Database tab

---

## Related
- [ADR-003: Deployment Strategy](../decisions/ADR-003-deployment.md)
- [Environment Variables](../reference/env-vars.md)
