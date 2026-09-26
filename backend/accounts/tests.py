from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User


class CustomerProfilePermissionTests(APITestCase):
    def test_profile_update_rejects_role_escalation(self):
        customer = User.objects.create_user(
            username='profile-customer',
            password='test-password',
            role=User.CUSTOMER,
        )
        self.client.force_authenticate(customer)

        response = self.client.patch('/api/customers/me/', {
            'name': 'Updated Name',
            'role': User.ADMIN,
            'is_staff': True,
        }, format='json')

        customer.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(customer.role, User.CUSTOMER)
        self.assertFalse(customer.is_staff)
        self.assertEqual(customer.name, '')

    def test_profile_update_allows_customer_profile_fields(self):
        customer = User.objects.create_user(
            username='profile-customer',
            password='test-password',
            role=User.CUSTOMER,
        )
        self.client.force_authenticate(customer)

        response = self.client.patch('/api/customers/me/', {
            'name': 'Updated Name',
            'phone': '09171234567',
            'two_factor_enabled': False,
        }, format='json')

        customer.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(customer.name, 'Updated Name')
        self.assertEqual(customer.phone, '09171234567')
        self.assertFalse(customer.two_factor_enabled)