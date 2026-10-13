from pydantic import BaseModel, Field
from typing import List, Optional

class ChatRequest(BaseModel):
    user_input: str
    lang: str = "de"
    conversation_history: List[dict] = Field(default_factory=list)


class ChatStartRequest(BaseModel):
    lang: str = "de"

class GrammerEvaluationRequest(BaseModel):
    user_input: str
    sample_text: Optional[List[str] | None] = None
    lang: str = "de"

class TfidfRequest(BaseModel):
    user_input: str
    reference_text: List[str]
    checkGrammar: Optional[bool] = False
    lang: str = "de"


class UnitSearchRequest(BaseModel):
    user_input: str
    top_k: int = 5
    level: Optional[str] = None