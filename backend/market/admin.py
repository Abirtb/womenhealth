from django.contrib import admin

from .models import Location, ProductAvailability, Seller


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ("label", "city", "latitude", "longitude")


@admin.register(Seller)
class SellerAdmin(admin.ModelAdmin):
    list_display = ("name", "location")


@admin.register(ProductAvailability)
class ProductAvailabilityAdmin(admin.ModelAdmin):
    list_display = ("food_item", "seller", "price_cents", "in_stock")
