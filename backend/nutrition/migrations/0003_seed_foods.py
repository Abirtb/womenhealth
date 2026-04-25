from django.db import migrations


def seed_foods(apps, schema_editor):
    FoodItem = apps.get_model("nutrition", "FoodItem")
    catalog = [
        ("Spinach", "vegetable", True, 96, "farm-hash:green-valley-01"),
        ("Wild salmon", "protein", True, 94, "farm-hash:north-river-co-op"),
        ("Greek yogurt", "dairy", False, 92, "farm-hash:local-dairy"),
        ("Blueberries", "fruit", True, 98, "farm-hash:berry-hill"),
        ("Quinoa bowl base", "grain", True, 90, "farm-hash:andes-organics"),
        ("Lentils", "protein", True, 93, "farm-hash:sunrise-pulse"),
        ("Carrots", "vegetable", True, 95, "farm-hash:root-farm"),
        ("Avocado", "fruit", False, 88, "farm-hash:coastal-grove"),
        ("Eggs (pasteurized)", "protein", False, 91, "farm-hash:heritage-hens"),
        ("Oats", "grain", True, 89, "farm-hash:prairie-mill"),
    ]
    for name, category, organic, score, origin in catalog:
        FoodItem.objects.get_or_create(
            name=name,
            defaults={
                "category": category,
                "organic": organic,
                "safety_score": score,
                "farm_origin": origin,
            },
        )


def unseed_foods(apps, schema_editor):
    FoodItem = apps.get_model("nutrition", "FoodItem")
    FoodItem.objects.filter(farm_origin__startswith="farm-hash:").delete()


class Migration(migrations.Migration):
    dependencies = [
        ("nutrition", "0002_initial"),
    ]

    operations = [
        migrations.RunPython(seed_foods, unseed_foods),
    ]
