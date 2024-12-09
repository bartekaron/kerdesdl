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
let totalUsers = 0;// Track the total number of users
let lastQuestionAnswers = 0; // Track the number of answers for the last question

socket.emit('joinToGame');

socket.on('updateGameUsers', ({ gameUsers, userNames, userIds }) => {
    usersList.innerHTML = '';
    let ul = document.createElement('ul');
    usersList.appendChild(ul);

    felhasznalokNeve = userNames;
    felhasznalokId = userIds;

    gameUsers.forEach(user => {
        let li = document.createElement('li');
        li.textContent = user.username;
        ul.appendChild(li);
    });
});


socket.on('updateUserCount', (count) => {
    totalUsers = count;
    console.log("Updated total users:", totalUsers);
});

socket.on('updateLastQuestionAnswers', (count) => {
    lastQuestionAnswers = count;
    console.log("Updated last question answers:", lastQuestionAnswers);
});

socket.on('userConnected', (user) => {
    renderMessage('System', `${user.username} csatlakozott a játékhoz.`);
    felhasznalokNeve.push(user.username);
    felhasznalokId.push(user.id); // Ensure the correct user ID is pushed
});


socket.on('end', (winnerId) => {
    let winnerName = 'Senki';
    for (let i = 0; i < felhasznalokNeve.length; i++) {
        if (felhasznalokId[i] == winnerId) {
            winnerName = felhasznalokNeve[i];
            break;
        }
    }
    renderMessage('System', `A játék véget ért. A nyertes: ${winnerName}`);
    sendBtn.disabled = true;
});


socket.on('kerdesek', (results) => {
    adatok = results;
    szam = 0; 
    kerdesek.innerHTML = adatok[szam].question;
    
   
});

sendBtn.addEventListener('click', () => {
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
    console.log("Valaszolt kerdesek", valaszoltKerdesek);
    if (valaszoltKerdesek == 2) {
        lastQuestionAnswers++;
        socket.emit("lastQuestionAnswered", (lastQuestionAnswers));
        console.log("Utso valasz", lastQuestionAnswers);
        console.log("Total users", totalUsers);
        if (lastQuestionAnswers === totalUsers) {
            console.log("babos");
            let max = 0;
            let winner = '';
            for (let key in correctAnswers) {
                if (correctAnswers[key] > max) {
                    max = correctAnswers[key];
                    winner = key;
                }
            }
            socket.emit('gameOver', winner);
        }
    }
});


socket.on('necsinald', () => {
    sendBtn.disabled = true;
})
socket.on('csinald', () => {
    sendBtn.disabled = false;
  
    
    
})

leaveBtn.addEventListener('click', () => {
    socket.emit('leaveGame');
    totalUsers--;
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



