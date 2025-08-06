const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { Octokit } = require('@octokit/rest');

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));

// Initialize Octokit with GitHub token
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

// GitHub repository details
const repoConfig = {
    owner: 'SkyLandYT2', // Replace with your GitHub username
    repo: 'pekora-player-data',    // Replace with your repository name
    branch: 'main'                 // Replace with your branch name
};

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

// GET handler for /api/obby/claim
app.get('/api/obby/claim', (req, res) => {
    res.status(405).json({ error: 'Method Not Allowed', message: 'Use POST to submit a claim to /api/obby/claim' });
});

// Updated obby claim endpoint using GitHub API
app.post('/api/obby/claim', async (req, res) => {
    const { playerName, userId, messengerText, rateText, feedbackText, timeSpent, deaths } = req.body;

    if (!playerName || !userId || !messengerText || !rateText || !feedbackText || !timeSpent || !deaths) {
        console.error('Missing required fields in obby claim request');
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const WEBHOOK_URL = "https://discord.com/api/webhooks/1402662075632844821/y_KmINBqHPWYYN_Fn0A9AAm_88_vbmY5uHeluqkuZDIhKjZ-wkE5CNtzP_oHl9HHAgoN";

    try {
        // Read winners.json from GitHub
        let winners = [];
        let winnersSha;
        try {
            const winnersResponse = await octokit.repos.getContent({
                owner: repoConfig.owner,
                repo: repoConfig.repo,
                path: 'api/obby/winners.json',
                ref: repoConfig.branch
            });
            winners = JSON.parse(Buffer.from(winnersResponse.data.content, 'base64').toString('utf8'));
            winnersSha = winnersResponse.data.sha;
            if (!Array.isArray(winners)) {
                winners = [];
            }
        } catch (err) {
            if (err.status === 404) {
                winners = []; // File doesn't exist yet
            } else {
                console.error('Error reading winners.json from GitHub:', err.message);
                return res.status(500).json({ error: 'Failed to read winners file', details: err.message });
            }
        }

        // Check if player is already in winners
        if (winners.includes(playerName)) {
            console.log(`Player ${playerName} already claimed the reward`);
            return res.status(400).json({ error: 'Player has already claimed the reward' });
        }

        // Read avaibled from GitHub
        let avaibled;
        let avaibledSha;
        try {
            const avaibledResponse = await octokit.repos.getContent({
                owner: repoConfig.owner,
                repo: repoConfig.repo,
                path: 'api/obby/avaibled',
                ref: repoConfig.branch
            });
            avaibled = parseInt(Buffer.from(avaibledResponse.data.content, 'base64').toString('utf8'), 10);
            avaibledSha = avaibledResponse.data.sha;
            if (isNaN(avaibled) || avaibled <= 0) {
                console.log(`No rewards available (avaibled: ${avaibled})`);
                return res.status(400).json({ error: 'No rewards available' });
            }
        } catch (err) {
            if (err.status === 404) {
                // Initialize avaibled with default value
                avaibled = 10;
                await octokit.repos.createOrUpdateFileContents({
                    owner: repoConfig.owner,
                    repo: repoConfig.repo,
                    path: 'api/obby/avaibled',
                    message: `Initialize avaibled with ${avaibled}`,
                    content: Buffer.from(avaibled.toString()).toString('base64'),
                    branch: repoConfig.branch
                });
            } else {
                console.error('Error reading avaibled file from GitHub:', err.message);
                return res.status(500).json({ error: 'Failed to read available rewards', details: err.message });
            }
        }

        // Update winners.json
        winners.push(playerName);
        const winnersContent = JSON.stringify(winners, null, 2);
        try {
            await octokit.repos.createOrUpdateFileContents({
                owner: repoConfig.owner,
                repo: repoConfig.repo,
                path: 'api/obby/winners.json',
                message: `Add ${playerName} to winners.json`,
                content: Buffer.from(winnersContent).toString('base64'),
                sha: winnersSha,
                branch: repoConfig.branch
            });
        } catch (err) {
            if (err.status === 404) {
                // File doesn't exist, create it
                await octokit.repos.createOrUpdateFileContents({
                    owner: repoConfig.owner,
                    repo: repoConfig.repo,
                    path: 'api/obby/winners.json',
                    message: `Create winners.json with ${playerName}`,
                    content: Buffer.from(winnersContent).toString('base64'),
                    branch: repoConfig.branch
                });
            } else {
                throw err;
            }
        }

        // Update avaibled
        const newAvaibled = (avaibled - 1).toString();
        await octokit.repos.createOrUpdateFileContents({
            owner: repoConfig.owner,
            repo: repoConfig.repo,
            path: 'api/obby/avaibled',
            message: `Decrement avaibled to ${newAvaibled}`,
            content: Buffer.from(newAvaibled).toString('base64'),
            sha: avaibledSha,
            branch: repoConfig.branch
        });

        // Send Discord webhook
        const embedData = {
            embeds: [{
                title: "New Feedback Submission",
                fields: [
                    { name: "Player", value: playerName, inline: true },
                    { name: "Messenger", value: messengerText, inline: true },
                    { name: "Rating", value: rateText, inline: true },
                    { name: "Time Spent", value: timeSpent, inline: true },
                    { name: "Deaths", value: deaths, inline: true },
                    { name: "Feedback", value: feedbackText, inline: false }
                ],
                color: 0x00FF00,
                timestamp: new Date().toISOString()
            }]
        };

        await axios.post(WEBHOOK_URL, embedData, {
            headers: { 'Content-Type': 'application/json', 'User-Agent': 'Roblox-Webhook-Proxy/1.0' }
        });

        console.log(`Successfully processed claim for ${playerName}, sent webhook, and updated avaibled to ${newAvaibled}`);
        res.json({ success: true, message: 'Claim processed successfully' });
    } catch (error) {
        console.error(`Error processing claim for ${playerName}:`, error.message);
        if (error.response) {
            console.error('Discord API response:', error.response.status, error.response.data);
            return res.status(error.response.status).json({
                error: 'Failed to send Discord webhook',
                details: error.response.data
            });
        }
        res.status(500).json({
            error: 'Failed to process claim',
            details: error.message
        });
    }
});

// Existing Discord webhook proxy endpoint
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
        message: 'Roblox Player Data Proxy Server is running. Use /api/playerdata?id={userId}, /api/users/data?keyword={keyword}, /api/discord/webhook, or /api/obby/claim (POST only).' 
    });
});

module.exports = app;
