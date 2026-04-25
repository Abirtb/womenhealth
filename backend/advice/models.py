from django.db import models


class ArticleCategory(models.TextChoices):
    NUTRITION = "nutrition", "Nutrition"
    HEALTH = "health", "Health"
    PREGNANCY = "pregnancy", "Pregnancy tips"
    WEEKLY = "weekly", "Weekly recommendation"


class Article(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    summary = models.TextField(blank=True)
    body = models.TextField()
    category = models.CharField(max_length=32, choices=ArticleCategory.choices, default=ArticleCategory.NUTRITION)
    trimester = models.CharField(max_length=1, blank=True, help_text="1/2/3 or blank for all")
    published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return self.title
