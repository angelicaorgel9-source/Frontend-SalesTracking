import calendar
from datetime import date, datetime, time, timedelta
from datetime import datetime, timezone as dt_timezone
import random
import string

from django.conf import settings
from django.db.models import Count, Sum
from django.utils import timezone
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from accounts.permissions import IsAdmin, IsAdminOrEmployee, IsCustomerOrStaff
from branches.models import Branch
from config.mongodb import get_mongo_database
from .models import Order
from .serializers import OrderSerializer, OrderTrackSerializer


def mongo_branch_name(document):
    branch_id = document.get('branchId')
    branch = None
    if str(branch_id or '').isdigit():
        branch = Branch.objects.filter(pk=int(branch_id)).first()
    if not branch:
        branch = Branch.objects.filter(code=document.get('branchCode', branch_id)).first()
    return branch.name if branch else ''


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
            'branch_name': mongo_branch_name(document),
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


class OrderStatusUpdateView(APIView):
    permission_classes = [IsAdminOrEmployee]

    def patch(self, request, transaction_id):
        status_value = request.data.get('status')
        valid_statuses = {value for value, _label in Order.STATUS_CHOICES}
        if status_value is not None and status_value not in valid_statuses:
            return Response({'status': 'Select a valid order status.'}, status=400)

        if settings.MONGO_URI:
            collection = get_mongo_database()['orders']
            order = collection.find_one({'transactionId': transaction_id})
            if not order:
                return Response({'detail': 'Order not found.'}, status=404)
            now = datetime.now(dt_timezone.utc)
            field_map = {
                'customer_name': 'customerName',
                'customer_phone': 'customerPhone',
                'customer_email': 'customerEmail',
                'payment_method': 'paymentMethod',
                'estimated_completion': 'estimatedCompletion',
                'branch': 'branchId',
                'total_amount': 'totalAmount',
            }
            updates = {field_map[key]: value for key, value in request.data.items() if key in field_map}
            updates['updatedAt'] = now
            if status_value is not None:
                updates['status'] = status_value
            operations = {'$set': updates}
            if status_value is not None:
                operations['$push'] = {'statusHistory': {'status': status_value, 'timestamp': now, 'updatedBy': request.user.id}}
            collection.update_one(
                {'_id': order['_id']},
                operations,
            )
            return Response({'transaction_id': transaction_id, 'status': status_value, 'updated_at': now})

        order = Order.objects.filter(transaction_id=transaction_id).first()
        if not order:
            return Response({'detail': 'Order not found.'}, status=404)
        field_map = {
            'customer_name': 'customer_name',
            'customer_phone': 'customer_phone',
            'customer_email': 'customer_email',
            'payment_method': 'payment_method',
            'estimated_completion': 'estimated_completion',
            'branch': 'branch_id',
            'total_amount': 'total_amount',
        }
        updated_fields = ['updated_at']
        for key, model_field in field_map.items():
            if key in request.data:
                setattr(order, model_field, request.data[key])
                updated_fields.append(model_field)
        if status_value is not None:
            order.status = status_value
            updated_fields.append('status')
        order.save(update_fields=updated_fields)
        return Response({'transaction_id': transaction_id, 'status': order.status, 'updated_at': order.updated_at})


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
                'branch_name': mongo_branch_name(document),
                'payment_method': document.get('paymentMethod', 'CASH'),
                'status': document.get('status', 'PLACED'),
                'created_at': document.get('createdAt'),
                'updated_at': document.get('updatedAt'),
                'estimated_completion': document.get('estimatedCompletion'),
                'total_amount': document.get('totalAmount', 0),
                'items': items,
            })
        return super().retrieve(request, *args, **kwargs)


class SalesAnalyticsView(APIView):
    permission_classes = [IsAdminOrEmployee]
    PERIODS = ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')

    def get(self, request):
        period = request.query_params.get('period', 'monthly').lower()
        branch_key = request.query_params.get('branch')
        if period not in self.PERIODS:
            return Response({'period': 'Select daily, weekly, monthly, quarterly, or yearly.'}, status=400)

        branch_query = Branch.objects.filter(is_active=True)
        if branch_key:
            branch_query = branch_query.filter(pk=branch_key) if str(branch_key).isdigit() else branch_query.filter(code=branch_key)
        branch = branch_query.first()
        if not branch:
            return Response({'detail': 'Branch not found.'}, status=404)

        today = timezone.localdate()
        if period == 'daily':
            range_start = today
            range_end = today + timedelta(days=1)
            buckets = [(hour, f'{hour:02d}:00') for hour in range(24)]
        elif period == 'weekly':
            range_start = today - timedelta(days=today.weekday())
            range_end = range_start + timedelta(days=7)
            buckets = [(range_start + timedelta(days=offset), (range_start + timedelta(days=offset)).strftime('%a')) for offset in range(7)]
        elif period == 'monthly':
            range_start = today.replace(day=1)
            range_end = today.replace(day=calendar.monthrange(today.year, today.month)[1]) + timedelta(days=1)
            buckets = [(range_start + timedelta(days=offset), (range_start + timedelta(days=offset)).strftime('%d %b')) for offset in range((range_end - range_start).days)]
        elif period == 'quarterly':
            quarter_month = ((today.month - 1) // 3) * 3 + 1
            range_start = today.replace(month=quarter_month, day=1)
            range_end = (range_start.replace(year=range_start.year + 1, month=1) if quarter_month == 10 else range_start.replace(month=quarter_month + 3))
            buckets = [(month, date(today.year, month, 1).strftime('%b')) for month in range(quarter_month, quarter_month + 3)]
        else:
            range_start = today.replace(month=1, day=1)
            range_end = range_start.replace(year=range_start.year + 1)
            buckets = [(month, calendar.month_abbr[month]) for month in range(1, 13)]

        start_at = timezone.make_aware(datetime.combine(range_start, time.min), timezone.get_current_timezone())
        end_at = timezone.make_aware(datetime.combine(range_end, time.min), timezone.get_current_timezone())
        totals = {key: {'sales': 0.0, 'orders': 0} for key, _label in buckets}

        if settings.MONGO_URI:
            branch_filters = [
                {'branchId': str(branch.id)},
                {'branchId': branch.id},
                {'branchCode': branch.code},
            ]
            orders = get_mongo_database()['orders'].find({
                '$and': [
                    {'$or': branch_filters},
                    {'createdAt': {'$gte': start_at, '$lt': end_at}},
                    {'status': {'$ne': Order.STATUS_CANCELLED}},
                ],
            }, {'createdAt': 1, 'totalAmount': 1})
            for order in orders:
                created_at = order.get('createdAt')
                if not created_at:
                    continue
                if timezone.is_naive(created_at):
                    created_at = timezone.make_aware(created_at, dt_timezone.utc)
                local_created = timezone.localtime(created_at)
                if period == 'daily':
                    key = local_created.hour
                elif period in ('weekly', 'monthly'):
                    key = local_created.date()
                else:
                    key = local_created.month
                if key in totals:
                    totals[key]['sales'] += float(order.get('totalAmount', 0) or 0)
                    totals[key]['orders'] += 1
        else:
            orders = Order.objects.filter(
                branch=branch,
                created_at__gte=start_at,
                created_at__lt=end_at,
            ).exclude(status=Order.STATUS_CANCELLED).values('created_at', 'total_amount')
            for order in orders:
                local_created = timezone.localtime(order['created_at'])
                if period == 'daily':
                    key = local_created.hour
                elif period in ('weekly', 'monthly'):
                    key = local_created.date()
                else:
                    key = local_created.month
                if key in totals:
                    totals[key]['sales'] += float(order['total_amount'] or 0)
                    totals[key]['orders'] += 1

        sales_total = sum(bucket['sales'] for bucket in totals.values())
        order_count = sum(bucket['orders'] for bucket in totals.values())
        completed_orders = 0
        if settings.MONGO_URI:
            completed_orders = get_mongo_database()['orders'].count_documents({
                '$and': [
                    {'$or': [{'branchId': str(branch.id)}, {'branchId': branch.id}, {'branchCode': branch.code}]},
                    {'createdAt': {'$gte': start_at, '$lt': end_at}},
                    {'status': Order.STATUS_COMPLETED},
                ],
            })
        else:
            completed_orders = Order.objects.filter(branch=branch, status=Order.STATUS_COMPLETED, created_at__gte=start_at, created_at__lt=end_at).count()

        return Response({
            'branch': {'id': branch.id, 'name': branch.name, 'code': branch.code},
            'period': period,
            'range_start': range_start.isoformat(),
            'range_end': (range_end - timedelta(days=1)).isoformat(),
            'sales_total': sales_total,
            'order_count': order_count,
            'average_order_value': sales_total / order_count if order_count else 0,
            'completed_orders': completed_orders,
            'series': [{'label': label, **totals[key]} for key, label in buckets],
        })


class SalesSummaryView(APIView):
    """
    GET /api/sales/summary/  -> today's and this-week's totals (staff only),
    plus a per-branch breakdown so each shop's numbers can be seen separately.
    Cancelled orders are excluded from the totals.
    """

    permission_classes = [IsAdminOrEmployee]

    def get(self, request):
        now = timezone.localtime()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=today_start.weekday())

        base_qs = Order.objects.exclude(status=Order.STATUS_CANCELLED)
        daily_qs = base_qs.filter(created_at__gte=today_start)
        weekly_qs = base_qs.filter(created_at__gte=week_start)

        def by_branch(queryset):
            rows = (
                queryset.values('branch__id', 'branch__name')
                .annotate(total=Sum('total_amount'), order_count=Count('id'))
                .order_by('branch__name')
            )
            return [
                {
                    'branch_id': row['branch__id'],
                    'branch_name': row['branch__name'] or 'Unassigned',
                    'total': row['total'] or 0,
                    'order_count': row['order_count'],
                }
                for row in rows
            ]

        return Response({
            'daily_total': daily_qs.aggregate(total=Sum('total_amount'))['total'] or 0,
            'daily_order_count': daily_qs.count(),
            'weekly_total': weekly_qs.aggregate(total=Sum('total_amount'))['total'] or 0,
            'weekly_order_count': weekly_qs.count(),
            'daily_by_branch': by_branch(daily_qs),
            'weekly_by_branch': by_branch(weekly_qs),
        })
