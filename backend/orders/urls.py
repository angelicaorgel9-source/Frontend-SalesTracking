from django.urls import path

from .views import CustomerOrderEditView, OrderDetailView, OrderListCreateView, OrderStatusUpdateView, OrderTrackView, SalesAnalyticsView, SalesSummaryView

urlpatterns = [
    path('orders/', OrderListCreateView.as_view(), name='order-list-create'),
    path('orders/<str:transaction_id>/edit/', CustomerOrderEditView.as_view(), name='customer-order-edit'),
    path('orders/<str:transaction_id>/status/', OrderStatusUpdateView.as_view(), name='order-status-update'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('orders/track/<str:transaction_id>/', OrderTrackView.as_view(), name='order-track'),
    path('sales/summary/', SalesSummaryView.as_view(), name='sales-summary'),
    path('sales/analytics/', SalesAnalyticsView.as_view(), name='sales-analytics'),
]
