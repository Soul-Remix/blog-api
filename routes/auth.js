const express = require('express');

const authController = require('../controllers/authController');

const router = express.Router();

router.put('/auth/signup', authController.signup);

module.exports = router;
