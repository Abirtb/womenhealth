from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("The email address must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self._create_user(email, password, **extra_fields)


class PregnancyStage(models.TextChoices):
    TRIMESTER_1 = "1", "First trimester"
    TRIMESTER_2 = "2", "Second trimester"
    TRIMESTER_3 = "3", "Third trimester"


class User(AbstractUser):
    username = None
    email = models.EmailField("email address", unique=True)
    name = models.CharField(max_length=150)
    pregnancy_stage = models.CharField(
        max_length=1,
        choices=PregnancyStage.choices,
        default=PregnancyStage.TRIMESTER_1,
    )
    city = models.CharField(max_length=120, blank=True)
    location_lat = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    location_lng = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    dietary_restrictions = models.TextField(blank=True)
    allergies = models.TextField(blank=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    def __str__(self):
        return self.email
