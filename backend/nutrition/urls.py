from django.urls import path

from .views import DietPlanView, FoodListView, GenerateDietView

urlpatterns = [
    path("foods/", FoodListView.as_view(), name="foods"),
    path("diet-plan/", DietPlanView.as_view(), name="diet-plan"),
    path("generate-diet/", GenerateDietView.as_view(), name="generate-diet"),
]
