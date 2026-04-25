from django.db import models

from nutrition.models import FoodItem


class Location(models.Model):
    label = models.CharField(max_length=200)
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=120, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)

    class Meta:
        verbose_name_plural = "locations"

    def __str__(self):
        return self.label


class Seller(models.Model):
    name = models.CharField(max_length=200)
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name="sellers")
    phone = models.CharField(max_length=40, blank=True)

    def __str__(self):
        return self.name


class ProductAvailability(models.Model):
    seller = models.ForeignKey(Seller, on_delete=models.CASCADE, related_name="inventory")
    food_item = models.ForeignKey(FoodItem, on_delete=models.CASCADE, related_name="availability")
    price_cents = models.PositiveIntegerField(default=0)
    in_stock = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "product availability records"
        unique_together = ("seller", "food_item")

    def __str__(self):
        return f"{self.food_item} @ {self.seller}"
