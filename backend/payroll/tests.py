from decimal import Decimal

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from payroll.models import PayrollRecord


class PayrollApiTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(username='payroll-admin', password='test-password', role=User.ADMIN)
        self.employee = User.objects.create_user(
            username='payroll-employee',
            password='test-password',
            role=User.EMPLOYEE,
            name='Payroll Employee',
        )
        self.other_employee = User.objects.create_user(
            username='other-employee',
            password='test-password',
            role=User.EMPLOYEE,
        )

    def test_admin_generate_edit_and_employee_reads_own_record(self):
        self.client.force_authenticate(self.admin)
        generate_response = self.client.post(reverse('payroll-generate'), {
            'period': '2026-09',
            'scope': 'specific',
            'employee': self.employee.username,
        }, format='json')

        self.assertEqual(generate_response.status_code, status.HTTP_201_CREATED)
        record_id = generate_response.data[0]['id']
        self.assertEqual(generate_response.data[0]['status'], PayrollRecord.STATUS_PENDING)

        update_response = self.client.patch(reverse('payroll-admin-detail', args=[record_id]), {
            'earnings': [{'label': 'Basic Salary', 'amount': 25000}],
            'deductions': [{'label': 'Tax', 'amount': 2500}],
            'status': PayrollRecord.STATUS_PAID,
        }, format='json')
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data['net_total'], Decimal('22500'))

        older_record = PayrollRecord.objects.create(
            employee=self.employee,
            period='2026-08',
            earnings=[{'label': 'Basic Salary', 'amount': '20000.00'}],
            deductions=[],
        )

        self.client.force_authenticate(self.employee)
        employee_response = self.client.get(reverse('my-payroll'))
        self.assertEqual(employee_response.status_code, status.HTTP_200_OK)
        self.assertEqual(employee_response.data['id'], record_id)
        self.assertEqual(employee_response.data['period'], '2026-09')
        self.assertEqual(employee_response.data['net_total'], Decimal('22500'))
        self.assertNotEqual(employee_response.data['id'], older_record.id)

        self.client.force_authenticate(self.other_employee)
        other_response = self.client.get(reverse('my-payroll'))
        self.assertEqual(other_response.status_code, status.HTTP_200_OK)
        self.assertIsNone(other_response.data)

    def test_employee_cannot_manage_payroll_records(self):
        self.client.force_authenticate(self.employee)
        response = self.client.get(reverse('payroll-admin-records'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_django_superuser_can_manage_payroll(self):
        superuser = User.objects.create_superuser(
            username='django-superuser',
            password='test-password',
            role=User.EMPLOYEE,
        )
        self.client.force_authenticate(superuser)
        response = self.client.get(reverse('payroll-admin-records'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)