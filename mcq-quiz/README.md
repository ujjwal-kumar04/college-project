# McqQuiz - MCQ Exam Portal

A full-stack MERN application for conducting MCQ exams with separate dashboards for teachers and students.

## Features

### Teacher Dashboard
- Create and manage exams with MCQ questions
- Generate unique exam keys for student access
- View student results and rankings
- Recent exam management (stack-based ordering)
- Subject-wise exam organization
- Profile management

### Student Dashboard
- Take exams using unique keys
- View exam results immediately after submission
- Profile management
- Exam history

### General Features
- Dark mode toggle (LeetCode-inspired design)
- JWT-based authentication
- Role-based access control
- Responsive design

## Tech Stack
- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT

## Project Structure
```
mcq-quiz/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── context/
    │   └── utils/
    └── public/
```

## Installation

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Environment Variables
Create `.env` file in backend directory:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5001
```