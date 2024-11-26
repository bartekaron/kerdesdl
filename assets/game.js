let usersList = document.getElementById('usersList');
let kerdesek = document.getElementById('kerdesek');
let valasz = document.getElementById('valasz');
let sendBtn = document.getElementById('sendBtn');
let leaveBtn = document.getElementById('leaveBtn');
const socket = io();
let szam = 0;
let adatok = [];
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




socket.on('kerdesek', (results) => {
    adatok = results;
    kerdesek.innerHTML = adatok[szam].question;
});

socket.on('gameOver', (winner) => {

});

sendBtn.addEventListener('click', () => {
    if(adatok[szam].answer == valasz.value){
        renderMessage('System', 'Helyes válasz!');
    }
    socket.emit('sendAnswer', valasz.value);
    valasz.value = '';
    szam++
    kerdesek.innerHTML = adatok[szam].question;
});

leaveBtn.addEventListener('click', () => {
    socket.emit('leaveGame');
    document.location.href = '/';
});

function renderMessage(user, message){
    let li = document.createElement('li');
    li.textContent = `${user}: ${message}`;
    kerdesek.appendChild(li);
}


