from flask import Flask, request, render_template, jsonify
from flask_socketio import SocketIO, send, emit, join_room, leave_room
from map import Node, Location, Map
from pawn import Pawn, MrX
from random import sample, randint
from type import Type
import requests

app = Flask(__name__)
socketio = SocketIO(app)
db = "http://trinity-developments.co.uk"

# game data
Pawns = []
gameMap = Map()
tempRoutes = [
    {
      "locationA": 1,
      "locationB": 2,
      "ticket": "Yellow"
    },
    {
      "locationA": 2,
      "locationB": 3,
      "ticket": "Yellow"
    },
    {
      "locationA": 3,
      "locationB": 4,
      "ticket": "Yellow"
    },
    {
      "locationA": 4,
      "locationB": 5,
      "ticket": "Yellow"
    },
    {
      "locationA": 5,
      "locationB": 6,
      "ticket": "Yellow"
    },
    {
      "locationA": 6,
      "locationB": 7,
      "ticket": "Yellow"
    },
    {
      "locationA": 7,
      "locationB": 1,
      "ticket": "Yellow"
    },
    {
      "locationA": 1,
      "locationB": 3,
      "ticket": "Green"
    },
    {
      "locationA": 3,
      "locationB": 6,
      "ticket": "Green"
    },
    {
      "locationA": 1,
      "locationB": 5,
      "ticket": "Red"
    }
]
tempLocations = [
    {
      "location": 1,
      "xPos": 56,
      "yPos": 82
    },
    {
      "location": 2,
      "xPos": 223,
      "yPos": 55
    },
    {
      "location": 3,
      "xPos": 352,
      "yPos": 80
    },
    {
      "location": 4,
      "xPos": 435,
      "yPos": 206
    },
    {
      "location": 5,
      "xPos": 361,
      "yPos": 309
    },
    {
      "location": 6,
      "xPos": 199,
      "yPos": 307
    },
    {
      "location": 7,
      "xPos": 79,
      "yPos": 219
    }
]

### import map ###
'''
def importMap(): #can be modified to allow other maps...
    mapdata = requests.get(db+"/maps/1", timeout=5) #get data of map
    data = mapdata.json()

    locationlist = []
    for loc in data["locations"]:
        newLoc = Location(loc["location"])
        newLoc.setLocation(loc["xPos"], loc["yPos"], data["mapWidth"], data["mapHeight"])
        locationlist.append(newLoc)
    socketio.emit(
                'drawMap',
                {
                    'image' : data["mapImage"],
                    'width' : data["mapWidth"],
                    'height' : data["mapHeight"],
                },
                broadcast=True
            ) 
'''

#page loading
@app.route('/')
def index_page():
    return render_template('index.html')

@app.route('/client')
def client_page():
    return render_template('PhoneApp.html')

#websocket handlers

@socketio.on('move')
def makemove(data):
    #get data parameters
    player = data['colour']
    locationTo = data['locationTo']
    method = data['method']

    match method:
            case "Yellow":
                ticketType = Type.Taxi
            case "Red":
                ticketType = Type.Underground
            case "Green":
                ticketType = Type.Bus
            case "Black":
                ticketType = Type.Ferry

    for pawn in Pawns:
        if pawn._colour == player:
            currentPawn = pawn
    if validateMove(currentPawn, locationTo, ticketType): #if move is valid
        if currentPawn.UseCard(method):
            if currentPawn._colour == "clear":
                currentPawn._count += 1
            currentPawn._position = int(locationTo)
            emit(
                'detMove',
                {
                    'colour': player,
                    'locationTo': locationTo
                },
                broadcast=True
            )    

### Temp Build Map ###
def buildTempMap():
    locationList = []
    for location in tempLocations:
        newLoc = Location(location["location"])
        newLoc.setLocation(location["xPos"], location["yPos"], 506, 369)
        locationList.append(newLoc)
    routeList = []
    for route in tempRoutes:
        match route["ticket"]:
            case "Yellow":
                ticketType = Type.Taxi
            case "Red":
                ticketType = Type.Underground
            case "Green":
                ticketType = Type.Bus
            case "Black":
                ticketType = Type.Ferry
        neighbours = []
        for location in locationList:
            if route["locationA"] == location._id or route["locationB"] == location._id:
                neighbours.append(location)
        newNode = Node(ticketType, neighbours)
        routeList.append(newNode)
    gameMap._BuildMap(locationList, routeList)

#### MAIN ####
if __name__ == '__main__':
    pawnList = ["Clear", "Red", "Green"]
    buildTempMap()
    for pawn in pawnList:
        if pawn == "Clear":
            pos = 1
        if pawn == "Red":
            pos = 5
        if pawn == "Green":
            pos = 7
        Pawns.append(Pawn(pawn, pos))
    socketio.run(app, debug=True)

    '''gameComplete = False
    while not gameComplete: #completion logic
        mrxloc = -1
        for pawn in Pawns:
            #turn(pawn)
            if pawn._colour == "clear":
                mrxloc = pawn._position
            if pawn._position == mrxloc:
                gameComplete == True'''


### move validation ###
def validateMove(pawn, toLoc, type):
    fromLoc = pawn._position
    found = False
    for location in gameMap.locationNodeList:
        if location._id == int(fromLoc):
            for node in location._neighbours:
                for endpoint in node._neighbours:
                    if endpoint._id == int(toLoc) and (type == node._type or type == Type.Ferry):
                        found = True
    return found
