# Auth-API
Authentication API

# server

> REST APIs build with express.js

# Getting Started

- Node.js
- npm (Node Package Manager)
- Postman (for API testing)
- mongodb

# Install the required dependencies.

npm i express nodemon mongoose jsonwebtoken joi express-session cookie-parser dotenv-safe cors 

# Add module type in package.json for development:

"type": "module"

# Update the scripts section in env package.json for development:

"scripts": {
"start": "nodemon server.js"
},

# Running the Project

`npm start`

# start the server

Run `http://localhost:4000/` in postman in postman

# API Documentation :-

# Base URL :-

`http://localhost:4000/`

# Endpoints

## 1. Registration
Handles user registration with different validation methods.

- **Method:** `POST`
- **URLs:**
  - `/api/auth/registration/custom-validation`
  - `/api/auth/registration/joi-validation`
  - `/api/auth/registration/db-validation`

---

## 2. Login
Handles user login with different validation methods.

- **Method:** `POST`
- **URLs:**
  - `/api/auth/login/custom-validation`
  - `/api/auth/login/joi-validation`

---

## 3. Logout
Logs out the user and invalidates their session.

- **Method:** `POST`
- **URL:** `/api/auth/logout`

---

## 4. Private Route
Access restricted content available only to authenticated users.

- **Method:** `GET`
- **URL:** `/api/page/private`

---

## 5. Renew Access Token
Generates a new access token using a valid refresh token.

- **Method:** `POST`
- **URL:** `/api/auth/refresh`
