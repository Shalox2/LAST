from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Comment
from users.serializers import UserSerializer

User = get_user_model()

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        source='user',
        queryset=User.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )
    replies = serializers.SerializerMethodField()
    is_shop_owner = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = [
            'id', 'user', 'user_id', 'shop', 'product', 'content', 'rating', 
            'created_at', 'updated_at', 'parent', 'is_reply', 'replies', 'is_shop_owner'
        ]
        read_only_fields = ['created_at', 'updated_at', 'is_reply']
        extra_kwargs = {
            'shop': {'required': False},
            'product': {'required': False},
            'parent': {'required': False}
        }
    
    def get_replies(self, obj):
        if obj.is_reply:
            return None
        replies = Comment.objects.filter(parent=obj, is_reply=True)
        return CommentSerializer(replies, many=True, context=self.context).data
    
    def get_is_shop_owner(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        if not obj.shop:
            return False
        return request.user == obj.shop.owner
    
    def validate(self, data):
        if not data.get('shop') and not data.get('product'):
            raise serializers.ValidationError("Either shop or product must be provided.")
        if data.get('shop') and data.get('product'):
            raise serializers.ValidationError("Cannot assign both shop and product to a comment.")
        return data
