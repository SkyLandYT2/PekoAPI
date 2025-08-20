const express = require('express');
const router = express.Router();
const { searchUsers, searchGroups } = require('../controllers/usersController');

router.get('/users', searchUsers);
router.get('/groups', searchGroups);

module.exports = router;