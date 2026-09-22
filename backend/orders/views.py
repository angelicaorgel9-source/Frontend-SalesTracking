from datetime import timedelta
from datetime import datetime, timezone as dt_timezone
import random
import string

from django.conf import settings
from django.db.models import Sum
from django.utils import timezone
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from accounts.permissions import IsAdmin, IsAdminOrEmployee, IsCustomerOrStaff
from config.mongodb import get_mongo_database
from .models import Order
from .serializers import OrderSerializer, OrderTrackSerializer


class OrderListCreateView(generics.ListCreateAPIView):


    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsCustomerOrStaff]

    def _mongo_order(self, document):
        items = [
            {
                **item,
                'product_name': item.get('itemName', 'Printing Service'),
                'subtotal': item.get('subtotal', item.get('price', 0) * item.get('quantity', 1)),
            }
            for item in document.get('items', [])
        ]
        return {
            'id': str(document['_id']),
            'transaction_id': document['transactionId'],
            'customer_name': document.get('customerName', ''),
            'customer_phone': document.get('customerPhone', ''),
            'customer_email': document.get('customerEmail', ''),
            'status': document.get('status', 'PLACED'),
            'payment_method': document.get('paymentMethod', 'CASH'),
            'total_amount': document.get('totalAmount', 0),
            'created_at': document.get('createdAt'),
            'updated_at': document.get('updatedAt'),
            'estimated_completion': document.get('estimatedCompletion'),
            'items': items,
        }

    def _create_mongo_order(self, request):
        data = request.data
        items = data.get('items') or []
        if not items:
            return Response({'detail': 'An order needs at least one item.'}, status=400)

        now = datetime.now(dt_timezone.utc)
        mongo_items = []
        subtotal = 0
        for item in items:
            quantity = int(item.get('quantity', 1))
            unit_price = float(item.get('unit_price', 0))
            line_total = unit_price * quantity
            subtotal += line_total
            mongo_items.append({
                'type': item.get('type', 'printing'),
                'serviceId': item.get('product'),
                'itemName': item.get('item_name', 'Printing Service'),
                'size': item.get('size', ''),
                'material': item.get('material', ''),
                'quantity': quantity,
                'uploadedFileUrl': item.get('uploaded_file_url', ''),
                'price': unit_price,
                'subtotal': line_total,
                'specifications': item.get('specifications', ''),
            })

        transaction_id = 'MJ-' + ''.join(random.choices(string.digits, k=5))
        document = {
            'transactionId': transaction_id,
            'customerId': str(request.user.id),
            'customerName': data.get('customer_name', ''),
            'customerPhone': data.get('customer_phone', ''),
            'customerEmail': data.get('customer_email', ''),
            'branchId': data.get('branch_id'),
            'branchCode': data.get('branch_code'),
            'items': mongo_items,
            'subtotal': subtotal,
            'deliveryFee': 100,
            'totalAmount': subtotal + 100,
            'paymentMethod': data.get('payment_method', 'CASH'),
            'status': 'PLACED',
            'statusHistory': [{'status': 'PLACED', 'timestamp': now, 'updatedBy': None}],
            'orderSource': 'online',
            'processedBy': None,
            'createdAt': now,
            'updatedAt': now,
            'completedAt': None,
        }
        result = get_mongo_database()['orders'].insert_one(document)
        document['_id'] = result.inserted_id
        get_mongo_database()['notifications_customers'].insert_one({
            'customerId': str(request.user.id),
            'customerEmail': data.get('customer_email', request.user.email),
            'category': 'Orders',
            'type': 'success',
            'title': 'Order submitted successfully',
            'message': f'Your order {transaction_id} was submitted successfully. Track your order for production updates.',
            'orderId': transaction_id,
            'isRead': False,
            'createdAt': now,
        })
        return Response(self._mongo_order(document), status=201)

    def list(self, request, *args, **kwargs):
        if settings.MONGO_URI:
            orders = get_mongo_database()['orders']
            if request.user.role == User.CUSTOMER:
                owner_filter = {
                    '$or': [
                        {'customerId': str(request.user.id)},
                        {'customerEmail': request.user.email},
                    ],
                }
            else:
                owner_filter = {}
            documents = orders.find(owner_filter).sort('createdAt', -1)
            return Response([self._mongo_order(document) for document in documents])
        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        if settings.MONGO_URI:
            return self._create_mongo_order(request)
        return super().create(request, *args, **kwargs)

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.role == User.CUSTOMER:
            return Order.objects.filter(created_by=self.request.user)
        return Order.objects.all()


class OrderDetailView(generics.RetrieveUpdateDestroyAPIView):
   
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def get_permissions(self):
        if self.request.method == 'DELETE':
            return [IsAdmin()]
        return [IsAdminOrEmployee()]


class CustomerOrderEditView(APIView):
    permission_classes = [IsCustomerOrStaff]

    def patch(self, request, transaction_id):
        if not settings.MONGO_URI:
            return Response({'detail': 'MongoDB orders are not configured.'}, status=503)

        database = get_mongo_database()
        query = {'transactionId': transaction_id}
        if request.user.role == User.CUSTOMER:
            query['$or'] = [
                {'customerId': str(request.user.id)},
                {'customerEmail': request.user.email},
            ]
        order = database['orders'].find_one(query)
        if not order:
            return Response({'detail': 'Order not found.'}, status=404)
        if order.get('status') not in ('PLACED', 'DESIGNING') and request.user.role == User.CUSTOMER:
            return Response({'detail': 'This order can no longer be edited.'}, status=400)

        updates = {}
        for field in ('customerName', 'customerPhone', 'customerEmail', 'paymentMethod'):
            if field in request.data:
                updates[field] = request.data[field]
        if 'notes' in request.data:
            database['orders'].update_one(
                {'_id': order['_id']},
                {'$set': {'items.0.specifications': request.data['notes']}},
            )
        if updates:
            database['orders'].update_one({'_id': order['_id']}, {'$set': updates})
        updated = database['orders'].find_one({'_id': order['_id']})
        return Response({
            'transaction_id': updated['transactionId'],
            'status': updated.get('status', 'PLACED'),
            'updated_at': updated.get('updatedAt'),
        })


class OrderTrackView(generics.RetrieveAPIView):
    
 

    queryset = Order.objects.all()
    serializer_class = OrderTrackSerializer
    lookup_field = 'transaction_id'
    lookup_url_kwarg = 'transaction_id'
    permission_classes = [IsCustomerOrStaff]

    def retrieve(self, request, *args, **kwargs):
        if settings.MONGO_URI:
            transaction_id = kwargs[self.lookup_url_kwarg]
            query = {'transactionId': transaction_id}
            if request.user.role == User.CUSTOMER:
                query = {
                    '$and': [
                        query,
                        {'$or': [
                            {'customerId': str(request.user.id)},
                            {'customerEmail': request.user.email},
                        ]},
                    ],
                }
            document = get_mongo_database()['orders'].find_one(query)
            if not document:
                return Response({'detail': 'Order not found.'}, status=404)
            items = [
                {
                    'product_name': item.get('itemName', 'Printing Service'),
                    'quantity': item.get('quantity', 1),
                    'subtotal': item.get('subtotal', 0),
                }
                for item in document.get('items', [])
            ]
            return Response({
                'transaction_id': document['transactionId'],
                'customer_name': document.get('customerName', ''),
                'customer_phone': document.get('customerPhone', ''),
                'customer_email': document.get('customerEmail', ''),
                'payment_method': document.get('paymentMethod', 'CASH'),
                'status': document.get('status', 'PLACED'),
                'created_at': document.get('createdAt'),
                'updated_at': document.get('updatedAt'),
                'estimated_completion': document.get('estimatedCompletion'),
                'total_amount': document.get('totalAmount', 0),
                'items': items,
            })
        return super().retrieve(request, *args, **kwargs)


class SalesSummaryView(APIView):
   

    permission_classes = [IsAdminOrEmployee]

    def get(self, request):
        now = timezone.localtime()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=today_start.weekday())

        base_qs = Order.objects.exclude(status=Order.STATUS_CANCELLED)
        daily_qs = base_qs.filter(created_at__gte=today_start)
        weekly_qs = base_qs.filter(created_at__gte=week_start)

        return Response({
            'daily_total': daily_qs.aggregate(total=Sum('total_amount'))['total'] or 0,
            'daily_order_count': daily_qs.count(),
            'weekly_total': weekly_qs.aggregate(total=Sum('total_amount'))['total'] or 0,
            'weekly_order_count': weekly_qs.count(),
        })
