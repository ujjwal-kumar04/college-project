# MCQ Quiz Portal

एक complete MCQ Quiz Portal जो teachers और students के लिए बनाया गया है। यह React frontend और Express.js backend के साथ बना है।

## Features

- 🎯 Teacher Dashboard - Exam create करने के लिए
- 📝 Student Dashboard - Exam देने के लिए  
- 🔐 Secure Authentication (JWT)
- 📊 Real-time Results और Analytics
- 🌙 Dark/Light Theme Support
- 📱 Mobile Responsive Design
- 📧 Contact Form (Web3Forms integration)
- 🔒 Role-based Access Control

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- React Router DOM
- Axios
- React Hot Toast

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Multer (File uploads)

## Installation

### Prerequisites
- Node.js (v14 या higher)
- MongoDB
- Git

### Clone Repository
```bash
git clone <repository-url>
cd mcq-quiz
```

### Install Dependencies
```bash
# Install all dependencies at once
npm run install-all

# OR install separately:
# Backend dependencies
npm run install-server

# Frontend dependencies  
npm run install-client
```

### Environment Setup

Backend में `.env` file create करें:
```env
MONGODB_URI=mongodb://localhost:27017/mcqquiz
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
PORT=5001
NODE_ENV=development
```

### Database Setup
1. MongoDB start करें
2. Database automatically create हो जाएगा first run पर

## Running the Application

### Development Mode
```bash
# Start both frontend and backend
npm run dev

# OR start separately:
# Start backend server
npm run server

# Start frontend (new terminal)
npm run client
```

### Production Build
```bash
# Build frontend
npm run build
```

## Project Structure

```
mcq-quiz/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── uploads/         # File uploads
│   ├── server.js        # Main server file
│   └── .env            # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React contexts
│   │   └── utils/       # Utility functions
│   ├── public/         # Static files
│   └── package.json    # Frontend dependencies
├── package.json        # Root package.json
└── README.md          # Project documentation
```

## Default Ports
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5001`

## User Roles

### Teacher
- Create और manage exams
- View student results
- Analytics dashboard

### Student  
- Take available exams
- View own results
- Profile management

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Exams
- `GET /api/exams` - Get all exams
- `POST /api/exams` - Create exam (Teacher only)
- `GET /api/exams/:id` - Get specific exam
- `PUT /api/exams/:id` - Update exam (Teacher only)
- `DELETE /api/exams/:id` - Delete exam (Teacher only)

### Results
- `POST /api/results` - Submit exam result
- `GET /api/results/:examId` - Get exam results
- `GET /api/results/detailed/:resultId` - Get detailed result

### Contact
- `POST /api/contact/send` - Send contact message

## Features Details

### Exam Creation
- Multiple choice questions
- Set exam duration
- Start/End time scheduling
- Auto-generated exam keys

### Exam Taking
- Timer functionality
- Auto-submit on time completion
- Question navigation
- Real-time progress tracking

### Results
- Instant result calculation
- Detailed answer analysis
- Score percentage
- Time taken tracking

### Security
- JWT token authentication
- Protected routes
- Role-based access
- Input validation

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

यह project ISC license के under है।

## Support

अगर कोई issue है तो:
1. GitHub issues create करें
2. Contact form use करें
3. Email: support@mcqquiz.com

---

Made with ❤️ by [Your Name]