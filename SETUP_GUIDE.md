# DashGen Beta - Setup Guide

## Database Setup Complete ✅

Your Supabase database has been successfully configured with:
- 6 tables (organizations, organization_members, data_sources, dashboards, widgets, ai_analyses)
- Row-Level Security (RLS) enabled on all tables
- Comprehensive security policies
- Automated triggers for timestamps
- Optimized indexes for performance

## Environment Configuration

### Required Configuration

Update your `.env` file with the correct database password:

```bash
# Get your database password from Supabase Dashboard:
# Settings → Database → Connection String (Pooler)

DATABASE_URL=postgresql://postgres.lvhovjynobmpgucfnmiy:YOUR_PASSWORD_HERE@aws-0-us-west-1.pooler.supabase.com:5432/postgres
```

### Optional: AI Features

To enable AI-powered insights, add your OpenAI API key:

```bash
AI_INTEGRATIONS_OPENAI_API_KEY=sk-your-openai-key-here
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
```

## Authentication Setup

### Enable Email/Password Authentication

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable "Email" provider
3. Configure email templates (optional)
4. Set up email confirmations (optional, disabled by default)

### Configure Replit Auth (Alternative)

If using Replit Auth integration:

1. Already configured in `server/replit_integrations/auth/`
2. Works automatically in Replit environment
3. No additional setup required

## Running the Application

### Development Mode

```bash
npm run dev
```

Starts the development server at `http://localhost:5000`

### Production Mode

```bash
npm run build
npm start
```

## Database Schema Overview

### Tables

**organizations** - Multi-tenant workspaces
- Supports team collaboration
- Owner-based access control

**organization_members** - User-to-org relationships
- Roles: owner, admin, member, viewer
- Granular permission system

**data_sources** - Imported data files
- Supports: CSV, JSON, Excel, URLs, Cloud storage
- Status tracking: pending, processing, ready, error

**dashboards** - Dashboard containers
- Public/private sharing
- Unique share tokens
- Custom layouts and themes

**widgets** - Chart visualizations
- 9 chart types supported
- Configurable positions
- AI-generated insights

**ai_analyses** - Cached AI insights
- Analysis types: summary, trends, anomalies, recommendations
- Linked to data sources

### Security Features

**Row-Level Security (RLS)**
- All queries filtered by authenticated user
- Organization members can access shared data
- Public dashboards accessible via share tokens
- Complete data isolation between users

**Policies Enforced**
- Users can only see their own data
- Organization members can view shared workspace data
- Public dashboards accessible to anyone
- Owners have full control of their organizations

## Features Enabled

### Backend APIs ✅
- RESTful API with Express.js
- File upload (CSV, JSON, Excel)
- Cloud storage integration (Google Drive, OneDrive, Notion)
- AI-powered data analysis
- Real-time insights generation
- Organization management
- Dashboard CRUD operations

### Frontend ✅
- React 18 with TypeScript
- Animated landing page
- Dashboard management UI
- File upload with drag-and-drop
- Cloud storage connector
- Visual widget builder
- KPI cards with animations
- Smart AI assistant
- Template gallery
- Dark/light theme toggle
- Responsive design

### Security ✅
- Row-Level Security (RLS)
- Secure authentication
- Input validation with Zod
- XSS protection
- CSRF protection
- Rate limiting ready
- Audit logging ready

## Testing the Application

### 1. Create Test User

Sign up through the application:
- Visit landing page
- Click "Get Started"
- Create account with email/password

### 2. Upload Data

Test file upload:
```bash
# Navigate to /upload
# Drag and drop a CSV file
# Or import from URL
```

### 3. Create Dashboard

```bash
# Navigate to /new
# Set title and description
# Click "Create Dashboard"
```

### 4. Add Widgets

```bash
# Open dashboard
# Click "Visual Builder"
# Select chart type
# Configure data mapping
# Preview and save
```

## Production Deployment Checklist

- [ ] Update DATABASE_URL with production password
- [ ] Set SESSION_SECRET to secure random string
- [ ] Configure AI_INTEGRATIONS_OPENAI_API_KEY (optional)
- [ ] Enable email provider in Supabase
- [ ] Configure domain in Supabase settings
- [ ] Set up SSL certificates
- [ ] Configure CORS if needed
- [ ] Enable monitoring and logging
- [ ] Set up backup strategy
- [ ] Configure rate limiting
- [ ] Review RLS policies

## API Endpoints

### Authentication
- `GET /api/auth/user` - Get current user
- `GET /api/login` - Initiate login
- `GET /api/logout` - Log out

### Data Sources
- `GET /api/data-sources` - List data sources
- `POST /api/upload` - Upload files
- `POST /api/data-sources/url` - Import from URL
- `POST /api/data-sources/cloud` - Import from cloud
- `DELETE /api/data-sources/:id` - Delete data source
- `POST /api/data-sources/:id/analyze` - Generate AI insights

### Dashboards
- `GET /api/dashboards` - List dashboards
- `POST /api/dashboards` - Create dashboard
- `GET /api/dashboards/:id` - Get dashboard
- `PATCH /api/dashboards/:id` - Update dashboard
- `DELETE /api/dashboards/:id` - Delete dashboard
- `GET /api/share/:token` - Public dashboard view

### Widgets
- `GET /api/dashboards/:id/widgets` - List widgets
- `POST /api/widgets` - Create widget
- `PATCH /api/widgets/:id` - Update widget
- `DELETE /api/widgets/:id` - Delete widget

### Organizations
- `GET /api/organizations` - List organizations
- `POST /api/organizations` - Create organization
- `GET /api/organizations/:id` - Get organization
- `PATCH /api/organizations/:id` - Update organization
- `DELETE /api/organizations/:id` - Delete organization
- `GET /api/organizations/:id/members` - List members
- `POST /api/organizations/:id/members` - Add member

### Cloud Storage
- `GET /api/cloud/status` - Check cloud connections
- `GET /api/cloud/:provider/files` - List files

### AI Features
- `POST /api/assistant/chat` - Chat with AI assistant

## Troubleshooting

### Database Connection Issues

If you see "getaddrinfo ENOTFOUND", check:
1. DATABASE_URL is correctly formatted
2. Database password is correct
3. Network allows outbound connections to Supabase

### Authentication Issues

If login doesn't work:
1. Check VITE_SUPABASE_URL matches your project
2. Verify VITE_SUPABASE_ANON_KEY is correct
3. Ensure email provider is enabled in Supabase

### Build Errors

If build fails:
```bash
# Clean node_modules and rebuild
rm -rf node_modules
npm install
npm run build
```

## Support

For issues or questions:
- Check documentation in `/attached_assets/`
- Review API documentation
- Check Supabase logs for database errors
- Review browser console for frontend errors

## Version Information

- **Version**: 1.0.0-beta
- **Database Schema**: v2 (UUID support)
- **Build Date**: January 2026
- **Node Version**: 20.x+
- **PostgreSQL**: 14+

---

**Status**: Ready for Beta Testing 🚀

All core features are implemented and tested. The application is ready for production deployment once environment variables are configured.
