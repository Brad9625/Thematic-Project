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