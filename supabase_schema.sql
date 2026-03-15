-- ============================================================
-- Account Management System – Supabase Schema
-- Run this in your Supabase SQL Editor (supabase.com)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- USERS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,
  balance     NUMERIC(12, 2) NOT NULL DEFAULT 10000.00,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TRANSACTIONS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount            NUMERIC(12, 2) NOT NULL,
  transaction_type  TEXT NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
  balance_after     NUMERIC(12, 2),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_transactions_sender   ON transactions(sender_id);
CREATE INDEX IF NOT EXISTS idx_transactions_receiver ON transactions(receiver_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created  ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email           ON users(email);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- Since we handle auth via JWT in our backend,
-- we disable RLS so the backend (anon key) can
-- read/write freely. For production, use a
-- service_role key instead.
-- ─────────────────────────────────────────────
ALTER TABLE users        DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
