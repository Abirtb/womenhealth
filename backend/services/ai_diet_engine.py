"""
Placeholder AI diet planner. Swap implementation for RAG + LLM later.

Planned architecture:
- Retrieve candidate foods from vector DB (FAISS / Pinecone) using pregnancy context
- Rank with safety scores and allergy filters
- Generate structured JSON via OpenAI or a local model
"""

from __future__ import annotations

from typing import Any


def generate_meal_plan(
    pregnancy_stage: str,
    allergies: str,
    dietary_restrictions: str,
    available_foods: list[dict[str, Any]],
    week_number: int | None = None,
) -> dict[str, Any]:
    """
    Build a deterministic mock meal plan from available foods.

    Args:
        pregnancy_stage: "1", "2", or "3" trimester codes.
        allergies: free-text list for future NLP filtering.
        dietary_restrictions: free-text restrictions.
        available_foods: list of dicts with at least name, category, organic, safety_score.
        week_number: optional gestational week for future personalization.
    """
    _ = (allergies, dietary_restrictions, week_number)  # reserved for RAG / rules engine
    safe = sorted(
        [f for f in available_foods if f.get("safety_score", 0) >= 70],
        key=lambda x: x.get("safety_score", 0),
        reverse=True,
    )
    names = [f.get("name", "Balanced option") for f in safe[:6]]
    if not names:
        names = ["Gentle broth", "Whole grain toast", "Steamed vegetables", "Yogurt", "Fresh fruit", "Lean protein"]

    trimester_hint = {
        "1": "Focus on folate-rich foods and small frequent meals.",
        "2": "Emphasize iron, calcium, and steady energy.",
        "3": "Prioritize fiber, hydration, and lighter portions.",
    }.get(pregnancy_stage, "Balanced variety each day.")

    meals = {
        "monday": {
            "breakfast": names[0] if len(names) > 0 else "Oatmeal with berries",
            "lunch": names[1] if len(names) > 1 else "Quinoa bowl",
            "dinner": names[2] if len(names) > 2 else "Baked salmon with greens",
            "snack": names[3] if len(names) > 3 else "Greek yogurt",
        },
        "tuesday": {
            "breakfast": names[1] if len(names) > 1 else "Smoothie bowl",
            "lunch": names[2] if len(names) > 2 else "Lentil soup",
            "dinner": names[0] if len(names) > 0 else "Grilled chicken salad",
            "snack": names[4] if len(names) > 4 else "Apple slices",
        },
        "wednesday": {
            "breakfast": names[2] if len(names) > 2 else "Avocado toast",
            "lunch": names[0] if len(names) > 0 else "Mediterranean plate",
            "dinner": names[3] if len(names) > 3 else "Stir-fry vegetables",
            "snack": names[5] if len(names) > 5 else "Handful of nuts",
        },
    }

    return {
        "source": "mock_ai_engine",
        "pregnancy_stage": pregnancy_stage,
        "trimester_focus": trimester_hint,
        "meals": meals,
        "hydration_liters": 2.3 if pregnancy_stage == "3" else 2.1,
        "notes": "Replace with RAG + LLM output; this response is deterministic for MVP.",
    }
