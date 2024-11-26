let users = [];
let games = [];

function userJoin(id, username, game){
    const user = { id, username, game };
    users.push(user);
    return user;
}

function userLeave(id){
    let idx = users.findIndex(user => user.id === id);
    if (idx != -1){
        users.splice(idx, 1);
    }
    return users;
}

function gameLeave(game){
    let idx = games.findIndex(r => r === game);
    if (idx != -1){
        games.splice(idx, 1);
    }
    return games;
}

function getgameUsers(game){
    return users.filter(user => user.game === game );
}

function getCurrentUser(id){
    return users.find(user => user.id === id);
}

function ingamesList(game){
    return games.includes(game);
}

module.exports = {
    users,
    games,
    userJoin,
    userLeave,
    gameLeave,
    getgameUsers,
    getCurrentUser,
    ingamesList
}