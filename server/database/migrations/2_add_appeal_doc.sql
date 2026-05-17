-- Migration: Add appeal document fields
ALTER TABLE users ADD COLUMN appeal_document_url VARCHAR(255) AFTER appeal_message;
ALTER TABLE organizations ADD COLUMN appeal_document_url VARCHAR(255) AFTER appeal_message;
