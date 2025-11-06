# Copilot Instructions

This document provides guidance for AI agents to effectively contribute to the McqQuiz project.

## Architecture Overview

This is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) application. The codebase is organized into two main parts:

-   `frontend/`: A React application that serves as the user interface.
-   `backend/`: A Node.js/Express.js application that provides a REST API.

The frontend and backend are separate projects, each with its own `package.json` and dependencies. They communicate via API calls.

### Key Directories

-   `mcq-quiz/backend/models/`: Defines the Mongoose schemas for `User`, `Exam`, and `Result`. This is the source of truth for the data structures.
-   `mcq-quiz/backend/routes/`: Contains the API endpoint definitions. Each file corresponds to a resource (e.g., `exams.js`, `users.js`).
-   `mcq-quiz/frontend/src/pages/`: Contains the main pages of the application, which correspond to different routes in the UI.
-   `mcq-quiz/frontend/src/context/`: Manages global state for authentication (`AuthContext.js`) and theme (`ThemeContext.js`) using the React Context API.

## Developer Workflow

### Running the Application

To run the application for development, you need to start both the backend and frontend servers.

**Backend:**

```bash
cd mcq-quiz/backend
npm install
npm run dev
```

**Frontend:**

```bash
cd mcq-quiz/frontend
npm install
npm start
```

Convenience scripts like `start-dev.ps1` and `start-servers.ps1` are available in the `mcq-quiz` directory to streamline this process.

### Environment Variables

The backend requires a `.env` file in the `mcq-quiz/backend` directory with the following variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5001
```

## Project-Specific Conventions

### Authentication

-   Authentication is handled using JSON Web Tokens (JWT).
-   The `mcq-quiz/backend/middleware/auth.js` file contains the middleware that protects routes by verifying the JWT.
-   On the frontend, `mcq-quiz/frontend/src/context/AuthContext.js` manages the user's authentication state and token.

### Role-Based Access Control

The application has two user roles: "Teacher" and "Student". The backend API endpoints have role-specific access control. For example, only teachers can create exams. When adding new features, be mindful of these roles.

### State Management

The frontend uses React's Context API for global state management.

-   For authentication-related state, use `AuthContext`.
-   For theme-related state (like dark mode), use `ThemeContext`.

For local component state, use React's `useState` and `useEffect` hooks.

### API Communication

The frontend communicates with the backend using `fetch` requests. API calls are typically made from within the `pages` components or custom hooks. When adding new API calls, follow the existing patterns. The base URL for the API is typically configured in a central place.
