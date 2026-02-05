/*
  # Initial Schema Setup for DashGen

  ## Overview
  This migration creates the core database structure for the DashGen enterprise dashboard platform.

  ## Tables Created
  
  ### 1. organizations
  - Multi-tenant workspace container
  - Columns: id, name, slug, owner_id, settings, created_at, updated_at
  
  ### 2. organization_members
  - User-to-organization mapping with roles
  - Columns: id, organization_id, user_id, role, created_at
  - Roles: owner, admin, member, viewer
  
  ### 3. data_sources
  - Imported data files and cloud connections
  - Columns: id, user_id, organization_id, name, type, file_type, source_url, raw_data, metadata, status, error_message, created_at, updated_at
  - Types: file, url, google_drive, onedrive, notion, database
  
  ### 4. dashboards
  - Dashboard containers
  - Columns: id, user_id, organization_id, title, description, is_public, share_token, layout, theme, created_at, updated_at
  
  ### 5. widgets
  - Individual chart/visualization components
  - Columns: id, dashboard_id, data_source_id, type, title, config, position, ai_insights, created_at, updated_at
  - Types: bar, line, pie, scatter, area, table, stat, text
  
  ### 6. ai_analyses
  - Cached AI-generated insights
  - Columns: id, data_source_id, analysis_type, result, created_at
  
  ## Security
  - Row-Level Security (RLS) enabled on all tables
  - Policies enforce user ownership and organization membership
  - Public dashboards accessible via share tokens
  
  ## Indexes
  - Optimized for common query patterns
  - Foreign key indexes for joins
  - User and organization filters
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  owner_id UUID NOT NULL,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_organizations_owner ON organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);

-- Organization members table
CREATE TABLE IF NOT EXISTS organization_members (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member' NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE(organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_member_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_member_org ON organization_members(organization_id);

-- Data sources table
CREATE TABLE IF NOT EXISTS data_sources (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('file', 'url', 'google_drive', 'onedrive', 'notion', 'database')),
  file_type TEXT,
  source_url TEXT,
  raw_data JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'processing', 'ready', 'error')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_data_source_user ON data_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_data_source_org ON data_sources(organization_id);
CREATE INDEX IF NOT EXISTS idx_data_source_status ON data_sources(status);

-- Dashboards table
CREATE TABLE IF NOT EXISTS dashboards (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE NOT NULL,
  share_token VARCHAR(64) UNIQUE,
  layout JSONB DEFAULT '{}'::jsonb,
  theme TEXT DEFAULT 'default',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dashboard_user ON dashboards(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_org ON dashboards(organization_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_share_token ON dashboards(share_token);

-- Widgets table
CREATE TABLE IF NOT EXISTS widgets (
  id SERIAL PRIMARY KEY,
  dashboard_id INTEGER NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
  data_source_id INTEGER REFERENCES data_sources(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('bar', 'line', 'pie', 'scatter', 'area', 'table', 'stat', 'text', 'composed')),
  title TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  position JSONB NOT NULL DEFAULT '{"x":0,"y":0,"w":1,"h":1}'::jsonb,
  ai_insights TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_widget_dashboard ON widgets(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_widget_data_source ON widgets(data_source_id);

-- AI analyses table
CREATE TABLE IF NOT EXISTS ai_analyses (
  id SERIAL PRIMARY KEY,
  data_source_id INTEGER NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('summary', 'trends', 'anomalies', 'recommendations')),
  result JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_analysis_source ON ai_analyses(data_source_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_type ON ai_analyses(analysis_type);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Users can view organizations they are members of"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organizations.id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create organizations"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their organizations"
  ON organizations FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can delete their organizations"
  ON organizations FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- RLS Policies for organization_members
CREATE POLICY "Users can view members of their organizations"
  ON organization_members FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Organization owners can manage members"
  ON organization_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = organization_members.organization_id
      AND organizations.owner_id = auth.uid()
    )
  );

-- RLS Policies for data_sources
CREATE POLICY "Users can view their own data sources"
  ON data_sources FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view organization data sources"
  ON data_sources FOR SELECT
  TO authenticated
  USING (
    organization_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = data_sources.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create data sources"
  ON data_sources FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own data sources"
  ON data_sources FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own data sources"
  ON data_sources FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for dashboards
CREATE POLICY "Users can view their own dashboards"
  ON dashboards FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view organization dashboards"
  ON dashboards FOR SELECT
  TO authenticated
  USING (
    organization_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = dashboards.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view public dashboards"
  ON dashboards FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

CREATE POLICY "Users can create dashboards"
  ON dashboards FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own dashboards"
  ON dashboards FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own dashboards"
  ON dashboards FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for widgets
CREATE POLICY "Users can view widgets of their dashboards"
  ON widgets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dashboards
      WHERE dashboards.id = widgets.dashboard_id
      AND dashboards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view widgets of organization dashboards"
  ON widgets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dashboards d
      JOIN organization_members om ON om.organization_id = d.organization_id
      WHERE d.id = widgets.dashboard_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view widgets of public dashboards"
  ON widgets FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dashboards
      WHERE dashboards.id = widgets.dashboard_id
      AND dashboards.is_public = true
    )
  );

CREATE POLICY "Users can manage widgets of their dashboards"
  ON widgets FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dashboards
      WHERE dashboards.id = widgets.dashboard_id
      AND dashboards.user_id = auth.uid()
    )
  );

-- RLS Policies for ai_analyses
CREATE POLICY "Users can view analyses of their data sources"
  ON ai_analyses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM data_sources
      WHERE data_sources.id = ai_analyses.data_source_id
      AND data_sources.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create analyses for their data sources"
  ON ai_analyses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM data_sources
      WHERE data_sources.id = ai_analyses.data_source_id
      AND data_sources.user_id = auth.uid()
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_organizations_updated_at') THEN
    CREATE TRIGGER update_organizations_updated_at
      BEFORE UPDATE ON organizations
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_data_sources_updated_at') THEN
    CREATE TRIGGER update_data_sources_updated_at
      BEFORE UPDATE ON data_sources
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_dashboards_updated_at') THEN
    CREATE TRIGGER update_dashboards_updated_at
      BEFORE UPDATE ON dashboards
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_widgets_updated_at') THEN
    CREATE TRIGGER update_widgets_updated_at
      BEFORE UPDATE ON widgets
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;