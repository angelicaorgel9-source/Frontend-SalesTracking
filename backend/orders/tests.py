from rest_framework import status
from rest_framework.test import APITestCase
import calendar
from django.test import override_settings
from django.utils import timezone

from accounts.models import CustomerNotification, User
from branches.models import Branch
from products.models import Inventory, Product
from orders.models import Order


class BranchScopedOrderTests(APITestCase):
    def setUp(self):
        self.branch, _ = Branch.objects.get_or_create(code='baliuag', defaults={'name': 'Baliuag'})
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
        self.assertEqual(response.data['delivery_fee'], '100.00')
        self.assertEqual(response.data['total_amount'], '300.00')

    def test_customer_pickup_order_has_no_delivery_fee(self):
        customer = User.objects.create_user(
            username='pickup-customer', password='test-password', role=User.CUSTOMER,
        )
        self.client.force_authenticate(customer)

        response = self.client.post('/api/orders/', {
            'branch': self.branch.id,
            'customer_name': 'Pickup Customer',
            'customer_phone': '09170000001',
            'fulfillment_method': Order.FULFILLMENT_PICKUP,
            'items': [{'product': self.product.id, 'quantity': 2}],
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['fulfillment_method'], Order.FULFILLMENT_PICKUP)
        self.assertEqual(response.data['delivery_fee'], '0.00')
        self.assertEqual(response.data['total_amount'], '200.00')

    def test_customer_delivery_order_includes_delivery_fee(self):
        customer = User.objects.create_user(
            username='delivery-customer', password='test-password', role=User.CUSTOMER,
        )
        self.client.force_authenticate(customer)

        response = self.client.post('/api/orders/', {
            'branch': self.branch.id,
            'customer_name': 'Delivery Customer',
            'customer_phone': '09170000002',
            'fulfillment_method': Order.FULFILLMENT_DELIVERY,
            'delivery_address': '123 Sample Street',
            'items': [{'product': self.product.id, 'quantity': 2}],
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['delivery_fee'], '100.00')
        self.assertEqual(response.data['total_amount'], '300.00')
        self.assertEqual(response.data['delivery_address'], '123 Sample Street')

    @override_settings(MONGO_URI='')
    def test_employee_ready_status_notifies_customer(self):
        customer = User.objects.create_user(
            username='ready-customer', email='ready@example.com', password='test-password', role=User.CUSTOMER,
        )
        order = Order.objects.create(
            branch=self.branch,
            created_by=customer,
            customer_name='Ready Customer',
            customer_phone='09170000003',
            fulfillment_method=Order.FULFILLMENT_PICKUP,
            delivery_fee=0,
            total_amount=100,
        )
        self.client.force_authenticate(self.employee)

        response = self.client.patch(
            f'/api/orders/{order.transaction_id}/status/',
            {'status': Order.STATUS_READY},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        notification = CustomerNotification.objects.get(user=customer, order_id=order.transaction_id)
        self.assertEqual(notification.title, 'Order ready for pickup')
        self.assertIn(self.branch.name, notification.message)

        self.client.force_authenticate(customer)
        notifications_response = self.client.get('/api/notifications/customers/')
        self.assertEqual(notifications_response.status_code, status.HTTP_200_OK)
        self.assertEqual(notifications_response.data[0]['orderId'], order.transaction_id)
        self.assertTrue(notifications_response.data[0]['unread'])

    @override_settings(MONGO_URI='')
    def test_employee_can_mark_pickup_and_delivery_orders_complete(self):
        pickup_customer = User.objects.create_user(
            username='picked-up-customer', password='test-password', role=User.CUSTOMER,
        )
        delivery_customer = User.objects.create_user(
            username='delivered-customer', password='test-password', role=User.CUSTOMER,
        )
        pickup_order = Order.objects.create(
            branch=self.branch, created_by=pickup_customer, customer_name='Pickup Customer',
            customer_phone='09170000004', fulfillment_method=Order.FULFILLMENT_PICKUP,
            delivery_fee=0, total_amount=100,
        )
        delivery_order = Order.objects.create(
            branch=self.branch, created_by=delivery_customer, customer_name='Delivery Customer',
            customer_phone='09170000005', fulfillment_method=Order.FULFILLMENT_DELIVERY,
            delivery_fee=100, total_amount=200,
        )
        self.client.force_authenticate(self.employee)

        pickup_response = self.client.patch(
            f'/api/orders/{pickup_order.transaction_id}/status/',
            {'status': Order.STATUS_PICKED_UP},
            format='json',
        )
        delivery_response = self.client.patch(
            f'/api/orders/{delivery_order.transaction_id}/status/',
            {'status': Order.STATUS_DELIVERED},
            format='json',
        )

        self.assertEqual(pickup_response.status_code, status.HTTP_200_OK)
        self.assertEqual(delivery_response.status_code, status.HTTP_200_OK)
        self.assertEqual(pickup_order.__class__.objects.get(pk=pickup_order.pk).status, Order.STATUS_PICKED_UP)
        self.assertEqual(delivery_order.__class__.objects.get(pk=delivery_order.pk).status, Order.STATUS_DELIVERED)
        self.assertEqual(CustomerNotification.objects.get(user=pickup_customer).title, 'Order picked up')
        self.assertEqual(CustomerNotification.objects.get(user=delivery_customer).title, 'Order delivered')

    @override_settings(MONGO_URI='')
    def test_employee_cannot_finish_order_with_wrong_fulfillment_status(self):
        customer = User.objects.create_user(
            username='wrong-final-status-customer', password='test-password', role=User.CUSTOMER,
        )
        delivery_order = Order.objects.create(
            branch=self.branch, created_by=customer, customer_name='Delivery Customer',
            customer_phone='09170000006', fulfillment_method=Order.FULFILLMENT_DELIVERY,
            delivery_fee=100, total_amount=200,
        )
        self.client.force_authenticate(self.employee)

        response = self.client.patch(
            f'/api/orders/{delivery_order.transaction_id}/status/',
            {'status': Order.STATUS_PICKED_UP},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Order.objects.get(pk=delivery_order.pk).status, Order.STATUS_PLACED)
        self.assertFalse(CustomerNotification.objects.filter(user=customer).exists())

    def test_sales_summary_breaks_down_by_branch(self):
        other_branch, _ = Branch.objects.get_or_create(code='tangos', defaults={'name': 'Tangos'})
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

    def test_branch_analytics_is_empty_and_zero_filled_for_each_period(self):
        self.client.force_authenticate(self.employee)
        today = timezone.localdate()
        periods = {'daily': 24, 'weekly': 7, 'monthly': calendar.monthrange(today.year, today.month)[1], 'quarterly': 3, 'yearly': 12}

        for period, bucket_count in periods.items():
            response = self.client.get('/api/sales/analytics/', {'branch': self.branch.id, 'period': period})
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(response.data['branch']['name'], 'Baliuag')
            self.assertEqual(response.data['sales_total'], 0)
            self.assertEqual(response.data['order_count'], 0)
            self.assertEqual(len(response.data['series']), bucket_count)
            self.assertTrue(all(bucket['sales'] == 0 and bucket['orders'] == 0 for bucket in response.data['series']))

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
