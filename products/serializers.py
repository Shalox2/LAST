from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    shop_name = serializers.CharField(source='shop.name', read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'shop', 'shop_name', 'stock_quantity', 'category', 'image', 'is_active', 'created_at']
        read_only_fields = ['shop', 'created_at']

class ProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['name', 'description', 'price', 'stock_quantity', 'category', 'image']

    def create(self, validated_data):
        # Get the seller's shop
        user = self.context['request'].user
        try:
            shop = user.shop
            if shop.verification_status != 'verified':
                raise serializers.ValidationError("Shop must be verified to create products")
            validated_data['shop'] = shop
            return super().create(validated_data)
        except:
            raise serializers.ValidationError("You must have a verified shop to create products")
