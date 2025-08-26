const express = require("express");
const router = express.Router();
const { getUserFollowers } = require("../controllers/followersController");

router.get("/", getUserFollowers);

module.exports = router;
