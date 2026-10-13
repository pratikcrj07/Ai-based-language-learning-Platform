from fastapi import APIRouter, HTTPException
from schemas import ChatRequest, ChatStartRequest
from services.groq_chat_service import (
    GroqConfigurationError,
    GroqServiceError,
    generate_chat_response,
)
from services.response_generator import generate_follow_up, generate_response, generate_start_message
from services.translation_service import translate_follow_up_to_english, translate_response_to_english

router = APIRouter()


@router.post("/start-chat")
def start_chat(request: ChatStartRequest):
    language = request.lang
    return {
        "message": generate_start_message(language),
        "message_translation": generate_start_message("en"),
        "language": language,
        "translation_language": "en",
        "conversation_history": [],
        "chat_started": True,
    }


@router.post("/classifyScenarioIntent")
def classify_scenario_intent(request: ChatRequest):
    input_text = request.user_input.strip()
    lang = request.lang
    conversation_history = request.conversation_history

    if not input_text.strip():
        response = generate_response("unknown", {}, lang)
        follow_up = generate_follow_up("unknown", {}, conversation_history, lang)
        return {
            "detected_scenario": "unknown",
            "predicted_intent": "unknown",
            "confidence_score": 0.0,
            "response": response,
            "response_translation": translate_response_to_english("unknown", {}),
            "follow_up": follow_up,
            "follow_up_translation": translate_follow_up_to_english("unknown", {}, conversation_history),
            "language": lang,
            "translation_language": "en",
        }

    try:
        response, response_translation = generate_chat_response(
            input_text,
            lang,
            conversation_history,
        )
    except GroqConfigurationError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except GroqServiceError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error

    return {
        "user_input": input_text,
        "sentence_type": "conversation",
        "detected_scenario": "conversation",
        "predicted_intent": "conversation",
        "confidence_score": None,
        "sentence_intents": [],
        "context": {},
        "response": response,
        "response_translation": response_translation,
        "follow_up": {
            "question": "",
            "topic": "conversation",
            "should_ask_follow_up": False,
        },
        "follow_up_translation": {
            "question": "",
            "topic": "conversation",
            "topic_changed": False,
            "should_ask_follow_up": False,
        },
        "language": lang,
        "translation_language": "en",
    }
