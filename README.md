Doctor Tracker — Complete Project Documentation & Overview
🚀 1. Elevator Pitch
Doctor Tracker is a production-ready, full-stack administrative web application built to streamline healthcare management. It bridges the gap between hospital medical staff and patient records by providing administrators with a lightning-fast, highly secure portal to manage doctor directories, track associated patient admissions, monitor clinical metrics in real-time through visual analytics, and securely manage multi-admin access control.

🛠️ 2. Setup Guide
Follow these instructions to run the frontend and backend applications locally on your machine.

Prerequisites
Node.js (v18+ recommended)

MongoDB database instance (Local or MongoDB Atlas)

Backend Setup (backend/)
Clone the repository and navigate into the backend directory.

Create a .env file using the following template:

Code snippet
MONGODB_URI=mongodb+srv://doctor:_6anS-XNRzz7GN8@morning.c6gwelo.mongodb.net/?appName=Morning
JWT_SECRET=supersecretjwtsecretkeychangeinproduction123
JWT_EXPIRE=30d
NODE_ENV=development
Install dependencies and start the server:

Bash
npm install
npm run dev
Frontend Setup (frontend/)
Navigate into the frontend directory.

Create a .env.local file using the following template:

Code snippet
NEXT_PUBLIC_API_URL=https://doctor-tracker-backend-4gto.onrender.com/api/v1
Install dependencies and start the development server:

Bash
npm install
npm run dev
Open http://localhost:3000 in your browser to view the application.

🏗️ 3. System Architecture
Doctor Tracker follows a decoupled client-server architecture:

Frontend (Client): Built with Next.js (App Router), leveraging React Context API for global session and authentication management, and Next.js URL Search Parameters (useSearchParams) for clean, shareable filter and pagination states.

Backend (Server): Standalone Node.js/Express REST API communicating securely via JSON Web Tokens (JWT).

Data Flow & Service Interactions:

Client sends authenticated HTTP requests containing Bearer tokens to /api/v1 endpoints.

Protected middleware validates credentials against the Admin collection in MongoDB via Mongoose.

UI components reactively update state based on API query parameters (search queries, date ranges, and specialization filters).

💡 4. Technical Decisions Deep Dive
Next.js App Router & URL Search Parameters (useSearchParams):

Decision: Filter states (such as search queries, specialization filters, and date ranges) are synchronized directly with URL search parameters instead of being trapped solely in local component state.

Rationale: This ensures that search queries and pagination states are shareable via URL links, support native browser back/forward navigation seamlessly, and allow deep-linking directly into filtered administrative views.

React Context API vs. Heavy State Management Libraries:

Decision: Utilized React Context API for managing global admin session data instead of Redux or heavy third-party stores.

Rationale: Since the primary global application state is lightweight (handling authentication tokens, admin session status, and theme preferences), Context API eliminates unnecessary boilerplate overhead while keeping bundle size optimized.

📷 5. Visual Evidence & Live Deployment
Live Production Deployment URL: Doctor Tracker Live Login

Desktop View Layout
Features a fully responsive sidebar navigation, modern metric cards with Recharts analytics, and structured data tables equipped with instant search and multi-column filtering.

Mobile Responsive View
Optimized card-based layouts and collapsible mobile menus ensuring 100% responsiveness across mobile, tablet, and desktop viewports.
