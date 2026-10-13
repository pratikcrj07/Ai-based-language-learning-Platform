<div align="center">

# Polli

**AI-powered language learning app: practise real sentences, get instant NLP feedback, and hold scenario-based conversations.**

![React Native](https://img.shields.io/badge/React_Native-Expo-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Python](https://img.shields.io/badge/Python-FastAPI-3776AB?logo=python&logoColor=white)
![spaCy](https://img.shields.io/badge/NLP-spaCy-09A3D5)
![Tests](https://img.shields.io/badge/tests-20%2F20_passing-brightgreen)

*BCA Final Year Project · Xavier International College · Tribhuvan University*

</div>

---

## Overview

Most language apps train memory: flashcards, fixed answers, repetition. Learners finish a lesson but still struggle to build their own sentence or hold a conversation.

**Polli closes that gap.** It evaluates what the learner actually writes, explains mistakes, and lets them practise dialogue with an AI coach, while tracking progress per day and per lesson. The demo course is **German (A1 and above)**.

## Key Features

| Feature | What it does |
| --- | --- |
| **Authentication** | Registration, login and logout with bcrypt-hashed passwords and JWT sessions |
| **Structured learning** | Courses by CEFR level (A1 to B2+), split into units and exercises |
| **Three practice modes** | **Word** (listen and learn), **Sentence** (translation and word ordering), **Dialogue** (choose the correct reply) |
| **NLP answer evaluation** | Compares the learner's answer to the expected one using TF-IDF and cosine similarity |
| **Grammar correction** | Rule-based checks on spaCy analysis: subject-verb agreement, tense, missing articles |
| **Polli Coach** | Scenario-based chatbot with intent detection using Naïve Bayes |
| **Progress analytics** | Practice time, daily streak, accuracy, lessons completed and vocabulary count |

## System Architecture

```
┌──────────────────┐   HTTPS   ┌────────────────────┐   queries   ┌────────────────┐
│   Mobile App     │ ───────▶  │  Node.js + Express │ ──────────▶ │ MongoDB Atlas  │
│ React Native     │           │  REST API · JWT    │             │ User · Course  │
│ Expo · Zustand   │ ◀───────  │  bcrypt            │             │ Lesson·Progress│
└──────────────────┘           └─────────┬──────────┘             └────────────────┘
                                         │ HTTPS
                                         ▼
                              ┌────────────────────┐
                              │ Python NLP Service │
                              │ FastAPI · spaCy    │
                              └────────────────────┘
```

**Design decisions**

- **Microservice for NLP.** Language processing runs as a separate Python service, so the main server stays fast and the NLP part can be updated or scaled independently.
- **Document database.** Lessons have different shapes (words, sentences, dialogues). MongoDB stores each as one flexible document instead of many joined tables.
- **Stateless auth.** JWT removes server-side sessions, so the API scales across multiple instances.
- **One codebase, two platforms.** React Native with Expo targets Android and iOS together.

## NLP Pipeline

| Task | Technique | Why |
| --- | --- | --- |
| Answer evaluation | **TF-IDF + cosine similarity**, tokenization, lowercasing and stop-word removal. A score of **0.7 or higher** counts as correct | Fast, needs no training, gives an explainable score |
| Intent detection (chat) | **Naïve Bayes** on TF-IDF features | Works well on small labelled datasets and is easy to retrain |
| Grammar correction | **Rule-based** checks on spaCy POS tags and dependency parse | Transparent, predictable and no training data required |

Similarity is calculated as `cos(θ) = (A · B) / (‖A‖ ‖B‖)`, and intent as `P(C|X) = P(X|C) · P(C) / P(X)`.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Mobile | React Native, Expo, Zustand (state), Axios (HTTP) |
| Backend | Node.js, Express, JWT, bcrypt |
| Database | MongoDB (Atlas) |
| NLP service | Python, FastAPI, spaCy |
| Methodology | Agile (Kanban): To-do → In progress → Testing → Completed |

## Getting Started

**Prerequisites:** Node.js 18+, Python 3.9+, a MongoDB Atlas connection string, and Expo Go on your phone or an Android/iOS emulator.

```bash
# Clone
git clone https://github.com/<username>/<repo>.git
cd <repo>

# 1. Backend
cd server
npm install
cp .env.example .env
npm run dev

# 2. NLP service
cd ../nlp-service
pip install -r requirements.txt
python -m spacy download <spacy-model>
uvicorn main:app --reload

# 3. Mobile app
cd ../client
npm install
npx expo start
```

**Environment variables (`server/.env`)**

| Variable | Description |
| --- | --- |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret used to sign tokens |
| `NLP_SERVICE_URL` | Base URL of the FastAPI service |
| `PORT` | Server port |

## Testing

**20 test cases, all passing.**

- **10 unit tests:** login (valid and invalid), registration (valid and duplicate email), course selection (with and without login), answer evaluation (correct and incorrect), NLP grammar correction, logout.
- **10 system tests:** end-to-end login and registration, course enrolment, vocabulary module, grammar evaluation, chatbot interaction, database integration, API communication, session handling, and invalid-input handling.

## Screenshots

| Login | Learn | Practice | Chat | Progress |
| --- | --- | --- | --- | --- |
| ![](screenshots/login.png) | ![](screenshots/learn.png) | ![](screenshots/practice.png) | ![](screenshots/chat.png) | ![](screenshots/progress.png) |

## Limitations and Roadmap

**Current limits:** focused on beginner and intermediate levels; chatbot works within predefined scenarios; grammar rules cover common errors only; recommendations rely on limited user data; limited languages.

**Roadmap**

- [ ] Speech recognition for pronunciation scoring
- [ ] Sentence embeddings for meaning-aware answer checking
- [ ] More languages, levels and conversation scenarios
- [ ] Measured NLP accuracy (precision and recall on a labelled set)
- [ ] Offline lessons
- [ ] Admin dashboard for courses and learner monitoring

## Documentation

Project report, UML and data-flow diagrams, and defence slides are in [`/docs`](docs/).

## Team

| Name | Roll No. |
| --- | --- |
| **Pratik Humagain** | 6-2-546-32-2021 |
| **Saurav Ghimire** | 6-2-546-46-2021 |

**Supervisor:** Santosh Neupane, Department of Computer Application, Xavier International College, Kathmandu

## License

Developed for academic purposes. © 2026 Pratik Humagain and Saurav Ghimire.
