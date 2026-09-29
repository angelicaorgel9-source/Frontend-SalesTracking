from django.urls import path

from .views import BranchDetailView, BranchListCreateView

urlpatterns = [
    path('branches/', BranchListCreateView.as_view(), name='branch-list-create'),
    path('branches/<int:pk>/', BranchDetailView.as_view(), name='branch-detail'),
]
