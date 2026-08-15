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

### 1. Backend Setup (`backend/`)

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
URL-Synchronized State (useSearchParams): Filter parameters are bound directly to Next.js URL query parameters for shareable deep links and browser history navigation.

Lightweight Global State (React Context API): Used React Context API for managing authentication state to eliminate boilerplate code and optimize bundle performance.

📷 Visual Evidence & Deployment
Live Application URL: Access Doctor Tracker Live
