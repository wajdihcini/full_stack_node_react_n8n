/**
 * Authentication Routes
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/register — Create a new account
router.post('/register', authController.register);

// POST /api/auth/login — Authenticate and receive JWT
router.post('/login', authController.login);

module.exports = router;
