from decimal import Decimal

from django.db import transaction
from rest_framework import serializers

from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 'subtotal', 'specifications']
        read_only_fields = ['subtotal']


class OrderSerializer(serializers.ModelSerializer):
  

    items = OrderItemSerializer(many=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True, default=None)

    class Meta:
        model = Order
        fields = ['id', 'transaction_id', 'branch', 'branch_name', 'customer_name', 'customer_phone', 'customer_email',
              'status', 'payment_method', 'fulfillment_method', 'delivery_fee', 'delivery_address',
              'total_amount', 'created_by', 'created_at', 'updated_at', 'estimated_completion', 'items']
        read_only_fields = ['transaction_id', 'delivery_fee', 'total_amount', 'created_by', 'created_at', 'updated_at']

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError('An order needs at least one item.')
        return value

    def validate(self, attrs):
        request = self.context.get('request')
        fulfillment_method = attrs.get('fulfillment_method', Order.FULFILLMENT_DELIVERY)
        delivery_address = attrs.get('delivery_address', '').strip()
        if (
            request and request.user.is_authenticated
            and request.user.role == 'CUSTOMER'
            and fulfillment_method == Order.FULFILLMENT_DELIVERY
            and not delivery_address
        ):
            raise serializers.ValidationError({'delivery_address': 'A delivery address is required for delivery orders.'})
        return attrs

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        request = self.context.get('request')
        fulfillment_method = validated_data.get('fulfillment_method', Order.FULFILLMENT_DELIVERY)
        delivery_fee = Order.DELIVERY_FEE if fulfillment_method == Order.FULFILLMENT_DELIVERY else Decimal('0.00')

        with transaction.atomic():
            order = Order.objects.create(
                delivery_fee=delivery_fee,
                created_by=request.user if request and request.user.is_authenticated else None,
                **validated_data,
            )
            total = Decimal('0.00')
            for item_data in items_data:
                product = item_data['product']
                unit_price = item_data.get('unit_price') or product.price
                order_item = OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=item_data['quantity'],
                    unit_price=unit_price,
                    specifications=item_data.get('specifications', ''),
                )
                total += order_item.subtotal
            order.total_amount = total + delivery_fee
            order.save()
        return order

    def update(self, instance, validated_data):
       
        validated_data.pop('items', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class OrderTrackSerializer(serializers.ModelSerializer):
   
    items = OrderItemSerializer(many=True, read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True, default=None)

    class Meta:
        model = Order
        fields = [
            'transaction_id', 'branch_name', 'status', 'fulfillment_method', 'delivery_fee',
            'delivery_address', 'total_amount', 'created_at', 'updated_at', 'estimated_completion', 'items',
        ]
