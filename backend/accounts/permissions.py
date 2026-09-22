from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Only allows logged-in users with role == ADMIN."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.role == 'ADMIN')


class IsAdminOrEmployee(BasePermission):
    """Allows any logged-in staff account (ADMIN or EMPLOYEE)."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.role in ('ADMIN', 'EMPLOYEE'))


class IsCustomerOrStaff(BasePermission):
    """Allows authenticated customer accounts and staff accounts."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.role in ('ADMIN', 'EMPLOYEE', 'CUSTOMER'))
