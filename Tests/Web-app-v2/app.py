from flask import Flask, render_template
import requests

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/rules")
def rules():
    return render_template("rules.html")

@app.route("/play")
def play():
    return render_template("GameScreen.html")




@app.route("/start_game", methods=["POST"]) 
def start_game():
    url = "I: http://trinity-developments.co.uk/games"

    data = {
        "name": "meow",
        "mapID": "2342341241",
        "GameLength": "default"
    }

    response = requests.post(url, json=data)


    






@app.route("/make_move", methods=["POST"])
def make_move():
    start_game.(response["gameID"])



if __name__ == "__main__":
    app.run(debug=True)
