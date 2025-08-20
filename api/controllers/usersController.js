const axios = require('axios');

const searchUsers = async (req, res) => {
    const keyword = req.query.keyword;

    if (!keyword || typeof keyword !== 'string' || keyword.trim() === '') {
        console.error('Invalid or missing keyword for user search request');
        return res.status(400).json({ error: 'Invalid or missing keyword parameter' });
    }

    const PEKOSECURITY = process.env.PEKOSECURITY;

    console.log(`Received user search request for keyword: ${keyword}`);

    if (!PEKOSECURITY) {
        console.error('Missing PEKOSECURITY for user search request');
        return res.status(500).json({ error: 'Server configuration error: Missing PEKOSECURITY' });
    }

    const headers = {
        'Cookie': `.PEKOSECURITY=${PEKOSECURITY}`,
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

    const PEKOSECURITY = process.env.PEKOSECURITY;

    console.log(`Received group search request for keyword: ${keyword}`);

    if (!PEKOSECURITY) {
        console.error('Missing PEKOSECURITY for group search request');
        return res.status(500).json({ error: 'Server configuration error: Missing PEKOSECURITY' });
    }

    const headers = {
        'Cookie': `.PEKOSECURITY=${PEKOSECURITY}`,
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

const searchGames = async (req, res) => {
    const keyword = req.query.keyword;

    console.log(`[DEBUG] Received game search request for keyword: ${keyword}`);
    console.log(`[DEBUG] Environment PEKOSECURITY exists: ${!!process.env.PEKOSECURITY}`);

    if (!keyword || typeof keyword !== 'string' || keyword.trim() === '') {
        console.error('Invalid or missing keyword for game search request');
        return res.status(400).json({ error: 'Invalid or missing keyword parameter' });
    }

    const PEKOSECURITY = process.env.PEKOSECURITY;

    if (!PEKOSECURITY) {
        console.error('Missing PEKOSECURITY for game search request');
        return res.status(500).json({ 
            error: 'Server configuration error: Missing PEKOSECURITY',
            debug: 'Please set the PEKOSECURITY environment variable'
        });
    }

    const headers = {
        'Cookie': `.PEKOSECURITY=${PEKOSECURITY}`,
        'User-Agent': 'Roblox/WinInet'
    };

    const url = `https://www.pekora.zip/apisite/games/v1/games/list?sortToken=&maxRows=100&genre=&keyword=${encodeURIComponent(keyword)}`;
    
    console.log(`[DEBUG] Making request to: ${url}`);
    console.log(`[DEBUG] Headers:`, headers);

    try {
        const searchResponse = await axios.get(url, { headers });
        
        console.log(`[DEBUG] Response status: ${searchResponse.status}`);
        console.log(`[DEBUG] Response data:`, JSON.stringify(searchResponse.data, null, 2));
        
        if (!searchResponse.data || Object.keys(searchResponse.data).length === 0) {
            console.log(`[DEBUG] Empty response detected for keyword: ${keyword}`);
            return res.json({
                error: 'Empty response from pekora.zip API',
                debug: 'The external API returned an empty object. This might be due to invalid authentication or API changes.',
                url: url,
                keyword: keyword
            });
        }
        
        console.log(`Successfully fetched game search data for keyword: ${keyword}`);
        res.json(searchResponse.data);
    } catch (error) {
        console.error(`[ERROR] Error fetching game search data for keyword: ${keyword}`, error.message);
        if (error.response) {
            console.error('[ERROR] Game search API response:', error.response.status, error.response.data);
            return res.status(error.response.status).json({
                error: 'Failed to fetch game search data from pekora.zip',
                details: error.response.data,
                status: error.response.status,
                url: url
            });
        }
        res.status(500).json({
            error: 'Failed to fetch game search data',
            details: error.message,
            url: url
        });
    }
};

module.exports = {
    searchUsers,
    searchGroups,
    searchGames
};