const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const ejs = require('ejs');

const app = express();
var session = require('express-session');
const moment = require('moment');
const server = http.createServer(app);
const io = socketio(server);

app.use('/assets', express.static('assets'));



server.listen(port, ()=>{
    console.log(`Server listening on http://localhost:${port}`);
});