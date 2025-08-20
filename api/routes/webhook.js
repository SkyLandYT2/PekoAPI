const express = require('express');
const router = express.Router();
const { sendDiscordWebhook } = require('../controllers/webhookController');

router.post('/', sendDiscordWebhook);

module.exports = router;