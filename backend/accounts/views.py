from django.contrib.auth import authenticate
from datetime import datetime, timezone
from datetime import timedelta
import re
import secrets
from django.conf import settings
from django.db.models import Count, Max, Q, Sum
from django.utils import timezone as django_timezone
from rest_framework import generics, status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from orders.models import Order
from .models import User
from .permissions import IsAdmin, IsAdminOrEmployee
from .serializers import CustomerProfileUpdateSerializer, CustomerSignupSerializer, CreateEmployeeSerializer, UserSerializer
from config.mongodb import get_mongo_database
from .sms import send_login_code


class LoginView(APIView):
    

    permission_classes = [AllowAny]

    def post(self, request):
        identifier = request.data.get('username', '').strip()
        password = request.data.get('password', '')

        if not identifier or not password:
            return Response({'detail': 'Username and password are required.'},
                             status=status.HTTP_400_BAD_REQUEST)

        user_record = User.objects.filter(username__iexact=identifier).first()
        if not user_record and '@' in identifier:
            user_record = User.objects.filter(email__iexact=identifier).first()
        if not user_record:
            user_record = User.objects.filter(name__iexact=identifier).first()

        user = authenticate(
            username=user_record.username if user_record else identifier,
            password=password,
        )
        if user is None:
            return Response({'detail': 'Invalid username or password.'},
                             status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            return Response({'detail': 'This account has been disabled.'},
                             status=status.HTTP_403_FORBIDDEN)

        device_id = request.data.get('device_id', '').strip()
        if user.role == User.CUSTOMER and user.two_factor_enabled:
            if not device_id:
                return Response({'detail': 'A device identifier is required for verification.'}, status=400)
            if not settings.MONGO_URI:
                return Response({'detail': 'Device verification requires MongoDB.'}, status=503)
            devices = get_mongo_database()['login_devices']
            known_device = devices.find_one({'userId': user.id, 'deviceId': device_id})
            if not known_device:
                if not user.phone:
                    return Response({'detail': 'Add a phone number to your profile before enabling two-factor authentication.'}, status=400)
                verification_id = secrets.token_urlsafe(24)
                code = f'{secrets.randbelow(10000):04d}'
                get_mongo_database()['login_verifications'].insert_one({
                    '_id': verification_id,
                    'userId': user.id,
                    'deviceId': device_id,
                    'code': code,
                    'expiresAt': datetime.now(timezone.utc) + timedelta(minutes=10),
                    'attempts': 0,
                })
                try:
                    send_login_code(user.phone, code)
                except Exception as error:
                    get_mongo_database()['login_verifications'].delete_one({'_id': verification_id})
                    return Response({'detail': str(error)}, status=503)
                return Response({
                    'requires_verification': True,
                    'verification_id': verification_id,
                    'masked_phone': f'******{user.phone[-4:]}',
                })

        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
        })


class VerifyLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        verification_id = request.data.get('verification_id', '')
        code = request.data.get('code', '')
        device_id = request.data.get('device_id', '')
        verification = get_mongo_database()['login_verifications'].find_one({'_id': verification_id})
        if not verification or verification.get('deviceId') != device_id:
            return Response({'detail': 'Verification request expired or invalid.'}, status=400)
        if verification['expiresAt'] < datetime.now(timezone.utc):
            return Response({'detail': 'Verification code expired. Request a new code.'}, status=400)
        if verification.get('attempts', 0) >= 5:
            return Response({'detail': 'Too many attempts. Request a new code.'}, status=429)
        if verification.get('code') != code:
            get_mongo_database()['login_verifications'].update_one({'_id': verification_id}, {'$inc': {'attempts': 1}})
            return Response({'detail': 'Invalid verification code.'}, status=400)

        user = User.objects.get(id=verification['userId'])
        get_mongo_database()['login_devices'].update_one(
            {'userId': user.id, 'deviceId': device_id},
            {'$set': {'userId': user.id, 'deviceId': device_id, 'verifiedAt': datetime.now(timezone.utc)}},
            upsert=True,
        )
        get_mongo_database()['login_verifications'].delete_one({'_id': verification_id})
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': UserSerializer(user).data})


class ResendLoginCodeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        verification_id = request.data.get('verification_id', '')
        verification = get_mongo_database()['login_verifications'].find_one({'_id': verification_id})
        if not verification:
            return Response({'detail': 'Verification request expired or invalid.'}, status=400)
        user = User.objects.get(id=verification['userId'])
        code = f'{secrets.randbelow(10000):04d}'
        get_mongo_database()['login_verifications'].update_one(
            {'_id': verification_id},
            {'$set': {'code': code, 'expiresAt': datetime.now(timezone.utc) + timedelta(minutes=10), 'attempts': 0}},
        )
        try:
            send_login_code(user.phone, code)
        except Exception as error:
            return Response({'detail': str(error)}, status=503)
        return Response({'detail': 'A new verification code was sent.'})


class EmployeeListCreateView(generics.ListCreateAPIView):
    

    queryset = User.objects.filter(role=User.EMPLOYEE).order_by('-created_at')
    permission_classes = [IsAdmin]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateEmployeeSerializer
        return UserSerializer


class EmployeeDashboardView(APIView):
    permission_classes = [IsAdminOrEmployee]

    def _status_label(self, status):
        mapping = {
            'PLACED': 'Queued',
            'DESIGNING': 'In Progress',
            'PRINTING': 'In Progress',
            'READY': 'Review',
            'COMPLETED': 'Completed',
            'CANCELLED': 'Cancelled',
        }
        return mapping.get(status, status)

    def _priority(self, status):
        return 'urgent' if status in ['DESIGNING', 'PRINTING'] else 'up'

    def get(self, request):
        today_start = django_timezone.localtime().replace(hour=0, minute=0, second=0, microsecond=0)

        orders = Order.objects.all()
        open_orders = orders.exclude(status__in=[Order.STATUS_COMPLETED, Order.STATUS_CANCELLED])
        today_total = float(
            orders.filter(created_at__gte=today_start).aggregate(total=Sum('total_amount'))['total'] or 0
        )

        pending_jobs = []
        for order in open_orders.order_by('-created_at')[:5]:
            pending_jobs.append({
                'id': order.transaction_id,
                'customer': order.customer_name or 'Walk-in Customer',
                'details': f'{order.items.count()} item(s) • ₱{order.total_amount}',
                'status': self._status_label(order.status),
                'priority': self._priority(order.status),
            })

        activity = []
        for order in orders.order_by('-created_at')[:5]:
            activity.append({
                'id': str(order.id),
                'type': 'update',
                'title': f'Order {order.transaction_id} moved to {self._status_label(order.status)}',
                'time': order.updated_at.strftime('%b %d, %Y %H:%M'),
            })

        return Response({
            'stats': {
                'assigned_jobs': open_orders.count(),
                'new_sales_today': today_total,
                'registered_customers': User.objects.filter(role=User.CUSTOMER).count(),
            },
            'pending_jobs': pending_jobs,
            'activity': activity,
        })


class EmployeeCustomersView(APIView):
    permission_classes = [IsAdminOrEmployee]

    def get(self, request):
        customers = User.objects.filter(role=User.CUSTOMER).order_by('-created_at')
        data = []
        for customer in customers:
            if settings.MONGO_URI:
                order_filters = [{'customerId': str(customer.id)}]
                if customer.email:
                    order_filters.append({
                        'customerEmail': {
                            '$regex': f'^{re.escape(customer.email)}$',
                            '$options': 'i',
                        },
                    })
                summary = next(get_mongo_database()['orders'].aggregate([
                    {'$match': {'$or': order_filters}},
                    {'$group': {
                        '_id': None,
                        'order_count': {'$sum': 1},
                        'total_spend': {'$sum': {'$ifNull': ['$totalAmount', 0]}},
                        'last_order_at': {'$max': '$createdAt'},
                    }},
                ]), {})
                order_count = summary.get('order_count', 0)
                total_spend = summary.get('total_spend', 0)
                last_order_at = summary.get('last_order_at')
            else:
                customer_orders = Order.objects.filter(created_by=customer)
                if customer.email:
                    customer_orders = customer_orders | Order.objects.filter(customer_email__iexact=customer.email)
                summary = customer_orders.aggregate(
                    order_count=Count('id'),
                    total_spend=Sum('total_amount'),
                    last_order_at=Max('created_at'),
                )
                order_count = summary['order_count']
                total_spend = summary['total_spend']
                last_order_at = summary['last_order_at']

            data.append({
                'id': customer.id,
                'name': customer.name or customer.username,
                'company': customer.email.split('@')[1].split('.')[0].title() if customer.email else 'Walk-in Client',
                'email': customer.email,
                'phone': customer.phone,
                'orders': order_count,
                'status': 'Active' if customer.is_active else 'Inactive',
                'lastDate': last_order_at.strftime('%b %d, %Y') if last_order_at else '—',
                'spend': f"₱{float(total_spend or 0):,.2f}",
            })
        return Response(data)


class EmployeeNotificationsView(APIView):
    permission_classes = [IsAdminOrEmployee]

    def get(self, request):
        notifications = []
        recent_orders = Order.objects.order_by('-created_at')[:4]
        for order in recent_orders:
            notifications.append({
                'id': f'order-{order.id}',
                'category': 'Orders',
                'type': 'info',
                'title': f'Order {order.transaction_id} updated',
                'desc': f'{order.customer_name} is now in {order.status}.',
                'time': order.updated_at.strftime('%b %d, %Y %H:%M'),
                'unread': True,
                'action': 'View order',
            })

        new_customers = User.objects.filter(role=User.CUSTOMER).order_by('-created_at')[:2]
        for customer in new_customers:
            notifications.append({
                'id': f'customer-{customer.id}',
                'category': 'Announcements',
                'type': 'success',
                'title': 'New customer registered',
                'desc': f'{customer.name or customer.username} just joined MJ Prints.',
                'time': customer.created_at.strftime('%b %d, %Y %H:%M'),
                'unread': True,
                'action': 'Review profile',
            })

        return Response(notifications)


class CustomerSignupView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = CustomerSignupSerializer

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        user = User.objects.get(username=response.data['username'])
        try:
            mongo_users = get_mongo_database()['users']
            mongo_users.insert_one({
                'name': user.name,
                'email': user.email,
                'phone': user.phone,
                'address': '',
                'authProvider': 'local',
                'password': user.password,
                'googleId': None,
                'profilePicture': None,
                'isActive': user.is_active,
                'createdAt': datetime.now(timezone.utc),
            })
        except Exception as error:
            user.delete()
            return Response({'detail': f'MongoDB users collection is unavailable: {error}'},
                            status=status.HTTP_503_SERVICE_UNAVAILABLE)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': UserSerializer(user).data},
                        status=status.HTTP_201_CREATED)


class CustomerProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = CustomerProfileUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)


class CustomerAddressesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not settings.MONGO_URI:
            return Response([])
        addresses = get_mongo_database()['customer_address'].find({
            '$or': [
                {'customerId': str(request.user.id)},
                {'customerEmail': request.user.email},
            ],
        }).sort('createdAt', -1)
        return Response([
            {key: value for key, value in address.items() if key != '_id'}
            for address in addresses
        ])

    def post(self, request):
        required = ('label', 'name', 'address', 'phone')
        if any(not str(request.data.get(field, '')).strip() for field in required):
            return Response({'detail': 'Label, name, address, and phone are required.'}, status=400)
        address = {
            'id': secrets.token_hex(8),
            'customerId': str(request.user.id),
            'customerEmail': request.user.email,
            'label': request.data['label'].strip(),
            'name': request.data['name'].strip(),
            'address': request.data['address'].strip(),
            'phone': request.data['phone'].strip(),
            'primary': bool(request.data.get('primary', False)),
            'createdAt': datetime.now(timezone.utc),
            'updatedAt': datetime.now(timezone.utc),
        }
        if not settings.MONGO_URI:
            return Response(address, status=201)
        get_mongo_database()['customer_address'].insert_one(address)
        return Response({key: value for key, value in address.items() if key not in ('_id', 'customerId', 'customerEmail')}, status=201)


class CustomerBranchesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response([])


class CustomerNotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not settings.MONGO_URI:
            return Response([])
        database = get_mongo_database()
        owner_filter = {
            '$or': [
                {'customerId': str(request.user.id)},
                {'customerEmail': request.user.email},
            ],
        }
        notifications_collection = database['notifications_customers']
        existing_order_ids = {
            notification.get('orderId')
            for notification in notifications_collection.find(owner_filter, {'orderId': 1})
        }
        now = datetime.now(timezone.utc)
        for order in database['orders'].find(owner_filter, {'transactionId': 1, 'createdAt': 1}):
            transaction_id = order.get('transactionId')
            if transaction_id and transaction_id not in existing_order_ids:
                notifications_collection.insert_one({
                    'customerId': str(request.user.id),
                    'customerEmail': request.user.email,
                    'category': 'Orders',
                    'type': 'success',
                    'title': 'Order submitted successfully',
                    'message': f'Your order {transaction_id} was submitted successfully. Track your order for production updates.',
                    'orderId': transaction_id,
                    'isRead': False,
                    'createdAt': order.get('createdAt', now),
                })
        notifications = notifications_collection.find(owner_filter).sort('createdAt', -1)
        return Response([
            {
                'id': str(notification['_id']),
                'category': notification.get('category', 'Orders'),
                'type': notification.get('type', 'info'),
                'title': notification.get('title', 'Notification'),
                'desc': notification.get('message', notification.get('desc', '')),
                'time': notification.get('createdAt'),
                'unread': not notification.get('isRead', False),
                'action': 'Track Order' if notification.get('orderId') else 'View Details',
                'orderId': notification.get('orderId'),
            }
            for notification in notifications
        ])

    def post(self, request):
        if settings.MONGO_URI:
            database = get_mongo_database()
            database['notifications_customers'].update_many(
                {
                    '$or': [
                        {'customerId': str(request.user.id)},
                        {'customerEmail': request.user.email},
                    ],
                },
                {'$set': {'isRead': True}},
            )
        return Response({'detail': 'Notifications marked as read.'})
