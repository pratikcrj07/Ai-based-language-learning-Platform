import sys
from pathlib import Path
from dotenv import load_dotenv

APP_DIR = Path(__file__).resolve().parent
ROOT_DIR = APP_DIR.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.append(str(ROOT_DIR))

load_dotenv(APP_DIR / ".env")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.grammar import router as grammar_router
from routes.tfidf import router as tfidf_router
from routes.intent_classifier import router as classifier_router
from routes.units import router as units_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(grammar_router, prefix="/api")
app.include_router(tfidf_router, prefix="/api")
app.include_router(classifier_router, prefix="/api")
app.include_router(units_router, prefix="/api")
