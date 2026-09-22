from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    

    ADMIN = 'ADMIN'
    EMPLOYEE = 'EMPLOYEE'
    CUSTOMER = 'CUSTOMER'
    ROLE_CHOICES = [
        (ADMIN, 'Admin'),
        (EMPLOYEE, 'Employee'),
        (CUSTOMER, 'Customer'),
    ]

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=EMPLOYEE)
    name = models.CharField(max_length=150, blank=True)
    phone = models.CharField(max_length=30, blank=True)
    two_factor_enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.username} ({self.role})'
