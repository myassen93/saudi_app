from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        (_("معلومات إضافية"), {"fields": ("gender",)}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        (_("معلومات إضافية"), {"fields": ("gender",)}),
    )
    list_display = ("username", "email", "gender", "is_staff", "is_active")
    list_filter = BaseUserAdmin.list_filter + ("gender",)
