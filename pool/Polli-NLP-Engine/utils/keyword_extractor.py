from utils.nlp_loader import get_nlp


_QUESTION_WORDS = {
    "de": {"wer", "was", "wann", "wo", "warum", "wie", "welche", "welcher", "welches"},
    "fr": {"qui", "quoi", "quand", "ou", "pourquoi", "comment", "quel", "quelle", "quels", "quelles"},
}


def extract_chat_context(user_text: str, lang: str = "de") -> dict:
    """Extract general context signals from a chat message."""
    doc = get_nlp(lang)(user_text.strip())
    language = (lang or "de").lower().split("-")[0].split("_")[0]

    keywords = []
    subjects = []
    actions = []
    locations = []
    time_references = []

    for token in doc:
        if token.is_space or token.is_punct or token.is_stop:
            continue

        if token.pos_ in {"NOUN", "PROPN", "ADJ"} and token.lemma_ not in keywords:
            keywords.append(token.lemma_)
        if token.dep_ in {"nsubj", "nsubjpass", "expl:subj", "sb", "subj"}:
            subjects.append(token.text)
        if token.pos_ in {"VERB", "AUX"} and token.lemma_ not in actions:
            actions.append(token.lemma_)
        if token.ent_type_ in {"LOC", "GPE", "FAC"} and token.text not in locations:
            locations.append(token.text)
        if token.ent_type_ in {"DATE", "TIME"} and token.text not in time_references:
            time_references.append(token.text)

    entities = [
        {"text": entity.text, "label": entity.label_}
        for entity in doc.ents
    ]
    question_words = [
        token.text for token in doc
        if token.text.lower() in _QUESTION_WORDS.get(language, set())
    ]

    if doc.text.endswith(("?", "？")) or question_words:
        message_context = "question"
    elif any(token.pos_ in {"VERB", "AUX"} and token.morph.get("Mood") == ["Imp"] for token in doc):
        message_context = "command"
    elif actions:
        message_context = "request_or_statement"
    else:
        message_context = "statement"

    return {
        "message_context": message_context,
        "keywords": keywords,
        "entities": entities,
        "subjects": subjects,
        "actions": actions,
        "locations": locations,
        "time_references": time_references,
        "question_words": question_words,
    }


# Backward-compatible alias for clients importing the old helper name.
extract_lesson_keywords = extract_chat_context
