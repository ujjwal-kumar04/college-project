const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { uploadProfilePicture, deleteFromCloudinary } = require('../config/cloudinary');
const emailService = require('../services/emailService');
const passport = require('../config/passport');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const buildFrontendUrl = (path) => {
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
    return `${frontendUrl}${path}`;
};

const createEmailVerificationToken = () => {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    return { rawToken, hashedToken };
};

const serializeUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    rollNumber: user.rollNumber,
    class: user.class,
    profileImage: user.profileImage,
    linkedin: user.linkedin,
    leetcode: user.leetcode,
    github: user.github,
    country: user.country,
    state: user.state,
    college: user.college,
    branch: user.branch,
    semester: user.semester,
    isEmailVerified: user.googleId ? true : user.isEmailVerified !== false
});

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, department, rollNumber, class: userClass, semester, linkedin, leetcode, github } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'Name, email, password, and role are required' });
        }

        if (role !== 'teacher' && role !== 'student') {
            return res.status(400).json({ message: 'Role must be either teacher or student' });
        }

        if (role === 'teacher' && !department) {
            return res.status(400).json({ message: 'Department is required for teacher registration' });
        }

        if (role === 'student' && (!rollNumber || !userClass)) {
            return res.status(400).json({ message: 'Roll number and class are required for student registration' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Create user object
        const userData = { name, email, password, role, linkedin, leetcode, github };

        // Add role-specific fields
        if (role === 'teacher') {
            userData.department = department;
        } else if (role === 'student') {
            userData.rollNumber = rollNumber;
            userData.class = userClass;
            userData.semester = semester;
        }

        const { rawToken, hashedToken } = createEmailVerificationToken();

        // Create new user
        const user = new User({
            ...userData,
            isEmailVerified: false,
            emailVerificationToken: hashedToken,
            emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });
        await user.save();

        const verificationUrl = buildFrontendUrl(`/verify-email?token=${rawToken}`);
        const emailResult = await emailService.sendEmailVerification(user, verificationUrl);

        res.status(201).json({
            message: emailResult.success
                ? 'Registration successful. Please verify your email before signing in.'
                : 'Registration successful, but verification email could not be sent. Configure nodemailer email credentials and resend verification.',
            requiresEmailVerification: true,
            emailSent: emailResult.success,
            user: serializeUser(user)
        });
    } catch (error) {
        console.error('Registration error:', error);

        if (error?.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern || {})[0] || 'field';
            return res.status(400).json({ message: `Duplicate value for ${duplicateField}` });
        }

        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (!user.googleId && user.isEmailVerified === false) {
            return res.status(403).json({
                message: 'Please verify your email before signing in.',
                requiresEmailVerification: true,
                email: user.email
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            message: 'Login successful',
            token,
            user: serializeUser(user)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login' });
    }
});

// @route   POST /api/auth/google
// @desc    Google OAuth authentication
// @access  Public
router.post('/google', async (req, res) => {
    try {
        const { credential } = req.body;
        
        if (!credential) {
            return res.status(400).json({ message: 'Google credential is required' });
        }

        // Decode Google credential (JWT)
        const { OAuth2Client } = require('google-auth-library');
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        console.log('[Google Auth] Payload received:', { googleId, email, name, picture: picture ? 'Present' : 'Missing' });

        // Check if user already exists with Google ID
        let user = await User.findOne({ googleId });
        
        if (user) {
            // User exists with this Google ID
            console.log('[Google Auth] Existing user found with googleId');
            // Update Google profile picture if user hasn't manually uploaded one
            if (!user.profileImagePublicId && picture) {
                console.log('[Google Auth] Updating profile image from Google');
                user.profileImage = picture;
                await user.save();
            } else {
                console.log('[Google Auth] Not updating profile image. Manual upload:', !!user.profileImagePublicId, 'Google picture:', !!picture);
            }
        } else {
            // Check if user with same email exists
            user = await User.findOne({ email });
            
            if (user) {
                console.log('[Google Auth] User found with email, linking Google account');
                // Link Google account to existing user
                user.googleId = googleId;
                // Update Google profile picture if user hasn't manually uploaded one
                if (!user.profileImagePublicId && picture) {
                    console.log('[Google Auth] Setting profile image from Google');
                    user.profileImage = picture;
                }
                await user.save();
            } else {
                // Create new user - role will be set later
                console.log('[Google Auth] Creating new user with Google profile');
                user = new User({
                    googleId,
                    name,
                    email,
                    profileImage: picture || '',
                    isEmailVerified: true,
                });
                await user.save();
                console.log('[Google Auth] New user created. Profile image set:', !!user.profileImage);
            }
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = '';
        user.emailVerificationExpires = null;
        await user.save();

        console.log('[Google Auth] Final user profileImage:', user.profileImage ? 'Present' : 'Empty');

        // Generate token
        const token = generateToken(user._id);

        res.json({
            message: 'Google authentication successful',
            token,
            user: serializeUser(user),
            needsRole: !user.role // Indicates if role selection is needed
        });
    } catch (error) {
        console.error('Google authentication error:', error);
        res.status(500).json({ message: 'Google authentication failed', error: error.message });
    }
});

// @route   POST /api/auth/verify-email
// @desc    Verify user email with token
// @access  Public
router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'Verification token is required.' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Verification link is invalid or has expired.' });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = '';
        user.emailVerificationExpires = null;
        await user.save();

        res.json({ message: 'Email verified successfully. You can now sign in.' });
    } catch (error) {
        console.error('Verify email error:', error);
        res.status(500).json({ message: 'Server error during email verification.' });
    }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend verification email
// @access  Public
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            return res.status(404).json({ message: 'No account found with this email.' });
        }

        if (user.googleId || user.isEmailVerified !== false) {
            return res.status(400).json({ message: 'This email is already verified.' });
        }

        const { rawToken, hashedToken } = createEmailVerificationToken();
        user.emailVerificationToken = hashedToken;
        user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();

        const verificationUrl = buildFrontendUrl(`/verify-email?token=${rawToken}`);
        const emailResult = await emailService.sendEmailVerification(user, verificationUrl);

        if (!emailResult.success) {
            return res.status(500).json({ message: 'Verification email could not be sent. Check nodemailer email configuration.' });
        }

        res.json({ message: 'Verification email sent successfully.' });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ message: 'Server error while resending verification email.' });
    }
});

// @route   POST /api/auth/google/set-role
// @desc    Set role for Google authenticated user
// @access  Private
router.post('/google/set-role', auth, async (req, res) => {
    try {
        const { role, department, rollNumber, class: userClass, semester } = req.body;

        console.log('[SET-ROLE] Request received:', { userId: req.user._id, role });

        if (!role || !['teacher', 'student'].includes(role)) {
            console.log('[SET-ROLE] Invalid role provided:', role);
            return res.status(400).json({ message: 'Valid role (teacher/student) is required' });
        }

        const user = await User.findById(req.user._id);
        
        if (!user) {
            console.log('[SET-ROLE] User not found:', req.user._id);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('[SET-ROLE] Current user role:', user.role, 'Type:', typeof user.role);

        // Check if user already has a role (but allow undefined/null to be set)
        if (user.role && user.role !== '') {
            console.log('[SET-ROLE] User role already set:', user.role);
            return res.status(400).json({ message: 'User role is already set. Contact support to change your role.' });
        }

        console.log('[SET-ROLE] Setting role to:', role);

        // Set role
        user.role = role;

        // Set role-specific fields
        if (role === 'teacher') {
            user.department = department || '';
        } else if (role === 'student') {
            user.rollNumber = rollNumber || '';
            user.class = userClass || '';
            user.semester = semester || '';
        }

        await user.save();

        res.json({
            message: 'Role set successfully',
            user: serializeUser(user)
        });
    } catch (error) {
        console.error('Set role error:', error);
        res.status(500).json({ message: 'Server error while setting role' });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        res.json({
            user: serializeUser(req.user)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
    try {
        const { name, department, rollNumber, class: userClass, linkedin, leetcode, github, country, state, college, branch, semester } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = name || user.name;

        // Social links (applicable to both roles)
        user.linkedin = typeof linkedin !== 'undefined' ? linkedin : user.linkedin;
        user.leetcode = typeof leetcode !== 'undefined' ? leetcode : user.leetcode;
        user.github = typeof github !== 'undefined' ? github : user.github;

        // Location and academic details (applicable to both roles)
        user.country = typeof country !== 'undefined' ? country : user.country;
        user.state = typeof state !== 'undefined' ? state : user.state;
        user.college = typeof college !== 'undefined' ? college : user.college;
        user.branch = typeof branch !== 'undefined' ? branch : user.branch;

        if (user.role === 'teacher') {
            user.department = department || user.department;
        } else if (user.role === 'student') {
            user.rollNumber = rollNumber || user.rollNumber;
            user.class = userClass || user.class;
            user.semester = typeof semester !== 'undefined' ? semester : user.semester;
        }

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: serializeUser(user)
        });
    } catch (error) {

        res.status(500).json({ message: 'Server error during profile update' });
    }
});

// @route   POST /api/auth/upload-profile-picture
// @desc    Upload or update profile picture
// @access  Private
router.post('/upload-profile-picture', auth, uploadProfilePicture.single('profilePicture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image file' });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete old profile picture from Cloudinary if exists
        if (user.profileImagePublicId) {
            try {
                await deleteFromCloudinary(user.profileImagePublicId, 'image');
            } catch (deleteError) {
                console.error('Error deleting old profile picture:', deleteError);
                // Continue even if deletion fails
            }
        }

        // Update user with new profile picture
        user.profileImage = req.file.path; // Cloudinary URL
        user.profileImagePublicId = req.file.public_id;

        await user.save();

        res.json({
            message: 'Profile picture uploaded successfully',
            profileImage: user.profileImage
        });
    } catch (error) {
        console.error('Profile picture upload error:', error);
        
        // Delete uploaded file from Cloudinary if error occurs
        if (req.file && req.file.public_id) {
            try {
                await deleteFromCloudinary(req.file.public_id, 'image');
            } catch (deleteError) {
                console.error('Error deleting file after error:', deleteError);
            }
        }
        
        res.status(500).json({ message: 'Server error while uploading profile picture' });
    }
});

// @route   DELETE /api/auth/delete-profile-picture
// @desc    Delete profile picture
// @access  Private
router.delete('/delete-profile-picture', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.profileImage) {
            return res.status(400).json({ message: 'No profile picture to delete' });
        }

        // Only delete from Cloudinary if it's a manually uploaded picture
        if (user.profileImagePublicId) {
            try {
                await deleteFromCloudinary(user.profileImagePublicId, 'image');
            } catch (deleteError) {
                console.error('Error deleting from Cloudinary:', deleteError);
                // Continue with database update even if Cloudinary deletion fails
            }
        }

        // Clear manual upload info
        user.profileImage = '';
        user.profileImagePublicId = '';
        await user.save();

        // Message depends on whether user has Google account
        const message = user.googleId 
            ? 'Profile picture deleted. Your Google profile picture will be restored on next login.'
            : 'Profile picture deleted successfully';

        res.json({ message, profileImage: user.profileImage });
    } catch (error) {
        console.error('Profile picture deletion error:', error);
        res.status(500).json({ message: 'Server error while deleting profile picture' });
    }
});

// @route   GET /api/auth/user/:userId
// @desc    Get user profile with their forum posts
// @access  Public
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Get user info
        const user = await User.findById(userId).select('-password -googleId');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get Forum model
        const Forum = require('../models/Forum');
        
        // Get user's forum posts
        const forums = await Forum.find({ author: userId })
            .populate('author', 'name email role profileImage')
            .populate('replies.user', 'name email role profileImage')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
                linkedin: user.linkedin,
                leetcode: user.leetcode,
                github: user.github,
                department: user.department,
                rollNumber: user.rollNumber,
                class: user.class,
                semester: user.semester,
                createdAt: user.createdAt
            },
            forums,
            stats: {
                totalPosts: forums.length,
                totalLikes: forums.reduce((sum, forum) => sum + forum.likes.length, 0),
                totalReplies: forums.reduce((sum, forum) => sum + forum.replies.length, 0)
            }
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ message: 'Server error while fetching user profile' });
    }
});

module.exports = router;