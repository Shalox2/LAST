from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

class Shop(models.Model):
    VERIFICATION_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('documents_submitted', 'Documents Submitted'),
        ('under_review', 'Under Review'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    ]
    
    name = models.CharField(max_length=200)
    owner = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='shop')
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to='shop_logos/', blank=True, null=True)
    
    # Business Information
    business_license_number = models.CharField(max_length=100, blank=True)
    tax_id = models.CharField(max_length=50, blank=True)
    business_address = models.TextField(blank=True)
    business_phone = models.CharField(max_length=20, blank=True)
    business_email = models.EmailField(blank=True)
    
    # Documents
    business_license_document = models.FileField(upload_to='business_documents/', blank=True, null=True)
    tax_certificate = models.FileField(upload_to='business_documents/', blank=True, null=True)
    identity_document = models.FileField(upload_to='business_documents/', blank=True, null=True)
    
    # Verification Process
    joined_fee_paid = models.BooleanField(default=False)
    verification_status = models.CharField(max_length=20, choices=VERIFICATION_STATUS_CHOICES, default='pending')
    verification_token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    verified_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_shops')
    verified_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def is_verified(self):
        return self.verification_status == 'verified'
    
    @property
    def documents_complete(self):
        return all([
            self.business_license_document,
            self.tax_certificate,
            self.identity_document,
            self.business_license_number,
            self.tax_id
        ])

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-created_at']

class VerificationLog(models.Model):
    ACTION_CHOICES = [
        ('created', 'Shop Created'),
        ('fee_paid', 'Join Fee Paid'),
        ('documents_submitted', 'Documents Submitted'),
        ('review_started', 'Review Started'),
        ('verified', 'Shop Verified'),
        ('rejected', 'Shop Rejected'),
        ('status_changed', 'Status Changed'),
    ]
    
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='verification_logs')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    notes = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']

class ShopComment(models.Model):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating from 1 to 5 stars"
    )
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_verified_purchase = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['shop', 'user']  # One comment per user per shop
    
    def __str__(self):
        return f"{self.user.username} - {self.shop.name} ({self.rating}★)"

class CommentHelpful(models.Model):
    comment = models.ForeignKey(ShopComment, on_delete=models.CASCADE, related_name='helpful_votes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    is_helpful = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['comment', 'user']
    
    def __str__(self):
        return f"{self.user.username} - {'Helpful' if self.is_helpful else 'Not Helpful'}"


class ProductInquiry(models.Model):
    """Model to store product inquiries from buyers to sellers"""
    STATUS_CHOICES = [
        ('new', 'New'),
        ('contacted', 'Contacted'),
        ('closed', 'Closed'),
    ]
    
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE, related_name='inquiries')
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='product_inquiries')
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='buyer_inquiries')
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='product_inquiries')
    
    # Contact information
    phone = models.CharField(max_length=20)
    message = models.TextField()
    
    # Status tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    is_read = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = 'Product Inquiries'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Inquiry about {self.product.name} from {self.buyer.username}"
