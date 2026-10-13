import os
import pickle
import numpy as np
from pathlib import Path
from services.text_preprocessing_service import preprocess_text_for_tfidf

# Absolute tracking path to avoid runtime working directory confusion
CURRENT_DIR = Path(__file__).resolve().parent
MODEL_DIR = CURRENT_DIR.parent / "models"
SUPPORTED_LANGUAGES = {"de", "fr"}

class UniversalIntentClassifier:
    def __init__(self, model_dir=MODEL_DIR):
        self.model_dir = Path(model_dir)
        self.pipelines = {}

    def load_model(self, lang: str):
        """Load and cache the pipeline for the requested language."""
        language = (lang or "de").lower().split("-")[0].split("_")[0]
        if language not in SUPPORTED_LANGUAGES:
            raise ValueError("Unsupported language. Available models: de, fr.")

        if language in self.pipelines:
            return self.pipelines[language]

        model_path = self.model_dir / f"model_{language}.pkl"
        if not model_path.is_file() or model_path.stat().st_size == 0:
            raise FileNotFoundError(f"Model file not found for language '{language}': {model_path}")

        try:
            with model_path.open("rb") as file:
                pipeline = pickle.load(file)
            self.pipelines[language] = pipeline
            print(f"Successfully loaded {language} intent model from: {model_path}")
            return pipeline
        except Exception as e:
            raise RuntimeError(f"Error loading {language} intent model: {e}") from e

    def predict_intent(self, user_input: str, lang: str = "de"):
        pipeline = self.load_model(lang)
        processed_input = preprocess_text_for_tfidf(user_input, lang)

        feature_names = pipeline.named_steps['tfidf'].get_feature_names_out()

        words = processed_input.split()
        known_words = [w for w in words if w in feature_names]

        if not known_words:
            return "fallback", "low_confidence_unknown", 0.0

        
        prediction_array = pipeline.predict([processed_input])
        combined_label = str(prediction_array[0])
        
        probabilities = pipeline.predict_proba([processed_input])
        max_idx = np.argmax(probabilities)
        confidence_score = float(probabilities[0][max_idx])
        
        if "__" in combined_label:
            scenario, intent = combined_label.split("__")
        else:
            scenario, intent = "general", combined_label

        print(f"DEBUG -> Predicted Label: {combined_label} | Raw Confidence: {confidence_score}")

            
        return scenario, intent, round(confidence_score, 2)

    def predict_sentences(self, sentences: list[str], lang: str = "de") -> list[dict]:
        """Predict an intent independently for every non-empty sentence."""
        predictions = []
        for sentence_number, sentence in enumerate(sentences, start=1):
            scenario, intent, confidence = self.predict_intent(sentence, lang)
            predictions.append({
                "sentence_number": sentence_number,
                "sentence": sentence,
                "detected_scenario": scenario,
                "predicted_intent": intent,
                "confidence_score": confidence,
            })
        return predictions

# Global instantiation reference point for router integration
intent_classifier = UniversalIntentClassifier()
