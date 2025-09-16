from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

class ShopComment(models.Model):
    shop = models.ForeignKey('Shop', on_delete=models.CASCADE, related_name='comments')
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
