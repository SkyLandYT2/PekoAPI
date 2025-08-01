const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' })); // Allow all origins for Roblox HttpService

// Endpoint to fetch badges using query parameter ?id
app.get('/api/badge', async (req, res) => {
    const userId = req.query.id;
    
    // Validate userId
    if (!userId || isNaN(userId)) {
        console.error('Invalid or missing userId in query parameter');
        return res.status(400).json({ error: 'Invalid or missing userId parameter' });
    }

    const robloxSecurityCookie = process.env.ROBLOSECURITY_COOKIE;

    // Log request for debugging
    console.log(`Received request for userId: ${userId}`);

    // Check if the cookie is set
    if (!robloxSecurityCookie) {
        console.error('Missing ROBLOSECURITY_COOKIE environment variable');
        return res.status(500).json({ error: 'Server configuration error: Missing ROBLOSECURITY_COOKIE' });
    }

    try {
        console.log(`Fetching badges from pekora.zip for userId: ${userId}`);
        const response = await axios.get(`https://www.pekora.zip/apisite/accountinformation/v1/users/${userId}/roblox-badges`, {
            headers: {
                'Cookie': `.ROBLOSECURITY=${robloxSecurityCookie}`,
                'User-Agent': 'Roblox/WinInet' // Mimic Roblox's HttpService
            }
        });

        // Log successful response
        console.log(`Successfully fetched badges for userId: ${userId}`, response.data);
        res.json(response.data);
    } catch (error) {
        console.error(`Error fetching badges for userId: ${userId}`, error.message);
        if (error.response) {
            console.error('API response:', error.response.status, error.response.data);
            res.status(error.response.status).json({
                error: 'Failed to fetch badges from pekora.zip',
                details: error.response.data
            });
        } else {
            res.status(500).json({
                error: 'Failed to fetch badges',
                details: error.message
            });
        }
    }
});

// Fallback route for debugging
app.get('/', (req, res) => {
    res.json({ message: 'Roblox Badge Proxy Server is running. Use /api/badge?id={userId} to fetch badges.' });
});

module.exports = app;