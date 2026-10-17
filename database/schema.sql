CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS users (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), full_name VARCHAR(120) NOT NULL,
 email VARCHAR(254) NOT NULL UNIQUE, password_hash TEXT NOT NULL,
 role VARCHAR(20) NOT NULL DEFAULT 'EMPLOYEE' CHECK (role IN ('ADMIN','EMPLOYEE')),
 phone VARCHAR(30), is_active BOOLEAN NOT NULL DEFAULT TRUE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS leads (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), full_name VARCHAR(160) NOT NULL,
 phone VARCHAR(30), email VARCHAR(254), company VARCHAR(160), source VARCHAR(80) NOT NULL DEFAULT 'Other',
 status VARCHAR(20) NOT NULL DEFAULT 'New' CHECK (status IN ('New','Contacted','Qualified','Converted','Lost')),
 assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
 follow_up_date DATE, notes TEXT, converted_client_id UUID,
 created_by UUID REFERENCES users(id) ON DELETE SET NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS clients (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), lead_id UUID UNIQUE REFERENCES leads(id) ON DELETE SET NULL,
 full_name VARCHAR(160) NOT NULL, email VARCHAR(254), phone VARCHAR(30), company VARCHAR(160),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_converted_client_id_fkey;
ALTER TABLE leads ADD CONSTRAINT leads_converted_client_id_fkey FOREIGN KEY (converted_client_id) REFERENCES clients(id) ON DELETE SET NULL;
CREATE TABLE IF NOT EXISTS follow_ups (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
 user_id UUID REFERENCES users(id) ON DELETE SET NULL, due_at TIMESTAMPTZ NOT NULL,
 note TEXT NOT NULL, completed BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS lead_notes (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
 user_id UUID REFERENCES users(id) ON DELETE SET NULL, body TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS activity_logs (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
 user_id UUID REFERENCES users(id) ON DELETE SET NULL, action VARCHAR(120) NOT NULL,
 details JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
CREATE INDEX IF NOT EXISTS leads_assigned_idx ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS leads_created_idx ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS leads_name_idx ON leads USING gin(to_tsvector('simple', full_name || ' ' || COALESCE(company,'')));
CREATE INDEX IF NOT EXISTS followups_due_idx ON follow_ups(due_at) WHERE completed = FALSE;
CREATE INDEX IF NOT EXISTS notes_lead_idx ON lead_notes(lead_id, created_at DESC);
