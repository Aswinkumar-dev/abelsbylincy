const express = require('express');
const router = express.Router();
const { register, verifyEmail, login, forgotPassword, resetPassword, googleLogin, logout } = require('../controllers/auth.controller');

router.post('/register', register);
router.get('/verify', verifyEmail);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/google', googleLogin);
router.post('/logout', logout);

module.exports = router;
