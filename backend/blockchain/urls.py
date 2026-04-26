from django.urls import path
from . import views

urlpatterns = [
    path('verify/<str:product_id>/', views.verify_product_blockchain, name='verify-product'),
    path('stats/', views.blockchain_stats, name='blockchain-stats'),
]
