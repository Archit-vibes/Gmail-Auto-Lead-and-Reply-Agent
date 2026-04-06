// Email routes

const express = require('express');

const router = express.Router();
const emailController = require('../controllers/email.controller')

router.get('/fetch-emails/:userId' , emailController.fetchEmails);
router.get('/get-emails/:userId' , emailController.getEmailsFromDB);


module.exports = router;