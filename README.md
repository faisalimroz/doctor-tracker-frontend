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
