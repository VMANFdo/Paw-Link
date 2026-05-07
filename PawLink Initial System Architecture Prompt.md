# PawLink System Architecture Prompt (For Antigravity AI)

You are a senior full-stack software architect and engineer.

I am building a modern full-stack web application called **PawLink** — a Stray Animal Rescue & Adoption Platform.

The goal of this system is to help people post stray dogs/cats they find and allow others to adopt, rescue, or help those animals through a centralized platform.

I already initialized the frontend using:

```bash
npm create vite@latest pawlink -- --template react
```

I want you to generate the COMPLETE scalable project architecture and starter implementation for this system using the following technologies.

# Tech Stack

## Frontend

* React + Vite
* React Router DOM
* Axios
* Context API
* Tailwind CSS

## Backend

* Node.js
* Express.js

## Database

* MySQL (XAMPP localhost during development)

## Authentication

* JWT Authentication
* bcrypt password hashing

## Maps

* Leaflet + OpenStreetMap

## File Uploads

* Multer
* Local uploads folder

## API Testing

* Postman

# Main System Modules

## 1. Authentication Module

Features:

* User registration
* Login
* Logout
* JWT token generation
* Password hashing
* Role-based access

Roles:

* Public User
* Shelter/Rescue Organization
* Admin

## 2. Animal Posting Module

Users can:

* Add stray animal posts
* Upload multiple images
* Add:

  * animal type
  * breed
  * age
  * gender
  * health condition
  * rescue urgency
  * location coordinates
  * description

Status:

* Available
* Adopted
* Rescued
* Pending

## 3. Adoption Module

Features:

* Send adoption requests
* Approve/reject requests
* Adoption history

## 4. Rescue Request Module

Features:

* Mark urgent rescue cases
* Track rescue status
* Notify shelters

## 5. Map Module

Features:

* Display stray animals on map
* Show nearby rescue cases
* Filter by area

Use:

* Leaflet
* OpenStreetMap

## 6. Shelter Management Module

Shelters can:

* Manage rescue cases
* Manage listed animals
* Update medical details

## 7. Admin Panel

Features:

* Manage users
* Moderate posts
* Remove fake/spam content
* Dashboard statistics

## 8. Messaging/Contact Module

Features:

* Contact poster
* Basic chat architecture
* Inquiry system

# What I Need You To Generate

Generate a PROFESSIONAL scalable architecture with clean separation of concerns.

# Frontend Requirements

Generate:

* Complete frontend folder structure
* Pages structure
* Components structure
* Context structure
* Services/API structure
* Route protection system
* Reusable UI component architecture
* Tailwind setup
* Axios base configuration
* Authentication flow
* Dashboard layouts

Use:

* Functional components
* React hooks
* Clean responsive UI architecture

Suggested pages:

* Home
* Browse Animals
* Animal Details
* Add Animal
* Login
* Register
* Dashboard
* Shelter Dashboard
* Admin Dashboard
* Profile
* Rescue Requests
* Adoption Requests
* Map View
* About
* Contact

# Backend Requirements

Generate:

* Complete backend folder structure
* MVC architecture
* REST API architecture
* Express middleware structure
* JWT middleware
* Error handling middleware
* Multer configuration
* MySQL connection setup
* Environment configuration

Use:

* Controllers
* Routes
* Services
* Models
* Middleware
* Utilities

# Database Requirements

Generate:

* Full MySQL schema
* Relationships
* Foreign keys
* Normalized structure

Tables should include:

* users
* animals
* animal_images
* adoption_requests
* rescue_requests
* shelters
* messages
* notifications
* reports
* medical_records

# API Requirements

Generate REST API endpoints for:

* Authentication
* Animal CRUD
* Adoption requests
* Rescue requests
* File uploads
* User management
* Messaging
* Notifications

Use RESTful naming conventions.

# Security Requirements

Implement:

* JWT authentication
* Password hashing
* Protected routes
* Role-based authorization
* Input validation
* File upload validation
* SQL injection prevention
* CORS setup

# Additional Requirements

I want:

* Scalable architecture
* Beginner-friendly structure
* Industry-standard best practices
* Modular architecture
* Clean code principles
* Mobile responsive frontend
* Reusable components
* Future-ready structure for deployment

# Important

Do NOT generate everything in one huge file.

Instead:

1. First generate the complete folder structure
2. Then explain architecture
3. Then generate backend setup
4. Then frontend setup
5. Then database schema
6. Then authentication flow
7. Then API structure
8. Then protected route system
9. Then file upload system
10. Then map integration structure

Make the architecture production-level but simple enough for a university student to understand and continue developing.

Also explain WHY each folder/module exists.
