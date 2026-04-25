from rest_framework import serializers

from .models import DietPlan, FoodItem


class FoodItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodItem
        fields = ("id", "name", "category", "organic", "safety_score", "farm_origin")


class DietPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = DietPlan
        fields = ("id", "week_number", "meals", "recommendations", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")
