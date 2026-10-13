from fastapi import APIRouter
from typing import List, Dict
from schemas import GrammerEvaluationRequest
from utils.grammar_rules import check_grammar_rules
from utils.nlp_loader import get_nlp

router = APIRouter()

@router.post("/check-grammar")
def checkGrammar(Request: GrammerEvaluationRequest):
    lang = Request.lang
    input_text = Request.user_input
    sample_text = Request.sample_text
    
    if not input_text.strip():
        return {"has_grammar_errors": False, "grammar_errors": [], "message": "Text payload is empty."}

    # Runs grammar rules (dynamically skips spelling if sample_text is missing)
    grammar_errors = check_grammar_rules(input_text, sample_text, lang)

    return {
        "has_grammar_errors": len(grammar_errors) > 0,
        "grammar_errors": grammar_errors,
        "input_text": input_text
    }

@router.post("/analyze-text")
def analyze_text(Request: GrammerEvaluationRequest):
    lang = Request.lang
    input_text = Request.user_input
    sample_text = Request.sample_text
    
    if not input_text.strip():
        return {"has_grammar_errors": False, "grammar_errors": [], "message": "Text payload is empty."}

    # Analyze each sentence independently so errors do not leak across sentences.
    document = get_nlp(lang)(input_text)
    sentences = [sentence.text.strip() for sentence in document.sents if sentence.text.strip()]
    sentence_results = []
    grammar_errors = []

    for sentence_number, sentence_text in enumerate(sentences, start=1):
        sentence_errors = check_grammar_rules(sentence_text, sample_text, lang)
        for error in sentence_errors:
            error["sentence_number"] = sentence_number
            error["sentence"] = sentence_text
        grammar_errors.extend(sentence_errors)
        sentence_results.append({
            "sentence_number": sentence_number,
            "sentence": sentence_text,
            "has_grammar_errors": bool(sentence_errors),
            "grammar_errors": sentence_errors,
        })

    return {
        "has_grammar_errors": len(grammar_errors) > 0,
        "grammar_errors": grammar_errors,
        "sentences": sentence_results,
        "input_text": input_text
    }