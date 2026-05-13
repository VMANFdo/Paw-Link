-- ================================================================
-- PawLink — Migration 002: Organizations Schema
-- ================================================================
-- Run AFTER 001 (schema.sql / initial schema).
-- This migration replaces the simple 'shelters' table concept
-- with a full, production-ready organization management system.
--
-- Run via MySQL CLI:
--   mysql -u root -p pawlink_db < 002_organizations_schema.sql
-- ================================================================

USE pawlink_db;

-- ================================================================
-- TABLE: organizations
-- WHY: Replaces the basic 'shelters' table with a rich profile
--      that supports the full approval workflow, capacity tracking,
--      GPS location, and document verification.
-- ================================================================
CREATE TABLE IF NOT EXISTS organizations (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id             INT UNSIGNED NOT NULL UNIQUE,
    name                VARCHAR(150) NOT NULL,
    description         TEXT DEFAULT NULL,
    contact_number      VARCHAR(20) DEFAULT NULL,
    logo_url            VARCHAR(255) DEFAULT NULL,
    address             TEXT DEFAULT NULL,
    latitude            DECIMAL(10, 8) DEFAULT NULL,
    longitude           DECIMAL(11, 8) DEFAULT NULL,
    website             VARCHAR(255) DEFAULT NULL,
    max_capacity        INT UNSIGNED NOT NULL DEFAULT 0,
    current_occupancy   INT UNSIGNED NOT NULL DEFAULT 0,
    -- Approval workflow states:
    --   pending         → just registered, awaiting admin review
    --   approved        → active, visible publicly
    --   rejected        → denied, cannot operate
    --   more_docs_needed → admin requested more information
    status              ENUM('pending', 'approved', 'rejected', 'more_docs_needed') NOT NULL DEFAULT 'pending',
    verified            TINYINT(1) NOT NULL DEFAULT 0,
    rejection_reason    TEXT DEFAULT NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status    (status),
    INDEX idx_location  (latitude, longitude)
);

-- ================================================================
-- TABLE: organization_animal_types
-- WHY: Many-to-many — each org can accept multiple animal types.
--      Using a separate table keeps 'organizations' clean and
--      makes filtering by animal type efficient.
-- ================================================================
CREATE TABLE IF NOT EXISTS organization_animal_types (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id INT UNSIGNED NOT NULL,
    animal_type     ENUM('dog', 'cat', 'bird', 'rabbit', 'other') NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    UNIQUE KEY uq_org_animal_type (organization_id, animal_type)
);

-- ================================================================
-- TABLE: organization_documents
-- WHY: Stores verification documents uploaded by orgs during
--      registration or in response to an admin's request for more
--      documents. Keeping these separate lets admins review them
--      independently without cluttering the main org profile.
-- ================================================================
CREATE TABLE IF NOT EXISTS organization_documents (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id INT UNSIGNED NOT NULL,
    document_url    VARCHAR(255) NOT NULL,
    document_type   VARCHAR(100) DEFAULT NULL,  -- e.g. 'registration_cert', 'tax_doc', 'photo'
    uploaded_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    INDEX idx_org (organization_id)
);

-- ================================================================
-- TABLE: organization_gallery
-- WHY: Shelter photo galleries shown on public profiles.
--      Separated from documents so UI can render them distinctly.
-- ================================================================
CREATE TABLE IF NOT EXISTS organization_gallery (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id INT UNSIGNED NOT NULL,
    image_url       VARCHAR(255) NOT NULL,
    caption         VARCHAR(255) DEFAULT NULL,
    uploaded_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    INDEX idx_org (organization_id)
);

-- ================================================================
-- TABLE: handover_requests
-- WHY: When a user finds a stray animal and wants to hand it over
--      to a shelter. The shelter reviews and accepts/rejects.
--      Linking to 'animals' is optional — the user may not have
--      already created a post for the found animal.
-- ================================================================
CREATE TABLE IF NOT EXISTS handover_requests (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         INT UNSIGNED NOT NULL,          -- the person who found the animal
    organization_id INT UNSIGNED NOT NULL,          -- target shelter
    animal_id       INT UNSIGNED DEFAULT NULL,      -- optional: links to an existing animal post
    description     TEXT NOT NULL,                  -- description of the animal
    pickup_address  TEXT DEFAULT NULL,
    animal_type     ENUM('dog', 'cat', 'bird', 'rabbit', 'other') DEFAULT NULL,
    -- Status flow:  pending → accepted | rejected → completed
    status          ENUM('pending', 'accepted', 'rejected', 'completed') NOT NULL DEFAULT 'pending',
    org_notes       TEXT DEFAULT NULL,              -- shelter's response/reason
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)         REFERENCES users(id)          ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id)  ON DELETE CASCADE,
    FOREIGN KEY (animal_id)       REFERENCES animals(id)        ON DELETE SET NULL,
    INDEX idx_user   (user_id),
    INDEX idx_org    (organization_id),
    INDEX idx_status (status)
);

-- ================================================================
-- MODIFY: animals table
-- WHY: Link animals to organizations (not just the old shelters).
--      When an org posts an animal, organization_id is populated
--      and the animal's lat/lng is auto-filled from the org's
--      registered coordinates by the backend.
-- ================================================================
ALTER TABLE animals
    ADD COLUMN IF NOT EXISTS organization_id INT UNSIGNED DEFAULT NULL AFTER posted_by,
    ADD FOREIGN KEY fk_animal_org (organization_id) REFERENCES organizations(id) ON DELETE SET NULL;

-- ================================================================
-- SEED: Sample approved organization for development testing
-- ================================================================
INSERT IGNORE INTO organizations (
    user_id, name, description, contact_number, address,
    latitude, longitude, max_capacity, current_occupancy,
    status, verified
)
SELECT
    u.id,
    'Happy Paws Rescue Foundation',
    'A registered non-profit shelter caring for stray and injured animals in Colombo.',
    '+94 11 234 5678',
    '123 Animal Rescue Lane, Colombo 07',
    6.9271,
    79.8612,
    50,
    2,
    'approved',
    1
FROM users u WHERE u.email = 'shelter@pawlink.com';

-- Assign accepted animal types for the seeded org
INSERT IGNORE INTO organization_animal_types (organization_id, animal_type)
SELECT o.id, t.animal_type
FROM organizations o
JOIN (
    SELECT 'dog'   AS animal_type UNION ALL
    SELECT 'cat'   AS animal_type UNION ALL
    SELECT 'rabbit' AS animal_type
) t ON TRUE
WHERE o.name = 'Happy Paws Rescue Foundation';
