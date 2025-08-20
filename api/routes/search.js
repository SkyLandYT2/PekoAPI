const express = require('express');
const router = express.Router();
const { searchUsers, searchGroups, searchGames } = require('../controllers/usersController');

router.get('/users', searchUsers);
router.get('/groups', searchGroups);
router.get('/games', searchGames);

module.exports = router;