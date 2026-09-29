from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.conf import settings

from accounts.permissions import IsAdmin, IsAdminOrEmployee
from config.mongodb import get_mongo_database
from .models import Inventory, Product
from .serializers import InventorySerializer, ProductSerializer


class ProductListCreateView(generics.ListCreateAPIView):
   

    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer

    def get(self, request, *args, **kwargs):
        if settings.MONGO_URI:
            products = []
            services = get_mongo_database()['printingServices'].find({})
            for service in services:
                for index, item in enumerate(service.get('items', [])):
                    minimum = item.get('minPrice', item.get('price', 0))
                    products.append({
                        'id': f"{service['_id']}-{index}",
                        'name': f"{item.get('type', 'Printing')} {service.get('category', '')}".strip(),
                        'category': service.get('category', 'Printing'),
                        'description': f"{item.get('type', 'Custom')} printing service",
                        'price': minimum,
                        'stock': None,
                        'is_active': True,
                        'unit': service.get('unit', 'unit'),
                        'max_price': item.get('maxPrice', minimum),
                        'currency': item.get('currency', 'PHP'),
                        'service_id': str(service['_id']),
                    })
            return Response(products)
        return super().get(request, *args, **kwargs)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [AllowAny()]


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
   

    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdmin()]


class InventoryListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/inventory/?branch=<id>  -> staff only, current stock (optionally
         filtered to one branch, which is how the POS/inventory screen for a
         given shop would use this)
    POST /api/inventory/              -> admin only, set up a product's
         starting stock at a branch
    """

    serializer_class = InventorySerializer

    def get_queryset(self):
        queryset = Inventory.objects.select_related('branch', 'product')
        branch_id = self.request.query_params.get('branch')
        if branch_id:
            queryset = queryset.filter(branch_id=branch_id)
        return queryset

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [IsAdminOrEmployee()]


class InventoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET             /api/inventory/<id>/  -> staff (e.g. after a sale, check
                    remaining stock)
    PATCH/DELETE    /api/inventory/<id>/  -> admin only (restock, correct a
                    count, or remove an item from a branch's inventory)
    """

    queryset = Inventory.objects.select_related('branch', 'product')
    serializer_class = InventorySerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAdminOrEmployee()]
        return [IsAdmin()]
