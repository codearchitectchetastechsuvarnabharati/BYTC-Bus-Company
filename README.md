# BYTC-Bus-Company
A complete bus transportation management system for Bharat Yatra Transport Corporation (BYTC), a Government of India Undertaking. The system offers online ticket booking, route management, passenger handling, payment integration, ticket generation with QR codes, and an admin dashboard.

## Homework Solver demo
This repository currently includes a full-stack Homework Solver landing page with a Python (Flask) API for authentication and AI-powered solve responses.

### Run locally
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Then open `http://localhost:5000` in your browser.

### Environment variables
- `OPENAI_API_KEY`: Required for live AI solving. Use `mock` for local mock answers.
- `LDAP_URL`: LDAP server URL (e.g., `ldap://localhost:389`).
- `LDAP_BASE_DN`: Base DN for LDAP searches (e.g., `dc=example,dc=com`).
- `LDAP_BIND_DN` / `LDAP_BIND_PASSWORD`: Optional service credentials for LDAP lookup.
