# Environment Variables Example

Copy this to a `.env` file for local development. In Replit, use the Secrets tool.

```bash
# Database
DATABASE_URL="postgres://user:pass@host:port/db"

# Security
SESSION_SECRET="your-very-secure-secret-key"

# Integrations (Optional)
# GOOGLE_DRIVE_CLIENT_ID="..."
# NOTION_API_KEY="..."
# OPENAI_API_KEY="..."
```

## Variable Descriptions

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Key used for signing session cookies |
| `OPENAI_API_KEY` | No | Required for AI dashboard insights |
