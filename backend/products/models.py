from django.db import models


class Product(models.Model):
    """A printing service/product (T-shirt printing, tarpaulin, etc.).
    This is one shared catalog across all branches — name, price, description
    are the same everywhere. Per-branch stock counts live in Inventory below.
    """

    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(null=True, blank=True, help_text='Deprecated: use Inventory for per-branch stock.')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Inventory(models.Model):
    """How much stock of a given Product a specific Branch currently has.
    One row per (branch, product) pair."""

    branch = models.ForeignKey('branches.Branch', on_delete=models.CASCADE, related_name='inventory')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='inventory')
    quantity = models.IntegerField(default=0)
    low_stock_threshold = models.IntegerField(default=5)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['branch', 'product'], name='unique_branch_product_inventory'),
        ]
        ordering = ['branch__name', 'product__name']

    def __str__(self):
        return f'{self.product.name} @ {self.branch.name}: {self.quantity}'
