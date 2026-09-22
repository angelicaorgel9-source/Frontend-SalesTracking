from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.conf import settings

from accounts.permissions import IsAdmin
from config.mongodb import get_mongo_database
from .models import Product
from .serializers import ProductSerializer


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
