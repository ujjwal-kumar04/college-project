const express = require('express');
const router = express.Router();

// @route   POST /api/contact/send
// @desc    Send contact message
// @access  Public
router.post('/send', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'कृपया सभी आवश्यक फील्ड भरें।' 
            });
        }

        // For now, just log the message and return success
        // In a real application, you would send an email or store in database
        console.log('Contact message received:', {
            name,
            email,
            subject: subject || 'No subject',
            message,
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'आपका संदेश सफलतापूर्वक भेजा गया है!'
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'सर्वर में कोई समस्या है। कृपया बाद में पुनः प्रयास करें।'
        });
    }
});

module.exports = router;