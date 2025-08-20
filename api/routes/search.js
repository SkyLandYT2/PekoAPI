const express = require('express');
const router = express.Router();
const { searchUsers, searchGroups, searchGames } = require('../controllers/searchController');

router.get('/users', searchUsers);
router.get('/groups', searchGroups);
router.get('/games', searchGames);

module.exports = router;