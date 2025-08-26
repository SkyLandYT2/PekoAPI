const express = require("express");
const router = express.Router();
const { getUserFollowing } = require("../controllers/followingController");

router.get("/", getUserFollowing);

module.exports = router;
