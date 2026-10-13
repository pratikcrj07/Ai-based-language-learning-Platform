from fastapi import APIRouter
from schemas import TfidfRequest
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from services.text_preprocessing_service import preprocess_text_for_tfidf
from utils.grammar_rules import check_grammar_rules

router = APIRouter()

SIMILARITY_THRESHOLD = 0.55

@router.post("/checkSimilarity")
def checkSimilarity(Request: TfidfRequest):
    input_text = Request.user_input
    reference_text = Request.reference_text
    lang = Request.lang
    check_grammar = Request.checkGrammar

    if not input_text.strip() or not reference_text:
        return {"similarity": 0.0, "message": "Input text and reference text cannot be empty."}

    if check_grammar:
        grammar_errors = check_grammar_rules(input_text, reference_text, lang) if check_grammar else [] 
    
    input_text_processed = preprocess_text_for_tfidf(input_text, lang)
    reference_text_processed = [preprocess_text_for_tfidf(text, lang) for text in reference_text]

    vectorizer = TfidfVectorizer(tokenizer=lambda x: x.split(), token_pattern="None", lowercase=False)
    reference_vector = vectorizer.fit_transform(reference_text_processed)
    input_vector = vectorizer.transform([input_text_processed])

    all_similarities = cosine_similarity(input_vector, reference_vector)[0]

    max_score = float(max(all_similarities)) if all_similarities.size > 0 else 0.0
    
    similarity_score = round(max_score, 4)

    has_grammar_errors = len(grammar_errors) > 0
    is_correct = similarity_score >= SIMILARITY_THRESHOLD

    report = {
        "is_correct": is_correct,
        "similarity_score": round(max_score, 2),
        "has_grammar_errors": has_grammar_errors,
        "grammar_errors": grammar_errors,
        "input_text": input_text,
        "message": "Integrated linguistic evaluation complete."
    }

    return report