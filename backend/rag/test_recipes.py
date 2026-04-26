# test_recipe.py

from rag.rag_chain import recommend_recipes

user_profile = {
    "is_pregnant": True,
    "trimester": 2,
    "conditions": ["iron deficiency"],
    "diet": "balanced",
    "allergies": ["peanuts"]
}

result = recommend_recipes(user_profile)

print("RESULT:")
print(result)