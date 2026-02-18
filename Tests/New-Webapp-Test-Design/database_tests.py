import database
from database import json_db
import json

if __name__ == "__main__":
    game = json_db(game_id=112)

    # add players
    game.add_player(1, "Meow", "mr_x")
    game.add_player(2, "Kitty", "detective")

    # give tickets
    game.players[0]["tickets"]["taxi"] = 4
    game.players[1]["tickets"]["taxi"] = 10

    # test move changes
    game.changed_position_to(1, "45")
    game.use_ticket(1, "taxi")
    game.save_move("mr x -> 45 (taxi)")

    game.changed_position_to(2, "13")
    game.use_ticket(2, "taxi")
    game.save_move("Kitty -> 13 (taxi)")

    print("\nJSON:")
    print(game.save_normal())

    # save to file
    game.save_json()
    print("\nfile saved as game_112.json")

    # say file content
    with open("game_112.json", "r") as f:
        data = json.load(f)
        print("\nfrom file:")
        print(json.dumps(data, indent=4))
