from collections.abc import Mapping

from services.response_generator import generate_follow_up, generate_response


def translate_response_to_english(
    intent: str,
    context: Mapping[str, object] | None = None,
) -> str:
    """Render a predefined bot response in English."""
    return generate_response(intent, context, "en")


def translate_follow_up_to_english(
    intent: str,
    context: Mapping[str, object] | None = None,
    history: list[dict] | None = None,
) -> dict:
    """Render a predefined follow-up question in English."""
    return generate_follow_up(intent, context, history, "en")
