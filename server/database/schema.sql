-- ================================================================
-- PawLink — Full Consolidated MySQL Database Schema
-- ================================================================
-- This file combines the initial schema and all subsequent 
-- migrations into a single source of truth.
-- ================================================================

CREATE DATABASE IF NOT EXISTS pawlink_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pawlink_db;

-- ================================================================
-- TABLE: users
-- ================================================================
CREATE TABLE IF NOT EXISTS users (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    role            ENUM('person', 'organization', 'admin') NOT NULL DEFAULT 'person',
    profile_picture VARCHAR(255) DEFAULT NULL,
    bio             TEXT DEFAULT NULL,
    phone           VARCHAR(20) DEFAULT NULL,
    is_active       TINYINT(1) NOT NULL DEFAULT 1,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role  (role)
);

-- ================================================================
-- TABLE: organizations
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
-- ================================================================
CREATE TABLE IF NOT EXISTS organization_documents (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id INT UNSIGNED NOT NULL,
    document_url    VARCHAR(255) NOT NULL,
    document_type   VARCHAR(100) DEFAULT NULL,
    uploaded_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- ================================================================
-- TABLE: organization_gallery
-- ================================================================
CREATE TABLE IF NOT EXISTS organization_gallery (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id INT UNSIGNED NOT NULL,
    image_url       VARCHAR(255) NOT NULL,
    caption         VARCHAR(255) DEFAULT NULL,
    uploaded_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- ================================================================
-- TABLE: animals
-- ================================================================
CREATE TABLE IF NOT EXISTS animals (
    id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    type             ENUM('dog', 'cat', 'other') NOT NULL,
    breed            VARCHAR(100) DEFAULT NULL,
    age              VARCHAR(50) DEFAULT NULL,
    gender           ENUM('male', 'female', 'unknown') NOT NULL DEFAULT 'unknown',
    health_condition TEXT DEFAULT NULL,
    rescue_urgency   ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
    latitude         DECIMAL(10, 8) NOT NULL,
    longitude        DECIMAL(11, 8) NOT NULL,
    city             VARCHAR(100) DEFAULT NULL,
    description      TEXT DEFAULT NULL,
    status           ENUM('available', 'adopted', 'rescued', 'pending') NOT NULL DEFAULT 'available',
    posted_by        INT UNSIGNED NOT NULL,
    organization_id  INT UNSIGNED DEFAULT NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (posted_by)       REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL,
    INDEX idx_type     (type),
    INDEX idx_status   (status),
    INDEX idx_urgency  (rescue_urgency),
    INDEX idx_location (latitude, longitude)
);

-- ================================================================
-- TABLE: animal_images
-- ================================================================
CREATE TABLE IF NOT EXISTS animal_images (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    animal_id  INT UNSIGNED NOT NULL,
    image_url  VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE
);

-- ================================================================
-- TABLE: adoption_requests
-- ================================================================
CREATE TABLE IF NOT EXISTS adoption_requests (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    animal_id     INT UNSIGNED NOT NULL,
    requester_id  INT UNSIGNED NOT NULL,
    message       TEXT DEFAULT NULL,
    status        ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (animal_id)    REFERENCES animals(id) ON DELETE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES users(id)   ON DELETE CASCADE
);

-- ================================================================
-- TABLE: rescue_requests
-- ================================================================
CREATE TABLE IF NOT EXISTS rescue_requests (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    animal_id   INT UNSIGNED NOT NULL,
    reported_by INT UNSIGNED NOT NULL,
    notes       TEXT DEFAULT NULL,
    status      ENUM('pending', 'in_progress', 'resolved') NOT NULL DEFAULT 'pending',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (animal_id)   REFERENCES animals(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_by) REFERENCES users(id)   ON DELETE CASCADE
);

-- ================================================================
-- TABLE: handover_requests
-- ================================================================
CREATE TABLE IF NOT EXISTS handover_requests (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         INT UNSIGNED NOT NULL,
    organization_id INT UNSIGNED NOT NULL,
    animal_id       INT UNSIGNED DEFAULT NULL,
    description     TEXT NOT NULL,
    pickup_address  TEXT DEFAULT NULL,
    animal_type     ENUM('dog', 'cat', 'bird', 'rabbit', 'other') DEFAULT NULL,
    status          ENUM('pending', 'accepted', 'rejected', 'completed') NOT NULL DEFAULT 'pending',
    org_notes       TEXT DEFAULT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)         REFERENCES users(id)          ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id)  ON DELETE CASCADE,
    FOREIGN KEY (animal_id)       REFERENCES animals(id)        ON DELETE SET NULL
);

-- ================================================================
-- TABLE: messages
-- ================================================================
CREATE TABLE IF NOT EXISTS messages (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sender_id   INT UNSIGNED NOT NULL,
    receiver_id INT UNSIGNED NOT NULL,
    subject     VARCHAR(255) DEFAULT NULL,
    body        TEXT NOT NULL,
    is_read     TINYINT(1) NOT NULL DEFAULT 0,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id)   REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ================================================================
-- TABLE: notifications
-- ================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id    INT UNSIGNED NOT NULL,
    type       VARCHAR(50) NOT NULL,
    message    TEXT NOT NULL,
    is_read    TINYINT(1) NOT NULL DEFAULT 0,
    related_id INT UNSIGNED DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ================================================================
-- TABLE: reports
-- ================================================================
CREATE TABLE IF NOT EXISTS reports (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    reporter_id INT UNSIGNED NOT NULL,
    animal_id   INT UNSIGNED NOT NULL,
    reason      VARCHAR(255) NOT NULL,
    details     TEXT DEFAULT NULL,
    status      ENUM('pending', 'reviewed', 'dismissed') NOT NULL DEFAULT 'pending',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (animal_id)   REFERENCES animals(id)  ON DELETE CASCADE
);

-- ================================================================
-- TABLE: medical_records
-- ================================================================
CREATE TABLE IF NOT EXISTS medical_records (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    animal_id   INT UNSIGNED NOT NULL,
    recorded_by INT UNSIGNED NOT NULL,
    record_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    record_date DATE NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (animal_id)   REFERENCES animals(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id)   ON DELETE CASCADE
);

-- ================================================================
-- SEED DATA
-- ================================================================

-- 1. Default Users (Pass: Admin@123, User@123, Shelter@123)
INSERT IGNORE INTO users (name, email, password, role) VALUES
('PawLink Admin', 'admin@pawlink.com', '$2a$12$K.sQpRtYwB9NPDJwOZWmqevIuTsvyl/hzQzpSvO3N5mBxy8h8FluC', 'admin'),
('John Doe', 'user@pawlink.com', '$2a$12$LFGIvP3wnvSFj4DB2wpnROu3EF3lUAHo3xxWE/Nxymx63rb28L.Ui', 'person'),
('Happy Paws Rescue', 'shelter@pawlink.com', '$2a$12$3Gm.idPBi8O9zefP5ta9v..fs59wjMlBcBehee5W4Op3kZLevk.xG', 'organization'),
('Animal Lovers Shelter', 'animalshelter@pawlink.com', '$2a$12$3Gm.idPBi8O9zefP5ta9v..fs59wjMlBcBehee5W4Op3kZLevk.xG', 'organization'),
('Safe Haven Rescues', 'safehaven@pawlink.com', '$2a$12$3Gm.idPBi8O9zefP5ta9v..fs59wjMlBcBehee5W4Op3kZLevk.xG', 'organization'),
('Paws & Claws Sanctuary', 'pawsandclaws@pawlink.com', '$2a$12$3Gm.idPBi8O9zefP5ta9v..fs59wjMlBcBehee5W4Op3kZLevk.xG', 'organization');

-- 2. Organizations
INSERT IGNORE INTO organizations (user_id, name, address, latitude, longitude, status, verified, max_capacity, current_occupancy) 
SELECT id, 'Happy Paws Rescue Foundation', '123 Animal Rescue Lane, Colombo', 6.9271, 79.8612, 'approved', 1, 50, 2 FROM users WHERE email = 'shelter@pawlink.com';

INSERT IGNORE INTO organizations (user_id, name, address, latitude, longitude, status, verified, max_capacity, current_occupancy) 
SELECT id, 'Animal Lovers Shelter', '45 Temple Road, Kandy', 7.2906, 80.6337, 'approved', 1, 30, 5 FROM users WHERE email = 'animalshelter@pawlink.com';

INSERT IGNORE INTO organizations (user_id, name, address, latitude, longitude, status, verified, max_capacity, current_occupancy) 
SELECT id, 'Safe Haven Rescues', '88 Galle Road, Mount Lavinia', 6.8301, 79.8675, 'approved', 1, 40, 12 FROM users WHERE email = 'safehaven@pawlink.com';

INSERT IGNORE INTO organizations (user_id, name, address, latitude, longitude, status, verified, max_capacity, current_occupancy) 
SELECT id, 'Paws & Claws Sanctuary', '12 Negombo Rd, Negombo', 7.2089, 79.8351, 'approved', 1, 60, 20 FROM users WHERE email = 'pawsandclaws@pawlink.com';

-- 3. Animal Types for Organizations
INSERT IGNORE INTO organization_animal_types (organization_id, animal_type)
SELECT id, 'dog' FROM organizations WHERE name = 'Happy Paws Rescue Foundation' UNION ALL
SELECT id, 'cat' FROM organizations WHERE name = 'Happy Paws Rescue Foundation';

INSERT IGNORE INTO organization_animal_types (organization_id, animal_type)
SELECT id, 'dog' FROM organizations WHERE name = 'Animal Lovers Shelter' UNION ALL
SELECT id, 'cat' FROM organizations WHERE name = 'Animal Lovers Shelter';

-- 4. Sample Animals
INSERT INTO animals (type, breed, age, gender, health_condition, rescue_urgency, latitude, longitude, description, status, posted_by)
SELECT 'dog', 'Golden Retriever Mix', '~2 years', 'male', 'Healthy', 'medium', 6.9271, 79.8612, 'Friendly street dog.', 'available', id FROM users WHERE email = 'user@pawlink.com';

INSERT INTO animals (type, breed, age, gender, health_condition, rescue_urgency, latitude, longitude, description, status, posted_by, organization_id)
SELECT 'cat', 'Persian Mix', '6 months', 'female', 'Healthy', 'low', 6.8649, 79.8997, 'Sanctuary cat.', 'available', u.id, o.id FROM users u JOIN organizations o ON u.id = o.user_id WHERE u.email = 'shelter@pawlink.com';
