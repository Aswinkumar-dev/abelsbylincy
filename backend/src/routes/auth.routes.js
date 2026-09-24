const express = require('express');
const router = express.Router();
const { register, verifyEmail, login, forgotPassword, resetPassword, googleLogin, logout, getAllUsers } = require('../controllers/auth.controller');

router.post('/register', register);
router.get('/verify', verifyEmail);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/google', googleLogin);
router.post('/logout', logout);
router.get('/users', getAllUsers);

module.exports = router;
