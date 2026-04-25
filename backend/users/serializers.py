from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.USERNAME_FIELD

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["email"] = serializers.EmailField()
        if "username" in self.fields:
            del self.fields["username"]

    def validate(self, attrs):
        attrs[User.USERNAME_FIELD] = attrs.get("email")
        return super().validate(attrs)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "name",
            "pregnancy_stage",
            "city",
            "location_lat",
            "location_lng",
            "dietary_restrictions",
            "allergies",
        )
        read_only_fields = ("id", "email")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = (
            "email",
            "password",
            "name",
            "pregnancy_stage",
            "city",
            "location_lat",
            "location_lng",
            "dietary_restrictions",
            "allergies",
        )

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user
