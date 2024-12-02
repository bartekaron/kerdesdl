let usersList = document.getElementById('usersList');
let kerdesek = document.getElementById('kerdesek');
let valasz = document.getElementById('valasz');
let sendBtn = document.getElementById('sendBtn');
let leaveBtn = document.getElementById('leaveBtn');
const socket = io();
let szam = 0;
let valaszoltKerdesek = 0;
let correctAnswers = {}; 
let felhasznalokNeve = [];
let felhasznalokId = [];
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
    renderMessage('System', `${user.username} csatlakozott a játékhoz.`);
    felhasznalokNeve.push(user.username);
    felhasznalokId.push(socket.id);
});

socket.on('end', (winner) => {
    for (let i = 0; i < felhasznalokNeve.length; i++) {
        if(felhasznalokId[i] == winner) {
            winner = felhasznalokNeve[i];
        }
    }
    renderMessage('System', `A játék véget ért. A nyertes: ${winner}`);
})





socket.on('kerdesek', (results) => {
    adatok = results;
    szam = 0; 
    kerdesek.innerHTML = adatok[szam].question;
});

sendBtn.addEventListener('click', () => {

    if (valaszoltKerdesek == 2) {
        // Determine the user with the most correct answers
        let maxCorrectAnswers = 0;
        let winner = '';
        for (let user in correctAnswers) {
            if (correctAnswers[user] > maxCorrectAnswers) {
                maxCorrectAnswers = correctAnswers[user];
                winner = user;
            }
        }
        socket.emit('gameOver', winner);
    }
    else{
        if (adatok[szam].answer == valasz.value) {
            renderMessage('System', 'Helyes válasz!');

            if (!correctAnswers[socket.id]) {
                correctAnswers[socket.id] = 0;
            }
            correctAnswers[socket.id]++;
        }
        socket.emit('sendAnswer', valasz.value); // Válasz elküldése
        valasz.value = '';
        valaszoltKerdesek++;
        console.log(valaszoltKerdesek);
    }
    
     
   
        
    // Ha mindenki válaszolt, csak akkor frissítjük a kérdést
    // A kérdés csupán akkor frissül, ha az összes játékos válaszolt.
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

socket.on('gameFull', (message) => {
    alert(message);
    document.location.href = '/';
});



/*
const { render } = require("ejs");

let usersList = document.getElementById('usersList');
let kerdesek = document.getElementById('kerdesek');
let valasz = document.getElementById('valasz');
let sendBtn = document.getElementById('sendBtn');
let leaveBtn = document.getElementById('leaveBtn');
const socket = io();
let szam = 0;
let adatok = [];
let valaszoltKerdesek = 0;
let correctAnswers = {}; 
let felhasznalokNeve = [];
let felhasznalokId = [];
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
    renderMessage('System', `${user.username} csatlakozott a játékhoz.`);
    felhasznalokNeve.push(user.username);
    felhasznalokId.push(socket.id);
});


socket.on('end', (winner) => {
    for (let i = 0; i < felhasznalokNeve.length; i++) {
        if(felhasznalokId[i] == winner) {
            winner = felhasznalokNeve[i];
        }
    }
    renderMessage('System', `A játék véget ért. A nyertes: ${winner}`);
})


socket.on('kerdesek', (results) => {
    adatok = results;
    szam = 0; 
    kerdesek.innerHTML = adatok[szam].question;
});

sendBtn.addEventListener('click', () => {
    if (valaszoltKerdesek < 10) {
        if (adatok[szam].answer == valasz.value) {
            renderMessage('System', 'Helyes válasz!');

            if (!correctAnswers[socket.id]) {
                correctAnswers[socket.id] = 0;
            }
            correctAnswers[socket.id]++;
        }
        socket.emit('sendAnswer', valasz.value); // Válasz elküldése
        valasz.value = '';
        valaszoltKerdesek++;
        console.log(valaszoltKerdesek);
    }
     
    if (valaszoltKerdesek == 10) {
        // Determine the user with the most correct answers
        let maxCorrectAnswers = 0;
        let winner = '';
        for (let user in correctAnswers) {
            if (correctAnswers[user] > maxCorrectAnswers) {
                maxCorrectAnswers = correctAnswers[user];
                winner = user;
            }
        }
        socket.emit('gameOver', winner);
    }
        
    // Ha mindenki válaszolt, csak akkor frissítjük a kérdést
    // A kérdés csupán akkor frissül, ha az összes játékos válaszolt.
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

socket.on('gameFull', (message) => {
    alert(message);
    document.location.href = '/';
});
*/