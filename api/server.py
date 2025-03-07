from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app, origins=["https://sumar.diecezko.cz"])

DATA_FILE = "data.json"


def load_data():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)


@app.route("/scores", methods=["GET"])
def get_scores():
    data = load_data()
    return jsonify([{"name": d["name"], "score": d["score"], "level": d["level"]} for d in data])


@app.route("/submit", methods=["POST"])
def submit_score():
    data = load_data()
    new_entry = request.json
    name, secret, level, score = new_entry.get("name"), new_entry.get(
        "secret"), new_entry.get("level"), new_entry.get("score")

    if not name or not secret or level is None or score is None:
        return jsonify({"error": "Missing fields"}), 400

    for entry in data:
        if entry["name"] == name:
            if entry["secret"] != secret:
                return jsonify({"error": "Invalid secret"}), 403

            if score > entry["score"]:
                entry["score"] = score
                entry["level"] = max(entry["level"], level)
                save_data(data)
                return jsonify({"message": "Skóre bylo aktualizováno."})

            return jsonify({"message": "Skóre nebylo překonáno, zůstává nezměněno."})

    return jsonify({"error": "User not found"}), 404


@app.route("/register", methods=["POST"])
def register_user():
    data = load_data()
    new_user = request.json
    name, secret = new_user.get("name"), new_user.get("secret")

    if not name or not secret:
        return jsonify({"error": "Missing fields"}), 400

    for entry in data:
        if entry["name"] == name:
            if entry["secret"] == secret:
                return jsonify({"message": "Vítej zpět. Jméno a tajné slovo se shoduje s jiným záznamem. Pokud překonáš své současné skóre, zvýšíme ti ho i v síni slávy."})
            return jsonify({"error": "Jméno je již obsazené, buďto zadej správné tajné slovo nebo si zvol jiné jméno"}), 403

    data.append({"name": name, "secret": secret, "level": 0, "score": 0})
    save_data(data)
    return jsonify({"message": "Tvé jméno bylo vytesané do síně slávy. Při každém úspěchu se nyní zapíšeš mezi hrdinné sumáře."})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
