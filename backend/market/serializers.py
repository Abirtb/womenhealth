from rest_framework import serializers

from nutrition.serializers import FoodItemSerializer

from .models import Location, ProductAvailability, Seller


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ("id", "label", "address", "city", "latitude", "longitude")


class SellerSerializer(serializers.ModelSerializer):
    location = LocationSerializer()

    class Meta:
        model = Seller
        fields = ("id", "name", "phone", "location")


class NearbyFoodSerializer(serializers.ModelSerializer):
    seller = SellerSerializer()
    food_item = FoodItemSerializer()
    distance_km = serializers.FloatField(read_only=True)

    class Meta:
        model = ProductAvailability
        fields = ("id", "seller", "food_item", "price_cents", "in_stock", "distance_km")
