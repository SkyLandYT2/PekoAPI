const axios = require('axios');

const getPlayerData = async (req, res) => {
    const userId = parseInt(req.query.id, 10);
    const fields = req.query.fields ? req.query.fields.split(',').map(field => field.trim()) : null;

    if (!userId || isNaN(userId) || userId <= 0) {
        console.error('Invalid or missing userId for playerdata request');
        return res.status(400).json({ error: 'Invalid or missing userId parameter' });
    }

    const PEKOSECURITY = process.env.PEKOSECURITY;

    console.log(`Received playerdata request for userId: ${userId}, fields: ${fields || 'all'}`);

    if (!PEKOSECURITY) {
        console.error('Missing PEKOSECURITY for playerdata request');
        return res.status(500).json({ error: 'Server configuration error: Missing PEKOSECURITY' });
    }

    const headers = {
        'Cookie': `.PEKOSECURITY=${PEKOSECURITY}`,
        'User-Agent': 'Pekora/WinInet'
    };

    try {
        // Define API promises based on requested fields
        const promises = [];
        const promiseMap = {};

        const validFields = [
            'id', 'hasVerifiedBadge', 'username', 'displayName', 'status', 'description',
            'membership', 'created', 'inventory_rap', 'isBanned', 'isStaff', 'followers',
            'following', 'friends', 'friendsList', 'badges', 'usernamehistory', 'groupRoles'
        ];

        // If no fields specified, include all promises
        if (!fields || fields.length === 0) {
            promiseMap.badges = axios.get(`https://www.pekora.zip/apisite/accountinformation/v1/users/${userId}/roblox-badges`, { headers });
            promiseMap.bc = axios.get(`https://www.pekora.zip/apisite/premiumfeatures/v1/users/${userId}/validate-membership`, { headers });
            promiseMap.user = axios.get(`https://www.pekora.zip/apisite/users/v1/users/${userId}`, { headers });
            promiseMap.status = axios.get(`https://www.pekora.zip/apisite/users/v1/users/${userId}/status`, { headers });
            promiseMap.followers = axios.get(`https://www.pekora.zip/apisite/friends/v1/users/${userId}/followers/count`, { headers });
            promiseMap.following = axios.get(`https://www.pekora.zip/apisite/friends/v1/users/${userId}/followings/count`, { headers });
            promiseMap.friends = axios.get(`https://www.pekora.zip/apisite/friends/v1/users/${userId}/friends`, { headers });
            promiseMap.usernamehistory = axios.get(`https://www.pekora.zip/apisite/users/v1/users/${userId}/username-history?limit=100`, { headers });
            promiseMap.grouproles = axios.get(`https://www.pekora.zip/apisite/groups/v1/users/${userId}/groups/roles`, { headers });
            promises.push(
                promiseMap.badges.catch(err => { throw new Error(`Badges API failed: ${err.message}`); }),
                promiseMap.bc.catch(err => { throw new Error(`BC API failed: ${err.message}`); }),
                promiseMap.user.catch(err => { throw new Error(`User API failed: ${err.message}`); }),
                promiseMap.status.catch(err => { throw new Error(`Status API failed: ${err.message}`); }),
                promiseMap.followers.catch(err => { throw new Error(`Followers API failed: ${err.message}`); }),
                promiseMap.following.catch(err => { throw new Error(`Following API failed: ${err.message}`); }),
                promiseMap.friends.catch(err => { throw new Error(`Friends API failed: ${err.message}`); }),
                promiseMap.usernamehistory.catch(err => { throw new Error(`Username History API failed: ${err.message}`); }),
                promiseMap.grouproles.catch(err => { throw new Error(`Group Roles API failed: ${err.message}`); })
            );
        } else {
            // Only include promises for requested fields
            const needsUser = fields.some(field => ['id', 'hasVerifiedBadge', 'username', 'displayName', 'description', 'created', 'inventory_rap', 'isBanned', 'isStaff'].includes(field));
            const needsStatus = fields.includes('status');
            const needsMembership = fields.includes('membership');
            const needsBadges = fields.includes('badges');
            const needsFollowers = fields.includes('followers');
            const needsFollowing = fields.includes('following');
            const needsFriends = fields.some(field => ['friends', 'friendsList'].includes(field));
            const needsUsernamehistory = fields.includes('usernamehistory');
            const needsGrouproles = fields.includes('groupRoles');

            if (needsUser) {
                promiseMap.user = axios.get(`https://www.pekora.zip/apisite/users/v1/users/${userId}`, { headers });
                promises.push(promiseMap.user.catch(err => { throw new Error(`User API failed: ${err.message}`); }));
            }
            if (needsStatus) {
                promiseMap.status = axios.get(`https://www.pekora.zip/apisite/users/v1/users/${userId}/status`, { headers });
                promises.push(promiseMap.status.catch(err => { throw new Error(`Status API failed: ${err.message}`); }));
            }
            if (needsMembership) {
                promiseMap.bc = axios.get(`https://www.pekora.zip/apisite/premiumfeatures/v1/users/${userId}/validate-membership`, { headers });
                promises.push(promiseMap.bc.catch(err => { throw new Error(`BC API failed: ${err.message}`); }));
            }
            if (needsBadges) {
                promiseMap.badges = axios.get(`https://www.pekora.zip/apisite/accountinformation/v1/users/${userId}/roblox-badges`, { headers });
                promises.push(promiseMap.badges.catch(err => { throw new Error(`Badges API failed: ${err.message}`); }));
            }
            if (needsFollowers) {
                promiseMap.followers = axios.get(`https://www.pekora.zip/apisite/friends/v1/users/${userId}/followers/count`, { headers });
                promises.push(promiseMap.followers.catch(err => { throw new Error(`Followers API failed: ${err.message}`); }));
            }
            if (needsFollowing) {
                promiseMap.following = axios.get(`https://www.pekora.zip/apisite/friends/v1/users/${userId}/followings/count`, { headers });
                promises.push(promiseMap.following.catch(err => { throw new Error(`Following API failed: ${err.message}`); }));
            }
            if (needsFriends) {
                promiseMap.friends = axios.get(`https://www.pekora.zip/apisite/friends/v1/users/${userId}/friends`, { headers });
                promises.push(promiseMap.friends.catch(err => { throw new Error(`Friends API failed: ${err.message}`); }));
            }
            if (needsUsernamehistory) {
                promiseMap.usernamehistory = axios.get(`https://www.pekora.zip/apisite/users/v1/users/${userId}/username-history?limit=100`, { headers });
                promises.push(promiseMap.usernamehistory.catch(err => { throw new Error(`Username History API failed: ${err.message}`); }));
            }
            if (needsGrouproles) {
                promiseMap.grouproles = axios.get(`https://www.pekora.zip/apisite/groups/v1/users/${userId}/groups/roles`, { headers });
                promises.push(promiseMap.grouproles.catch(err => { throw new Error(`Group Roles API failed: ${err.message}`); }));
            }

            // If no valid fields are requested, return an error
            if (promises.length === 0) {
                return res.status(400).json({ error: 'No valid fields specified' });
            }
        }

        // Execute only the necessary API calls
        const responses = await Promise.all(promises);

        console.log(`Successfully fetched playerdata for userId: ${userId}`);

        // Construct full response with available data
        const fullResponse = {};
        if (promiseMap.user) {
            const userResponse = responses[promises.indexOf(promiseMap.user.catch(err => { throw new Error(`User API failed: ${err.message}`); }))];
            fullResponse.id = userResponse.data.id;
            fullResponse.hasVerifiedBadge = userResponse.data.hasVerifiedBadge;
            fullResponse.username = userResponse.data.name;
            fullResponse.displayName = userResponse.data.displayName;
            fullResponse.description = userResponse.data.description;
            fullResponse.created = userResponse.data.created;
            fullResponse.inventory_rap = userResponse.data.inventory_rap;
            fullResponse.isBanned = userResponse.data.isBanned;
            fullResponse.isStaff = userResponse.data.isStaff;
        }
        if (promiseMap.status) {
            const statusResponse = responses[promises.indexOf(promiseMap.status.catch(err => { throw new Error(`Status API failed: ${err.message}`); }))];
            fullResponse.status = statusResponse.data.status;
        }
        if (promiseMap.bc) {
            const bcResponse = responses[promises.indexOf(promiseMap.bc.catch(err => { throw new Error(`BC API failed: ${err.message}`); }))];
            fullResponse.membership = bcResponse.data;
        }
        if (promiseMap.badges) {
            const badgesResponse = responses[promises.indexOf(promiseMap.badges.catch(err => { throw new Error(`Badges API failed: ${err.message}`); }))];
            fullResponse.badges = badgesResponse.data;
        }
        if (promiseMap.followers) {
            const followersResponse = responses[promises.indexOf(promiseMap.followers.catch(err => { throw new Error(`Followers API failed: ${err.message}`); }))];
            fullResponse.followers = followersResponse.data.count;
        }
        if (promiseMap.following) {
            const followingResponse = responses[promises.indexOf(promiseMap.following.catch(err => { throw new Error(`Following API failed: ${err.message}`); }))];
            fullResponse.following = followingResponse.data.count;
        }
        if (promiseMap.friends) {
            const friendsResponse = responses[promises.indexOf(promiseMap.friends.catch(err => { throw new Error(`Friends API failed: ${err.message}`); }))];
            fullResponse.friends = friendsResponse.data.data.length;
            fullResponse.friendsList = friendsResponse.data.data.map(friend => friend.displayName);
        }
        if (promiseMap.usernamehistory) {
            const usernamehistoryResponse = responses[promises.indexOf(promiseMap.usernamehistory.catch(err => { throw new Error(`Username History API failed: ${err.message}`); }))];
            fullResponse.usernamehistory = usernamehistoryResponse.data.data;
        }
        if (promiseMap.grouproles) {
            const grouprolesResponse = responses[promises.indexOf(promiseMap.grouproles.catch(err => { throw new Error(`Group Roles API failed: ${err.message}`); }))];
            fullResponse.groupRoles = (grouprolesResponse.data.data || []).map(role => ({
                groupId: role.group.id,
                groupName: role.group.name,
                roleId: role.role.id,
                roleName: role.role.name
            }));
        }

        // Filter response based on fields parameter
        let response = fullResponse;
        if (fields && fields.length > 0) {
            response = {};
            fields.forEach(field => {
                if (validFields.includes(field) && field in fullResponse) {
                    response[field] = fullResponse[field];
                }
            });
            if (Object.keys(response).length === 0) {
                return res.status(400).json({ error: 'No valid fields specified' });
            }
        }

        res.json(response);
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