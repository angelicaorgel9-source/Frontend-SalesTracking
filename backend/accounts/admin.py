from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('MJ Prints info', {'fields': ('role', 'name', 'phone', 'branch')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('MJ Prints info', {'fields': ('role', 'name', 'phone', 'branch')}),
    )
    list_display = ('username', 'name', 'role', 'branch', 'is_active', 'is_staff')
    list_filter = ('role', 'branch', 'is_active')


admin.site.register(User, CustomUserAdmin)
