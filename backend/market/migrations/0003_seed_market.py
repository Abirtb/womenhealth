from decimal import Decimal

from django.db import migrations


def seed_market(apps, schema_editor):
    Location = apps.get_model("market", "Location")
    Seller = apps.get_model("market", "Seller")
    ProductAvailability = apps.get_model("market", "ProductAvailability")
    FoodItem = apps.get_model("nutrition", "FoodItem")

    loc_a, _ = Location.objects.get_or_create(
        label="Bloom Mother Market",
        defaults={
            "address": "12 Garden Lane",
            "city": "Springfield",
            "latitude": Decimal("37.7749"),
            "longitude": Decimal("-122.4194"),
        },
    )
    loc_b, _ = Location.objects.get_or_create(
        label="Harbor Greens Collective",
        defaults={
            "address": "88 Bay Street",
            "city": "Springfield",
            "latitude": Decimal("37.8044"),
            "longitude": Decimal("-122.2712"),
        },
    )

    seller_a, _ = Seller.objects.get_or_create(name="Bloom Mother Market", defaults={"location": loc_a, "phone": ""})
    seller_b, _ = Seller.objects.get_or_create(
        name="Harbor Greens Collective", defaults={"location": loc_b, "phone": ""}
    )

    foods = list(FoodItem.objects.all()[:8])
    for idx, food in enumerate(foods):
        seller = seller_a if idx % 2 == 0 else seller_b
        ProductAvailability.objects.get_or_create(
            seller=seller,
            food_item=food,
            defaults={"price_cents": 499 + idx * 50, "in_stock": True},
        )


def unseed_market(apps, schema_editor):
    ProductAvailability = apps.get_model("market", "ProductAvailability")
    Seller = apps.get_model("market", "Seller")
    Location = apps.get_model("market", "Location")
    ProductAvailability.objects.all().delete()
    Seller.objects.filter(name__in=("Bloom Mother Market", "Harbor Greens Collective")).delete()
    Location.objects.filter(label__in=("Bloom Mother Market", "Harbor Greens Collective")).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("market", "0002_initial"),
        ("nutrition", "0003_seed_foods"),
    ]

    operations = [
        migrations.RunPython(seed_market, unseed_market),
    ]
