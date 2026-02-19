from flask import Flask, render_template

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


if __name__ == "__main__":
    app.run(debug=True)
