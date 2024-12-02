let nameField = document.querySelector('#name');
let gameField = document.querySelector('#game');
let gamesSelect = document.querySelector('#games');
let loginBtn = document.querySelector('#login');

const socket = io();

loginBtn.addEventListener('click', ()=>{
    if (nameField.value == ''){
        alert('Hiányzó név!');
        return
    }

    if (gameField.value == '' && gamesSelect.value == ''){
        alert('Hiányzó játék neve!');
        return
    }

    let username = nameField.value;
    let game = gameField.value;
    
    if (gameField.value == ''){
        game = gamesSelect.value;
    }

    document.location.href = `game/${game}/${username}`;

});

socket.emit('getGameList');

socket.on('updateGameList', (games) => {
    gamesSelect.innerHTML = '<option value="" selected>Join to an existing game: </option>';
    games.forEach(game => {
        let option = document.createElement('option');
        option.value = game;
        option.innerText = game;
        gamesSelect.appendChild(option);
    });
});