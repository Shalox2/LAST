from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Q
from .models import Order, SellerNotification
from .serializers import OrderSerializer, OrderCreateSerializer, SellerNotificationSerializer

class OrderListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'admin':
            return Order.objects.all()
        elif user.role == 'seller':
            # Orders containing products from seller's shop
            return Order.objects.filter(product__shop__owner=user)
        else:  # buyer
            return Order.objects.filter(buyer=user)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return OrderCreateSerializer
        return OrderSerializer
    
    def create(self, request, *args, **kwargs):
        # Only buyers can create orders
        if request.user.role != 'buyer':
            return Response({'error': 'Only buyers can create orders'}, 
                          status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'admin':
            return Order.objects.all()
        elif user.role == 'seller':
            return Order.objects.filter(product__shop__owner=user)
        else:  # buyer
            return Order.objects.filter(buyer=user)


class SellerNotificationListView(generics.ListAPIView):
    serializer_class = SellerNotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Only sellers can view their notifications
        if self.request.user.role != 'seller':
            return SellerNotification.objects.none()
        return SellerNotification.objects.filter(seller=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    """Mark a notification as read"""
    try:
        notification = SellerNotification.objects.get(
            id=notification_id, 
            seller=request.user
        )
        notification.is_read = True
        notification.save()
        return Response({'status': 'success'})
    except SellerNotification.DoesNotExist:
        return Response({'error': 'Notification not found'}, 
                       status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    """Mark all notifications as read for the current seller"""
    if request.user.role != 'seller':
        return Response({'error': 'Only sellers can mark notifications'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    SellerNotification.objects.filter(
        seller=request.user, 
        is_read=False
    ).update(is_read=True)
    
    return Response({'status': 'success'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def fulfill_order(request, order_id):
    """Mark an order as delivered and mark related notifications read"""
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    # Only seller of the product's shop or admin can fulfill
    user = request.user
    if not (user.role == 'admin' or (user.role == 'seller' and order.product.shop.owner_id == user.id)):
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    # Update order status
    order.status = 'delivered'
    order.save()

    # Mark related notifications as read
    SellerNotification.objects.filter(order=order, seller=order.product.shop.owner, is_read=False).update(is_read=True)

    return Response({'status': 'success', 'order': OrderSerializer(order).data})
