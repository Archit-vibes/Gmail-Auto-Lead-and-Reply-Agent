const express = require('express');
const router = express.Router();
const leadController = require('../controllers/lead.controller');

router.get('/', leadController.getLeads);
router.post('/:leadId/schedule-event', leadController.scheduleEvent);

module.exports = router;
