from django.contrib import admin

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('transaction_id', 'customer_name', 'status', 'total_amount', 'created_at')
    list_filter = ('status', 'payment_method')
    search_fields = ('transaction_id', 'customer_name', 'customer_phone')
    inlines = [OrderItemInline]
