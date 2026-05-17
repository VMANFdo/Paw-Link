ALTER TABLE users ADD COLUMN is_permanently_banned BOOLEAN DEFAULT FALSE;
ALTER TABLE organizations ADD COLUMN is_permanently_banned BOOLEAN DEFAULT FALSE;
