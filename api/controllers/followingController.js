const axios = require("axios");

const getUserFollowing = async (req, res) => {
    try {
        const userId = parseInt(req.query.id, 10);
        let page = parseInt(req.query.page, 10) || 1;

        if (!userId || isNaN(userId)) {
            return res.status(400).json({ error: "Invalid or missing userId parameter" });
        }

        if (isNaN(page) || page < 1) {
            page = 1;
        }

        const cursor = (page - 1) * 100;

        const apiUrl = `https://www.pekora.zip/apisite/friends/v1/users/${userId}/followings?cursor=${cursor}&limit=100`;

        const response = await axios.get(apiUrl);

        return res.json({
            userId,
            page,
            data: response.data
        });

    } catch (err) {
        console.error("Error fetching following:", err.message);
        return res.status(500).json({ error: "Failed to fetch following" });
    }
};

module.exports = { getUserFollowing };
