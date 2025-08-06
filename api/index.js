const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));

// Existing playerdata endpoint
app.get('/api/playerdata', async (req, res) => {
    const userId = parseInt(req.query.id, 10);

    if (!userId || isNaN(userId) || userId <= 0) {
        console.error('Invalid or missing userId for playerdata request');
        return res.status(400).json({ error: 'Invalid or missing userId parameter' });
    }

    const robloxSecurityCookie = process.env.ROBLOSECURITY_COOKIE;

    console.log(`Received playerdata request for userId: ${userId}`);

    if (!robloxSecurityCookie) {
        console.error('Missing ROBLOSECURITY_COOKIE for playerdata request');
        return res.status(500).json({ error: 'Server configuration error: Missing ROBLOSECURITY_COOKIE' });
    }

    const headers = {
        'Cookie': `.ROBLOSECURITY=${robloxSecurityCookie}`,
        'User-Agent': 'Roblox/WinInet'
    };

    try {
        const badgesPromise = axios.get(`https://www.pekora.zip/apisite/accountinformation/v1/users/${userId}/roblox-badges`, { headers });
        const bcPromise = axios.get(`https://www.pekora.zip/apisite/premiumfeatures/v1/users/${userId}/validate-membership`, { headers });
        const userPromise = axios.get(`https://www.pekora.zip/apisite/users/v1/users/${userId}`, { headers });
        const statusPromise = axios.get(`https://www.pekora.zip/apisite/users/v1/users/${userId}/status`, { headers });

        const [badgesResponse, bcResponse, userResponse, statusResponse] = await Promise.all([
            badgesPromise.catch(err => { throw new Error(`Badges API failed: ${err.message}`); }),
            bcPromise.catch(err => { throw new Error(`BC API failed: ${err.message}`); }),
            userPromise.catch(err => { throw new Error(`User API failed: ${err.message}`); }),
            statusPromise.catch(err => { throw new Error(`Status API failed: ${err.message}`); })
        ]);

        console.log(`Successfully fetched playerdata for userId: ${userId}`);
        res.json({
            badges: badgesResponse.data,
            bc: bcResponse.data,
            hasVerifiedBadge: userResponse.data.hasVerifiedBadge,
            status: statusResponse.data.status,
            description: userResponse.data.description,
            created: userResponse.data.created,
            inventory_rap: userResponse.data.inventory_rap,
            name: userResponse.data.name,
            displayName: userResponse.data.displayName,
            isBanned: userResponse.data.isBanned
        });
    } catch (error) {
        console.error(`Error fetching playerdata for userId: ${userId}`, error.message);
        if (error.response) {
            console.error('Playerdata API response:', error.response.status, error.response.data);
            return res.status(error.response.status).json({
                error: 'Failed to fetch playerdata from pekora.zip',
                details: error.response.data
            });
        }
        res.status(500).json({
            error: 'Failed to fetch playerdata',
            details: error.message
        });
    }
});

// Existing user search endpoint
app.get('/api/users/data', async (req, res) => {
    const keyword = req.query.keyword;

    if (!keyword || typeof keyword !== 'string' || keyword.trim() === '') {
        console.error('Invalid or missing keyword for user search request');
        return res.status(400).json({ error: 'Invalid or missing keyword parameter' });
    }

    const robloxSecurityCookie = process.env.ROBLOSECURITY_COOKIE;

    console.log(`Received user search request for keyword: ${keyword}`);

    if (!robloxSecurityCookie) {
        console.error('Missing ROBLOSECURITY_COOKIE for user search request');
        return res.status(500).json({ error: 'Server configuration error: Missing ROBLOSECURITY_COOKIE' });
    }

    const headers = {
        'Cookie': `.ROBLOSECURITY=${robloxSecurityCookie}`,
        'User-Agent': 'Roblox/WinInet'
    };

    try {
        const searchResponse = await axios.get(`https://www.pekora.zip/search/users/results?keyword=${encodeURIComponent(keyword)}&maxRows=12&startIndex=0`, { headers });
        
        console.log(`Successfully fetched user search data for keyword: ${keyword}`);
        res.json(searchResponse.data);
    } catch (error) {
        console.error(`Error fetching user search data for keyword: ${keyword}`, error.message);
        if (error.response) {
            console.error('User search API response:', error.response.status, error.response.data);
            return res.status(error.response.status).json({
                error: 'Failed to fetch user search data from pekora.zip',
                details: error.response.data
            });
        }
        res.status(500).json({
            error: 'Failed to fetch user search data',
            details: error.message
        });
    }
});

// New endpoint for proxying Discord webhook requests
app.post('/api/discord/webhook', async (req, res) => {
    const { webhookUrl, payload } = req.body;

    if (!webhookUrl || typeof webhookUrl !== 'string' || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
        console.error('Invalid or missing webhookUrl in Discord webhook request');
        return res.status(400).json({ error: 'Invalid or missing webhookUrl parameter' });
    }

    if (!payload || typeof payload !== 'object') {
        console.error('Invalid or missing payload in Discord webhook request');
        return res.status(400).json({ error: 'Invalid or missing payload parameter' });
    }

    console.log(`Received Discord webhook proxy request for URL: ${webhookUrl}`);

    try {
        const response = await axios.post(webhookUrl, payload, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Roblox-Webhook-Proxy/1.0'
            }
        });

        console.log(`Successfully sent Discord webhook for URL: ${webhookUrl}`);
        res.status(200).json({
            message: 'Webhook sent successfully',
            discordResponse: response.data
        });
    } catch (error) {
        console.error(`Error sending Discord webhook for URL: ${webhookUrl}`, error.message);
        if (error.response) {
            console.error('Discord API response:', error.response.status, error.response.data);
            return res.status(error.response.status).json({
                error: 'Failed to send Discord webhook',
                details: error.response.data
            });
        }
        res.status(500).json({
            error: 'Failed to send Discord webhook',
            details: error.message
        });
    }
});

// Default endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'Roblox Player Data Proxy Server is running. Use /api/playerdata?id={userId}, /api/users/data?keyword={keyword}, or /api/discord/webhook for Discord webhook proxy.' 
    });
});

module.exports = app;
