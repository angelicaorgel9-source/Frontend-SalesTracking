from django.conf import settings
from django.db import models


class PayrollRecord(models.Model):
    STATUS_PENDING = 'PENDING'
    STATUS_PROCESSING = 'PROCESSING'
    STATUS_PAID = 'PAID'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_PROCESSING, 'Processing'),
        (STATUS_PAID, 'Paid'),
    ]

    employee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payroll_records',
    )
    period = models.CharField(max_length=7)
    branch = models.CharField(max_length=100, blank=True)
    earnings = models.JSONField(default=list)
    deductions = models.JSONField(default=list)
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default=STATUS_PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-period', 'employee__username']
        constraints = [
            models.UniqueConstraint(fields=['employee', 'period'], name='unique_employee_payroll_period'),
        ]

    def __str__(self):
        return f'{self.employee.username} - {self.period}'