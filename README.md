# 🐾 PawLink — Stray Animal Rescue & Adoption Platform

PawLink is a modern, full-stack platform designed to bridge the gap between stray animals, rescuers, and loving homes. It provides a real-time interactive map, verified shelter profiles, and a streamlined adoption process to ensure every animal gets a second chance.

---

## 🚀 Key Features

### 1. **Stray Animal Reporting**
*   **Location-Based Posts:** Pin the exact GPS coordinates of a stray animal.
*   **Multi-Image Upload:** Upload up to 5 photos per animal for better identification.
*   **Urgency Levels:** Mark rescues as *Low*, *Medium*, *High*, or *Critical*.

### 2. **Interactive Rescue Map**
*   **Leaflet Integration:** View all active rescues and adoptable pets on a high-performance interactive map.
*   **Smart Popups:** Quick access to animal details and status directly from the map.

### 3. **Adoption & Rescue Modules**
*   **Adoption Workflow:** Submit adoption requests and track their status (*Pending*, *Approved*, *Rejected*).
*   **Rescue Tracking:** Shelter organizations can take ownership of rescue cases and log progress.
*   **Medical Records:** Shelters can maintain vaccination and health logs for every animal.

### 4. **User & Shelter Management**
*   **Role-Based Access (RBAC):** Distinct permissions for *Public Users*, *Shelters*, and *Administrators*.
*   **Verified Profiles:** Shelters get a verification badge and a dedicated public profile page.

### 5. **Messaging & Notifications**
*   **Direct Messaging:** REST-based inbox for communication between rescuers and adopters.
*   **Real-time Feedback:** Toast notifications and success/error handling across all forms.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Leaflet |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL (XAMPP / phpMyAdmin) |
| **Auth** | JWT (JSON Web Tokens), Bcrypt.js |
| **File Handling** | Multer (Local Storage) |
| **Validation** | Express-Validator, Zod-style logic |

---

## 📂 Project Structure

```text
PawLink/
├── pawlink/                # Frontend (Vite + React)
│   ├── src/
│   │   ├── components/     # Reusable UI (Cards, Navbar, Map)
│   │   ├── context/        # Auth & Global State
│   │   ├── pages/          # Full Page Views (Home, Browse, Map)
│   │   ├── services/       # Axios API Layers
│   │   └── routes/         # App Routing & Protected Guards
│   └── tailwind.config.js  # Brand Palette (Orange/Teal)
│
└── server/                 # Backend (Express MVC)
    ├── config/             # DB & Multer configs
    ├── controllers/        # Business Logic
    ├── database/           # MySQL Schema & Seeds
    ├── middleware/         # Auth, RBAC, Error Handling
    └── routes/             # API Endpoints
```

---

## ⚙️ Installation & Setup

### 1. Database Setup (XAMPP)
1.  Start **Apache** and **MySQL** in your XAMPP Control Panel.
2.  Go to `http://localhost/phpmyadmin`.
3.  Create a new database named `pawlink_db`.
4.  Import the file: `server/database/schema.sql`.

### 2. Backend Setup
1.  Navigate to the `server/` directory.
2.  Install dependencies: `npm install`.
3.  Create a `.env` file (copy from `.env.example`).
4.  Start the server: `npm start` (or `node server.js`).
    *   *The API will run on http://localhost:5000*

### 3. Frontend Setup
1.  Navigate to the `pawlink/` directory.
2.  Install dependencies: `npm install`.
3.  Start the dev server: `npm run dev`.
    *   *The app will run on http://localhost:3000*

---

## 🔑 Seed Credentials

### Test Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@pawlink.com` | `Admin@123` |
| **Public User** | `user@pawlink.com` | `User@123` |
| **Shelter/Rescue**| `shelter@pawlink.com` | `Shelter@123` |

---

*Built with ❤️ for animals everywhere.*
