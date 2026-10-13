import re
from utils.nlp_loader import get_nlp

def preprocess_text_for_classification(
        lang: str,
        text: str,
        include_stopwords: bool = True,
        include_punctuation: bool = True,
        include_space: bool = False, 
        include_numbers: bool = True) -> str:
    
    text = text.lower()
    text = re.sub(r'\s+', ' ', text).strip()
    
    print(f"Cleaned text: {text}")

    doc = get_nlp(lang)(text)

    # Lemmatization and stop word removal
    tokens = [
        token.lemma_
        for token in doc
        if not token.is_stop and not token.is_space
    ]
    print(f"Preprocessed tokens: {tokens}")

    return ' '.join(tokens)

def preprocess_text_for_grammar(text: str, lang: str = "de"):
    doc = get_nlp(lang)(text)

    tokens = [token for token in doc if not token.is_space]
    return {
        "tokens": tokens
    }

def preprocess_text_for_tfidf(text: str, lang: str = "de") -> str:
    text = text.lower()
    text = re.sub(r'\s+', ' ', text).strip()
    

    doc = get_nlp(lang)(text)

    tokens = [
        token.lemma_
        for token in doc
        if not token.is_stop and not token.is_punct and not token.is_space
    ]
    print(f"Preprocessed tokens for TF-IDF: {tokens}")

    return ' '.join(tokens)
 