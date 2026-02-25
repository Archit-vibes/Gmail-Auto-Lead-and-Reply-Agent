// Auth routes
const express = require('express');

const router = express.Router();
const authController = require('../controllers/auth.controller');

router.get('/google' , authController.callGoogleAuth);
router.get('/google/callback' , authController.callbackHandler);

module.exports = router;