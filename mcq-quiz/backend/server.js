require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const detect = require('detect-port').default;
const path = require('path');
const fs = require('fs');

// Check for JWT_SECRET
if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined.');
    process.exit(1);
}

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads', 'profiles');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://college-project-roan.vercel.app',  
        'https://college-project-git-main-ujjwal-kumar04s-projects.vercel.app'
    ],
    credentials: true
}));

if (process.env.ALLOWED_ORIGINS) {
    const envOrigins = process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
    allowedOrigins.push(...envOrigins);
}

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS Error: Origin not allowed:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Handle preflight requests
app.options('*', cors());

// Additional CORS headers for complex requests
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours
    
    // Log CORS info for debugging
    console.log(`${req.method} ${req.path} from origin: ${origin}`);
    
    next();
});



// Static files middleware for serving uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mcqquiz', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        process.exit(1);
    }
};

// Connect to database
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/exams', require('./routes/exams'));
app.use('/api/results', require('./routes/results'));
app.use('/api/contact', require('./routes/contact'));

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'McqQuiz API is running!' });
});

const PORT = process.env.PORT || 5001;

const startServer = (port) => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
};

detect(PORT, (err, _port) => {
    if (err) {
        console.log('Error detecting port:', err);
        // Fallback to default port if detection fails
        startServer(PORT);
        return;
    }

    if (PORT !== _port) {
        console.log(`Port ${PORT} was occupied, using port ${_port} instead.`);
        startServer(_port);
    } else {
        startServer(PORT);
    }
});