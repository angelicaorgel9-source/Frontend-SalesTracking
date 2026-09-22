from django.urls import path

from .views import CustomerOrderEditView, OrderDetailView, OrderListCreateView, OrderTrackView, SalesSummaryView

urlpatterns = [
    path('orders/', OrderListCreateView.as_view(), name='order-list-create'),
    path('orders/<str:transaction_id>/edit/', CustomerOrderEditView.as_view(), name='customer-order-edit'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('orders/track/<str:transaction_id>/', OrderTrackView.as_view(), name='order-track'),
    path('sales/summary/', SalesSummaryView.as_view(), name='sales-summary'),
]
