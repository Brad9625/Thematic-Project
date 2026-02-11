from type import Type

INIT_CARDS = { Type.Bus : 8, Type.Taxi : 11, Type.Underground : 4 }

class Pawn:
    def __init__(self, colour: str, start: int):
        self._colour = colour
        self._position = start
        self._cards = INIT_CARDS.copy()

    def UseCard(self, card: Type):
        if self._cards[card] > 0:
            self._cards[card] -= 1
            return True
        elif self._cards[card] == -1: #if moves are unlimited
            return True
        else:
            return False
        
class MrX(Pawn):
    def __init__(self, start: int):
        self._count = 0
        self._colour = "black"
        self._position = start
        self._cards = { Type.Bus : -1, Type.Taxi : -1, Type.Underground : -1, Type.Ferry : 5, Type.TimesTwo : 2} 
        #unique cards for Mr X, -1 means unlimited