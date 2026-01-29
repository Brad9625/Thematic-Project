from flask import Flask, request, render_template
from flask_socketio import SocketIO, send, emit, join_room, leave_room
from map import Node, Location, Map

app = Flask(__name__)

#page loading
@app.route('/')
def index_page():
    return render_template('index.html')

#websocket handlers
@socketio.on('move')
def makemove(data):
    detective = data[0]
    locationTo = data[1]
    method = data[2]
    emit("detMove", ,broadcast=True)  #TODO - validate and modify transport cards    

if __name__ == '__main__':
    socketio.run(app, debug=True)