const socket = io();

let loading_on = null;
let untilVanishes = null;

let currentPlayerName = "";
let currentLobbyCode = "";
let currentHost = "";
let currentPlayerId = null;





// loading dots
function startLoadingAnimation() {
    const lt = document.getElementById("loading_text");
    let dots = 0;

    loading_on = setInterval(() => {
        dots = (dots + 1) % 4;
        lt.innerText = "Creating lobby" + ".".repeat(dots);
    }, 500);
}

function stopLoadingAnimation() {
    clearInterval(loading_on);
    loading_on = null;
}




// error box
function showTopMessage(message) {
    const box = document.getElementById("top_message");
    const text = document.getElementById("top_message_text");

    if (!box || !text) return;

    clearTimeout(untilVanishes);

    text.textContent = message;
    box.classList.remove("hidden");
    box.classList.add("show");

    untilVanishes = setTimeout(() => {
        hideTopMessage();
    }, 10000);
}

function hideTopMessage() {
    const box = document.getElementById("top_message");
    if (!box) return;

    clearTimeout(untilVanishes);

    box.classList.remove("show");
    box.classList.add("hidden");
}











function createGame() {
    const gameName = document.getElementById("game_name_input").value.trim();
    const playerCount = parseInt(document.getElementById("player_count_input").value);
    const leaderName = document.getElementById("leader_name_input").value.trim();

    if (!leaderName || !gameName || isNaN(playerCount) || playerCount < 3) {
        showTopMessage("Please enter a the game details");
        return;
    }   

    currentPlayerName = leaderName;

    document.getElementById("join_lobby").style.display = "none";
    document.getElementById("make_game_buttons").style.display = "none";
    document.getElementById("loading_message").style.display = "block";
    document.getElementById("create_game_box").style.display = "none";

    startLoadingAnimation();

    socket.emit("create_game", {
        player: leaderName,
        gameName: gameName,
        maxPlayers: playerCount
    });
}

function joinGame() {
    document.getElementById("join_lobby").style.display = "block";
    document.getElementById("make_game_buttons").style.display = "none";
    document.getElementById("display_new_game").style.display = "none";
    document.getElementById("create_game_box").style.display = "none";
}

function submitJoin() {
    const code = document.getElementById("join_code_input").value.trim();
    const name = document.getElementById("nickname_input").value.trim();

    if (!code || !name) return;

    currentPlayerName = name;
    currentLobbyCode = code;

    socket.emit("join_game", {
        code: code,
        player: name
    });
}


// after clicking create game button
socket.on("game_created", (data) => {
    stopLoadingAnimation();

    currentLobbyCode = data.code;
    currentHost = data.host || currentPlayerName;
    currentPlayerId = data.playerId;

    document.getElementById("lobby").style.display = "block";
    document.getElementById("join_lobby").style.display = "none";
    document.getElementById("game_code").innerText = data.code;
    document.getElementById("loading_message").style.display = "none";
    document.getElementById("create_game_box").style.display = "none";

    updatePlayers(data.players, data.maxPlayers, data.gameName);

    if (currentPlayerName === currentHost) {
        document.getElementById("start_game").style.display = "block";
    }
});

socket.on("player_update", (data) => {
    currentLobbyCode = data.code;
    currentHost = data.host || data.leader || currentHost;

    document.getElementById("lobby").style.display = "block";
    document.getElementById("join_lobby").style.display = "none";
    document.getElementById("game_code").innerText = data.code;
    document.getElementById("create_game_box").style.display = "none";

    updatePlayers(data.players, data.maxPlayers, data.gameName);

    if (currentPlayerName === currentHost) {
        document.getElementById("start_game").style.display = "block";
    } else {
        document.getElementById("start_game").style.display = "none";
    }
});

function updatePlayers(players, maxPlayers, gameName) {
    const slotsContainer = document.getElementById("player_places");
    const lobbyTitle = document.getElementById("lobby_title");

    if (!slotsContainer || !players) return;

    if (lobbyTitle && gameName) {
        lobbyTitle.textContent = `Lobby (${gameName})`;
    }

    slotsContainer.innerHTML = "";

    const limit = maxPlayers || 6;

    for (let i = 0; i < limit; i++) {
        const slot = document.createElement("div");
        slot.classList.add("player_place");

        const icon = document.createElement("div");
        icon.classList.add("player_icon");

        const img = document.createElement("img");
        const name = document.createElement("p");

        if (i < players.length) {
            img.src = "/static/images/user_here.png";
            name.textContent = players[i];
        } else {
            img.src = "/static/images/user_not_here.png";
            name.textContent = "person not here";
        }

        icon.appendChild(img);
        slot.appendChild(icon);
        slot.appendChild(name);
        slotsContainer.appendChild(slot);
    }
}

function startGame() {
    socket.emit("start_game", {
        code: currentLobbyCode,
        playerId: currentPlayerId
    });
}

socket.on("joined_game", (data) => {
    currentLobbyCode = data.code;
    currentPlayerId = data.playerId;
    currentHost = data.host;
});

function resetLobby() {
    window.location.reload();
}

socket.on("game_started", function(data) {
    alert("Game started!");
});

socket.on("game_error", function(data) {
    stopLoadingAnimation();
    showTopMessage(data.error);
});