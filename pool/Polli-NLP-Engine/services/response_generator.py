from collections.abc import Mapping


_TEMPLATES = {
    "en": {
        "greeting": "Hello! How can I help you?",
        "introduction": "Nice to meet you.",
        "daily_life": "That sounds like a normal day.",
        "family": "Your family seems important to you.",
        "hobby": "That sounds like an interesting hobby.",
        "food": "That sounds delicious.",
        "school_work": "Good luck with your studies or work.",
        "friends": "Spending time with friends is always nice.",
        "travel": "That sounds like an interesting trip.",
        "plans": "That sounds like a good plan.",
        "past_activity": "That sounds like a nice memory.",
        "weather": "Thanks for sharing the weather information.",
        "preferences": "Thanks for sharing your preferences.",
        "opinion": "Thanks for sharing your opinion.",
        "question": "I understand your question.",
        "thanks": "You are welcome!",
        "goodbye": "Goodbye!",
        "unknown": "I am not sure how to respond to that.",
    },
    "de": {
        "greeting": "Hallo! Wie kann ich dir helfen?",
        "introduction": "Freut mich, dich kennenzulernen.",
        "daily_life": "Das klingt nach einem normalen Alltag.",
        "family": "Deine Familie scheint dir wichtig zu sein.",
        "hobby": "Das klingt nach einem interessanten Hobby.",
        "food": "Das klingt lecker.",
        "school_work": "Viel Erfolg bei deiner Arbeit oder deinem Studium.",
        "friends": "Zeit mit Freunden ist immer schoen.",
        "travel": "Das klingt nach einer interessanten Reise.",
        "plans": "Das klingt nach einem guten Plan.",
        "past_activity": "Das klingt nach einer schoenen Erinnerung.",
        "weather": "Danke fuer die Information zum Wetter.",
        "preferences": "Danke, dass du deine Vorlieben teilst.",
        "opinion": "Danke, dass du deine Meinung teilst.",
        "question": "Ich habe deine Frage verstanden.",
        "thanks": "Gern geschehen!",
        "goodbye": "Auf Wiedersehen!",
        "unknown": "Ich bin mir nicht sicher, wie ich darauf antworten soll.",
    },
    "fr": {
        "greeting": "Bonjour ! Comment puis-je vous aider ?",
        "introduction": "Ravi de faire votre connaissance.",
        "daily_life": "Cela ressemble a une journee ordinaire.",
        "family": "Votre famille semble importante pour vous.",
        "hobby": "Cela ressemble a un loisir interessant.",
        "food": "Cela semble delicieux.",
        "school_work": "Bon courage pour vos etudes ou votre travail.",
        "friends": "Passer du temps avec ses amis est toujours agreable.",
        "travel": "Cela ressemble a un voyage interessant.",
        "plans": "Cela semble etre un bon plan.",
        "past_activity": "Cela ressemble a un beau souvenir.",
        "weather": "Merci pour cette information sur la meteo.",
        "preferences": "Merci de partager vos preferences.",
        "opinion": "Merci de partager votre opinion.",
        "question": "J'ai compris votre question.",
        "thanks": "Je vous en prie !",
        "goodbye": "Au revoir !",
        "unknown": "Je ne suis pas certain de savoir comment repondre.",
    },
}

_CONTEXT_SUFFIXES = {
    "en": {
        "location": " You mentioned {value}.",
        "time": " You referred to {value}.",
        "keywords": " Topic: {value}.",
    },
    "de": {
        "location": " Du erwaehnst {value}.",
        "time": " Du beziehst dich auf {value}.",
        "keywords": " Thema: {value}.",
    },
    "fr": {
        "location": " Vous mentionnez {value}.",
        "time": " Vous faites reference a {value}.",
        "keywords": " Sujet : {value}.",
    },
}

_FOLLOW_UP_QUESTIONS = {
    "en": {
        "greeting": ["How has your day been so far?", "What would you like to talk about today?"],
        "introduction": ["Where are you from?", "What do you like to do in your free time?"],
        "daily_life": ["What is your daily routine like?", "What do you usually do in the evening?"],
        "family": ["How big is your family?", "What do you enjoy doing together?"],
        "hobby": ["How often do you do this hobby?", "What do you like most about it?"],
        "food": ["What is your favorite food?", "Do you enjoy cooking?"],
        "school_work": ["What are you working on right now?", "What is your next study goal?"],
        "friends": ["What do you like doing with your friends?", "How often do you meet?"],
        "travel": ["Where would you like to travel next?", "What was your best trip?"],
        "plans": ["What would you like to do next?", "When will you have time for that?"],
        "past_activity": ["Did you enjoy it?", "Would you do it again?"],
        "weather": ["What is the weather like where you are?", "Do you like this weather?"],
        "preferences": ["Why do you like that?", "What would be your second choice?"],
        "opinion": ["What supports that idea?", "How did you form that opinion?"],
        "question": ["Would you like to know more?", "Is there a specific part I should explain?"],
        "unknown": ["Can you tell me more about that?", "What exactly is it about?"],
    },
    "de": {
        "greeting": ["Wie war dein Tag bisher?", "Was moechtest du heute besprechen?"],
        "introduction": ["Woher kommst du?", "Was machst du gerne in deiner Freizeit?"],
        "daily_life": ["Wie sieht dein Tagesablauf aus?", "Was machst du normalerweise am Abend?"],
        "family": ["Wie gross ist deine Familie?", "Was unternehmt ihr gerne zusammen?"],
        "hobby": ["Wie oft gehst du diesem Hobby nach?", "Was gefaellt dir daran am meisten?"],
        "food": ["Was isst du am liebsten?", "Kochst du gerne selbst?"],
        "school_work": ["Woran arbeitest du gerade?", "Was ist dein naechstes Lernziel?"],
        "friends": ["Was machst du gerne mit deinen Freunden?", "Wie oft trefft ihr euch?"],
        "travel": ["Wohin moechtest du als Naechstes reisen?", "Was war deine schoenste Reise?"],
        "plans": ["Was moechtest du danach machen?", "Wann hast du Zeit dafuer?"],
        "past_activity": ["Wie hat es dir gefallen?", "Wuerdest du das wieder machen?"],
        "weather": ["Wie ist das Wetter bei dir?", "Magst du dieses Wetter?"],
        "preferences": ["Warum gefaellt dir das?", "Was waere deine zweite Wahl?"],
        "opinion": ["Was spricht dafuer?", "Wie bist du zu dieser Meinung gekommen?"],
        "question": ["Moechtest du noch etwas dazu wissen?", "Gibt es einen bestimmten Teil, den ich erklaeren soll?"],
        "unknown": ["Kannst du mir mehr darueber erzaehlen?", "Worum geht es genau?"],
    },
    "fr": {
        "greeting": ["Comment se passe votre journee ?", "De quoi voulez-vous parler aujourd'hui ?"],
        "introduction": ["D'ou venez-vous ?", "Qu'aimez-vous faire pendant votre temps libre ?"],
        "daily_life": ["A quoi ressemble votre journee ?", "Que faites-vous normalement le soir ?"],
        "family": ["Votre famille est-elle nombreuse ?", "Que faites-vous ensemble ?"],
        "hobby": ["A quelle frequence pratiquez-vous ce loisir ?", "Qu'aimez-vous le plus dans cette activite ?"],
        "food": ["Quel est votre plat prefere ?", "Aimez-vous cuisiner ?"],
        "school_work": ["Sur quoi travaillez-vous en ce moment ?", "Quel est votre prochain objectif d'etude ?"],
        "friends": ["Que faites-vous avec vos amis ?", "A quelle frequence vous rencontrez-vous ?"],
        "travel": ["Ou aimeriez-vous voyager ensuite ?", "Quel a ete votre plus beau voyage ?"],
        "plans": ["Que voulez-vous faire ensuite ?", "Quand serez-vous disponible ?"],
        "past_activity": ["Est-ce que cela vous a plu ?", "Le referiez-vous ?"],
        "weather": ["Quel temps fait-il chez vous ?", "Aimez-vous ce temps ?"],
        "preferences": ["Pourquoi est-ce que cela vous plait ?", "Quel serait votre deuxieme choix ?"],
        "opinion": ["Quels sont les arguments en faveur de cette idee ?", "Comment avez-vous forme cette opinion ?"],
        "question": ["Voulez-vous en savoir plus ?", "Y a-t-il une partie que je dois expliquer ?"],
        "unknown": ["Pouvez-vous m'en dire plus ?", "De quoi s'agit-il exactement ?"],
    },
}

_TOPIC_ORDER = [
    "daily_life", "hobby", "food", "family", "friends", "travel",
    "plans", "weather", "preferences", "opinion",
]
MAX_CONSECUTIVE_TOPIC_TURNS = 2

_START_MESSAGES = {
    "de": "Worueber moechtest du sprechen?",
    "fr": "De quoi voulez-vous parler ?",
    "en": "What do you want to talk about?",
}


def _language_code(lang: str) -> str:
    language = (lang or "de").lower().split("-")[0].split("_")[0]
    return language if language in _TEMPLATES else "de"


def generate_start_message(lang: str = "de") -> str:
    """Return the first prompt shown when a chat session starts."""
    return _START_MESSAGES[_language_code(lang)]


def generate_response(intent: str, context: Mapping[str, object] | None = None, lang: str = "de") -> str:
    """Generate a deterministic response from an intent and extracted context."""
    language = _language_code(lang)
    context = context or {}
    response = _TEMPLATES[language].get(intent, _TEMPLATES[language]["unknown"])
    suffixes = _CONTEXT_SUFFIXES[language]

    locations = context.get("locations") or []
    times = context.get("time_references") or []
    keywords = context.get("keywords") or []

    if locations:
        response += suffixes["location"].format(value=", ".join(str(value) for value in locations[:2]))
    elif times:
        response += suffixes["time"].format(value=", ".join(str(value) for value in times[:2]))
    elif keywords and intent in {"question", "plans", "travel", "food", "hobby", "opinion"}:
        response += suffixes["keywords"].format(value=", ".join(str(value) for value in keywords[:3]))

    return response


def _recent_topics(history: list[dict]) -> list[str]:
    topics = []
    for turn in reversed(history):
        topic = turn.get("topic") or turn.get("predicted_intent") or turn.get("intent")
        if topic:
            topics.append(str(topic))
        else:
            break
    return topics


def generate_follow_up(
    intent: str,
    context: Mapping[str, object] | None = None,
    history: list[dict] | None = None,
    lang: str = "de",
) -> dict:
    """Choose a follow-up question and rotate topics after repeated turns."""
    language = _language_code(lang)
    history = history or []
    should_ask_follow_up = intent not in {"goodbye", "thanks"}
    if not should_ask_follow_up:
        return {
            "question": "",
            "topic": intent,
            "topic_changed": False,
            "should_ask_follow_up": False,
        }

    recent_topics = _recent_topics(history)
    same_topic_count = 0
    for topic in recent_topics:
        if topic == intent:
            same_topic_count += 1
        else:
            break

    topic_changed = same_topic_count >= MAX_CONSECUTIVE_TOPIC_TURNS
    topic = intent
    if topic_changed:
        recent_set = set(recent_topics)
        topic = next((candidate for candidate in _TOPIC_ORDER if candidate not in recent_set), "daily_life")

    questions = _FOLLOW_UP_QUESTIONS[language].get(topic, _FOLLOW_UP_QUESTIONS[language]["unknown"])
    question_index = len(history) % len(questions)
    return {
        "question": questions[question_index],
        "topic": topic,
        "topic_changed": topic_changed,
        "should_ask_follow_up": True,
    }
