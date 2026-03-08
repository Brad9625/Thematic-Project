from flask import Flask, render_template
from flask_socketio import SocketIO, join_room, emit
import requests, random

app = Flask(__name__)
socketio = SocketIO(app)


games = {}



def test_code_until_nicks_server_setup():
    return str(random.randint(1000,9999))




@app.route("/")
def home():
    return render_template("index.html")

@app.route("/rules")
def rules():
    return render_template("rules.html")


@app.route("/play")
def play():
    return render_template("GameCreation.html")















# these 2 funcs are placeholders, will be edited
@socketio.on("create_game")
def create_game():

    code = test_code_until_nicks_server_setup()
    games[code] = ["Me"]

    join_room(code)

    emit("game_created", {
        "code": code,
        "players": games[code]
    })


@socketio.on("join_game")
def join_game(data):
    code = data["code"]
    player = data["player"]

    if code in games:
        games[code].append(player)
        join_room(code)

        emit("player_update", {
            "code": code,
            "players": games[code]
        }, to=code)






if __name__ == "__main__":
    socketio.run(app, debug=True)