# DormFix - Hostel Complaint Management System

DormFix is a modern, full-stack application designed to streamline the process of filing, tracking, and resolving university hostel complaints. It features an innovative "shared institutional clock system" to ensure accountability and real-time tracking for students, wardens, and maintenance staff.

## 🏗️ Architecture

- **Frontend:** Next.js (App Router), React 19, Tailwind CSS, Lucide Icons
- **Backend:** Pure Node.js with Express.js
- **Authentication:** JSON Web Tokens (JWT) and Role-Based Access Control (RBAC)
- **Data Storage:** In-Memory (Temporary mockup, ready to be connected to PostgreSQL)

## ✨ Key Features

- **Secure Authentication:** Full JWT-based login and signup flows securely stored in the client.
- **Personalized Student Dashboard:** Students can view their assigned room/hostel, submit new complaints, and track the status of existing ones.
- **Additional Modules:** Includes dedicated (currently placeholder) pages for "All Submissions", "Notifications", and "Settings" routing perfectly within the app layout.
- **Shared Clock System:** A timeline visualizer that shows exactly how long a complaint has been with a specific department (e.g., Warden, Engineering Cell).
- **Role-Based APIs:** Backend routes protected by middleware ensuring that students can only view their own complaints, while staff and admins have global access.
- **Premium Glassmorphism UI:** A highly aesthetic, responsive user interface built with customized Tailwind classes.

## 🚀 Getting Started

To run DormFix locally, you will need to start both the backend server and the frontend application.

### 1. Start the Express Backend
The pure Node.js backend handles APIs, Authentication, and Business Logic.
```bash
cd backend
npm install
npm run dev
```
*The backend will start on `http://localhost:5000`*

### 2. Start the Next.js Frontend
The frontend serves the modern user interface.
```bash
# From the frontend directory (where this README is located)
npm install
npm run dev
```
*The frontend will start on `http://localhost:3000`*

Open [http://localhost:3000](http://localhost:3000) in your browser, create an account, and experience the DormFix dashboard!
