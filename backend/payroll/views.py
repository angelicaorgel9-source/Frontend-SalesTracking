from django.db.models import Q
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from accounts.permissions import IsAdminOrEmployee
from .models import PayrollRecord
from .permissions import IsPayrollAdmin
from .serializers import GeneratePayrollSerializer, PayrollRecordSerializer


EMPTY_EARNINGS = [
    {'label': 'Basic Salary', 'amount': 0},
    {'label': 'Overtime Pay', 'amount': 0},
    {'label': 'Allowances', 'amount': 0},
    {'label': 'Bonuses', 'amount': 0},
]
EMPTY_DEDUCTIONS = [
    {'label': 'SSS Contribution', 'amount': 0},
    {'label': 'PhilHealth', 'amount': 0},
    {'label': 'Pag-IBIG', 'amount': 0},
    {'label': 'Withholding Tax', 'amount': 0},
]


class PayrollAdminListView(generics.ListAPIView):
    serializer_class = PayrollRecordSerializer
    permission_classes = [IsPayrollAdmin]

    def get_queryset(self):
        queryset = PayrollRecord.objects.select_related('employee').all()
        period = self.request.query_params.get('period')
        status_filter = self.request.query_params.get('status')
        search = self.request.query_params.get('search', '').strip()
        if period:
            queryset = queryset.filter(period=period)
        if status_filter:
            queryset = queryset.filter(status=status_filter.upper())
        if search:
            queryset = queryset.filter(
                Q(employee__username__icontains=search)
                | Q(employee__name__icontains=search)
                | Q(employee__email__icontains=search)
            )
        return queryset


class PayrollGenerateView(APIView):
    permission_classes = [IsPayrollAdmin]

    def post(self, request):
        input_serializer = GeneratePayrollSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        data = input_serializer.validated_data

        employees = User.objects.filter(role=User.EMPLOYEE, is_active=True)
        if data['scope'] == 'specific':
            identifier = data['employee'].strip()
            employee = employees.filter(
                Q(username__iexact=identifier)
                | Q(name__iexact=identifier)
                | Q(email__iexact=identifier)
            ).first()
            if not employee:
                return Response({'detail': 'No active employee matches that username or name.'}, status=status.HTTP_404_NOT_FOUND)
            employees = employees.filter(pk=employee.pk)

        records = []
        for employee in employees:
            record, _ = PayrollRecord.objects.get_or_create(
                employee=employee,
                period=data['period'],
                defaults={
                    'earnings': EMPTY_EARNINGS,
                    'deductions': EMPTY_DEDUCTIONS,
                    'status': PayrollRecord.STATUS_PENDING,
                },
            )
            records.append(record)

        return Response(PayrollRecordSerializer(records, many=True).data, status=status.HTTP_201_CREATED)


class PayrollAdminDetailView(generics.RetrieveUpdateAPIView):
    queryset = PayrollRecord.objects.select_related('employee')
    serializer_class = PayrollRecordSerializer
    permission_classes = [IsPayrollAdmin]


class MyPayrollView(generics.ListAPIView):
    serializer_class = PayrollRecordSerializer
    permission_classes = [IsAdminOrEmployee]

    def get_queryset(self):
        return PayrollRecord.objects.filter(employee=self.request.user).select_related('employee')

    def list(self, request, *args, **kwargs):
        record = self.get_queryset().first()
        if not record:
            return Response(None)
        return Response(self.get_serializer(record).data)