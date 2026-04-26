from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("users.auth_urls")),
    path("api/", include("users.urls")),
    path("api/", include("nutrition.urls")),
    path("api/", include("market.urls")),
    path("api/", include("advice.urls")),
    path("api/blockchain/", include("blockchain.urls")),
]
