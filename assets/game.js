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