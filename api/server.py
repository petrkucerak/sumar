from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import re
import logging
from logging.handlers import RotatingFileHandler
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Initialize Flask application
app = Flask(__name__)

# Configure rate limiter: 1000 requests per hour per IP
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["1000 per hour"]
)

# Configure logging
if not os.path.exists('logs'):
    os.mkdir('logs')
file_handler = RotatingFileHandler(
    'logs/sumar_api.log', maxBytes=10240, backupCount=10)
file_handler.setFormatter(logging.Formatter(
    '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
))
file_handler.setLevel(logging.INFO)
app.logger.addHandler(file_handler)
app.logger.setLevel(logging.INFO)
app.logger.info('Sumar API startup')

# Allow cross-origin requests from specific domain
CORS(app, resources={r"*": {"origins": ["https://sumar.diecezko.cz", "https://22-implement-autosharing-sco.sumar-5fj.pages.dev"]}})

DATA_FILE = "data.json"  # Path to the JSON file storing user scores


def load_data():
    """Load data from the JSON file. If the file does not exist, return an empty list."""
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def is_valid_name(name):
    """Ensure the name contains only allowed characters."""
    return bool(re.match(r"^[a-zA-Z0-9_-]{3,20}$", name))


def save_data(data):
    """Save the provided data to the JSON file."""
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)


@app.route("/scores", methods=["GET"])
@limiter.limit("100 per minute")  # Custom limit for this endpoint
def get_scores():
    """Retrieve the leaderboard with names, scores, and levels."""
    data = load_data()
    return jsonify([{"name": d["name"], "score": d["score"], "level": d["level"]} for d in data])


@app.route("/submit", methods=["POST"])
def submit_score():
    """Submit a new score for an existing user. Updates only if the new score is higher."""
    if not request.is_json:
        return jsonify({"error": {"english": "Request must be JSON", "czech": "Požadavek musí být ve formátu JSON"}}), 400

    data = load_data()
    new_entry = request.json
    name, secret, level, score = new_entry.get("name"), new_entry.get(
        "secret"), new_entry.get("level"), new_entry.get("score")

    # Validate score and level are integers
    try:
        level = int(level)
        score = int(score)
    except (ValueError, TypeError):
        return jsonify({"error": {"english": "Level and score must be integers", "czech": "Úroveň a skóre musí být celá čísla"}}), 400

    # Validate score and level are positive
    if score < 0 or level < 0:
        return jsonify({"error": {"english": "Level and score must be positive", "czech": "Úroveň a skóre musí být kladná"}}), 400

    # Validate request fields
    if not name or not secret or level is None or score is None:
        return jsonify({"error": {"english": "Missing fields", "czech": "Chybějící pole"}}), 400

    if not is_valid_name(name):
        return jsonify({"error": {"english": "Invalid name format", "czech": "Neplatný formát jména"}}), 400

    for entry in data:
        if entry["name"] == name:
            if entry["secret"] != secret:
                return jsonify({"error": {"english": "Invalid secret", "czech": "Neplatný tajný kód"}}), 403

            if int(score) > int(entry["score"]):
                entry["score"] = score
                entry["level"] = max(int(entry["level"]), int(level))
                save_data(data)
                return jsonify({"message": {"english": "Score has been updated.", "czech": "Skóre bylo aktualizováno."}})

            return jsonify({"message": {"english": "Score was not beaten, remains unchanged.", "czech": "Skóre nebylo překonáno, zůstává nezměněno."}})

    return jsonify({"error": {"english": "User not found", "czech": "Uživatel nebyl nalezen"}}), 404


@app.route("/register", methods=["POST"])
def register_user():
    """Register a new user with a unique name and secret."""
    data = load_data()
    new_user = request.json
    name, secret = new_user.get("name"), new_user.get("secret")

    # Validate request fields
    if not name or not secret:
        return jsonify({"error": {"english": "Missing fields", "czech": "Chybějící pole"}}), 400

    if not is_valid_name(name):
        return jsonify({"error": {"english": "Invalid name format", "czech": "Neplatný formát jména"}}), 400

    for entry in data:
        if entry["name"] == name:
            if entry["secret"] == secret:
                return jsonify({"message": {
                    "english": "Welcome back. Your name and secret match an existing record. If you beat your current score, it will be updated in the hall of fame.",
                    "czech": "Vítejte zpět. Vaše jméno a tajný kód odpovídají existujícímu záznamu. Pokud překonáte své současné skóre, bude aktualizováno v síni slávy."
                }})
            return jsonify({"error": {
                "english": "Name is already taken. Either enter the correct secret or choose a different name.",
                "czech": "Jméno je již obsazeno. Zadejte správný tajný kód nebo zvolte jiné jméno."
            }}), 403

    # Register a new user with an initial score of 0
    data.append({"name": name, "secret": secret, "level": 0, "score": 0})
    save_data(data)
    return jsonify({"message": {
        "english": "Your name has been added to the hall of fame. Your achievements will now be recorded.",
        "czech": "Vaše jméno bylo přidáno do síně slávy. Vaše úspěchy budou nyní zaznamenávány."
    }})


if __name__ == "__main__":
    # Run the server on all available network interfaces
    app.run(host="0.0.0.0", port=5000)
