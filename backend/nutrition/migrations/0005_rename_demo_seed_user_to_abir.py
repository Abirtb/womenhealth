"""
If an older 0004 created demo@nurtura.app, move that account to Abir Tabarki
and keep diet plans attached. Safe no-op if Abir already exists alone.
"""

from django.contrib.auth.hashers import make_password
from django.db import migrations

OLD_EMAIL = "demo@nurtura.app"
ABIR_EMAIL = "abir.tabarki@nurtura.app"
ABIR_NAME = "Abir Tabarki"
ABIR_PASSWORD = "NurturaAbir1!"


def forwards(apps, schema_editor):
    User = apps.get_model("users", "User")
    DietPlan = apps.get_model("nutrition", "DietPlan")

    old = User.objects.filter(email=OLD_EMAIL).first()
    new = User.objects.filter(email=ABIR_EMAIL).first()

    if old and not new:
        old.email = ABIR_EMAIL
        old.name = ABIR_NAME
        old.password = make_password(ABIR_PASSWORD)
        old.save(update_fields=["email", "name", "password"])
        return

    if old and new:
        DietPlan.objects.filter(user=old).update(user=new)
        old.delete()


def backwards(apps, schema_editor):
    User = apps.get_model("users", "User")
    try:
        u = User.objects.get(email=ABIR_EMAIL)
    except User.DoesNotExist:
        return
    u.email = OLD_EMAIL
    u.name = "River"
    u.password = make_password("NurturaDemo1!")
    u.save(update_fields=["email", "name", "password"])


class Migration(migrations.Migration):
    dependencies = [
        ("nutrition", "0004_seed_mock_diet_plans"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
