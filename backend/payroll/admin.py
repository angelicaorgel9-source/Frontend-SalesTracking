from django.contrib import admin

from .models import PayrollRecord


@admin.register(PayrollRecord)
class PayrollRecordAdmin(admin.ModelAdmin):
    list_display = ('employee', 'period', 'status', 'updated_at')
    list_filter = ('period', 'status')
    search_fields = ('employee__username', 'employee__name', 'employee__email')