from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from branches.models import Branch
from products.models import Inventory, Product
from orders.models import Order


class BranchScopedOrderTests(APITestCase):
    def setUp(self):
        self.branch = Branch.objects.create(name='Baliuag', code='baliuag')
        self.product = Product.objects.create(name='Test Product', price=100)
        self.employee = User.objects.create_user(
            username='test-employee', password='test-password', role=User.EMPLOYEE,
        )

    def test_employee_can_create_order_with_branch(self):
        self.client.force_authenticate(self.employee)
        response = self.client.post('/api/orders/', {
            'branch': self.branch.id,
            'customer_name': 'Test Customer',
            'customer_phone': '09170000000',
            'payment_method': 'CASH',
            'items': [{'product': self.product.id, 'quantity': 2}],
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['branch_name'], 'Baliuag')
        self.assertEqual(response.data['total_amount'], '200.00')

    def test_sales_summary_breaks_down_by_branch(self):
        other_branch = Branch.objects.create(name='Tangos', code='tangos')
        Order.objects.create(
            branch=self.branch, customer_name='A', customer_phone='1',
            total_amount=100, status=Order.STATUS_PLACED,
        )
        Order.objects.create(
            branch=other_branch, customer_name='B', customer_phone='2',
            total_amount=50, status=Order.STATUS_PLACED,
        )
        Order.objects.create(
            branch=self.branch, customer_name='C', customer_phone='3',
            total_amount=999, status=Order.STATUS_CANCELLED,
        )

        self.client.force_authenticate(self.employee)
        response = self.client.get('/api/sales/summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(float(response.data['daily_total']), 150.0)
        branch_totals = {row['branch_name']: float(row['total']) for row in response.data['daily_by_branch']}
        self.assertEqual(branch_totals['Baliuag'], 100.0)
        self.assertEqual(branch_totals['Tangos'], 50.0)

    def test_only_admin_can_write_inventory(self):
        Inventory.objects.create(branch=self.branch, product=self.product, quantity=10)
        self.client.force_authenticate(self.employee)

        response = self.client.get(f'/api/inventory/?branch={self.branch.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

        response = self.client.post('/api/inventory/', {
            'branch': self.branch.id, 'product': self.product.id, 'quantity': 5,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
