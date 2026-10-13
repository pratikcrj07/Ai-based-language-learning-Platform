# Workspace Guidance

This workspace contains three separate Git repositories. Check status and make changes in the owning directory; do not assume the workspace root is a Git repository.

## Components

- `Polli/` is the Expo Router React Native app. Routes live in `app/`, shared UI in `components/`, app state in `store/`, and bundled lesson content in `data/`. Follow [Polli/AGENTS.md](Polli/AGENTS.md), [Polli/DESIGN_SYSTEM.md](Polli/DESIGN_SYSTEM.md), and [Polli/PRD.md](Polli/PRD.md).
- `polli/` is the Express 5 and MongoDB API. Routes, controllers, models, and middleware are separated under their matching directories. See [polli/README.md](polli/README.md) for environment variables and API contracts.
- `Polli-NLP-Engine/` is the FastAPI NLP service. `index.py` mounts routers under `/api`; HTTP routes are in `routes/`, application logic in `services/`, and intent datasets in `training/`.

## Commands

- App: from `Polli/`, run `npm run lint`; start Expo with `npm run start` (or `npm run android`, `npm run ios`, or `npm run web`). There is no configured test script.
- Express API: from `polli/`, run `npm run dev`. `npm test` is a placeholder that exits with an error, not a test suite. The API expects `MONGODB_URI` and `JWT_SECRET` in `.env`; never commit secrets.
- NLP API: from `Polli-NLP-Engine/`, install `requirements.txt` in the active Python environment and run `python -m uvicorn index:app --reload --port 8000`. The service also requires the German and French spaCy models named in `utils/nlp_loader.py`.

## Working Conventions

- Keep changes inside the owning service unless a shared API or behavior explicitly requires coordinated updates. The app calls the Express API on port 3001 and the NLP API on port 8000; check both sides when changing a contract.
- Prefer the existing module and data patterns. Treat `PRD.md` files as product intent and verify implementation behavior in code before assuming a requirement is already met.
- Do not run `Polli`'s `npm run reset-project` during normal development; it replaces the starter app structure.
- `Polli-NLP-Engine/train_intent_model.py` regenerates model pickle files. Run it only when intentionally retraining from changed datasets.
- Run the narrowest available lint, syntax check, or relevant manual verification for the component changed. Report when a component has no automated test suite instead of implying tests passed.