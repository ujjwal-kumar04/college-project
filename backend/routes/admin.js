const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, isTeacher } = require('../middleware/auth');

// This is a protected admin route. 
// You might want to add more specific role checks here in the future.
router.post('/drop-user-index', auth, isTeacher, adminController.dropUserIndex);

module.exports = router;
