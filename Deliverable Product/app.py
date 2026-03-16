from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, join_room, emit
import requests, random

from flask import Flask, request, render_template, redirect
from flask_socketio import SocketIO, send, emit, join_room, leave_room
from map import Node, Location, Map
from pawn import Pawn, MrX
from random import sample
from type import Type

app = Flask(__name__)
socketio = SocketIO(app)


games = {}

players = {}
pawns = []
typeDict = {
    "Red" : Type.Underground,
    "Green" : Type.Bus,
    "Yellow" : Type.Taxi,
    "Black" : Type.Ferry
}

locationList = {}
connectionList = []


useTestServer = False





if useTestServer:
    url = "http://localhost:5001" 

else:
    url = "http://trinity-developments.co.uk"  



def test_code_until_nicks_server_setup():
    return str(random.randint(1000,9999))

print(url)


@app.route("/")
def home():
    return render_template("index.html")

@app.route("/rules")
def rules():
    return render_template("rules.html")


@app.route("/play")
def play():
    return render_template("GameCreation.html")

@app.route("/gameplay/<code>")
def game_screen(code):
    return render_template("JoinPhone.html", code=code)














@socketio.on("create_game")
def create_game(data=None):
    if data is None:
        data = {}

    leader = data.get("player", "Me").strip()
    game_name = data.get("gameName", "New Game").strip()
    map_id = data.get("mapId", 1)
    game_length = data.get("gameLength", "short")

    try:
        max_players = max(3, int(data.get("maxPlayers", 3)))
    except (ValueError, TypeError):
        max_players = 3

    create_response = requests.post(f"{url}/games", json={
        "name": game_name,
        "mapId": map_id,
        "gameLength": game_length
    })

    if create_response.status_code not in [200, 201]:
        emit("game_error", {"error": "Failed to create game"})
        return

    server_game = create_response.json()
    code = str(server_game["gameId"])

    join_response = requests.post(f"{url}/games/{code}/players", json={
        "playerName": leader
    })

    if join_response.status_code not in [200, 201]:
        emit("game_error", {"error": "Game created, but host could not join"})
        return

    join_data = join_response.json()
    host_player_id = join_data["playerId"]

    lobby_response = requests.get(f"{url}/games/{code}")

    if lobby_response.status_code != 200:
        emit("game_error", {"error": "Could not load lobby"})
        return

    lobby_data = lobby_response.json()
    player_names = [p["playerName"] for p in lobby_data["players"]]

    games[code] = {
        "gameName": game_name,
        "hostName": leader,
        "hostPlayerId": host_player_id,
        "players": lobby_data["players"],
        "maxPlayers": max_players
    }

    join_room(code)

    emit("game_created", {
        "code": code,
        "players": player_names,
        "gameName": game_name,
        "host": leader,
        "playerId": host_player_id,
        "maxPlayers": max_players
    })




@socketio.on("join_game")
def join_game(data):
    code = str(data["code"]).strip()
    player = data["player"].strip()

    join_response = requests.post(f"{url}/games/{code}/players", json={
        "playerName": player
    })

    if join_response.status_code not in [200, 201]:
        try:
            error_message = join_response.json().get("message", "Could not join game")
        except:
            error_message = "Could not join game"

        emit("game_error", {"error": error_message})
        return

    join_data = join_response.json()
    player_id = join_data["playerId"]

    lobby_response = requests.get(f"{url}/games/{code}")

    if lobby_response.status_code != 200:
        emit("game_error", {"error": "Joined game, but could not load lobby"})
        return

    lobby_data = lobby_response.json()
    player_names = [p["playerName"] for p in lobby_data["players"]]




    if code not in games:
        games[code] = {
            "gameName": lobby_data.get("gameName", "Game"),
            "hostName": player_names[0] if player_names else "",
            "hostPlayerId": None,
            "players": lobby_data["players"]
        }
    else:
        games[code]["players"] = lobby_data["players"]

    join_room(code)

    

    emit("player_update", {
        "code": code,
        "players": player_names,
        "gameName": games[code]["gameName"],
        "host": games[code]["hostName"]
    }, to=code)

    emit("joined_game", {
        "code": code,
        "playerId": player_id,
        "gameName": games[code]["gameName"],
        "host": games[code]["hostName"]
    })




@socketio.on("join_room_code")
def join_room_code(data):
    code = str(data["code"])
    join_room(code)


@socketio.on("start_game")
def start_game_socket(data):
    code = str(data["code"]).strip()
    player_id = data["playerId"]

    start_response = requests.patch(f"{url}/games/{code}/start/{player_id}")

    if start_response.status_code != 200:
        try:
            error_message = start_response.json().get("message", "Could not start game")
        except:
            error_message = "Could not start game"

        emit("game_error", {"error": error_message})
        return

    lobby_response = requests.get(f"{url}/games/{code}")
    lobby_data = lobby_response.json()

    game_players = lobby_data["players"]

    pawns.clear()
    for player in game_players:

        player_id = player["playerId"]
        colour = player["colour"] 

        if colour.lower() == "clear":
            pawn = MrX(player["location"])
        else:
            pawn = Pawn(colour, player["location"])

        pawns.append(pawn)

        players[player_id] = colour

    
    
    emit("game_started", {
        "code": code,
        "pawns": [
        {
            "colour": pawn._colour.lower(),
            "location": pawn._position
        }
        for pawn in pawns
    ]
    }, to=code)






@app.route("/maps", methods=["GET"])
def get_maps():
    """gets the maps from the server

    Returns:
        list: {
            int: mapID,
            str: mapName,
            file: mapThumb
        }
    """
    r = requests.get(f"{url}/maps")
    if r.status_code == 200:
        return jsonify(r.json())
    else:
        return jsonify({"error": "Failed to retrieve maps"}), r.status_code


@app.route("/map/<int:map_id>", methods=["GET"])
def get_map(map_id):
    """gets the info for a specified map

    Args:
        map_id (int): the id of the map to get

    Returns:
        dict: {
            int: mapID,
            str: mapName,
            file: mapImage,
            str: mapThumb,
            int: mapWidth,
            int: mapHeight,
            list: locations {
                {
                int: location,
                int: xPos,
                int: yPos
                }
            }
        }
    """
    r = requests.get(f"{url}/maps/{map_id}")
    if r.status_code == 200:
        return jsonify(r.json())
    else:
        return jsonify({"error": "Failed to retrieve map"}), r.status_code


@app.route("/games", methods=["GET"])
def get_games():
    """Obtains a list of games from the server 

    Returns:
        int: gameID,
        str: gameName,
        int: mapID,
        str: mapName,
        file: mapThumb,
        str: status,
        list: players {
            int: playerID,
            str: playerName
        }

    """
    r = requests.get(f"{url}/games")
    if r.status_code == 200:
        return jsonify(r.json())
    else:
        return jsonify({"error": "Failed to retrieve games"}), r.status_code


"""
@app.route("/create_game", methods=["POST"])
def create_game():
    data = request.json
    r = requests.post(f"{url}/games", json=data)
    if r.status_code in [200, 201]:
        return jsonify(r.json())
    else:
        return jsonify({"error": "Failed to create game"}), r.status_code

        

@app.route("/join_game/<int:game_id>", methods=["POST"])
def join_game(game_id):
    data = request.json
    r = requests.post(f"{url}/games/{game_id}/players", json=data)
    if r.status_code in [200, 201]:
        return jsonify(r.json())
    else:
        return jsonify({"error": "Failed to join game"}), r.status_code
"""

@app.route("/start_game/<int:game_id>/<int:player_id>", methods=["PATCH"])
def start_game(game_id, player_id):
    r = requests.patch(f"{url}/games/{game_id}/start/{player_id}")
    if r.status_code == 200:
        return jsonify(r.json())
    else:
        return jsonify({"error": "Failed to start game"}), r.status_code


@app.route("/game/<int:game_id>", methods=["GET"])
def game_state(game_id):
    r = requests.get(f"{url}/games/{game_id}")
    if r.status_code == 200:
        return jsonify(r.json())
    else:
        return jsonify({"error": "Failed to retrieve game state"}), r.status_code


@app.route("/player/<int:player_id>", methods=["GET"])
def player_status(player_id):
    r = requests.get(f"{url}/players/{player_id}")
    if r.status_code == 200:
        return jsonify(r.json())
    else:
        return jsonify({"error": "Failed to retrieve player status"}), r.status_code


@app.route("/player/<int:player_id>/moves", methods=["GET"])
def player_moves(player_id):
    r = requests.get(f"{url}/players/{player_id}/moves")
    if r.status_code == 200:
        return jsonify(r.json())
    else:
        return jsonify({"error": "Failed to retrieve player moves"}), r.status_code


def check_move(detective, locationTo, method):
    for pawn in pawns:
        if pawn._colour == detective:
            currentPawn = pawn
            break
    if validateMove(currentPawn._position, locationTo, method):
        if currentPawn.UseCard(typeDict[method]):
            if currentPawn._colour == "clear":
                currentPawn._count += 1
            currentPawn._position = locationTo
            return True, currentPawn

@app.route("/move/<int:player_id>", methods=["POST"])
def make_move(player_id):

    data = request.json

    detective = players[player_id]
    locationTo = data['locationTo']
    method = data['method']

    success, result = check_move(detective, locationTo, method)

    if success:
        return jsonify({"status": "complete"})
    else:
        return jsonify({"error": result}), 400
    

@socketio.on("move")
def makemove(data):

    detective = players[data['player_id']]
    locationTo = data['locationTo']
    method = data['method']

    success, result = check_move(detective, locationTo, method)

    if success:
        emit(
            'detMove',
            {
                'detective': detective,
                'locationTo': locationTo
            },
            broadcast=True
        )




@app.route("/phone")
def phone():
    return render_template("JoinPhone.html")


if __name__ == "__main__":
    socketio.run(app, debug=True)


## New Validation ##
def validateMove(initialPosition, toLoc, type):
    found = False
    for connection in connectionList:
        if ((connection["locationA"] == initialPosition and connection["locationB"] == toLoc)
        or (connection["locationB"] == initialPosition and connection["locationA"] == toLoc)
        and (typeDict[type] == connection["type"] or typeDict[type] == Type.Ferry)):
            found = True
    return found