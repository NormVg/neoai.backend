-- Add subscription plan columns to users (for Dodo Payments).
-- Run once: psql $DATABASE_URL -f server/database/migrations/0001_add_user_plan.sql
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "plan" text DEFAULT 'free' NOT NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "plan_expires_at" timestamp;
