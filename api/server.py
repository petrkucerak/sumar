from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

# Initialize Flask application
app = Flask(__name__)
# Allow cross-origin requests from specific domain
CORS(app, origins=["https://sumar.diecezko.cz"])

DATA_FILE = "data.json"  # Path to the JSON file storing user scores


def load_data():
    """Load data from the JSON file. If the file does not exist, return an empty list."""
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_data(data):
    """Save the provided data to the JSON file."""
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)


@app.route("/scores", methods=["GET"])
def get_scores():
    """Retrieve the leaderboard with names, scores, and levels."""
    data = load_data()
    return jsonify([{"name": d["name"], "score": d["score"], "level": d["level"]} for d in data])


@app.route("/submit", methods=["POST"])
def submit_score():
    """Submit a new score for an existing user. Updates only if the new score is higher."""
    data = load_data()
    new_entry = request.json
    name, secret, level, score = new_entry.get("name"), new_entry.get(
        "secret"), new_entry.get("level"), new_entry.get("score")

    # Validate request fields
    if not name or not secret or level is None or score is None:
        return jsonify({"error": "Missing fields"}), 400

    for entry in data:
        if entry["name"] == name:
            if entry["secret"] != secret:
                # Reject if secret does not match
                return jsonify({"error": "Invalid secret"}), 403

            # Update score only if it is higher
            if score > entry["score"]:
                entry["score"] = score
                # Keep the highest level achieved
                entry["level"] = max(entry["level"], level)
                save_data(data)
                return jsonify({"message": "Score has been updated."})

            return jsonify({"message": "Score was not beaten, remains unchanged."})

    return jsonify({"error": "User not found"}), 404


@app.route("/register", methods=["POST"])
def register_user():
    """Register a new user with a unique name and secret."""
    data = load_data()
    new_user = request.json
    name, secret = new_user.get("name"), new_user.get("secret")

    # Validate request fields
    if not name or not secret:
        return jsonify({"error": "Missing fields"}), 400

    for entry in data:
        if entry["name"] == name:
            if entry["secret"] == secret:
                return jsonify({"message": "Welcome back. Your name and secret match an existing record. If you beat your current score, it will be updated in the hall of fame."})
            return jsonify({"error": "Name is already taken. Either enter the correct secret or choose a different name."}), 403

    # Register a new user with an initial score of 0
    data.append({"name": name, "secret": secret, "level": 0, "score": 0})
    save_data(data)
    return jsonify({"message": "Your name has been added to the hall of fame. Your achievements will now be recorded."})


if __name__ == "__main__":
    # Run the server on all available network interfaces
    app.run(host="0.0.0.0", port=5000)
