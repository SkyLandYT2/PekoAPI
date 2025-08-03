const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' })); // Allow all origins for Roblox HttpService

// Endpoint for badges
app.get('/api/badge', async (req, res) => {
    const userId = req.query.id;
    
    if (!userId || isNaN(userId)) {
        console.error('Invalid or missing userId for badge request');
        return res.status(400).json({ error: 'Invalid or missing userId parameter' });
    }

    const robloxSecurityCookie = process.env.ROBLOSECURITY_COOKIE;

    console.log(`Received badge request for userId: ${userId}`);

    if (!robloxSecurityCookie) {
        console.error('Missing ROBLOSECURITY_COOKIE for badge request');
        return res.status(500).json({ error: 'Server configuration error: Missing ROBLOSECURITY_COOKIE' });
    }

    try {
        const response = await axios.get(`https://www.pekora.zip/apisite/accountinformation/v1/users/${userId}/roblox-badges`, {
            headers: {
                'Cookie': `.PEKOSECURITY=${robloxSecurityCookie}`,
                'User-Agent': 'Roblox/WinInet'
            }
        });
        console.log(`Successfully fetched badges for userId: ${userId}`, response.data);
        res.json(response.data);
    } catch (error) {
        console.error(`Error fetching badges for userId: ${userId}`, error.message);
        if (error.response) {
            console.error('Badge API response:', error.response.status, error.response.data);
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

// Endpoint for BC membership
app.get('/api/bc', async (req, res) => {
    const userId = req.query.id;
    
    if (!userId || isNaN(userId)) {
        console.error('Invalid or missing userId for BC request');
        return res.status(400).json({ error: 'Invalid or missing userId parameter' });
    }

    const robloxSecurityCookie = process.env.ROBLOSECURITY_COOKIE;

    console.log(`Received BC request for userId: ${userId}`);

    if (!robloxSecurityCookie) {
        console.error('Missing ROBLOSECURITY_COOKIE for BC request');
        return res.status(500).json({ error: 'Server configuration error: Missing ROBLOSECURITY_COOKIE' });
    }

    try {
        const response = await axios.get(`https://www.pekora.zip/apisite/premiumfeatures/v1/users/${userId}/validate-membership`, {
            headers: {
                'Cookie': `.PEKOSECURITY=${robloxSecurityCookie}`,
                'User-Agent': 'Roblox/WinInet'
            }
        });
        console.log(`Successfully fetched BC membership for userId: ${userId}`, response.data);
        res.json(response.data);
    } catch (error) {
        console.error(`Error fetching BC membership for userId: ${userId}`, error.message);
        if (error.response) {
            console.error('BC API response:', error.response.status, error.response.data);
            res.status(error.response.status).json({
                error: 'Failed to fetch BC membership from pekora.zip',
                details: error.response.data
            });
        } else {
            res.status(500).json({
                error: 'Failed to fetch BC membership',
                details: error.message
            });
        }
    }
});

// Fallback route for debugging
app.get('/', (req, res) => {
    res.json({ message: 'Roblox Badge & BC Proxy Server is running. Use /api/badge?id={userId} or /api/bc?id={userId}.' });
});

module.exports = app;
