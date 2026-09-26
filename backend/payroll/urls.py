from django.urls import path

from .views import MyPayrollView, PayrollAdminDetailView, PayrollAdminListView, PayrollGenerateView

urlpatterns = [
    path('me/', MyPayrollView.as_view(), name='my-payroll'),
    path('admin/records/', PayrollAdminListView.as_view(), name='payroll-admin-records'),
    path('admin/generate/', PayrollGenerateView.as_view(), name='payroll-generate'),
    path('admin/records/<int:pk>/', PayrollAdminDetailView.as_view(), name='payroll-admin-detail'),
]