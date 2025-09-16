from django.contrib import admin
from .models import Product

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'shop', 'price', 'stock_quantity', 'is_active', 'created_at')
    list_filter = ('is_active', 'shop', 'created_at')
    search_fields = ('name', 'shop__name')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
