from django.db.models import Q
from rest_framework import permissions
from rest_framework.generics import ListAPIView

from .models import Article
from .serializers import ArticleSerializer


class ArticleListView(ListAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = ArticleSerializer

    def get_queryset(self):
        qs = Article.objects.filter(published=True)
        tri = self.request.query_params.get("trimester")
        if tri in ("1", "2", "3"):
            qs = qs.filter(Q(trimester="") | Q(trimester=tri))
        return qs
