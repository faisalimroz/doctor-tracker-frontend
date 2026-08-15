# 🩺 Doctor Tracker — Admin Panel

**A production-ready, full-stack healthcare administrative management portal**

[View Live Demo](https://doctor-tracker-admin-panel.vercel.app/login) • [Architecture](#-system-architecture) • [Setup Guide](#-setup-guide) • [Technical Decisions](#-technical-decisions)

---

## 🚀 Elevator Pitch

**Doctor Tracker** is a secure, full-stack administrative web application built to streamline healthcare management operations. It bridges the gap between medical staff directories and patient records by empowering administrators with a lightning-fast portal to manage doctor profiles, track associated patient admissions, and monitor clinical metrics.

---

## 🏗️ System Architecture

Doctor Tracker implements a robust, decoupled client-server architecture:
* **Frontend:** Next.js (App Router) deployed on Vercel.
* **Backend:** Node.js & Express REST API deployed on Render, secured with JWT.
* **Database:** MongoDB Atlas via Mongoose.

---

## 🛠️ Setup Guide

### 1. Setup 

Navigate to your backend folder and install dependencies:

```bash
cd backend
npm install
PORT=5000
MONGODB_URI=mongodb+srv://doctor:_6anS-XNRzz7GN8@morning.c6gwelo.mongodb.net/?appName=Morning
JWT_SECRET=supersecretjwtsecretkeychangeinproduction123
JWT_EXPIRE=30d
NODE_ENV=development
**
### 2 . Frontend Setup (frontend/)
Navigate to your frontend folder and install dependencies:
cd frontend
npm install
Create a .env.local file in the root of the frontend directory:
NEXT_PUBLIC_API_URL=[https://doctor-tracker-backend-4gto.onrender.com/api/v1](https://doctor-tracker-backend-4gto.onrender.com/api/v1)
Start the Next.js development server:

npm run dev

Open http://localhost:3000 in your browser.

💡 Technical Decisions
💡 Technical Decisions
1. URL-Synchronized State (useSearchParams)
Decision: Filter parameters (search text, specialization filters, date ranges) are bound directly to Next.js URL query parameters rather than local component states.

Rationale: This enables shareable deep links, supports seamless browser back/forward navigation history, and preserves filter states on page reloads.

2. Lightweight Global State (React Context API)
Decision: Used React Context API for managing authentication state instead of bulky state containers like Redux.

Rationale: Since global state is primarily scoped to user authentication sessions and theme preferences, Context API eliminates boilerplate code while optimizing bundle performance.

📷 Visual Evidence & Deployment
Live Application URL: https://doctor-tracker-admin-panel.vercel.app/login
