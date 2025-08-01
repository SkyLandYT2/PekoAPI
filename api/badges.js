const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// Endpoint to fetch badges for a given user ID
app.get('/badges/:userId', async (req, res) => {
    const userId = req.params.userId;
    const robloxSecurityCookie = process.env.ROBLOSECURITY_COOKIE;

    if (!robloxSecurityCookie) {
        return res.status(500).json({ error: 'Server configuration error: Missing ROBLOSECURITY_COOKIE' });
    }

    try {
        const response = await axios.get(`https://www.pekora.zip/apisite/accountinformation/v1/users/${userId}/roblox-badges`, {
            headers: {
                'Cookie': `.ROBLOSECURITY=${robloxSecurityCookie}`
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching badges:', error.message);
        res.status(500).json({ error: 'Failed to fetch badges', details: error.message });
    }
});

module.exports = app;
