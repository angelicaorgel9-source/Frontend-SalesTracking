from django.urls import path

from .views import InventoryDetailView, InventoryListCreateView, ProductDetailView, ProductListCreateView

urlpatterns = [
    path('products/', ProductListCreateView.as_view(), name='product-list-create'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('inventory/', InventoryListCreateView.as_view(), name='inventory-list-create'),
    path('inventory/<int:pk>/', InventoryDetailView.as_view(), name='inventory-detail'),
]
