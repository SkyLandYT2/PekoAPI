const axios = require('axios');

const getPlayerData = async (req, res) => {
    const userId = parseInt(req.query.id, 10);
    const fields = req.query.fields ? req.query.fields.split(',').map(field => field.trim()) : null;

    if (!userId || isNaN(userId) || userId <= 0) {
        return res.status(400).json({ error: 'Invalid or missing userId parameter' });
    }

    const PEKOSECURITY = process.env.PEKOSECURITY;
    if (!PEKOSECURITY) {
        return res.status(500).json({ error: 'Server configuration error: Missing PEKOSECURITY' });
    }

    const headers = {
        'Cookie': `.PEKOSECURITY=${PEKOSECURITY}`,
        'User-Agent': 'Pekora/WinInet'
    };

    try {
        // 🔹 определяем какие поля нужны
        const requested = fields && fields.length > 0 ? fields : [
            'id', 'hasVerifiedBadge', 'username', 'displayName', 'status', 'description',
            'membership', 'created', 'inventory_rap', 'isBanned', 'isStaff', 'followers',
            'following', 'friends', 'friendsList', 'badges', 'usernamehistory', 'groupRoles'
        ];

        const promises = {};
        
        if (requested.some(f => ['id','hasVerifiedBadge','username','displayName','description','created','inventory_rap','isBanned','isStaff'].includes(f))) {
            promises.user = axios.get(`https://www.pekora.zip/apisite/users/v1/users/${userId}`, { headers });
        }
        if (requested.includes('status')) {
            promises.status = axios.get(`https://www.pekora.zip/apisite/users/v1/users/${userId}/status`, { headers });
        }
        if (requested.includes('membership')) {
            promises.membership = axios.get(`https://www.pekora.zip/apisite/premiumfeatures/v1/users/${userId}/validate-membership`, { headers });
        }
        if (requested.includes('followers')) {
            promises.followers = axios.get(`https://www.pekora.zip/apisite/friends/v1/users/${userId}/followers/count`, { headers });
        }
        if (requested.includes('following')) {
            promises.following = axios.get(`https://www.pekora.zip/apisite/friends/v1/users/${userId}/followings/count`, { headers });
        }
        if (requested.includes('friends') || requested.includes('friendsList')) {
            promises.friends = axios.get(`https://www.pekora.zip/apisite/friends/v1/users/${userId}/friends`, { headers });
        }
        if (requested.includes('badges')) {
            promises.badges = axios.get(`https://www.pekora.zip/apisite/accountinformation/v1/users/${userId}/roblox-badges`, { headers });
        }
        if (requested.includes('usernamehistory')) {
            promises.usernamehistory = axios.get(`https://www.pekora.zip/apisite/users/v1/users/${userId}/username-history?limit=100`, { headers });
        }
        if (requested.includes('groupRoles')) {
            promises.groupRoles = axios.get(`https://www.pekora.zip/apisite/groups/v1/users/${userId}/groups/roles`, { headers });
        }

        // ждём выполнения
        const results = await Promise.allSettled(Object.values(promises));

        // сопоставляем обратно
        const responses = {};
        let i = 0;
        for (const key of Object.keys(promises)) {
            if (results[i].status === "fulfilled") {
                responses[key] = results[i].value.data;
            } else {
                console.error(`${key} API failed:`, results[i].reason.message);
            }
            i++;
        }

        // собираем ответ
        const fullResponse = {};
        if (responses.user) {
            fullResponse.id = responses.user.id;
            fullResponse.hasVerifiedBadge = responses.user.hasVerifiedBadge;
            fullResponse.username = responses.user.name;
            fullResponse.displayName = responses.user.displayName;
            fullResponse.description = responses.user.description;
            fullResponse.created = responses.user.created;
            fullResponse.inventory_rap = responses.user.inventory_rap;
            fullResponse.isBanned = responses.user.isBanned;
            fullResponse.isStaff = responses.user.isStaff;
        }
        if (responses.status) fullResponse.status = responses.status.status;
        if (responses.membership) fullResponse.membership = responses.membership;
        if (responses.followers) fullResponse.followers = responses.followers.count;
        if (responses.following) fullResponse.following = responses.following.count;
        if (responses.friends) {
            fullResponse.friends = responses.friends.data.length;
            fullResponse.friendsList = responses.friends.data.map(f => f.displayName);
        }
        if (responses.badges) fullResponse.badges = responses.badges;
        if (responses.usernamehistory) fullResponse.usernamehistory = responses.usernamehistory.data;
        if (responses.groupRoles) {
            fullResponse.groupRoles = (responses.groupRoles.data || []).map(role => ({
                groupId: role.group.id,
                groupName: role.group.name,
                roleId: role.role.id,
                roleName: role.role.name
            }));
        }

        // если нужны конкретные поля — фильтруем
        let response = fullResponse;
        if (fields && fields.length > 0) {
            response = {};
            fields.forEach(f => {
                if (fullResponse.hasOwnProperty(f)) {
                    response[f] = fullResponse[f];
                }
            });
        }

        res.json(response);

    } catch (error) {
        console.error(`Error fetching playerdata for userId: ${userId}`, error.message);
        res.status(500).json({ error: 'Failed to fetch playerdata', details: error.message });
    }
};

module.exports = { getPlayerData };
