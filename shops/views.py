from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth.decorators import login_required
from django.core.mail import send_mail
from django.conf import settings


from .models import Shop, VerificationLog, ShopComment, CommentHelpful, ProductInquiry
from .serializers import (
    ShopSerializer, ShopCreateSerializer, ShopDocumentUploadSerializer,
    ShopVerificationSerializer, VerificationLogSerializer,
    ShopCommentSerializer, CommentHelpfulSerializer, ProductInquirySerializer
)
from django.views.generic import TemplateView

from django.views.generic import View
from django.http import HttpResponse
import os
class ShopListCreateView(generics.ListCreateAPIView):
    queryset = Shop.objects.all()
    
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ShopCreateSerializer
        return ShopSerializer
    
    def perform_create(self, serializer):
        # Only sellers can create shops
        if self.request.user.role != 'seller':
            raise PermissionError("Only sellers can create shops")
        serializer.save()

class ShopDetailView(generics.RetrieveAPIView):
    queryset = Shop.objects.all()
    serializer_class = ShopSerializer
    permission_classes = [AllowAny]

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_payment(request):
    """Process join fee payment and create verification log"""
    if request.user.role != 'seller':
        return Response({'error': 'Only sellers can pay join fee'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        shop = request.user.shop
        
        # Check if already paid
        if shop.joined_fee_paid:
            return Response({'error': 'Join fee already paid'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Process payment (in real implementation, integrate with payment gateway)
        shop.joined_fee_paid = True
        shop.verification_status = 'documents_submitted'  # Move to next step
        shop.save()
        
        # Create verification log
        VerificationLog.objects.create(
            shop=shop,
            action='fee_paid',
            performed_by=request.user,
            notes='Join fee payment completed',
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        # Create notification for admin
        from orders.models import SellerNotification
        from django.contrib.auth import get_user_model
        admin_users = get_user_model().objects.filter(role='admin')
        for admin in admin_users:
            SellerNotification.objects.create(
                seller=admin,  # Admin as "seller" for notification purposes
                notification_type='shop_verified',
                title=f'Shop Payment Completed - {shop.name}',
                message=f'Shop "{shop.name}" has completed payment and is ready for verification.'
            )
        
        return Response({
            'message': 'Join fee payment successful! Your shop is now ready for admin verification.',
            'shop_status': shop.verification_status,
            'payment_status': shop.joined_fee_paid
        })
        return Response({'error': 'Shop not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST', 'PATCH'])

@permission_classes([IsAdminUser])
def verify_shop(request, shop_id):
    """Secure admin endpoint to verify shop with multi-step process"""
    shop = get_object_or_404(Shop, id=shop_id)
    
    # Security checks
    if not shop.documents_complete:
        return Response({
            'error': 'Shop verification requires all documents to be submitted'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not shop.joined_fee_paid:
        return Response({
            'error': 'Shop verification requires join fee to be paid'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if shop.verification_status == 'verified':
        return Response({
            'error': 'Shop is already verified'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Use serializer for secure verification
    serializer = ShopVerificationSerializer(
        shop, 
        data=request.data, 
        context={'request': request}
    )
    
    if serializer.is_valid():
        updated_shop = serializer.save()
        
        # Send notification email (if configured)
        try:
            if updated_shop.verification_status == 'verified':
                send_mail(
                    subject='Shop Verification Approved',
                    message=f'Congratulations! Your shop "{updated_shop.name}" has been verified.',
                    from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@weshop.com'),
                    recipient_list=[updated_shop.owner.email] if updated_shop.owner.email else [],
                    fail_silently=True
                )
        except Exception:
            pass  # Email sending is optional
        
        return Response({
            'message': f'Shop verification status updated to {updated_shop.verification_status}',
            'shop': ShopSerializer(updated_shop).data
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_documents(request, shop_id):
    """Secure document upload endpoint"""
    shop = get_object_or_404(Shop, id=shop_id)
    
    # Only shop owner can upload documents
    if shop.owner != request.user:
        return Response({
            'error': 'Only shop owner can upload documents'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Cannot upload if already verified or rejected
    if shop.verification_status in ['verified', 'rejected']:
        return Response({
            'error': f'Cannot upload documents for {shop.verification_status} shop'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = ShopDocumentUploadSerializer(
        shop,
        data=request.data,
        context={'request': request}
    )
    
    if serializer.is_valid():
        updated_shop = serializer.save()
        return Response({
            'message': 'Documents uploaded successfully',
            'shop': ShopSerializer(updated_shop).data
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def verification_audit_trail(request, shop_id):
    """Get complete audit trail for shop verification"""
    shop = get_object_or_404(Shop, id=shop_id)
    logs = shop.verification_logs.all()
    
    from .serializers import VerificationLogSerializer
    return Response({
        'shop': ShopSerializer(shop).data,
        'audit_trail': VerificationLogSerializer(logs, many=True).data
    })

class ShopCommentListCreateView(generics.ListCreateAPIView):
    serializer_class = ShopCommentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        shop_id = self.kwargs.get('shop_id')
        return ShopComment.objects.filter(shop_id=shop_id)
    
    def perform_create(self, serializer):
        shop_id = self.kwargs.get('shop_id')
        shop = get_object_or_404(Shop, id=shop_id)
        serializer.save(shop=shop)

class CommentHelpfulView(generics.CreateAPIView):
    serializer_class = CommentHelpfulSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        comment_id = request.data.get('comment')
        if not comment_id:
            return Response(
                {"comment": ["This field is required."]},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            comment = ShopComment.objects.get(id=comment_id)
        except ShopComment.DoesNotExist:
            return Response(
                {"comment": [f"Invalid pk \"{comment_id}\" - object does not exist."]},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Check if user already voted
        helpful_vote = CommentHelpful.objects.filter(
            comment=comment,
            user=request.user
        ).first()
        
        is_helpful = request.data.get('is_helpful', True)
        
        if helpful_vote:
            # Update existing vote
            helpful_vote.is_helpful = is_helpful
            helpful_vote.save()
        else:
            # Create new vote
            helpful_vote = CommentHelpful.objects.create(
                comment=comment,
                user=request.user,
                is_helpful=is_helpful
            )
            
        serializer = self.get_serializer(helpful_vote)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ProductInquiryView(generics.CreateAPIView):
    """
    API endpoint for buyers to inquire about a product.
    """
    serializer_class = ProductInquirySerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        from products.models import Product
        
        shop_id = self.kwargs.get('shop_id')
        
        # Handle both 'product' and 'product_id' in request data
        product_id = request.data.get('product') or request.data.get('product_id')
        
        if not product_id:
            return Response(
                {"error": "Product ID is required. Please provide 'product' or 'product_id' in the request data."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate shop exists
        try:
            shop = Shop.objects.get(id=shop_id)
        except (ValueError, Shop.DoesNotExist):
            return Response(
                {"error": "Shop not found"},
                status=status.HTTP_404_NOT_FOUND
            )
            
        # Validate product exists and belongs to shop
        try:
            product = Product.objects.get(id=product_id, shop=shop)
        except (ValueError, Product.DoesNotExist):
            return Response(
                {"error": "Product not found in this shop"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Prepare data for serializer
        data = {
            'product_id': product_id,
            'phone': request.data.get('phone', '').strip(),
            'message': request.data.get('message', '').strip()
        }
        
        # Create the inquiry
        serializer = self.get_serializer(data=data, context={
            'request': request,
            'view': self
        })
        
        try:
            serializer.is_valid(raise_exception=True)
            inquiry = serializer.save()
            
            # Send notification to seller (you can implement email/notification here)
            self._notify_seller(inquiry)
            
            return Response(
                {"message": "Your inquiry has been sent to the seller"},
                status=status.HTTP_201_CREATED
            )
            
        except serializers.ValidationError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": "An error occurred while processing your inquiry"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _notify_seller(self, inquiry):
        """
        Send notification to seller about the new inquiry
        In a real app, this would send an email or in-app notification
        """
        from django.core.mail import send_mail
        from django.conf import settings
        from django.template.loader import render_to_string
        from django.utils.html import strip_tags
        
        seller = inquiry.seller
        buyer = inquiry.buyer
        product = inquiry.product
        
        subject = f"New Inquiry About {product.name}"
        
        # Render HTML email template
        html_message = render_to_string('emails/product_inquiry.html', {
            'buyer': buyer,
            'seller': seller,
            'product': product,
            'inquiry': inquiry,
            'shop': inquiry.shop,
            'site_name': 'WeShop'
        })
        
        # Create plain text version
        plain_message = strip_tags(html_message)
        
        # Send email (in production, use Celery or similar for async)
        try:
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@weshop.com'),
                recipient_list=[seller.email],
                html_message=html_message,
                fail_silently=True
            )
        except Exception as e:
            # Log the error but don't fail the request
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send inquiry notification: {str(e)}")
        
        # Here you could also add in-app notifications, WebSocket, or push notifications
        # For example:
        # notify_user(seller.id, {
        #     'type': 'new_inquiry',
        #     'message': f'New inquiry about {product.name} from {buyer.username}',
        #     'inquiry_id': inquiry.id
        # })

from shops.views import FrontendAppView

class FrontendAppView(TemplateView):
    template_name = "index.html"
