from django.contrib import admin
from .models import Order

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'buyer', 'product', 'quantity', 'total_price', 'status', 'created_at')
    list_filter = ('status', 'created_at', 'product__shop')
    search_fields = ('buyer__username', 'product__name')
    ordering = ('-created_at',)
    readonly_fields = ('total_price', 'created_at', 'updated_at')
