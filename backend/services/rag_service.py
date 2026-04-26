from rag_chain import (
    explain_recipe,
    nutrition_needs,
    safety_check,
    recommend_recipes
)

# -------- SERVICE WRAPPERS --------

def get_recipe_explanation(recipe: str):
    return explain_recipe(recipe)

def get_nutrition_info(trimester: int, condition: str):
    return nutrition_needs(trimester, condition)

def get_safety_info(ingredients: list):
    return safety_check(ingredients)

def get_recommendations(user_profile: dict):
    return recommend_recipes(user_profile)