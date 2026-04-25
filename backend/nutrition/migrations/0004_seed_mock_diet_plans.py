from django.contrib.auth.hashers import make_password
from django.db import migrations


def _meal_day(breakfast, lunch, dinner, snack):
    return {
        "breakfast": breakfast,
        "lunch": lunch,
        "dinner": dinner,
        "snack": snack,
    }


def _plan_body(week_number: int, stage: str):
    """Rich mock plan matching frontend shape (meals.* + trimester_focus)."""
    focus = {
        "1": "First trimester: gentle portions, folate-forward plates, and nausea-friendly options.",
        "2": "Second trimester: iron + vitamin C pairings, steady energy, and calcium-rich snacks.",
        "3": "Third trimester: lighter dinners, fiber-forward bites, and hydration nudges.",
    }.get(stage, "Balanced variety each day.")

    w = week_number
    return {
        "source": "mock_seed_migration",
        "pregnancy_stage": stage,
        "week_hint": w,
        "trimester_focus": focus,
        "hydration_liters": 2.2 if stage == "3" else 2.1,
        "notes": "Seeded mock plans for Abir Tabarki — replace with RAG + LLM output later.",
        "meals": {
            "monday": _meal_day(
                f"Oat bowl + berries + chia (week {w})",
                "Lentil soup, wholegrain crackers, side salad",
                "Baked salmon, roasted carrots, herbed quinoa",
                "Greek yogurt + crushed walnuts",
            ),
            "tuesday": _meal_day(
                "Avocado toast + cherry tomatoes",
                "Mediterranean chickpea bowl + cucumber",
                "Turkey or tofu stir-fry with peppers",
                "Apple slices + almond butter",
            ),
            "wednesday": _meal_day(
                "Smoothie: spinach, banana, oat milk",
                "Quinoa tabbouleh + feta (pasteurized)",
                "Chicken + sweet potato + greens",
                "Handful of trail mix",
            ),
            "thursday": _meal_day(
                "Wholegrain pancakes + yogurt",
                "Veggie wrap + hummus",
                "Shrimp or chickpea pasta + peas",
                "Pear + cheese cube",
            ),
            "friday": _meal_day(
                "Chia pudding + mango",
                "Miso soup + tofu + seaweed salad",
                "Lean beef or lentil shepherd’s pie",
                "Dark chocolate square + herbal tea",
            ),
            "saturday": _meal_day(
                "Eggs (well cooked) + sautéed greens",
                "Grain bowl: brown rice, edamame, sesame",
                "Grilled fish tacos + cabbage slaw",
                "Cottage cheese + pineapple",
            ),
            "sunday": _meal_day(
                "French toast + strawberries",
                "Tomato basil soup + grilled cheese (pasteurized cheese)",
                "Roast chicken + farro + broccolini",
                "Chamomile tea + rice cakes",
            ),
        },
    }


ABIR_EMAIL = "abir.tabarki@nurtura.app"
ABIR_NAME = "Abir Tabarki"


def seed_mock_plans(apps, schema_editor):
    User = apps.get_model("users", "User")
    DietPlan = apps.get_model("nutrition", "DietPlan")

    user, _ = User.objects.get_or_create(
        email=ABIR_EMAIL,
        defaults={
            "name": ABIR_NAME,
            "password": make_password("NurturaAbir1!"),
            "pregnancy_stage": "2",
            "city": "Springfield",
            "dietary_restrictions": "Prefer low-sodium dinners.",
            "allergies": "None listed",
        },
    )

    # Apply week 1 last so its `updated_at` is newest (dashboard uses latest plan first).
    seeds = [
        (28, "3", "Late pregnancy comfort — lighter evenings, steady hydration."),
        (12, "2", "Mid-pregnancy energy — pair plants with gentle proteins."),
        (1, "1", "Early weeks — settle in with simple, nourishing rhythms."),
    ]

    for week_number, stage, rec in seeds:
        body = _plan_body(week_number, stage)
        DietPlan.objects.update_or_create(
            user=user,
            week_number=week_number,
            defaults={
                "meals": body,
                "recommendations": rec,
            },
        )


def unseed_mock_plans(apps, schema_editor):
    User = apps.get_model("users", "User")
    DietPlan = apps.get_model("nutrition", "DietPlan")
    try:
        user = User.objects.get(email=ABIR_EMAIL)
    except User.DoesNotExist:
        return
    DietPlan.objects.filter(user=user).delete()
    user.delete()


class Migration(migrations.Migration):
    dependencies = [
        ("nutrition", "0003_seed_foods"),
        ("users", "0002_alter_user_managers"),
    ]

    operations = [
        migrations.RunPython(seed_mock_plans, unseed_mock_plans),
    ]
