from node import Node, Location

class Map:
    def __init__(self):
        return

    def _BuildMap(self, locationList: list, routeList: list):
        locationNodeList = [] #create blank list to contain location NODES
        for idNumber in locationList:
            locationNodeList.append(Location(idNumber)) #make list of locations from ID numbers
        for route in routeList: #now iterate through routelist (format is (loc,dest,type),(loc,dest,type))
            for location in locationNodeList:
                if location._id == route[0]: #get the start of route
                    locStart = location
                if location._id == route[1]: #get end of route
                    locEnd = location
            if locStart and locEnd:
                locStart.SetNeighbour(Node(route[2], [locEnd])) #add route to start location
        
        for i in locationNodeList:
            if i._id == 1:
                self.root = i