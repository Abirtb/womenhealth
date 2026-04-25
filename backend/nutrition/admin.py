from django.contrib import admin

from .models import DietPlan, FoodItem


@admin.register(FoodItem)
class FoodItemAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "organic", "safety_score")
    list_filter = ("category", "organic")


@admin.register(DietPlan)
class DietPlanAdmin(admin.ModelAdmin):
    list_display = ("user", "week_number", "updated_at")
