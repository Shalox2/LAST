from rest_framework import serializers
from .models import Order, SellerNotification

class OrderSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    shop_name = serializers.CharField(source='product.shop.name', read_only=True)
    buyer_username = serializers.CharField(source='buyer.username', read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'buyer', 'buyer_username', 'product', 'product_name', 'shop_name', 
                 'quantity', 'total_price', 'status', 'buyer_phone', 'buyer_message', 
                 'seller_notified', 'notification_sent_at', 'created_at']
        read_only_fields = ['buyer', 'total_price', 'seller_notified', 'notification_sent_at', 'created_at']

class OrderCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['product', 'quantity', 'buyer_phone', 'buyer_message']

    def validate(self, attrs):
        product = attrs['product']
        quantity = attrs['quantity']
        
        if quantity <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        
        if product.stock_quantity < quantity:
            raise serializers.ValidationError("Insufficient stock")
        
        return attrs

    def create(self, validated_data):
        validated_data['buyer'] = self.context['request'].user
        order = super().create(validated_data)
        
        # Update product stock
        product = order.product
        product.stock_quantity -= order.quantity
        product.save()
        
        # Create notification for seller
        from django.utils import timezone
        SellerNotification.objects.create(
            seller=product.shop.owner,
            order=order,
            notification_type='new_order',
            title=f'New Order for {product.name}',
            message=f'You have received a new order for {product.name} from {order.buyer.username}. Contact: {order.buyer_phone}'
        )
        
        # Mark order as notified
        order.seller_notified = True
        order.notification_sent_at = timezone.now()
        order.save()
        
        return order


class SellerNotificationSerializer(serializers.ModelSerializer):
    order_info = serializers.SerializerMethodField()
    
    class Meta:
        model = SellerNotification
        fields = ['id', 'notification_type', 'title', 'message', 'is_read', 'created_at', 'order_info']
        read_only_fields = ['created_at']
    
    def get_order_info(self, obj):
        if obj.order:
            return {
                'id': obj.order.id,
                'product_name': obj.order.product.name,
                'buyer_username': obj.order.buyer.username,
                'buyer_phone': obj.order.buyer_phone,
                'quantity': obj.order.quantity,
                'total_price': obj.order.total_price,
                'status': obj.order.status
            }
        return None
