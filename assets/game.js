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



socket.on('gameOver', (winner) => {

});

socket.on('kerdesek', (results) => {
    adatok = results;
    szam = 0; 
    kerdesek.innerHTML = adatok[szam].question;
});

sendBtn.addEventListener('click', () => {
    if (adatok[szam].answer == valasz.value) {
        renderMessage('System', 'Helyes válasz!');
    }
    socket.emit('sendAnswer', valasz.value); // Válasz elküldése
    valasz.value = '';

    // Ha mindenki válaszolt, csak akkor frissítjük a kérdést
    // A kérdés csupán akkor frissül, ha az összes játékos válaszolt.
});


socket.on('necsinald', () => {
    sendBtn.disabled = true;
})
socket.on('csinald', () => {
    sendBtn.disabled = false;
})


leaveBtn.addEventListener('click', () => {
    socket.emit('leaveGame');
    document.location.href = '/';
});

function renderMessage(user, message){
    let li = document.createElement('li');
    li.textContent = `${user}: ${message}`;
    kerdesek.appendChild(li);
}

socket.on('gameFull', (message) => {
    alert(message);
    document.location.href = '/';
});