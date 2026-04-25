from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ("email",)
    list_display = ("email", "name", "pregnancy_stage", "is_staff")
    search_fields = ("email", "name")
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (
            "Profile",
            {
                "fields": (
                    "name",
                    "pregnancy_stage",
                    "city",
                    "location_lat",
                    "location_lng",
                    "dietary_restrictions",
                    "allergies",
                )
            },
        ),
        (
            "Permissions",
            {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")},
        ),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "name",
                    "password1",
                    "password2",
                    "pregnancy_stage",
                ),
            },
        ),
    )
    filter_horizontal = ("groups", "user_permissions",)
