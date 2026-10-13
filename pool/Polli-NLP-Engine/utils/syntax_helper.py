import spacy
from utils.nlp_loader import get_nlp

def analyze_sentence_type(text: str, lang: str = "de") -> str:
    cleaned_text = text.strip().lower()
    if not cleaned_text:
        return "statement"
    
    doc = get_nlp(lang)(text)
    first_token = doc[0]

    #Checking Explicit Question Starters
    wh_words = {"what", "where", "when", "why", "how", "which", "who", "whom", "whose"}
    if first_token.text.lower() in wh_words:
        return "question"
    
    #Checking Auxiliary Verb Starters
    auxiliary_starters = {
        "can", "could", "would", "should", "will", "shall", "may", "might", "must",
        "is", "are", "am", "was", "were", "do", "does", "did", "have", "has", "had"
    }
    if first_token.text.lower() in auxiliary_starters:
        # Double check to prevent false positives from rare command statements
        if first_token.pos_ in ("AUX", "VERB"):
            return "question"
    
    # Checking for polite question patterns (e.g., "Excuse me, can you...?", "Sorry, do you know...?") with a leniency for common conversational openings
    if len(doc) > 2 and first_token.text.lower() in ("excuse", "sorry", "hello", "hi"):
        # Check if any of the next two tokens are question tokens
        for token in doc[1:3]:
            if token.text.lower() in wh_words or token.text.lower() in auxiliary_starters:
                return "question"
            
    return "statement"