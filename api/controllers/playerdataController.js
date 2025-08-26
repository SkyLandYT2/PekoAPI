const axios = require('axios');

const getPlayerData = async (req, res) => {
    const userId = parseInt(req.query.id, 10);

    if (!userId || isNaN(userId) || userId <= 0) {
        console.error('Invalid or missing userId for playerdata request');
        return res.status(400).json({ error: 'Invalid or missing userId parameter' });
    }

    const PEKOSECURITY = process.env.PEKOSECURITY;

    console.log(`Received playerdata request for userId: ${userId}`);

    if (!PEKOSECURITY) {
        console.error('Missing PEKOSECURITY for playerdata request');
        return res.status(500).json({ error: 'Server configuration error: Missing PEKOSECURITY' });
    }

    const headers = {
        'Cookie': `.PEKOSECURITY=${PEKOSECURITY}`,
        'User-Agent': 'Pekora/WinInet'
    };

    try {
        const badgesPromise = axios.get(`https://www.pekora.zip/apisite/accountinformation/v1/users/${userId}/roblox-badges`, { headers });
        const bcPromise = axios.get(`https://www.pekora.zip/apisite/premiumfeatures/v1/users/${userId}/validate-membership`, { headers });
        const userPromise = axios.get(`https://www.pekora.zip/apisite/users/v1/users/${userId}`, { headers });
        const statusPromise = axios.get(`https://www.pekora.zip/apisite/users/v1/users/${userId}/status`, { headers });
        const followersPromise = axios.get(`https://www.pekora.zip/apisite/friends/v1/users/${userId}/followers/count`, { headers });
        const followingPromise = axios.get(`https://www.pekora.zip/apisite/friends/v1/users/${userId}/followings/count`, { headers });
        const friendsPromise = axios.get(`https://www.pekora.zip/apisite/friends/v1/users/${userId}/friends`, { headers });
        const unsernamehistoryPromise = axios.get(`https://www.pekora.zip/apisite/users/v1/users/${userId}/username-history?limit=100`, { headers });
        const grouprolesPromise = axios.get(`https://www.pekora.zip/apisite/groups/v1/users/${userId}/groups/roles`, { headers });

        const [
            badgesResponse,
            bcResponse,
            userResponse,
            statusResponse,
            followersResponse,
            followingResponse,
            friendsResponse,
            usernameHistoryResponse,
            groupRolesResponse
        ] = await Promise.all([
            badgesPromise.catch(err => { throw new Error(`Badges API failed: ${err.message}`); }),
            bcPromise.catch(err => { throw new Error(`BC API failed: ${err.message}`); }),
            userPromise.catch(err => { throw new Error(`User API failed: ${err.message}`); }),
            statusPromise.catch(err => { throw new Error(`Status API failed: ${err.message}`); }),
            followersPromise.catch(err => { throw new Error(`Followers API failed: ${err.message}`); }),
            followingPromise.catch(err => { throw new Error(`Following API failed: ${err.message}`); }),
            friendsPromise.catch(err => { throw new Error(`Friends API failed: ${err.message}`); }),
            unsernamehistoryPromise.catch(err => { throw new Error(`Username History API failed: ${err.message}`); }),
            grouprolesPromise.catch(err => { throw new Error(`Group Roles API failed: ${err.message}`); }) // Fixed closing parenthesis
    ]);
        console.log(`Successfully fetched playerdata for userId: ${userId}`);
        res.json({
            id: userResponse.data.id,
            hasVerifiedBadge: userResponse.data.hasVerifiedBadge,
            username: userResponse.data.name,
            displayName: userResponse.data.displayName,
            status: statusResponse.data.status,
            description: userResponse.data.description,
            membership: bcResponse.data,
            created: userResponse.data.created,
            inventory_rap: userResponse.data.inventory_rap,
            isBanned: userResponse.data.isBanned,
            isStaff: userResponse.data.isStaff,
            followers: (await followersPromise).data.count,
            following: (await followingPromise).data.count,
            friends: (await friendsPromise).data.data.length,
            friendsList: (await friendsPromise).data.data.map(friend => friend.displayName),
            badges: badgesResponse.data,
            usernamehisotry: (await unsernamehistoryPromise).data.data,
            groupRoles: (await grouprolesPromise).data.map(role => ({
                groupId: role.group.id,
                groupName: role.group.name,
                roleId: role.role.id,
                roleName: role.role.name,
            }))

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
};

module.exports = {
    getPlayerData
};