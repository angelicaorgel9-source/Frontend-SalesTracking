from decimal import Decimal, InvalidOperation

from rest_framework import serializers

from .models import PayrollRecord


def total_for(items):
    return sum((Decimal(str(item.get('amount', 0))) for item in items), Decimal('0'))


class PayrollRecordSerializer(serializers.ModelSerializer):
    employee_id = serializers.IntegerField(read_only=True)
    employee_username = serializers.CharField(source='employee.username', read_only=True)
    employee_name = serializers.SerializerMethodField()
    position = serializers.SerializerMethodField()
    gross_total = serializers.SerializerMethodField()
    deduction_total = serializers.SerializerMethodField()
    net_total = serializers.SerializerMethodField()

    class Meta:
        model = PayrollRecord
        fields = [
            'id', 'employee_id', 'employee_username', 'employee_name', 'position',
            'branch', 'period', 'earnings', 'deductions', 'gross_total',
            'deduction_total', 'net_total', 'status', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'employee_id', 'employee_username', 'employee_name', 'position', 'created_at', 'updated_at']

    def get_employee_name(self, record):
        return record.employee.name or record.employee.get_full_name() or record.employee.username

    def get_position(self, record):
        return record.employee.role.title()

    def get_gross_total(self, record):
        return total_for(record.earnings)

    def get_deduction_total(self, record):
        return total_for(record.deductions)

    def get_net_total(self, record):
        return total_for(record.earnings) - total_for(record.deductions)

    def validate_items(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError('Expected a list of payroll items.')
        normalized = []
        for item in value:
            label = str(item.get('label', '')).strip()
            if not label:
                raise serializers.ValidationError('Each payroll item needs a label.')
            try:
                amount = Decimal(str(item.get('amount', 0)))
            except (InvalidOperation, TypeError):
                raise serializers.ValidationError('Each amount must be a valid number.')
            if not amount.is_finite() or amount < 0:
                raise serializers.ValidationError('Amounts must be finite and non-negative.')
            normalized.append({'label': label, 'amount': str(amount.quantize(Decimal('0.01')))})
        return normalized

    def validate_earnings(self, value):
        return self.validate_items(value)

    def validate_deductions(self, value):
        return self.validate_items(value)


class GeneratePayrollSerializer(serializers.Serializer):
    period = serializers.RegexField(r'^\d{4}-(0[1-9]|1[0-2])$')
    scope = serializers.ChoiceField(choices=['all', 'specific'])
    employee = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        if attrs['scope'] == 'specific' and not attrs.get('employee', '').strip():
            raise serializers.ValidationError({'employee': 'Enter the employee username or full name.'})
        return attrs