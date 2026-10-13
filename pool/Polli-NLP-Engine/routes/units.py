from fastapi import APIRouter

from schemas import UnitSearchRequest
from services.unit_search_service import search_units


router = APIRouter()


@router.post("/search-units")
def search_exercise_units(request: UnitSearchRequest):
    results = search_units(request.user_input, request.top_k, request.level)
    return {
        "user_input": request.user_input,
        "results": results,
        "count": len(results),
    }