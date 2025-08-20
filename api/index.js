const express = require('express');
const cors = require('cors');
const { Octokit } = require('@octokit/rest');

// Import route modules
const playerdataRoutes = require('./routes/playerdata');
const searchRoutes = require('./routes/search');
const webhookRoutes = require('./routes/webhook');

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
    repo: 'PekoraPlayerData',    // Replace with your repository name
    branch: 'main'                 // Replace with your branch name
};

// Use route modules
app.use('/api/playerdata', playerdataRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/discord/webhook', webhookRoutes);

// Default endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'Roblox Player Data Proxy Server is running. Use /api/playerdata?id={userId}, /api/search/users?keyword={keyword}, or /api/discord/webhook.' 
    });
});

module.exports = app;