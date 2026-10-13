import json
import re
from pathlib import Path


CATALOG_PATH = Path(__file__).resolve().parent.parent / "training" / "exercise_units.json"
_SYNONYMS = {
    "shop": {"shopping", "buy", "buying", "store", "price", "prices"},
    "shopping": {"shop", "buy", "buying", "store", "price", "prices"},
    "food": {"eat", "eating", "drink", "restaurant", "meal"},
    "travel": {"trip", "travel", "airport", "flight", "holiday"},
    "direction": {"directions", "location", "route", "map"},
    "work": {"job", "office", "career", "workplace"},
}


def _words(value: str) -> set[str]:
    return set(re.findall(r"[a-zA-Z]+", value.lower()))


def _expanded_words(words: set[str]) -> set[str]:
    expanded = set(words)
    for word in words:
        expanded.update(_SYNONYMS.get(word, set()))
    return expanded


def search_units(user_text: str, top_k: int = 5, level: str | None = None) -> list[dict]:
    """Rank exercise units by relevance to a user's text."""
    if not user_text.strip():
        return []

    with CATALOG_PATH.open("r", encoding="utf-8-sig") as file:
        units = json.load(file)

    query_words = _expanded_words(_words(user_text))
    results = []
    for unit in units:
        if level and unit["level"].lower() != level.lower():
            continue
        title_words = _words(unit["title"])
        description_words = _words(unit["description"])
        searchable_words = _expanded_words(title_words | description_words)
        title_matches = len(query_words & title_words)
        all_matches = len(query_words & searchable_words)
        if not title_matches and not all_matches:
            continue

        score = title_matches * 3 + all_matches
        results.append({
            **unit,
            "relevance_score": round(score / max(len(query_words), 1), 3),
            "matched_terms": sorted(query_words & searchable_words),
        })

    results.sort(key=lambda item: (-item["relevance_score"], item["level"], item["id"]))
    return results[:max(1, min(top_k, 20))]
