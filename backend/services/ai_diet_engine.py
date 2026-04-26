"""
Diet plan generator: deterministic weekly meals plus optional RAG recipes.

RAG output is merged as `rag_recipes` with each ingredient linked to a `FoodItem`
when the catalog name matches (substring / normalized text).
"""

from __future__ import annotations

import os
import re
from typing import Any


def _trimester_int(pregnancy_stage: str) -> int:
    try:
        return max(1, min(3, int(str(pregnancy_stage).strip()[:1])))
    except (TypeError, ValueError):
        return 1


def normalize_ingredient_text(s: str) -> str:
    s = (s or "").lower().strip()
    s = re.sub(r"^[\d./]+\s*", "", s)
    s = re.sub(r"\([^)]*\)", " ", s)
    s = re.sub(r"[^\w\s-]", " ", s)
    return " ".join(s.split())


def match_catalog_food(ingredient_line: str, foods: list[dict[str, Any]]) -> dict[str, Any] | None:
    ing = normalize_ingredient_text(ingredient_line)
    if not ing:
        return None
    best: dict[str, Any] | None = None
    best_len = 0
    for f in foods:
        fn = normalize_ingredient_text(str(f.get("name", "")))
        if not fn:
            continue
        if fn == ing:
            return f
        if fn in ing or ing in fn:
            score = min(len(fn), len(ing))
            if score > best_len:
                best = f
                best_len = score
    return best


def enrich_rag_recipes_with_catalog(raw: dict[str, Any], foods: list[dict[str, Any]]) -> list[dict[str, Any]]:
    recipes = raw.get("recipes")
    if not isinstance(recipes, list):
        return []
    out: list[dict[str, Any]] = []
    for r in recipes:
        if not isinstance(r, dict):
            continue
        ingredients_raw = r.get("ingredients") or []
        linked: list[dict[str, Any]] = []
        for item in ingredients_raw:
            line = item if isinstance(item, str) else str(item)
            m = match_catalog_food(line, foods)
            linked.append({"text": line, "matched_food": m})
        row = dict(r)
        row["ingredients_linked"] = linked
        out.append(row)
    return out


def _mock_meal_plan(
    pregnancy_stage: str,
    allergies: str,
    dietary_restrictions: str,
    available_foods: list[dict[str, Any]],
    week_number: int | None = None,
) -> dict[str, Any]:
    _ = (allergies, dietary_restrictions, week_number)
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
        "notes": "Weekly layout is deterministic; see rag_recipes for retrieval-backed ideas.",
    }


def generate_meal_plan(
    pregnancy_stage: str,
    allergies: str,
    dietary_restrictions: str,
    available_foods: list[dict[str, Any]],
    week_number: int | None = None,
) -> dict[str, Any]:
    plan = _mock_meal_plan(
        pregnancy_stage,
        allergies,
        dietary_restrictions,
        available_foods,
        week_number=week_number,
    )

    use_rag = os.environ.get("NURTURA_USE_RAG", "true").lower() in ("1", "true", "yes")
    plan["rag_recipes"] = []
    plan["rag_error"] = None

    if not use_rag:
        plan["rag_note"] = "RAG disabled (NURTURA_USE_RAG)."
        return plan

    try:
        from services import rag_service

        conds = [c.strip() for c in re.split(r"[,;\n]+", dietary_restrictions or "") if c.strip()]
        if not conds:
            conds = ["general healthy pregnancy"]
        allergy_list = [a.strip() for a in re.split(r"[,;\n]+", allergies or "") if a.strip()]

        profile = {
            "is_pregnant": True,
            "trimester": _trimester_int(pregnancy_stage),
            "conditions": conds,
            "diet": "balanced",
            "allergies": allergy_list,
        }
        raw = rag_service.get_recommendations(profile)
        if isinstance(raw, dict) and raw.get("error"):
            plan["rag_error"] = str(raw.get("error"))
            plan["rag_recipes"] = []
        else:
            plan["rag_recipes"] = enrich_rag_recipes_with_catalog(
                raw if isinstance(raw, dict) else {},
                available_foods,
            )
        if plan["rag_recipes"]:
            plan["source"] = "mock_ai_engine+rag_recipes"
    except Exception as exc:  # noqa: BLE001 — diet must still return mock plan
        plan["rag_error"] = str(exc)
        plan["rag_recipes"] = []

    return plan
