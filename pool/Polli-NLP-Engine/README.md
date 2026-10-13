# Polli NLP Engine

## Setup

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Set `GROQ_API_KEY` in `.env` to a newly rotated key. The key stays on this server and must never be added to the Expo app or committed. `GROQ_MODEL` defaults to `llama-3.3-70b-versatile`; change it if that model is not enabled for your Groq account.

## Run

```bash
python -m uvicorn index:app --reload --host 0.0.0.0 --port 8000
```