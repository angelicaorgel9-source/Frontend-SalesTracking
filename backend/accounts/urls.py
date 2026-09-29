from django.urls import path

from .views import (
    CustomerAddressesView,
    CustomerNotificationsView,
    CustomerProfileView,
    CustomerSignupView,
    EmployeeCustomersView,
    EmployeeDashboardView,
    EmployeeListCreateView,
    EmployeeNotificationsView,
    LoginView,
    ResendLoginCodeView,
    VerifyLoginView,
)

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/login/verify/', VerifyLoginView.as_view(), name='login-verify'),
    path('auth/login/resend/', ResendLoginCodeView.as_view(), name='login-resend'),
    path('customers/signup/', CustomerSignupView.as_view(), name='customer-signup'),
    path('customers/me/', CustomerProfileView.as_view(), name='customer-profile'),
    path('customers/addresses/', CustomerAddressesView.as_view(), name='customer-addresses'),
    path('notifications/customers/', CustomerNotificationsView.as_view(), name='customer-notifications'),
    path('employees/', EmployeeListCreateView.as_view(), name='employee-list-create'),
    path('employees/dashboard/', EmployeeDashboardView.as_view(), name='employee-dashboard'),
    path('employees/customers/', EmployeeCustomersView.as_view(), name='employee-customers'),
    path('employees/notifications/', EmployeeNotificationsView.as_view(), name='employee-notifications'),
]
