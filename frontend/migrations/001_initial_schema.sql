-- DormFix — Initial Database Schema
-- Run this against your PostgreSQL database to create all tables.
--
-- Usage:
--   psql -d dormfix -f migrations/001_initial_schema.sql

-- ═══════════════════════════════════════════════════════════════════════
-- Extension for UUID generation
-- ═══════════════════════════════════════════════════════════════════════
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ═══════════════════════════════════════════════════════════════════════
-- hostels
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS hostels (
  hostel_id   TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  hostel_name TEXT NOT NULL,
  location    TEXT NOT NULL
);

-- ═══════════════════════════════════════════════════════════════════════
-- departments
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS departments (
  dept_id   TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  dept_name TEXT NOT NULL UNIQUE
);

-- ═══════════════════════════════════════════════════════════════════════
-- urgency_levels
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS urgency_levels (
  urgency_id       TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  label            TEXT NOT NULL UNIQUE,
  escalation_hours INT  NOT NULL DEFAULT 48
);

-- ═══════════════════════════════════════════════════════════════════════
-- users
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS users (
  user_id       TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'student'
                CHECK (role IN ('student', 'warden', 'admin', 'maintenance')),
  hostel_id     TEXT REFERENCES hostels(hostel_id) ON DELETE SET NULL,
  room_number   TEXT,
  tenure_since  TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- ═══════════════════════════════════════════════════════════════════════
-- complaints
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS complaints (
  complaint_id        TEXT      PRIMARY KEY DEFAULT gen_random_uuid()::text,
  filed_by_id         TEXT      NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  hostel_id           TEXT      NOT NULL REFERENCES hostels(hostel_id) ON DELETE CASCADE,
  room_number         TEXT      NOT NULL,
  title               TEXT      NOT NULL,
  description         TEXT      NOT NULL DEFAULT '',
  urgency_id          TEXT      NOT NULL REFERENCES urgency_levels(urgency_id),
  status              TEXT      NOT NULL DEFAULT 'filed'
                      CHECK (status IN ('filed', 'in_progress', 'resolved', 'escalated', 'closed')),
  is_escalated        BOOLEAN   NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  escalation_deadline TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '48 hours'),
  resolved_at         TIMESTAMPTZ,
  assigned_dept_id    TEXT      REFERENCES departments(dept_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_complaints_filed_by  ON complaints (filed_by_id);
CREATE INDEX IF NOT EXISTS idx_complaints_hostel    ON complaints (hostel_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status    ON complaints (status);

-- ═══════════════════════════════════════════════════════════════════════
-- complaint_media
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS complaint_media (
  media_id     TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  complaint_id TEXT NOT NULL REFERENCES complaints(complaint_id) ON DELETE CASCADE,
  media_url    TEXT NOT NULL,
  media_type   TEXT NOT NULL DEFAULT 'image',
  upload_stage TEXT NOT NULL DEFAULT 'initial'
);

CREATE INDEX IF NOT EXISTS idx_media_complaint ON complaint_media (complaint_id);

-- ═══════════════════════════════════════════════════════════════════════
-- complaint_history
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS complaint_history (
  history_id   TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  complaint_id TEXT        NOT NULL REFERENCES complaints(complaint_id) ON DELETE CASCADE,
  user_id      TEXT        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  action       TEXT        NOT NULL,
  remarks      TEXT        NOT NULL DEFAULT '',
  timestamp    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_history_complaint ON complaint_history (complaint_id);

-- ═══════════════════════════════════════════════════════════════════════
-- Seed data
-- ═══════════════════════════════════════════════════════════════════════

-- Default urgency levels
INSERT INTO urgency_levels (urgency_id, label, escalation_hours) VALUES
  ('urg-low',      'Low',      72),
  ('urg-medium',   'Medium',   48),
  ('urg-high',     'High',     24),
  ('urg-critical', 'Critical', 6)
ON CONFLICT (label) DO NOTHING;

-- Default departments
INSERT INTO departments (dept_id, dept_name) VALUES
  ('dept-plumbing',    'Plumbing'),
  ('dept-electrical',  'Electrical'),
  ('dept-carpentry',   'Carpentry'),
  ('dept-housekeeping','Housekeeping'),
  ('dept-it',          'IT Support'),
  ('dept-general',     'General Maintenance')
ON CONFLICT (dept_name) DO NOTHING;
