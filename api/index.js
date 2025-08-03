const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));

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
        'Cookie': `.PEKOSECURITY=${robloxSecurityCookie}`,
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
            inventory_rap: userResponse.data.inventory_rap
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

app.get('/search/users/results', async (req, res) => {
    const keyword = req.query.keyword;
    const maxRows = parseInt(req.query.maxRows) || 12;
    const startIndex = parseInt(req.query.startIndex) || 0;

    if (!keyword) {
        console.error('Missing keyword for search request');
        return res.status(400).json({ error: 'Missing keyword parameter' });
    }

    const robloxSecurityCookie = process.env.ROBLOSECURITY_COOKIE;

    if (!robloxSecurityCookie) {
        console.error('Missing ROBLOSECURITY_COOKIE for search request');
        return res.status(500).json({ error: 'Server configuration error: Missing ROBLOSECURITY_COOKIE' });
    }

    const headers = {
        'Cookie': `.PEKOSECURITY=${robloxSecurityCookie}`,
        'User-Agent': 'Roblox/WinInet'
    };

    try {
        const response = await axios.get(`https://pekora-player-data.vercel.app/search/users/result?keyword=${encodeURIComponent(keyword)}&maxRows=${maxRows}&startIndex=${startIndex}`, { headers });
        console.log(`Successfully fetched search results for keyword: ${keyword}`);
        res.json(response.data);
    } catch (error) {
        console.error(`Error fetching search results for keyword: ${keyword}`, error.message);
        if (error.response) {
            console.error('Search API response:', error.response.status, error.response.data);
            return res.status(error.response.status).json({
                error: 'Failed to fetch search results from pekora-player-data.vercel.app',
                details: error.response.data
            });
        }
        res.status(500).json({
            error: 'Failed to fetch search results',
            details: error.message
        });
    }
});

app.get('/', (req, res) => {
    res.json({ message: 'Roblox Player Data Proxy Server is running. Use /api/playerdata?id={userId} or /search/users/results?keyword={keyword}.' });
});

module.exports = app;
