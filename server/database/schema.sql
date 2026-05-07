-- ================================================================
-- PawLink — Full MySQL Database Schema
-- ================================================================
-- Run this file in phpMyAdmin or via MySQL CLI:
--   mysql -u root -p < schema.sql
-- ================================================================

CREATE DATABASE IF NOT EXISTS pawlink_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pawlink_db;

-- ================================================================
-- TABLE: users
-- WHY: Stores all user accounts (public, shelter staff, admin)
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
-- TABLE: shelters
-- WHY: Shelter/rescue org extended profile (linked to a user)
-- ================================================================
CREATE TABLE IF NOT EXISTS shelters (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         INT UNSIGNED NOT NULL UNIQUE,
    org_name        VARCHAR(150) NOT NULL,
    address         TEXT DEFAULT NULL,
    latitude        DECIMAL(10, 8) DEFAULT NULL,
    longitude       DECIMAL(11, 8) DEFAULT NULL,
    website         VARCHAR(255) DEFAULT NULL,
    verified        TINYINT(1) NOT NULL DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ================================================================
-- TABLE: animals
-- WHY: Core entity — stores every stray animal post
-- ================================================================

CREATE TABLE IF NOT EXISTS animals (
    id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    type             ENUM('dog', 'cat', 'other') NOT NULL,
    breed            VARCHAR(100) DEFAULT NULL,
    age              VARCHAR(50) DEFAULT NULL,           -- e.g., "~2 years", "puppy"
    gender           ENUM('male', 'female', 'unknown') NOT NULL DEFAULT 'unknown',
    health_condition TEXT DEFAULT NULL,
    rescue_urgency   ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
    latitude         DECIMAL(10, 8) NOT NULL,
    longitude        DECIMAL(11, 8) NOT NULL,
    description      TEXT DEFAULT NULL,
    status           ENUM('available', 'adopted', 'rescued', 'pending') NOT NULL DEFAULT 'available',
    posted_by        INT UNSIGNED NOT NULL,
    shelter_id       INT UNSIGNED DEFAULT NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (posted_by)   REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (shelter_id)  REFERENCES shelters(id) ON DELETE SET NULL,
    INDEX idx_type     (type),
    INDEX idx_status   (status),
    INDEX idx_urgency  (rescue_urgency),
    INDEX idx_location (latitude, longitude)
);

-- ================================================================
-- TABLE: animal_images
-- WHY: One animal can have multiple images (1-to-many)
-- ================================================================

CREATE TABLE IF NOT EXISTS animal_images (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    animal_id  INT UNSIGNED NOT NULL,
    image_url  VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE,
    INDEX idx_animal (animal_id)
);

-- ================================================================
-- TABLE: adoption_requests
-- WHY: Tracks requests from users who want to adopt an animal
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
    FOREIGN KEY (requester_id) REFERENCES users(id)   ON DELETE CASCADE,
    UNIQUE KEY uq_adoption (animal_id, requester_id),  -- one request per animal per user
    INDEX idx_animal    (animal_id),
    INDEX idx_requester (requester_id)
);

-- ================================================================
-- TABLE: rescue_requests
-- WHY: Flags an animal as needing urgent rescue
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
    FOREIGN KEY (reported_by) REFERENCES users(id)   ON DELETE CASCADE,
    INDEX idx_animal (animal_id),
    INDEX idx_status (status)
);

-- ================================================================
-- TABLE: messages
-- WHY: REST-based messaging between users (inbox/sent)
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
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_receiver (receiver_id),
    INDEX idx_sender   (sender_id)
);

-- ================================================================
-- TABLE: notifications
-- WHY: System-generated alerts (adoption approved, rescue update etc.)
-- ================================================================

CREATE TABLE IF NOT EXISTS notifications (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id    INT UNSIGNED NOT NULL,
    type       VARCHAR(50) NOT NULL,        -- e.g., 'adoption_approved', 'rescue_update'
    message    TEXT NOT NULL,
    is_read    TINYINT(1) NOT NULL DEFAULT 0,
    related_id INT UNSIGNED DEFAULT NULL,  -- ID of the related entity (optional)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user   (user_id),
    INDEX idx_unread (user_id, is_read)
);

-- ================================================================
-- TABLE: reports
-- WHY: Users can flag spam/fake animal posts for admin review
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
    FOREIGN KEY (animal_id)   REFERENCES animals(id)  ON DELETE CASCADE,
    INDEX idx_status (status)
);

-- ================================================================
-- TABLE: medical_records
-- WHY: Shelters can log vaccination, treatment, vet notes per animal
-- ================================================================

CREATE TABLE IF NOT EXISTS medical_records (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    animal_id   INT UNSIGNED NOT NULL,
    recorded_by INT UNSIGNED NOT NULL,
    record_type VARCHAR(100) NOT NULL,   -- e.g., 'vaccination', 'treatment', 'vet_check'
    description TEXT NOT NULL,
    record_date DATE NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (animal_id)   REFERENCES animals(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id)   ON DELETE CASCADE,
    INDEX idx_animal (animal_id)
);

-- ================================================================
-- SEED DATA: Default Users
-- Passwords: 
-- Admin:   Admin@123
-- User:    User@123
-- Shelter: Shelter@123
-- ================================================================

-- 1. Admin User
INSERT IGNORE INTO users (name, email, password, role) VALUES
('PawLink Admin', 'admin@pawlink.com', '$2a$12$K.sQpRtYwB9NPDJwOZWmqevIuTsvyl/hzQzpSvO3N5mBxy8h8FluC', 'admin');

-- 2. Public Person
INSERT IGNORE INTO users (name, email, password, role) VALUES
('John Doe', 'user@pawlink.com', '$2a$12$LFGIvP3wnvSFj4DB2wpnROu3EF3lUAHo3xxWE/Nxymx63rb28L.Ui', 'person');

-- 3. Shelter Organization
INSERT IGNORE INTO users (name, email, password, role) VALUES
('Happy Paws Rescue', 'shelter@pawlink.com', '$2a$12$3Gm.idPBi8O9zefP5ta9v..fs59wjMlBcBehee5W4Op3kZLevk.xG', 'organization');

-- Insert the shelter profile details (linked dynamically to the shelter user)
INSERT IGNORE INTO shelters (user_id, org_name, address, verified) 
SELECT id, 'Happy Paws Rescue Foundation', '123 Animal Rescue Lane, Colombo', 1 
FROM users WHERE email = 'shelter@pawlink.com';

-- ================================================================
-- SEED DATA: Default Animal Posts
-- ================================================================

-- Animal 1: Posted by Public User (Colombo location)
INSERT INTO animals (type, breed, age, gender, health_condition, rescue_urgency, latitude, longitude, description, status, posted_by)
SELECT 'dog', 'Golden Retriever Mix', '~2 years', 'male', 'Healthy, slightly malnourished', 'medium', 6.9271, 79.8612, 'Found wandering near the park. Very friendly but hungry. Looking for a good home.', 'available', id
FROM users WHERE email = 'user@pawlink.com';

-- Animal 2: Posted by Shelter (Nugegoda location)
INSERT INTO animals (type, breed, age, gender, health_condition, rescue_urgency, latitude, longitude, description, status, posted_by, shelter_id)
SELECT 'cat', 'Persian Mix', '6 months', 'female', 'Recovering from minor leg injury', 'low', 6.8649, 79.8997, 'Rescued from a drain. Getting better now at the shelter.', 'available', u.id, s.id
FROM users u JOIN shelters s ON u.id = s.user_id WHERE u.email = 'shelter@pawlink.com';

-- Animal 3: Urgent Rescue case posted by Public User (Dehiwala location)
INSERT INTO animals (type, breed, age, gender, health_condition, rescue_urgency, latitude, longitude, description, status, posted_by)
SELECT 'dog', 'Local Street Dog', 'Unknown', 'unknown', 'Injured leg, bleeding', 'critical', 6.8511, 79.8632, 'Hit by a car near the main junction. Needs urgent medical attention!', 'pending', id
FROM users WHERE email = 'user@pawlink.com';
