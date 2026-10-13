import json
import pickle
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from services.text_preprocessing_service import preprocess_text_for_tfidf
from utils.tokenizer import space_tokenizer
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent


def train_model(language: str) -> Path:
    if language not in {"de", "fr"}:
        raise ValueError("Only German ('de') and French ('fr') models are supported.")

    dataset_path = ROOT_DIR / "training" / f"dataset_{language}.json"
    model_path = ROOT_DIR / "models" / f"model_{language}.pkl"

    if not dataset_path.exists():
        raise FileNotFoundError(f"Dataset not found: {dataset_path}")

    with dataset_path.open("r", encoding="utf-8-sig") as f:
        data = json.load(f)

    required_fields = {"text", "intent", "language", "split"}
    if not data or any(not required_fields.issubset(item) for item in data):
        raise ValueError("Each dataset item must contain text, intent, language, and split fields.")
    if any(item["language"] != language for item in data):
        raise ValueError(f"Dataset contains records for a language other than '{language}'.")
    if any(item["split"] not in {"train", "test"} for item in data):
        raise ValueError("Dataset split must be either 'train' or 'test'.")

    train_records = [item for item in data if item["split"] == "train"]
    test_records = [item for item in data if item["split"] == "test"]
    if not train_records or not test_records:
        raise ValueError("Dataset must contain both train and test records.")

    train_texts = [item["text"].strip() for item in train_records]
    train_labels = np.array([item["intent"] for item in train_records])
    test_texts = [item["text"].strip() for item in test_records]
    test_labels = np.array([item["intent"] for item in test_records])
    if any(not text for text in train_texts + test_texts):
        raise ValueError("Dataset text values cannot be empty.")

    print(f"Preprocessing {language} training and test data via spaCy...")
    processed_train_texts = [
        preprocess_text_for_tfidf(text, language)
        for text in train_texts
    ]
    processed_test_texts = [
        preprocess_text_for_tfidf(text, language)
        for text in test_texts
    ]

    def build_pipeline():
        return Pipeline([
        ("tfidf", TfidfVectorizer(
            tokenizer=space_tokenizer,
            lowercase=False,
        )),
        ("nb", MultinomialNB(alpha=0.5))
        ])

    print(f"Training Naive Bayes Classifier on {len(train_records)} records...")
    model_pipeline = build_pipeline()
    model_pipeline.fit(processed_train_texts, train_labels)

    test_accuracy = model_pipeline.score(processed_test_texts, test_labels)
    print(f"Test accuracy: {test_accuracy * 100:.2f}%")

    model_path.parent.mkdir(parents=True, exist_ok=True)
    with model_path.open("wb") as f:
        pickle.dump(model_pipeline, f)

    training_accuracy = model_pipeline.score(processed_train_texts, train_labels)
    print(f"Training accuracy: {training_accuracy * 100:.2f}%")
    print(f"Success! Integrated {language} model saved to '{model_path}'")
    return model_path

if __name__ == "__main__":
    for language in ("de", "fr"):
        train_model(language)
