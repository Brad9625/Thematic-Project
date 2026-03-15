from type import Type

class Node:    
    def __init__(self, type: Type, neighbours: list):
        self._type = type
        self._neighbours = []
        for neighbour in neighbours:
            self.SetNeighbour(neighbour)

    def Next(self, card: Type): #finds the next node to go to based on card
        if self._type != Type.Location:
            return self._neighbours #if this is not a location, there are only two next nodes
        else:
            nextNodes = [] #create blank list of potential nodes
            for neighbour in self._neighbours: #search through neighbours
                if neighbour._type == card:
                    nextNodes.append(neighbour) #add each compatible neighbour node
            return nextNodes
        
    def SetNeighbour(self, neighbour: Node): #add a new neighbour node
        self._neighbours.append(neighbour)
        neighbour._neighbours.append(self) #remember to add this node as a neighbour too!
        
        
class Location(Node):
    def __init__(self, id: int):
        self._id = id
        self._type = Type.Location #automatically set type to be location
        self._neighbours = [] #blank neighbour set

class Map:
    def __init__(self):
        return

    def _BuildMap(self, locationList: list, routeList: list):
        self.locationNodeList = [] #create blank list to contain location NODES
        for loc in locationList:
            self.locationNodeList.append(Location(loc)) #make list of locations from ID numbers
        for route in routeList: #now iterate through routelist (format is (loc,dest,type),(loc,dest,type))
            for location in self.locationNodeList:
                if location._id == route[0]: #get the start of route
                    locStart = location
                if location._id == route[1]: #get end of route
                    locEnd = location
            if locStart and locEnd:
                locStart.SetNeighbour(Node(route[2], [locEnd])) #add route to start location