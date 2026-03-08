const socket = io();








// most of this file is just to hide and show parts of the display depending on the situuation






function createGame(){
    document.getElementById("join_lobby").style.display = "none";
    socket.emit("create_game");
}




function joinGame(){
    document.getElementById("join_lobby").style.display = "block";
}








function submitJoin(){
    const code = document.getElementById("join_code_input").value.trim();
    const name = document.getElementById("nickname_input").value.trim();

    if (!code || !name) return;

    socket.emit("join_game", {
        code: code,
        player: name
    });
}

socket.on("game_created", (data) => {

    document.getElementById("lobby").style.display = "block";
    document.getElementById("join_lobby").style.display = "none";
    document.getElementById("game_code").innerText = data.code;

    updatePlayers(data.players);

});



socket.on("player_update", (data) => {

    document.getElementById("lobby").style.display = "block";
    updatePlayers(data.players);

});

function updatePlayers(players){

    const list = document.getElementById("player_list");

    if(!list || !players) return;

    list.innerHTML = "";

    players.forEach(player => {
        const li = document.createElement("li");
        li.textContent = player;
        list.appendChild(li);
    });

}