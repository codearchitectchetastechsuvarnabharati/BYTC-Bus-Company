import os
import secrets
from hashlib import scrypt

import json

import requests
from flask import Flask, jsonify, request, send_from_directory
from ldap3 import Connection, Server

app = Flask(__name__, static_folder="public", static_url_path="")

users = {}


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    hashed = scrypt(password.encode("utf-8"), salt=salt, n=2**14, r=8, p=1)
    return f"{salt.hex()}:{hashed.hex()}"


def verify_password(password: str, stored: str) -> bool:
    salt_hex, hash_hex = stored.split(":")
    salt = bytes.fromhex(salt_hex)
    hashed = scrypt(password.encode("utf-8"), salt=salt, n=2**14, r=8, p=1)
    return secrets.compare_digest(hash_hex, hashed.hex())


def ldap_authenticate(username: str, password: str) -> None:
    ldap_url = os.getenv("LDAP_URL")
    ldap_base_dn = os.getenv("LDAP_BASE_DN")
    if not ldap_url or not ldap_base_dn:
        raise ValueError("LDAP not configured.")

    server = Server(ldap_url)
    bind_dn = os.getenv("LDAP_BIND_DN")
    bind_password = os.getenv("LDAP_BIND_PASSWORD")

    with Connection(server, user=bind_dn, password=bind_password, auto_bind=True) as conn:
        conn.search(ldap_base_dn, f"(uid={username})", attributes=["dn"])
        if not conn.entries:
            raise ValueError("User not found.")
        user_dn = conn.entries[0].entry_dn

    with Connection(server, user=user_dn, password=password, auto_bind=True):
        return None


@app.get("/")
def index():
    return send_from_directory(app.static_folder, "index.html")


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/api/solve")
def solve():
    data = request.get_json(silent=True) or {}
    subject = data.get("subject", "Homework")
    question = (data.get("question") or "").strip()
    topic = question.split("?")[0] if question else "your topic"

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return (
            jsonify({
                "message": "AI engine not configured. Set OPENAI_API_KEY to enable solving.",
            }),
            503,
        )

    if api_key == "mock":
        return jsonify(
            {
                "title": f"AI-Guided {subject} Solution",
                "summary": f"We used AI to outline the best approach for {topic.lower()}.",
                "steps": [
                    "Identify the core concepts and formulas.",
                    "Break the question into smaller steps.",
                    "Solve carefully and verify the final answer.",
                ],
                "duration": "35 seconds",
                "source": "mock-ai",
            }
        )

    prompt = (
        "You are a homework assistant. Provide a concise title, summary, and 3 steps to solve the question."
        f"\nSubject: {subject}\nQuestion: {question}"
        "\nRespond in JSON with keys: title, summary, steps (array of 3 strings)."
    )

    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": "Return strict JSON only."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.4,
        },
        timeout=20,
    )
    response.raise_for_status()
    payload = response.json()
    content = payload.get("choices", [{}])[0].get("message", {}).get("content", "{}")
    parsed = json.loads(content)
    parsed["duration"] = "30 seconds"
    parsed["source"] = "openai"
    return jsonify(parsed)


@app.post("/api/auth/signup")
def signup():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not name or not email or not password:
        return jsonify({"message": "Name, email, and password are required."}), 400

    if email in users:
        return jsonify({"message": "Account already exists."}), 409

    users[email] = {"name": name, "password_hash": hash_password(password)}
    return jsonify({"message": "Account created. You can now log in."})


@app.post("/api/auth/login")
def login():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
    method = data.get("method", "local")

    if not username or not password:
        return jsonify({"message": "Username and password are required."}), 400

    if method == "ldap":
        try:
            ldap_authenticate(username, password)
        except ValueError as error:
            return jsonify({"message": str(error)}), 401
        return jsonify({"message": "LDAP authentication successful."})

    user = users.get(username.lower())
    if not user or not verify_password(password, user["password_hash"]):
        return jsonify({"message": "Invalid credentials."}), 401

    return jsonify({"message": f"Welcome back, {user['name']}."})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=False)
