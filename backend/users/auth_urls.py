from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializers import EmailTokenObtainPairSerializer
from .views import RegisterView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", TokenObtainPairView.as_view(serializer_class=EmailTokenObtainPairSerializer), name="auth-login"),
    path("refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
]
