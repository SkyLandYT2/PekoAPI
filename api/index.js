const express = require('express');
const cors = require('cors');
const { Octokit } = require('@octokit/rest');

// Import route modules
const playerdataRoutes = require('./routes/playerdata');
const searchRoutes = require('./routes/search');
const webhookRoutes = require('./routes/webhook');
const followingRoutes = require('./routes/following');
const followersRoutes = require('./routes/followers');

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));

// Initialize Octokit with GitHub token
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

// GitHub repository details
const repoConfig = {
    owner: 'SkyLandYT2',
    repo: 'PekoAPI',
    branch: 'main'
};

// Use route modules
app.use('/api/user/data', playerdataRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/discord/webhook', webhookRoutes);
app.use('/api/user/following', followingRoutes);
app.use('/api/user/followers', followersRoutes);

// Default endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'Pekora Player Data Proxy Server is running. Use /api/playerdata?id={userId}, /api/search/users?keyword={keyword}, /api/search/groups?keyword={keyword}, /api/search/games?keyword={keyword}, or /api/discord/webhook, or /api/following?id={userId}, or api/followers?id={userId} endpoints.', 
    });
});

const PORT = process.env.PORT || 3000;

// Only start the server if this file is run directly (not imported)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Available endpoints:`);
        console.log(`- GET / - API documentation`);
        console.log(`- GET /api/playerdata?id={userId} - Player data`);
        console.log(`- GET /api/search/users?keyword={keyword} - Search users`);
        console.log(`- GET /api/search/groups?keyword={keyword} - Search groups`);
        console.log(`- GET /api/search/games?keyword={keyword} - Search games`);
        console.log(`- POST /api/discord/webhook - Discord webhook`);
        console.log(`- GET /api/following?id={userId} - Following data`);
        console.log(`- GET /api/followers?id={userId} - Followers data`);
    });
}

module.exports = app;