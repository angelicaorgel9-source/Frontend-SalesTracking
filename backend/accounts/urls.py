from django.urls import path

from .views import (
    CustomerBranchesView,
    CustomerAddressesView,
    CustomerNotificationsView,
    CustomerProfileView,
    CustomerSignupView,
    EmployeeListCreateView,
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
    path('branches/', CustomerBranchesView.as_view(), name='customer-branches'),
    path('notifications/customers/', CustomerNotificationsView.as_view(), name='customer-notifications'),
    path('employees/', EmployeeListCreateView.as_view(), name='employee-list-create'),
]
