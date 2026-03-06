from flask import Flask, request, render_template
from flask_socketio import SocketIO, send, emit, join_room, leave_room
from map import Node, Location, Map
from pawn import Pawn, MrX
from random import sample
from type import Type

app = Flask(__name__)
socketio = SocketIO(app)

# game data
minLoc = 0
maxLoc = 10
Pawns = []
gameMap = Map()
typeDict = {
        "Bus" : Type.Bus,
        "Taxi" : Type.Taxi,
        "Underground" : Type.Underground,
        "Ferry" : Type.Ferry
    }

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

    for pawn in Pawns:
        if pawn._colour == detective:
            currentPawn = pawn
    if validateMove(currentPawn, locationTo, method):
        if currentPawn.UseCard(typeDict[method]):
            if currentPawn._colour == "black":
                currentPawn._count += 1
            currentPawn._position = int(locationTo)
            emit(
                'detMove',
                {
                    'detective': detective,
                    'locationTo': locationTo
                },
                broadcast=True
            )    

## TEST DATA ##
locs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
connections = [(1,2,Type.Bus), (2,3,Type.Bus)]

if __name__ == '__main__':
    gameMap._BuildMap(locs, connections)

    colours = ["red", "blue", "green", "yellow", "purple"]
    startPositions = sample(range(minLoc, maxLoc), 6) # numbers determine locs
    for i in range(0, 5):
        pawn = Pawn(colours[i], startPositions[i])
        Pawns.append(pawn)
    Pawns.append(MrX(startPositions[5]))
    socketio.run(app, debug=True)

def validateMove(pawn, toLoc, type):
    fromLoc = pawn._position
    found = False
    for location in gameMap.locationNodeList:
        if location._id == int(fromLoc):
            for node in location._neighbours:
                for endpoint in node._neighbours:
                    if endpoint._id == int(toLoc) and (typeDict[type] == node._type or typeDict[type] == Type.Ferry):
                        found = True
    return found