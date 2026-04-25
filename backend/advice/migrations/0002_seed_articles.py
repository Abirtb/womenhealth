from django.db import migrations


def seed_articles(apps, schema_editor):
    Article = apps.get_model("advice", "Article")
    articles = [
        {
            "title": "What to eat in the first trimester",
            "slug": "first-trimester-nutrition",
            "summary": "Gentle, folate-forward ideas for early pregnancy.",
            "category": "nutrition",
            "trimester": "1",
            "body": (
                "Small, frequent meals can ease nausea while keeping energy steady. "
                "Prioritize folate-rich greens, citrus, legumes, and whole grains. "
                "Stay curious, not restrictive—work with your care team for any concerns."
            ),
        },
        {
            "title": "Foods to avoid during pregnancy",
            "slug": "foods-to-avoid",
            "summary": "A calm checklist to reduce risk while you enjoy meals.",
            "category": "health",
            "trimester": "",
            "body": (
                "Unpasteurized dairy, raw sprouts, undercooked meats, and high-mercury fish "
                "are common guidance items. Heat leftovers thoroughly and wash produce well. "
                "Your clinician can personalize this list for you."
            ),
        },
        {
            "title": "Hydration tips that feel doable",
            "slug": "hydration-tips",
            "summary": "Sip-friendly habits for every trimester.",
            "category": "pregnancy",
            "trimester": "",
            "body": (
                "Keep a bottle nearby, add fruit or herbs for flavor, and pair water with fiber-rich snacks. "
                "If swelling appears, talk with your provider about balanced fluid intake."
            ),
        },
        {
            "title": "Weekly spotlight: iron + vitamin C pairings",
            "slug": "weekly-iron-vitamin-c",
            "summary": "Boost absorption with simple plate combos.",
            "category": "weekly",
            "trimester": "2",
            "body": (
                "Try lentils with tomatoes, spinach with lemon, or fortified cereal with berries. "
                "These pairings support energy as blood volume grows."
            ),
        },
    ]
    for row in articles:
        Article.objects.get_or_create(slug=row["slug"], defaults=row)


def unseed_articles(apps, schema_editor):
    Article = apps.get_model("advice", "Article")
    Article.objects.filter(
        slug__in=(
            "first-trimester-nutrition",
            "foods-to-avoid",
            "hydration-tips",
            "weekly-iron-vitamin-c",
        )
    ).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("advice", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_articles, unseed_articles),
    ]
