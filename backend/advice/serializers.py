from rest_framework import serializers

from .models import Article


class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = ("id", "title", "slug", "summary", "body", "category", "trimester", "created_at")
