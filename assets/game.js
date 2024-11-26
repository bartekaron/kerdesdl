let usersList = document.getElementById('usersList');
let kerdesek = document.getElementById('kerdesek');
let valaszok = document.getElementById('valaszok');
let sendBtn = document.getElementById('sendBtn');
let leaveBtn = document.getElementById('leaveBtn');
const socket = io();

socket.emit('joinToGame');

socket.on('updateGameUsers', (gameUsers) => {
    usersList.innerHTML = '';
    let ul = document.createElement('ul');
    usersList.appendChild(ul);
    gameUsers.forEach(user => {
        let li = document.createElement('li');
        li.textContent = user.username;
        ul.appendChild(li);
    });
});

socket.on('userConnected', (user) => {
   renderMessage('System', `${user.username} connected to the game...`);
});

socket.on('message', (user, msg) => {
    renderMessage(user.username, msg);
});

socket.on('kerdes', (kerdes) => {
    kerdesek.innerHTML = kerdes.kerdes;
    valaszok.innerHTML = '';
    kerdes.valaszok.forEach(valasz => {
        let btn = document.createElement('button');
        btn.textContent = valasz;
        btn.addEventListener('click', () => {
            socket.emit('valasz', valasz);
        });
        valaszok.appendChild(btn);
    });
}
);

socket.on('gameOver', (winner) => {
    renderMessage('System', `The winner is ${winner}!`);
});

sendBtn.addEventListener('click', () => {
    let msg = document.getElementById('msg').value;
    socket.emit('sendMsg', msg);
    renderMessage('You', msg);
});

leaveBtn.addEventListener('click', () => {
    socket.emit('leaveGame');
    document.location.href = '/';
});


function renderMessage(user, msg) {
    
}

