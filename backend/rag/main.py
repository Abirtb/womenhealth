from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict

from rag_service import (
    get_recipe_explanation,
    get_nutrition_info,
    get_safety_info,
    get_recommendations
)

app = FastAPI(title="Pregnancy Nutrition RAG API")

# -------- MODELS --------

class ExplainRequest(BaseModel):
    recipe: str

class NutritionRequest(BaseModel):
    trimester: int
    condition: str

class SafetyRequest(BaseModel):
    ingredients: List[str]

class RecommendationRequest(BaseModel):
    user_profile: Dict

# -------- ROUTES --------

@app.get("/")
def root():
    return {"message": "RAG API is running"}

@app.post("/rag/explain")
def explain(req: ExplainRequest):
    return get_recipe_explanation(req.recipe)

@app.post("/rag/nutrition")
def nutrition(req: NutritionRequest):
    return get_nutrition_info(req.trimester, req.condition)

@app.post("/rag/safety")
def safety(req: SafetyRequest):
    return get_safety_info(req.ingredients)

@app.post("/rag/recommend")
def recommend(req: RecommendationRequest):
    return get_recommendations(req.user_profile)