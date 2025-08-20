const express = require('express');
const router = express.Router();
const { getPlayerData } = require('../controllers/playerdataController');

router.get('/', getPlayerData);

module.exports = router;