from django.urls import path

from .views import FoodByLocationView, NearbyFoodView

urlpatterns = [
    path("nearby-food/", NearbyFoodView.as_view(), name="nearby-food"),
    path("food-by-location/", FoodByLocationView.as_view(), name="food-by-location"),
]
