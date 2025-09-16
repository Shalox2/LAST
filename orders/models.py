from django.db import models
from django.conf import settings
from django.utils import timezone

class Order(models.Model):
    ORDER_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default='pending')
    
    # Buyer contact information for seller communication
    buyer_phone = models.CharField(max_length=20, blank=True, help_text="Buyer's phone number for seller contact")
    buyer_message = models.TextField(blank=True, help_text="Additional message from buyer")
    
    # Notification tracking
    seller_notified = models.BooleanField(default=False)
    notification_sent_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.total_price:
            self.total_price = self.product.price * self.quantity
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order #{self.id} - {self.buyer.username} - {self.product.name}"

    class Meta:
        ordering = ['-created_at']


class SellerNotification(models.Model):
    """Model to track notifications sent to sellers about new orders"""
    NOTIFICATION_TYPES = [
        ('new_order', 'New Order'),
        ('order_update', 'Order Update'),
        ('payment_received', 'Payment Received'),
        ('shop_verified', 'Shop Verified'),
        ('shop_rejected', 'Shop Rejected'),
    ]
    
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    order = models.ForeignKey(Order, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.seller.username} - {self.title}"
