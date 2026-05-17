-- Migration: Add city to organizations table
ALTER TABLE organizations ADD COLUMN city VARCHAR(100) DEFAULT NULL AFTER longitude;
