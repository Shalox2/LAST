from django.db import models
from django.conf import settings
from shops.models import Shop
from products.models import Product

class Comment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_comments')
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='shop_comments', null=True, blank=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='product_comments', null=True, blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    content = models.TextField()
    rating = models.PositiveSmallIntegerField(choices=[(i, i) for i in range(1, 6)], default=5)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_reply = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Comment by {self.user.username} on {self.created_at}"
