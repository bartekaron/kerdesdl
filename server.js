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

let gameUsers = {};

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


let gameAnswers = {};  // A válaszok nyomon követésére szolgáló objektum
let gameAnswerCount = {};  // A válaszolt játékosok száma

io.on('connection', (socket) => {
    console.log(socket.id);

    socket.emit('updateGameList', games);

    socket.on('getGameList', () => {
        io.emit('updateGameList', games);
    });

    socket.on('joinToGame', () => {
        const game = session.game;

        if (gameUsers[game] && gameUsers[game].length >= 5) {
            socket.emit('gameFull', 'Ez a szoba már tele van.');
            return;
        }

        if (!gameUsers[game]) {
            gameUsers[game] = [];
        }

        gameUsers[game].push(socket.id);

        if (gameUsers[game].length === 2) { // Ha 2 játékos csatlakozott
            pool.query(`SELECT * FROM questions GROUP BY RAND() LIMIT 10`, (err, results) => {
                if (err) {
                    console.log(err);
                    return;
                }
                io.to(game).emit('kerdesek', results);
                // Inicializáljuk a válaszokat, hogy mindegyik játékos még nem válaszolt
                gameAnswers[game] = {};
                gameAnswerCount[game] = 0; // Kezdetben nincs válasz

                gameUsers[game].forEach(id => {
                    gameAnswers[game][id] = false; // Minden játékos válasza kezdetben hamis
                });
            });
        }

        let user = userJoin(socket.id, session.user, game);
        socket.join(game);
        io.to(game).emit('updateGameUsers', getgameUsers(game));
        io.to(game).emit('userConnected', user);
        if (!ingamesList(game)) {
            games.push(game);
            io.emit('updateGameList', games);
        }
    });

    socket.on('sendAnswer', (valasz) => {
        let user = getCurrentUser(socket.id);
        console.log(valasz);
        socket.emit('necsinald');
        

        // Markoljuk, hogy válaszolt
        gameAnswers[user.game][socket.id] = true;
        gameAnswerCount[user.game] += 1; // Növeljük a válaszolt játékosok számát

        io.to(user.game).emit('message', user.username, valasz);

        // Ellenőrizzük, hogy mindenki válaszolt-e
        if (gameAnswerCount[user.game] === gameUsers[user.game].length) {

            io.emit('csinald');

            // Ha mindenki válaszolt, küldjük az új kérdést
            pool.query(`SELECT * FROM questions GROUP BY RAND() LIMIT 10`, (err, results) => {
                if (err) {
                    console.log(err);
                    return;
                }
                io.to(user.game).emit('kerdesek', results);

                // Reseteljük a válaszokat és a számlálót
                gameAnswers[user.game] = {};
                gameAnswerCount[user.game] = 0; // Válaszok száma reset
                gameUsers[user.game].forEach(id => {
                    gameAnswers[user.game][id] = false; // Mindenki válasza resetelve
                });
            });
        }
    });

    socket.on('leaveGame', () => {
        let user = getCurrentUser(socket.id);
        userLeave(socket.id);
        io.to(user.game).emit('message', 'System', `${user.username} left the chat...`);
        io.to(user.game).emit('updateGameUsers', getgameUsers(user.game));

        gameUsers[user.game] = gameUsers[user.game].filter(id => id !== socket.id);

        if (getgameUsers(user.game).length === 0) {
            gameLeave(user.game);
            io.emit('updateGameList', games);
        }
    });
});






server.listen(port, ()=>{
    console.log(`Server listening on http://localhost:${port}`);
});