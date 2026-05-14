-- Migration: Add appeal fields to users and organizations
-- Path: server/migrations/20240514_add_appeal_fields.sql

ALTER TABLE users ADD COLUMN ban_reason TEXT AFTER is_active;
ALTER TABLE users ADD COLUMN appeal_message TEXT AFTER ban_reason;

ALTER TABLE organizations ADD COLUMN appeal_message TEXT AFTER rejection_reason;
