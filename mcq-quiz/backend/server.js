require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const detect = require('detect-port').default;
const path = require('path');
const fs = require('fs');

const app = express();

// =======================
// 🔐 ENV CHECK
// =======================
if (!process.env.JWT_SECRET) {
    console.error("❌ FATAL: JWT_SECRET missing in environment");
    process.exit(1);
}

if (!process.env.MONGO_URI) {
    console.error("❌ FATAL: MONGO_URI missing in environment");
    process.exit(1);
}

// =======================
// 📁 UPLOADS FOLDER
// =======================
const uploadsDir = path.join(__dirname, "uploads", "profiles");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// =======================
// 🔧 Middleware
// =======================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// =======================
// 🌐 CORS FIXED
// =======================
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://college-project-roan.vercel.app",
    "https://college-project-git-main-ujjwal-kumar04s-projects.vercel.app"
];

// Add from ENV if present
if (process.env.ALLOWED_ORIGINS) {
    process.env.ALLOWED_ORIGINS.split(",").forEach(o => allowedOrigins.push(o.trim()));
}

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        console.log("❌ CORS BLOCKED:", origin);
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
}));

// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =======================
// 🔗 MongoDB Connection
// =======================
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("✅ MongoDB Connected");
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1);
    }
};

connectDB();

// =======================
// 📌 ROUTES
// =======================
app.use("/api/auth", require("./routes/auth"));
app.use("/api/exams", require("./routes/exams"));
app.use("/api/results", require("./routes/results"));
app.use("/api/contact", require("./routes/contact"));

app.get("/", (req, res) => {
    res.json({ message: "McqQuiz API is running!" });
});

// =======================
// 🚀 START SERVER
// =======================
const PORT = process.env.PORT || 5001;

detect(PORT, (err, availablePort) => {
    if (err) {
        console.log("Port check error, starting normally:", err);
        return app.listen(PORT, () => console.log(`Server running on ${PORT}`));
    }

    const portToUse = PORT === availablePort ? PORT : availablePort;
    console.log(` Server running on port ${portToUse}`);
    app.listen(portToUse);
});
