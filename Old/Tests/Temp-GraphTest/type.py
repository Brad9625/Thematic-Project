from enum import Enum

class Type(Enum): #used to determine the type of node (location/route)
    Location = 0
    Taxi = 1
    Bus = 2
    Underground = 3
    Ferry = 4