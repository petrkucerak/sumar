"""Module for generating game levels.

This script contains functions such as generate_level_id, generate_level, and generate_game_set.
It is responsible for assembling and outputting different game board configurations.
"""

import random
import json

# Create a matrix


# Fill with random values from 1 to 9

# Compute borders

# Generate list of levels

def generate_level_id(level_data):
    ret = ""
    rows, cols = level_data['size']
    for row in range(rows):
        for col in range(cols):
            ret += f"{level_data['board'][row][col]}"
    for row in range(rows):
        ret += f"-{level_data['row'][row]}"
    for col in range(cols):
        ret += f"-{level_data['col'][col]}"
    return ret


def generate_level(board_size, level_number, board_min_int, board_max_int):
    """
    Generate a game level with random numbers and calculate row/column sums.

    Args:
        board_size (tuple): A tuple of (rows, cols) defining the board dimensions
        level_number (int): The level number to assign to this level

    Returns:
        tuple: (level_data, level_id) where:
            - level_data is a dictionary containing the board, row sums, column sums, and level number
            - level_id is a unique string identifier for this level
    """

    rows, cols = board_size
    board = [[random.randint(board_min_int, board_max_int)
              for _ in range(cols)] for _ in range(rows)]
    board_mask = [[random.randint(0, 1) for _ in range(cols)]
                  for _ in range(rows)]

    row_sum = [0] * rows
    col_sum = [0] * cols

    for row in range(rows):
        for col in range(cols):
            row_sum[row] += board[row][col] * board_mask[row][col]

    for col in range(cols):
        for row in range(rows):
            col_sum[col] += board[row][col] * board_mask[row][col]

    level_data = {
        "size": board_size,
        "board": board,
        "row": row_sum,
        "col": col_sum,
        "level": level_number
    }
    level_id = generate_level_id(level_data)
    return level_data, level_id


def generate_game_set(board_size, level_count, start_level, output_path, board_min_int=1, board_max_int=9):
    """
    Generate a set of unique game levels and save them to a JSON file.

    Args:
        board_size (tuple): A tuple of (rows, cols) defining the board dimensions
        level_count (int): The number of levels to generate
        start_level (int): 
        output_path (str): Path where the JSON file will be saved

    Returns:
        None
    """
    game_id_set = set()
    data = []

    for level_number in range(level_count):
        # Generate unique level
        level_complete = False
        while not level_complete:
            level_data, level_id = generate_level(
                board_size, start_level + level_number, board_min_int, board_max_int)
            # If level unique, save id in the set and write level to the
            # output file
            if level_id not in game_id_set:
                game_id_set.add(level_id)
                data.append(level_data)
                level_complete = True
    try:
        with open(output_path, "w+", encoding="utf-8") as f:
            json.dump(data, f)
        print(f"Successfully generated {level_count} levels at {output_path}")
    except IOError as e:
        print(f"Error writing to {output_path}: {e}")


if __name__ == "__main__":
    generate_game_set((5, 5), 10, 1,    "5x5_1-5_levels.json", 1, 5)
    generate_game_set((5, 5), 10, 11,   "5x5_1-7_levels.json", 1, 7)
    generate_game_set((5, 5), 29, 21,   "5x5_1-9_levels.json", 1, 9)
    generate_game_set((5, 5), 50, 50,   "5x5_-1-9_levels.json", -1, 9)
    generate_game_set((5, 5), 100, 100, "5x5_-1-12_levels.json", -1, 12)
    generate_game_set((5, 5), 300, 200, "5x5_-1-19_levels.json", -1, 19)
    generate_game_set((5, 5), 250, 500, "5x5_-9-19_levels.json", -9, 19)
    generate_game_set((5, 5), 25, 750,  "5x5_-19-19_levels.json", -19, 19)
    # generate_game_set((7, 7), 100, 201, "7x7_levels.json")
    # generate_game_set((9, 9), 100, 301, "9x9_levels.json")
    print("Game levels generated successfully!")
