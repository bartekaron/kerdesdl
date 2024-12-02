const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const ejs = require('ejs');
require("dotenv").config()

const app = express();
var session = require('express-session');
const moment = require('moment');
const server = http.createServer(app);
const io = socketio(server);
const mysql = require('mysql')

let currentGameUsers = [];

const { users, games, userJoin, userLeave, getgameUsers, getCurrentUser, ingamesList, gameLeave } = require('./utils');

app.use('/assets', express.static('assets'));

var port = process.env.PORT;

var pool = mysql.createPool({
    host     : process.env.DBHOST,
    user     : process.env.DBUSER,
    password : process.env.DBPASSWORD,
    database : process.env.DBNAME
});


app.get('/', (req, res)=>{
    res.render('index.ejs');
}); 

app.get('/game/:game/:user', (req, res)=>{
    session.user = req.params.user;
    session.game = req.params.game;
    res.render('game.ejs', {user:session.user, game:session.game});
});


io.on('connection', (socket) => {
    console.log(socket.id);

    socket.emit('updateGameList', games);

    socket.on('getGameList', () => {
        io.emit('updateGameList', games);
    });

    socket.on('joinToGame', () => {
  
        currentGameUsers.push(socket.id);

     
        if (currentGameUsers.length === 5) {
            pool.query(`SELECT * FROM questions GROUP BY RAND() LIMIT 10`, (err, results) => {
                if (err) {
                    console.log(err);
                    return;
                }

                io.to(session.game).emit('kerdesek', results);
            });
        }

        let user = userJoin(socket.id, session.user, session.game);
        socket.join(session.game);
        io.to(session.game).emit('updateGameUsers', getgameUsers(session.game));
        io.to(session.game).emit('userConnected', user);
        if (!ingamesList(session.game)) {
            games.push(session.game);
            io.emit('updateGameList', games);
        }
    });

    socket.on('leaveGame', () => {
        let user = getCurrentUser(socket.id);
        userLeave(socket.id);
        io.to(user.game).emit('message', 'System', `${user.username} left the chat...`);
        io.to(user.game).emit('updateGameUsers', getgameUsers(user.game));
        currentGameUsers = currentGameUsers.filter(id => id !== socket.id); 
        if (getgameUsers(user.game).length === 0) {
            gameLeave(user.game);
            io.emit('updateGameList', games);
        }
    });

    socket.on('sendAnswer', (valasz) => {
        let user = getCurrentUser(socket.id);
        console.log(valasz);
        io.to(user.game).emit('message', user, valasz);
    });
});


server.listen(port, ()=>{
    console.log(`Server listening on http://localhost:${port}`);
});