<div align="center">

# 🩺 Doctor Tracker — Admin Panel

<p align="center">
  <b>A production-ready, full-stack healthcare administrative management portal</b>
</p>

<p align="center">
  <a href="https://doctor-tracker-admin-panel.vercel.app/login"><b>View Live Demo</b></a> •
  <a href="#-system-architecture"><b>Architecture</b></a> •
  <a href="#-setup-guide"><b>Setup Guide</b></a> •
  <a href="#-technical-decisions"><b>Technical Decisions</b></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Node.js-Express-green?style=flat-square&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-brightgreen?style=flat-square&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-UI-blue?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Deployment-Vercel%20%2F%20Render-orange?style=flat-square" alt="Deployment" />
</p>

</div>

---

## 🚀 Elevator Pitch

**Doctor Tracker** is a secure, full-stack administrative web application built to streamline healthcare management operations. It bridges the gap between medical staff directories and patient records by empowering administrators with a lightning-fast portal to:
* Manage doctor profiles, specializations, and hospital affiliations.
* Track associated patient admissions, diagnoses, and medical histories.
* Monitor clinical metrics and distribution analytics in real-time via interactive charts.
* Securely control multi-admin access authentication.

---

## 🏗️ System Architecture

Doctor Tracker implements a robust, decoupled **client-server architecture**:


[ Next.js Client (Vercel) ] --( HTTPS / Bearer Token )--> [ Express REST API (Render) ] --> [ MongoDB Atlas ]
* **Frontend:** Built with **Next.js (App Router)**, utilizing the **React Context API** for global session management and **URL Search Parameters (`useSearchParams`)** for clean, shareable filter/pagination states.
* **Backend:** Standalone **Node.js & Express** REST API protected by JSON Web Token (JWT) authentication middleware.
* **Database:** **MongoDB** optimized with Mongoose schemas and strict indexing on searchable fields (`name`, `specialization`, `admissionDate`).

---

## 🛠️ Setup Guide

Follow these steps to run the application locally on your machine.

### Prerequisites
* **Node.js** (v18+ recommended)
* **MongoDB** database instance (Local or MongoDB Atlas)

---

### 1. Backend Setup (`backend/`)

1. Navigate to your backend folder and install dependencies:
   ```bash
   cd backend
   npm install
Create a .env file in the root of the backend directory:Code snippetPORT=5000
MONGODB_URI=mongodb+srv://doctor:_6anS-XNRzz7GN8@morning.c6gwelo.mongodb.net/?appName=Morning
JWT_SECRET=supersecretjwtsecretkeychangeinproduction123
JWT_EXPIRE=30d
NODE_ENV=development
Start the development server:Bashnpm run dev
2. Frontend Setup (frontend/)Navigate to your frontend folder and install dependencies:Bashcd frontend
npm install
Create a .env.local file in the root of the frontend directory:Code snippetNEXT_PUBLIC_API_URL=[https://doctor-tracker-backend-4gto.onrender.com/api/v1](https://doctor-tracker-backend-4gto.onrender.com/api/v1)
Start the Next.js development server:Bashnpm run dev
Open http://localhost:3000 in your browser.💡 Technical Decisions1. URL-Synchronized State (useSearchParams)Decision: Filter parameters (search text, specialization filters, date ranges) are bound directly to Next.js URL query parameters rather than local component states.Rationale: This enables shareable deep links, supports seamless browser back/forward navigation history, and preserves filter states on page reloads.2. Lightweight Global State (React Context API)Decision: Used React Context API for managing authentication state instead of bulky state containers like Redux.Rationale: Since global state is primarily scoped to user authentication sessions and theme preferences, Context API eliminates boilerplate code while optimizing bundle performance.📷 Visual Evidence & DeploymentLive Application URL: Access Doctor Tracker LiveDesktop ViewMobile ViewResponsive sidebar navigation, real-time Recharts analytics dashboards, and structured high-density data tables.Adaptive card layouts and collapsible mobile menus ensuring full mobile responsiveness.
