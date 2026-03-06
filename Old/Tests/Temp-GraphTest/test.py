from map import Map
from type import Type

#TEST DATA


if __name__ == "__main__":
    locationlist = [1,2,3,4,5]
    routelist = [(1,3,Type.Bus),(5,1,Type.Underground),(1,2,Type.Taxi)]

    map = Map()
    map._BuildMap(locationList=locationlist, routeList=routelist)
    for neighbour in map.root._neighbours:
        if neighbour._type == Type.Taxi:
            for nb in neighbour._neighbours:
                if nb._id != 1:
                    nextobj = nb._id
            print(f"Taxi from 1 to {nextobj}")
        if neighbour._type == Type.Bus:
            for nb in neighbour._neighbours:
                if nb._id != 1:
                    nextobj = nb._id
            print(f"Bus from 1 to {nextobj}")
        if neighbour._type == Type.Underground:
            for nb in neighbour._neighbours:
                if nb._id != 1:
                    nextobj = nb._id
            print(f"Train from 1 to {nextobj}")