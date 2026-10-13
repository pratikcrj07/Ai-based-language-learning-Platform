import spacy

print("Loading spaCy models...")

_MODEL_NAMES = {
    "de": "de_core_news_md",
    "fr": "fr_core_news_md",
}
_NLP_MODELS = {}

for _lang, _model_name in _MODEL_NAMES.items():
    try:
        _NLP_MODELS[_lang] = spacy.load(_model_name)
        print(f"spaCy {_lang} model loaded successfully.")
    except Exception as error:
        print(f"Unable to load spaCy {_lang} model: {error}")

nlp_de = _NLP_MODELS.get("de")
nlp_fr = _NLP_MODELS.get("fr")


def get_nlp(lang: str = "de"):
    """Return the spaCy pipeline matching a supported language code."""
    language = (lang or "de").lower().split("-")[0].split("_")[0]
    if language not in _MODEL_NAMES:
        raise ValueError(f"Unsupported language '{lang}'. Supported languages: de, fr.")

    pipeline = _NLP_MODELS.get(language)
    if pipeline is None:
        raise RuntimeError(f"The spaCy model for '{language}' is not available.")
    return pipeline