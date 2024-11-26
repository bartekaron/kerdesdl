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
const mysql = require('mysql');

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

app.get('/game/:room/:user', (req, res)=>{
    // let { name, room } = req.body;
    session.user = req.params.user;
    session.room = req.params.room;
    pool.query(`SELECT * FROM questions GROUP BY RAND() LIMIT 10`, (err, results)=>{
        if (err) {
            console.log(err);
            return;
        }
    res.render('game.ejs', {user:session.user, room:session.room, kerdesek:results});
});

});

server.listen(port, ()=>{
    console.log(`Server listening on http://localhost:${port}`);
});