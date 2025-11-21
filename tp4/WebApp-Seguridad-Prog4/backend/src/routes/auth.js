const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginLimiter, checkUsernameLimiter } = require('../middleware/rateLimiters');

// Rutas de autenticación con rate limiting
router.post('/login', loginLimiter, authController.login);
router.post('/register', authController.register);
router.post('/auth/verify', authController.verifyToken);
router.post('/check-username', checkUsernameLimiter, authController.checkUsername);

module.exports = router;
