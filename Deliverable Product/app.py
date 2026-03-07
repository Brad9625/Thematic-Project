from flask import Flask, render_template, request, jsonify
import requests


app = Flask(__name__)
url = "http://trinity-developments.co.uk"  # Nicks server

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/rules")
def rules():
    return render_template("rules.html")

@app.route("/play")
def play():
    return render_template("GameCreation.html")

@app.route("/join")
def join():
    return render_template("JoinPhone.html")


@app.route("/maps", methods=["GET"])
def get_maps():
    r = requests.get(f"{url}/maps")
    if r.status_code == 200:
        return jsonify(r.json())
    else:
        return jsonify({"error": "Failed to retrieve maps"}), r.status_code


@app.route("/map/<int:map_id>", methods=["GET"])
def get_map(map_id):
    r = requests.get(f"{url}/maps/{map_id}")
    if r.status_code == 200:
        return jsonify(r.json())
    else:
        return jsonify({"error": "Failed to retrieve map"}), r.status_code


@app.route("/games", methods=["GET"])
def get_games():
    r = requests.get(f"{url}/games")
    if r.status_code == 200:
        return jsonify(r.json())
    else:
        return jsonify({"error": "Failed to retrieve games"}), r.status_code


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


@app.route("/move/<int:player_id>", methods=["POST"])
def make_move(player_id):
    data = request.json
    r = requests.post(f"{url}/players/{player_id}/moves", json=data)
    if r.status_code in [200, 201]:
        return jsonify(r.json())
    else:
        return jsonify({"error": "Failed to make move"}), r.status_code




if __name__ == "__main__":
    app.run(debug=True)
