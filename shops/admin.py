from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.http import HttpResponseRedirect
from .models import Shop

@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'joined_fee_paid', 'get_verification_status', 'verification_actions', 'created_at')
    list_filter = ('joined_fee_paid', 'verification_status', 'created_at')
    search_fields = ('name', 'owner__username', 'description')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    
    def get_verification_status(self, obj):
        status_colors = {
            'pending': '#6c757d',
            'documents_submitted': '#17a2b8', 
            'under_review': '#ffc107',
            'verified': '#28a745',
            'rejected': '#dc3545'
        }
        status_icons = {
            'pending': '⏸️',
            'documents_submitted': '📄',
            'under_review': '🔍',
            'verified': '✅',
            'rejected': '❌'
        }
        color = status_colors.get(obj.verification_status, '#6c757d')
        icon = status_icons.get(obj.verification_status, '❓')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{} {}</span>',
            color, icon, obj.get_verification_status_display()
        )
    get_verification_status.short_description = 'Verification Status'
    
    def verification_actions(self, obj):
        if obj.verification_status == 'documents_submitted':
            verify_url = reverse('admin:verify_shop', args=[obj.pk])
            return format_html(
                '<a href="{}" style="background: #28a745; color: white; padding: 5px 10px; text-decoration: none; border-radius: 3px;">Review & Verify</a>',
                verify_url
            )
        elif obj.verification_status == 'verified':
            return format_html('<span style="color: green;">✓ Verified</span>')
        elif obj.verification_status == 'rejected':
            return format_html('<span style="color: red;">❌ Rejected</span>')
        else:
            return format_html('<span style="color: gray;">Waiting for documents</span>')
    verification_actions.short_description = 'Actions'
    
    def get_urls(self):
        from django.urls import path
        urls = super().get_urls()
        custom_urls = [
            path('verify-shop/<int:shop_id>/', self.admin_site.admin_view(self.verify_shop), name='verify_shop'),
        ]
        return custom_urls + urls
    
    def verify_shop(self, request, shop_id):
        shop = Shop.objects.get(pk=shop_id)
        shop.verification_status = 'verified'
        shop.save()
        
        self.message_user(request, f'Shop "{shop.name}" has been successfully verified!')
        return HttpResponseRedirect(reverse('admin:shops_shop_changelist'))
    
    fieldsets = (
        ('Shop Information', {
            'fields': ('name', 'description', 'owner')
        }),
        ('Business Information', {
            'fields': ('business_license_number', 'tax_id', 'business_address', 'business_phone', 'business_email')
        }),
        ('Documents', {
            'fields': ('business_license_document', 'tax_certificate', 'identity_document')
        }),
        ('Verification Status', {
            'fields': ('joined_fee_paid', 'verification_status', 'verified_by', 'verified_at', 'rejection_reason'),
            'description': 'Enhanced secure verification workflow with document validation'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
