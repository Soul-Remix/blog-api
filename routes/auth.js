const express = require('express');

const authController = require('../controllers/authController');

const router = express.Router();

router.post('/auth/signup', authController.signup);

router.post('/auth/login', authController.logIn);

module.exports = router;
