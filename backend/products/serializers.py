from rest_framework import serializers

from .models import Inventory, Product


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'category', 'description', 'price', 'stock',
                  'is_active', 'created_at', 'updated_at']


class InventorySerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    low_stock = serializers.SerializerMethodField()

    class Meta:
        model = Inventory
        fields = ['id', 'branch', 'branch_name', 'product', 'product_name',
                  'quantity', 'low_stock_threshold', 'low_stock', 'updated_at']

    def get_low_stock(self, obj):
        return obj.quantity <= obj.low_stock_threshold
