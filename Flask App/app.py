from flask import Flask, request, render_template
from flask_socketio import SocketIO, send, emit, join_room, leave_room
from map import Node, Location, Map

app = Flask(__name__)
socketio = SocketIO(app)

#page loading
@app.route('/')
def index_page():
    return render_template('index.html')

@app.route('/client')
def client_page():
    return render_template('TEMP.html')

#websocket handlers
@socketio.on('move')
def makemove(data):
    detective = data['detective']
    locationTo = data['locationTo']
    method = data['method']
    emit(
        'detMove',
        {
            'detective': detective,
            'locationTo': locationTo
        },
        broadcast=True
    )  #TODO - validate and modify transport cards    

if __name__ == '__main__':
    socketio.run(app, debug=True)