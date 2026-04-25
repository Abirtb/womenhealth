from django.conf import settings
from django.db import models


class FoodCategory(models.TextChoices):
    FRUIT = "fruit", "Fruit"
    VEGETABLE = "vegetable", "Vegetable"
    PROTEIN = "protein", "Protein"
    DAIRY = "dairy", "Dairy"
    GRAIN = "grain", "Grain"
    SNACK = "snack", "Snack"
    OTHER = "other", "Other"


class FoodItem(models.Model):
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=32, choices=FoodCategory.choices, default=FoodCategory.OTHER)
    organic = models.BooleanField(default=False)
    safety_score = models.PositiveSmallIntegerField(default=85)
    farm_origin = models.CharField(
        max_length=255,
        blank=True,
        help_text="Farm label or future on-chain hash reference",
    )

    class Meta:
        ordering = ("name",)

    def __str__(self):
        return self.name


class DietPlan(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="diet_plans")
    week_number = models.PositiveSmallIntegerField(default=1)
    meals = models.JSONField(default=dict)
    recommendations = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-updated_at",)
        indexes = [models.Index(fields=("user", "-updated_at"))]

    def __str__(self):
        return f"DietPlan user={self.user_id} week={self.week_number}"
