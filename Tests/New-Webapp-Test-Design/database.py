import json, time, random


"""
Json Database Contents

game_id: Integer - Unique ID for each game, used in the URL (and QR code if we go that route)
Status: String - Status of the game ("waiting", "in_progress")
turn_number: Integer - Current turn number, starting at 0
players: List of player objects, each containing:
    player_id: Integer - Unique ID for each player
    name: String - Player's name
    role: String - Player's role (mr. x, detective)
    Position: String - Current location of the player on the board
    tickets: Dictionary - Number of each type of ticket the player has (taxi, bus, underground)
History: Dictionary - key: turn_number, value: the move made

"""


class json_db: # (not a db, just a gamestate, named db for simplicty)
    def __init__(self, game_id):
        self.game_id = game_id
        self.status = "waiting"
        self.turn_number = 0
        self.players = []
        self.history = {}

    def add_player(self, player_id, name, role):
        """_summary_

        Args:
            player_id (int): ID of the moving player
            name (str): Name of the player
            role (str): Role of the player (mr. x, detective)
        """
        player = {
            "player_id": player_id,
            "name": name,
            "role": role,
            "position": None,
            "tickets": {"taxi": 0, "bus": 0, "underground": 0} # for teammates to edit as required
        }
        self.players.append(player)

    def changed_position_to(self, player_id, new_position):
        """Stores the new position of each player, following their move

        Args:
            player_id (int): ID of the moving player
            new_position (str): new position of the player after they move
        """
        for player in self.players:
            if player["player_id"] == player_id:
                player["position"] = new_position
                break
        self.turn_number += 1


    def use_ticket(self, player_id, ticket_type):
        """Stores and reduces the number of tickets each player has, following their move

        Args:
            player_id (int): ID of the moving player
            ticket_type (str): The type of ticket used (bus, taxi, underground)
        """
        for player in self.players:
            if player["player_id"] == player_id:
                if player["tickets"][ticket_type] > 0:
                    player["tickets"][ticket_type] -= 1
                break

    def save_move(self, move):
        """Method to save each move to history

        Args:
            move (Str): The move to be saved in the history
        """
        self.history[self.turn_number] = move

    def show_me(self):
        return {
            "game_id": self.game_id,
            "status": self.status,
            "turn_number": self.turn_number,
            "players": self.players,
            "history": self.history
        }

    def save_normal(self):
        return json.dumps(self.show_me(), indent=4)

    def save_json(self):
        with open(f"game_{self.game_id}.json", "w") as f:
            json.dump(self.show_me(), f, indent=4)



"""
TODO:
- Add a win condition
- Add current player
- Add remove player
- Add validation

"""