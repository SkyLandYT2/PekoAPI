const express = require("express");
const router = express.Router();
const { getUserFollowing } = require("../controllers/followingController");

// GET /api/user/following?id={userid}&page={page}
router.get("/user/following", getUserFollowing);

module.exports = router;
