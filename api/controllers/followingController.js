const axios = require("axios");

const getUserFollowing = async (req, res) => {
    try {
        const userId = parseInt(req.query.id, 10);
        let page = parseInt(req.query.page, 10) || 1;

        console.log(`Received following request for userId: ${userId}, page: ${page}`);

        if (!userId || isNaN(userId)) {
            console.error("Invalid or missing userId for following request");
            return res.status(400).json({ error: "Invalid or missing userId parameter" });
        }

        const PEKOSECURITY = process.env.PEKOSECURITY;

        if (!PEKOSECURITY) {
            console.error("Missing PEKOSECURITY for following request");
            return res.status(500).json({ error: "Server configuration error: Missing PEKOSECURITY" });
        }

        if (isNaN(page) || page < 1) {
            page = 1;
        }

        const cursor = (page - 1) * 100;

        const apiUrl = `https://www.pekora.zip/apisite/friends/v1/users/${userId}/followings?cursor=${cursor}&limit=100`;

        const headers = {
            "Cookie": `.PEKOSECURITY=${PEKOSECURITY}`,
            "User-Agent": "Pekora/WinInet"
        };

        const response = await axios.get(apiUrl, { headers });

        return res.json({
            userId,
            page,
            nextPage: response.data?.data?.length === 100 ? page + 1 : null,
            data: response.data
        });

    } catch (err) {
        console.error("Error fetching following:", err.message);
        return res.status(500).json({ error: "Failed to fetch following" });
    }
};

module.exports = { getUserFollowing };
