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
let totalUsers = 0;
let lastQuestionAnswers = 0;
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
let correctAnswers = {};
let adatok = [];
let szam = 0;

io.on('connection', (socket) => {   
    console.log(socket.id);

    

    socket.emit('updateGameList', games);

    socket.on('getGameList', () => {
        io.emit('updateGameList', games);
    });

    
    socket.on('joinToGame', () => {
        const game = session.game;
        totalUsers++;
        io.emit('updateUserCount', totalUsers);

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
                console.log(results);
                adatok = results;
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
        io.to(game).emit('updateGameUsers', {
            gameUsers: getgameUsers(game),
            userNames: gameUsers[game].map(id => getCurrentUser(id).username), // Felhasználónevek
            userIds: gameUsers[game], // Felhasználói ID-k
        });
        
        io.to(game).emit('userConnected', user); // Felhasználó értesítése a szobában
        if (!ingamesList(game)) {
            games.push(game);
            io.emit('updateGameList', games);
        }
    });

    socket.on('lastQuestionAnswered', (lastQuestionAnswers) => {
        
        io.emit('updateLastQuestionAnswers', lastQuestionAnswers);
    });

    socket.on('sendAnswer', (valasz) => {
        let user = getCurrentUser(socket.id);
        let game = user.game; // Aktuális játék
        
        // Ellenőrizzük, hogy létezik-e a correctAnswers a játékhoz
        if (!correctAnswers[game]) {
            correctAnswers[game] = {};
        }
        if (!correctAnswers[game][socket.id]) {
            correctAnswers[game][socket.id] = 0;
        }
    
        // Ellenőrizd a választ
        if (adatok[szam].answer === valasz) {
            correctAnswers[game][socket.id]++; // Növeld a helyes válaszok számát
        }
    
        gameAnswers[game][socket.id] = true;
        gameAnswerCount[game]++;
    
        socket.emit('necsinald');
    
        io.to(game).emit('message', user.username, valasz);
    

        // Ellenőrizzük, hogy minden játékos válaszolt-e
        if (gameAnswerCount[game] === gameUsers[game].length) {


            szam++;
            console.log(szam)
            if (szam >= adatok.length) {
                // Ha vége a kérdéseknek, határozzuk meg a győztest
                let maxScore = -1;
                let winnerId = null;
    
                for (let id of gameUsers[game]) {
                    if (correctAnswers[game][id] > maxScore) {
                        maxScore = correctAnswers[game][id];
                        winnerId = id;
                    }
                }
    
                szam = 0;
                // Értesítés a győztesről
                io.to(game).emit('end', winnerId);
                resetGame(game); // Új játék inicializálása
            } else {
                // Új kérdés                
                gameAnswerCount[game] = 0;
                gameUsers[game].forEach(id => {
                    gameAnswers[game][id] = false; 
                });
                io.to(game).emit('csinald');
                io.to(game).emit('kerdesek', [adatok[szam]]);
            }
        }
    });
    

    // Játék inicializálás
    function resetGame(game) {
        gameAnswers[game] = {};
        gameAnswerCount[game] = 0;
        correctAnswers = {}; // Minden pontszám alaphelyzetbe állítása
    
        gameUsers[game].forEach(id => {
            correctAnswers[id] = 0; // Minden játékosnak alapértelmezett pontszám
            gameAnswers[game][id] = false; // Jelölés, hogy nem válaszolt még
        });
    }
    
    
    
    
    

    socket.on('leaveGame', () => {
        let user = getCurrentUser(socket.id);
        totalUsers--;
        userLeave(socket.id);
        io.to(user.game).emit('message', 'System', `${user.username} left the chat...`);
        io.to(user.game).emit('updateGameUsers', getgameUsers(user.game));

        gameUsers[user.game] = gameUsers[user.game].filter(id => id !== socket.id);

        if (getgameUsers(user.game).length === 0) {
            gameLeave(user.game);
            io.emit('updateGameList', games);
        }

    });

    socket.on('gameOver', (winner) => {

        let user = getCurrentUser(socket.id);

        io.to(user.game).emit('end', winner);

    });

    



});






server.listen(port, ()=>{
    console.log(`Server listening on http://localhost:${port}`);
});