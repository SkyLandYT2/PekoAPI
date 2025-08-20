const axios = require('axios');

const sendDiscordWebhook = async (req, res) => {
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
                'User-Agent': 'Pekora-Webhook-Proxy/1.0'
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
};

module.exports = {
    sendDiscordWebhook
};