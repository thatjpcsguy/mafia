from datetime import datetime, date, time

#CONSTANTS
PURPLE = '\033[95m'
BLUE = '\033[94m'
GREEN = '\033[92m'
ORANGE = '\033[93m'
RED = '\033[91m'
ENDC = '\033[0m'

#THE HOUR OF DAY WHEN DAY TURNS TO NIGHT
DAY_HOUR = 12


class Player:
    def __init__(self, name, type):
        self._name = name
        self._type = type

class DayHandler:
    def __init__(self):
        self.current_day = 0

    def get_day():

    def is_day(self):
        return datetime.now().time() > time(DAY_HOUR)


class Game:
    def __init__(self, id):
        self._id = int(id)
        try:
           with open('.player'):
               
        except IOError:
           


        self._day = DayHandler()


    def set_me(self, me):
        self._me = me



print BLUE + "Welcome To Mafia!" + ENDC


game = Game(raw_input(ORANGE + "Please enter the game ID: " + ENDC))


#print me