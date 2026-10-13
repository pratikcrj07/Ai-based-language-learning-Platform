from services.text_preprocessing_service import preprocess_text_for_grammar
from utils.levenshtein import calculate_levenshtein_distance as calculate_levenshtein


_SUBJECT_DEPENDENCIES = {"nsubj", "nsubjpass", "expl:subj", "sb", "subj"}


def _agreement_error(subject, verb, lang: str) -> dict | None:
    subject_features = subject.morph.to_dict()
    verb_features = verb.morph.to_dict()
    mismatches = []

    for feature in ("Number", "Person"):
        subject_value = subject_features.get(feature)
        verb_value = verb_features.get(feature)
        if subject_value and verb_value and subject_value != verb_value:
            mismatches.append(feature.lower())

    if not mismatches:
        return None

    return {
        "type": "Grammar",
        "message": f"Subject and verb do not agree in {', '.join(mismatches)}.",
        "incorrect_word": verb.text,
        "suggestions": [
            "Use a verb that matches the subject in number (singular or plural).",
            "Check that the verb matches the subject's person (I, you, he, she, or they).",
        ],
    }


def _determiner_agreement_error(determiner, noun, lang: str) -> dict | None:
    determiner_features = determiner.morph.to_dict()
    noun_features = noun.morph.to_dict()
    mismatches = []

    for feature in ("Gender", "Number"):
        determiner_value = determiner_features.get(feature)
        noun_value = noun_features.get(feature)
        if determiner_value and noun_value and determiner_value != noun_value:
            mismatches.append(feature.lower())

    if not mismatches:
        return None

    return {
        "type": "Grammar",
        "message": f"Determiner and noun do not agree in {', '.join(mismatches)}.",
        "incorrect_word": determiner.text,
        "suggestions": [
            "Use an article that matches the noun's gender and number.",
            "Check whether the noun is masculine, feminine, neuter, singular, or plural.",
        ],
    }


def check_grammar_rules(text: str, sample_text: list[str] | None, lang: str = "de") -> list[dict]:
   
    errors = []
    
    processed_text = preprocess_text_for_grammar(text, lang)
    tokens = processed_text["tokens"]
    # Rule 1: Subject-verb agreement using language-specific dependency labels.
    for token in tokens:
        if token.pos_ not in ("VERB", "AUX") or token.morph.get("VerbForm") != ["Fin"]:
            continue

        subjects = [child for child in token.children if child.dep_ in _SUBJECT_DEPENDENCIES]
        for subject in subjects:
            error = _agreement_error(subject, token, lang)
            if error:
                errors.append(error)

    # Rule 2: Determiner-noun agreement for German and French.
    for token in tokens:
        if token.pos_ != "NOUN":
            continue
        determiner_dependencies = {"det", "nk"} if lang == "de" else {"det"}
        determiners = [child for child in token.children if child.dep_ in determiner_dependencies]
        for determiner in determiners:
            error = _determiner_agreement_error(determiner, token, lang)
            if error:
                errors.append(error)

    # Rule 3: Missing action verb / auxiliary verb.
    has_verb = any(token.pos_ in ("VERB", "AUX") for token in tokens)
    if not has_verb:
        errors.append({
            "type": "Structure",
            "message": "Your spoken sentence is missing a main verb or predicate action.",
            "suggestions": [
                "Add a main verb to show the action or state.",
                "Make sure the sentence says who or what does the action.",
            ]
            })

    if sample_text:
        valid_vocabulary = set()
        for sample in sample_text:
            for token in preprocess_text_for_grammar(sample.lower(), lang)["tokens"]:
                if token.is_alpha:
                    valid_vocabulary.add(token.text)

        for token in tokens:
            # Check only letters, ignoring speech artifacts/punctuation tokens
            if token.is_alpha and token.text.lower() not in valid_vocabulary:
                suggestions = [w for w in valid_vocabulary if calculate_levenshtein(token.text.lower(), w) <= 2]
                errors.append({
                    "type": "Spelling",
                    "message": f"Word variation detected",
                    "incorrect_word": token.text,
                    "suggestions": suggestions[:3] or [
                        "Check the spelling of this word.",
                        "Check whether the word is the correct form for this sentence.",
                    ]
                })
    
    return errors