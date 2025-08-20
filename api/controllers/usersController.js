const axios = require('axios');

const searchUsers = async (req, res) => {
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
};

const searchGroups = async (req, res) => {
    const keyword = req.query.keyword;

    if (!keyword || typeof keyword !== 'string' || keyword.trim() === '') {
        console.error('Invalid or missing keyword for group search request');
        return res.status(400).json({ error: 'Invalid or missing keyword parameter' });
    }

    const robloxSecurityCookie = process.env.ROBLOSECURITY_COOKIE;

    console.log(`Received group search request for keyword: ${keyword}`);

    if (!robloxSecurityCookie) {
        console.error('Missing ROBLOSECURITY_COOKIE for group search request');
        return res.status(500).json({ error: 'Server configuration error: Missing ROBLOSECURITY_COOKIE' });
    }

    const headers = {
        'Cookie': `.ROBLOSECURITY=${robloxSecurityCookie}`,
        'User-Agent': 'Roblox/WinInet'
    };

    try {
        const searchResponse = await axios.get(`https://www.pekora.zip/apisite/groups/v1/groups/search?keyword=${encodeURIComponent(keyword)}&maxRows=12&startIndex=0`, { headers });
        
        console.log(`Successfully fetched group search data for keyword: ${keyword}`);
        res.json(searchResponse.data);
    } catch (error) {
        console.error(`Error fetching group search data for keyword: ${keyword}`, error.message);
        if (error.response) {
            console.error('Group search API response:', error.response.status, error.response.data);
            return res.status(error.response.status).json({
                error: 'Failed to fetch group search data from pekora.zip',
                details: error.response.data
            });
        }
        res.status(500).json({
            error: 'Failed to fetch group search data',
            details: error.message
        });
    }
};

module.exports = {
    searchUsers,
    searchGroups
};