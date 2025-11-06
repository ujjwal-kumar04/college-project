# McqQuiz - MCQ Exam Portal

This is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) application that serves as an MCQ exam portal.

## Features

*   User authentication (registration and login) for students and teachers.
*   Role-based access control:
    *   Teachers can create, view, and manage exams.
    *   Students can view and take exams.
*   Exams consist of multiple-choice questions with a single correct answer.
*   Exam results are stored and can be viewed by students.
*   Detailed results page showing the student's answers and the correct answers.

## Tech Stack

*   **Frontend:** React.js, Tailwind CSS, React Context API
*   **Backend:** Node.js, Express.js, MongoDB (with Mongoose)
*   **Authentication:** JSON Web Tokens (JWT)

## Getting Started

### Prerequisites

*   Node.js and npm
*   MongoDB

### Installation and Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/aadityaraj912739/onlineSubjectQuiz.git
    cd onlineSubjectQuiz
    ```

2.  **Install dependencies for the root, backend, and frontend:**
    ```bash
    npm run install-deps
    ```

3.  **Create a `.env` file in the `backend` directory with the following variables:**
    ```
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    PORT=5001
    ```

4.  **Run the application:**
    ```bash
    npm run dev
    ```
    This will start both the backend and frontend servers concurrently.

    *   Backend server will be running on `http://localhost:5001`
    *   Frontend server will be running on `http://localhost:3000`
