import random
import string

from django.conf import settings
from django.db import models

from products.models import Product


def generate_transaction_id():
  # for ID 
    while True:
        candidate = 'MJ-' + ''.join(random.choices(string.digits, k=5))
        if not Order.objects.filter(transaction_id=candidate).exists():
            return candidate


class Order(models.Model):
    STATUS_PLACED = 'PLACED'
    STATUS_DESIGNING = 'DESIGNING'
    STATUS_PRINTING = 'PRINTING'
    STATUS_READY = 'READY'
    STATUS_COMPLETED = 'COMPLETED'
    STATUS_CANCELLED = 'CANCELLED'
    STATUS_CHOICES = [
        (STATUS_PLACED, 'Order Placed'),
        (STATUS_DESIGNING, 'Designing'),
        (STATUS_PRINTING, 'Printing'),
        (STATUS_READY, 'Ready for Pickup'),
        (STATUS_COMPLETED, 'Completed'),
        (STATUS_CANCELLED, 'Cancelled'),
    ]

    PAYMENT_CHOICES = [
        ('CASH', 'Cash'),
        ('GCASH', 'GCash'),
        ('CARD', 'Card'),
        ('OTHER', 'Other'),
    ]

    transaction_id = models.CharField(max_length=20, unique=True, default=generate_transaction_id, editable=False)
    customer_name = models.CharField(max_length=150)
    customer_phone = models.CharField(max_length=30)
    customer_email = models.EmailField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PLACED)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default='CASH')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    estimated_completion = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.transaction_id


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, editable=False)
    specifications = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        self.subtotal = self.unit_price * self.quantity
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.product.name} x {self.quantity}'
