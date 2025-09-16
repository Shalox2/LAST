from rest_framework import serializers
from .models import Shop, VerificationLog, ShopComment, CommentHelpful, ProductInquiry

class ShopSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    documents_complete = serializers.BooleanField(read_only=True)
    verification_logs = serializers.SerializerMethodField()
    
    class Meta:
        model = Shop
        fields = [
            'id', 'name', 'description', 'logo', 'owner', 'owner_username', 
            'business_license_number', 'tax_id', 'business_address', 
            'business_phone', 'business_email',
            'joined_fee_paid', 'verification_status', 'is_verified',
            'documents_complete', 'verified_by', 'verified_at',
            'rejection_reason', 'created_at', 'verification_logs'
        ]
        read_only_fields = [
            'owner', 'verification_status', 'verified_by', 
            'verified_at', 'created_at', 'documents_complete'
        ]
    
    def get_verification_logs(self, obj):
        return VerificationLogSerializer(obj.verification_logs.all()[:5], many=True).data

class ShopCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shop
        fields = ['name', 'description', 'logo']

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        shop = super().create(validated_data)
        
        # Create audit log
        VerificationLog.objects.create(
            shop=shop,
            action='created',
            performed_by=self.context['request'].user,
            notes=f'Shop "{shop.name}" created',
            ip_address=self.context['request'].META.get('REMOTE_ADDR')
        )
        return shop

class ShopDocumentUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shop
        fields = [
            'business_license_number', 'tax_id', 'business_address',
            'business_phone', 'business_email', 'business_license_document',
            'tax_certificate', 'identity_document', 'logo'
        ]
    
    def update(self, instance, validated_data):
        shop = super().update(instance, validated_data)
        
        # Update status if documents are complete
        if shop.documents_complete and shop.verification_status == 'pending':
            shop.verification_status = 'documents_submitted'
            shop.save()
            
            # Create audit log
            VerificationLog.objects.create(
                shop=shop,
                action='documents_submitted',
                performed_by=self.context['request'].user,
                notes='All required documents submitted',
                ip_address=self.context['request'].META.get('REMOTE_ADDR')
            )
        
        return shop

class ShopVerificationSerializer(serializers.ModelSerializer):
    verification_notes = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Shop
        fields = ['verification_status', 'rejection_reason', 'verification_notes']
    
    def update(self, instance, validated_data):
        from django.utils import timezone
        
        verification_notes = validated_data.pop('verification_notes', '')
        old_status = instance.verification_status
        
        if validated_data.get('verification_status') == 'verified':
            validated_data['verified_by'] = self.context['request'].user
            validated_data['verified_at'] = timezone.now()
        
        shop = super().update(instance, validated_data)
        
        # Create audit log
        action = 'verified' if shop.verification_status == 'verified' else 'status_changed'
        VerificationLog.objects.create(
            shop=shop,
            action=action,
            performed_by=self.context['request'].user,
            notes=verification_notes or f'Status changed from {old_status} to {shop.verification_status}',
            ip_address=self.context['request'].META.get('REMOTE_ADDR')
        )
        
        return shop

class ShopCommentSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    helpful_count = serializers.SerializerMethodField()
    user_found_helpful = serializers.SerializerMethodField()
    
    class Meta:
        model = ShopComment
        fields = [
            'id', 'shop', 'user', 'user_username', 'rating', 'comment',
            'created_at', 'updated_at', 'is_verified_purchase',
            'helpful_count', 'user_found_helpful'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']
    
    def get_helpful_count(self, obj):
        return obj.helpful_votes.filter(is_helpful=True).count()
    
    def get_user_found_helpful(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            helpful_vote = obj.helpful_votes.filter(user=request.user).first()
            return helpful_vote.is_helpful if helpful_vote else None
        return None
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class CommentHelpfulSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommentHelpful
        fields = ['id', 'comment', 'user', 'is_helpful', 'created_at']
        read_only_fields = ['user', 'created_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        # Update or create helpful vote
        comment = validated_data['comment']
        user = validated_data['user']
        is_helpful = validated_data['is_helpful']
        
        helpful_vote, created = CommentHelpful.objects.update_or_create(
            comment=comment,
            user=user,
            defaults={'is_helpful': is_helpful}
        )
        return helpful_vote

class VerificationLogSerializer(serializers.ModelSerializer):
    performed_by_username = serializers.CharField(source='performed_by.username', read_only=True)
    
    class Meta:
        model = VerificationLog
        fields = ['action', 'performed_by_username', 'notes', 'timestamp']


class ProductInquirySerializer(serializers.ModelSerializer):
    """Serializer for product inquiries from buyers to sellers"""
    buyer_username = serializers.CharField(source='buyer.username', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    shop_name = serializers.CharField(source='shop.name', read_only=True)
    product_id = serializers.IntegerField(write_only=True, required=False)
    product = serializers.IntegerField(write_only=True, required=False)
    phone = serializers.CharField(required=True, allow_blank=False)
    message = serializers.CharField(required=True, allow_blank=False)
    
    def validate(self, data):
        # Ensure either product or product_id is provided
        if 'product' not in data and 'product_id' not in data:
            raise serializers.ValidationError({
                'product': 'Either product or product_id is required'
            })
        return data
    
    class Meta:
        model = ProductInquiry
        fields = [
            'id', 'product', 'product_id', 'product_name', 'buyer', 'buyer_username', 
            'seller', 'shop', 'shop_name', 'phone', 'message', 'status',
            'is_read', 'created_at'
        ]
        read_only_fields = ['product', 'buyer', 'seller', 'shop', 'status', 'is_read', 'created_at']
        
    def validate_product_id(self, value):
        from products.models import Product
        try:
            product = Product.objects.get(id=value)
            return value
        except Product.DoesNotExist:
            raise serializers.ValidationError("Invalid product ID")
    
    def create(self, validated_data):
        request = self.context.get('request')
        view = self.context.get('view')
        
        # Get product_id from either 'product' or 'product_id' field
        product_id = validated_data.pop('product_id', None) or validated_data.pop('product', None)
        
        if not product_id:
            raise serializers.ValidationError({
                'product': 'Product ID is required'
            })
            
        # Get the product and shop
        from products.models import Product
        try:
            product = Product.objects.get(id=product_id)
            shop = Shop.objects.get(id=view.kwargs.get('shop_id'))
        except (Product.DoesNotExist, Shop.DoesNotExist) as e:
            raise serializers.ValidationError({
                'product': 'Invalid product or shop'
            })
        
        # Create the inquiry
        inquiry = ProductInquiry.objects.create(
            product=product,
            buyer=request.user,
            seller=shop.owner,
            shop=shop,
            phone=validated_data.get('phone'),
            message=validated_data.get('message', '')
        )

        # Also create a pending order and seller notification so both sides can track it
        try:
            from orders.models import Order, SellerNotification
            # Create a lightweight pending order (quantity defaults to 1)
            order = Order.objects.create(
                buyer=request.user,
                product=product,
                quantity=1,
                buyer_phone=inquiry.phone,
                buyer_message=inquiry.message,
                status='pending'
            )
            # Notify seller with order context
            SellerNotification.objects.create(
                seller=shop.owner,
                order=order,
                notification_type='new_order',
                title=f'New Inquiry for {product.name}',
                message=f'Buyer {request.user.username} is interested in {product.name}. Phone: {inquiry.phone}'
            )
        except Exception:
            # Silently continue if orders app is unavailable
            pass

        return inquiry
